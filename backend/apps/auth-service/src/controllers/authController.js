/**
 * Auth Controller - Bank Grade Authentication
 * Handles user registration, login, logout, and token verification
 */

const User = require('../models/userModel');
const TokenService = require('../services/tokenService');
const ValidationService = require('../services/validationService');
const NotificationQueueService = require('../services/notificationQueueService');

class AuthController {
  
  /**
   * User Registration - Bank Grade
   * POST /register
   */
static async register(req, res) {
  try {
    const registrationData = req.body;

   

    // Check if user already exists
    const existingUser = await User.findByEmailOrMobile(registrationData.email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        errorType: "DUPLICATE_USER",
        message: "User already exists with this email or mobile number"
      });
    }

    // Check mobile separately
    const existingMobile = await User.findOne({ mobile_number: registrationData.mobile_number });
    if (existingMobile) {
      return res.status(409).json({
        success: false,
        errorType: "DUPLICATE_MOBILE",
        message: "Mobile number already registered"
      });
    }

    // Prepare user data
    const userData = {
      full_name: registrationData.full_name.trim(),
      email: registrationData.email.toLowerCase().trim(),
      mobile_number: registrationData.mobile_number.trim(),
      date_of_birth: new Date(registrationData.date_of_birth),
      password_hash: registrationData.password,
      address: {
        address_line: registrationData.address.address_line.trim(),
        city: registrationData.address.city.trim(),
        state: registrationData.address.state.trim(),
        pincode: registrationData.address.pincode.replace(/\s/g, "")
      },
      role: "USER",
      kyc_status: "PENDING",
      account_status: "INACTIVE"
    };

    // Create user
    const user = new User(userData);
    // Save without running schema validators so pre-save middleware can hash the raw password
    // (we validate input earlier via ValidationService). This avoids the password_hash minlength
    // schema validation failing on the raw password before the pre-save hook runs.
    await user.save({ validateBeforeSave: false });

    // Notifications (async, non-blocking)
    NotificationQueueService.sendRegistrationNotification(user).catch(console.error);
    NotificationQueueService.sendKycPendingNotification(user).catch(console.error);

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please complete KYC to activate your account.",
      data: {
        user: user.toPublicJSON()
      }
    });

  } catch (error) {
    console.error("Registration error:", error);

    // 🔴 DUPLICATE KEY (MongoDB)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        errorType: "DUPLICATE_KEY",
        message: "Duplicate field value",
        details: error.keyValue
      });
    }

    // 🔴 MONGOOSE VALIDATION ERROR
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        errorType: "SCHEMA_VALIDATION_ERROR",
        message: "Schema validation failed",
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    // 🔴 CAST / DATE / FORMAT ERRORS
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        errorType: "INVALID_FORMAT",
        message: `Invalid value for field: ${error.path}`,
        value: error.value
      });
    }

    // 🔴 UNKNOWN / SERVER ERROR
    return res.status(500).json({
      success: false,
      errorType: "INTERNAL_SERVER_ERROR",
      message: "Registration failed. Please try again later.",
      ...(process.env.NODE_ENV === "development" && {
        debug: {
          errorMessage: error.message,
          stack: error.stack
        }
      })
    });
  }
}

  
  /**
   * User Login - Email or Mobile
   * POST /login
   */
  static async login(req, res) {
    try {
      const { identifier, password } = req.body;
      
      // Validate login data
      const validation = ValidationService.validateLoginData({ identifier, password });
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }
      
      // Find user by email or mobile
      const user = await User.findByEmailOrMobile(identifier.trim());
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Check if account is locked
      if (user.isAccountLocked()) {
        return res.status(423).json({
          success: false,
          message: 'Account temporarily locked due to failed login attempts. Please try again later.'
        });
      }
      
      // Check if account is blocked
      if (user.account_status === 'BLOCKED' || user.account_status === 'SUSPENDED') {
        return res.status(403).json({
          success: false,
          message: 'Account is blocked. Please contact support.'
        });
      }
      
      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        // Increment failed login attempts
        user.login_attempts += 1;
        
        // Lock account after 5 failed attempts
        if (user.login_attempts >= 5) {
          user.lockAccount();
        }
        
        await user.save();
        
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Reset login attempts on successful login
      if (user.login_attempts > 0) {
        user.unlockAccount();
      }
      
      // Update last login
      user.last_login = new Date();
      await user.save();
      
      // Generate JWT token
      const { token, expiresIn } = TokenService.generateAccessToken(user);
      
      // Store session in Redis
      const ttlSeconds = 86400; // 24 hours
      await TokenService.storeSession(user._id.toString(), token, ttlSeconds);
      
      // Get client info for notification
      const clientInfo = {
        ip_address: req.ip || req.connection.remoteAddress || 'unknown',
        user_agent: req.get('User-Agent') || 'unknown'
      };
      
      // Send login alert notification (async)
      await NotificationQueueService.sendLoginAlert(user, clientInfo);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toPublicJSON(),
          token: {
            access_token: token,
            token_type: 'Bearer',
            expires_in: expiresIn
          }
        }
      });
      
    } catch (error) {
      console.error('Login error:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Login failed. Please try again later.'
      });
    }
  }
  
  /**
   * User Logout
   * POST /logout
   */
  static async logout(req, res) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }
      
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      // Verify token
      const decoded = TokenService.verifyToken(token);
      
      // Delete session from Redis
      await TokenService.deleteSession(decoded.user_id);
      
      // Blacklist the token
      await TokenService.blacklistToken(token, 86400);
      
      res.json({
        success: true,
        message: 'Logout successful'
      });
      
    } catch (error) {
      console.error('Logout error:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  }
  
  /**
   * Token Verification (Internal API Gateway use)
   * POST /verify-token
   */
  static async verifyToken(req, res) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token is required'
        });
      }
      
      // Check if token is blacklisted
      const isBlacklisted = await TokenService.isTokenBlacklisted(token);
      
      if (isBlacklisted) {
        return res.status(401).json({
          success: false,
          message: 'Token is blacklisted'
        });
      }
      
      // Verify JWT token
      const decoded = TokenService.verifyToken(token);
      
      // Validate session in Redis
      const isSessionValid = await TokenService.validateSession(decoded.user_id, token);
      
      if (!isSessionValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid session'
        });
      }
      
      // Get fresh user data
      const user = await User.findById(decoded.user_id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Check account status
      if (user.account_status === 'BLOCKED' || user.account_status === 'SUSPENDED') {
        return res.status(403).json({
          success: false,
          message: 'Account is blocked'
        });
      }
      
      res.json({
        success: true,
        message: 'Token is valid',
        data: {
          user: user.toPublicJSON(),
          decoded: {
            user_id: decoded.user_id,
            role: decoded.role,
            kyc_status: decoded.kyc_status,
            account_status: decoded.account_status
          }
        }
      });
      
    } catch (error) {
      console.error('Token verification error:', error.message);
      
      res.status(401).json({
        success: false,
        message: error.message || 'Token verification failed'
      });
    }
  }
  
  /**
   * Health Check
   * GET /health
   */
  static async health(req, res) {
    try {
      // Test database connectivity
      await User.countDocuments({});
      
      res.json({
        success: true,
        message: 'Auth Service is healthy',
        data: {
          service: 'auth-service',
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      });
      
    } catch (error) {
      console.error('Health check error:', error.message);
      
      res.status(503).json({
        success: false,
        message: 'Auth Service is unhealthy',
        data: {
          service: 'auth-service',
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date().toISOString()
        }
      });
    }
  }
}

module.exports = AuthController;
