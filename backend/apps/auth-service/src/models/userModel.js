/**
 * User Model - Bank Grade User Schema
 * Contains realistic banking user registration fields
 */

const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

// Address sub-schema for embedded address object
const addressSchema = new mongoose.Schema({
  address_line: {
    type: String,
    required: [true, 'Address line is required'],
    trim: true,
    maxlength: [200, 'Address line cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [50, 'City name cannot exceed 50 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [50, 'State name cannot exceed 50 characters']
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true,
    match: [/^\d{6}$/, 'Pincode must be 6 digits']
  }
}, { _id: false });

// Main User Schema - Bank realistic fields
const userSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters'],
    maxlength: [100, 'Full name cannot exceed 100 characters'],
    match: [/^[a-zA-Z\s.]+$/, 'Full name can only contain letters, spaces and dots']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please provide a valid email address'
    ],
    index: true
  },
  
  mobile_number: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Mobile number must be 10 digits starting with 6-9'],
    index: true
  },
  
  date_of_birth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(dob) {
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        return age >= 18 && age <= 100; // Banking age requirements
      },
      message: 'Age must be between 18 and 100 years'
    }
  },
  
  password_hash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [60, 'Invalid password hash'] // bcrypt hash length
  },
  
  address: {
    type: addressSchema,
    required: [true, 'Address is required']
  },
  
  role: {
    type: String,
    enum: ['USER', 'ADMIN', 'MANAGER'],
    default: 'USER',
    uppercase: true
  },
  
  kyc_status: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING',
    uppercase: true
  },
  
  account_status: {
    type: String,
    enum: ['INACTIVE', 'ACTIVE', 'BLOCKED', 'SUSPENDED'],
    default: 'INACTIVE',
    uppercase: true
  },
  
  // Tracking fields
  last_login: {
    type: Date,
    default: null
  },
  
  login_attempts: {
    type: Number,
    default: 0
  },
  
  account_locked_until: {
    type: Date,
    default: null
  }
  
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'users'
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password_hash')) {
    return next();
  }
  
  try {
    // Hash password with salt rounds 12 (bank grade security)
    const salt = await bcryptjs.genSalt(12);
    this.password_hash = await bcryptjs.hash(this.password_hash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcryptjs.compare(candidatePassword, this.password_hash);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to check if account is locked
userSchema.methods.isAccountLocked = function() {
  return !!(this.account_locked_until && this.account_locked_until > Date.now());
};

// Instance method to lock account after failed attempts
userSchema.methods.lockAccount = function() {
  this.account_locked_until = Date.now() + (30 * 60 * 1000); // 30 minutes
  this.login_attempts = 0;
};

// Instance method to unlock account
userSchema.methods.unlockAccount = function() {
  this.account_locked_until = undefined;
  this.login_attempts = 0;
};

// Instance method to get public user data (no sensitive info)
userSchema.methods.toPublicJSON = function() {
  return {
    _id: this._id,
    full_name: this.full_name,
    email: this.email,
    mobile_number: this.mobile_number,
    role: this.role,
    kyc_status: this.kyc_status,
    account_status: this.account_status,
    last_login: this.last_login,
    createdAt: this.createdAt
  };
};

// Static method to find user by email or mobile
userSchema.statics.findByEmailOrMobile = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { mobile_number: identifier }
    ]
  });
};

// Export the User model
module.exports = mongoose.model('User', userSchema);
