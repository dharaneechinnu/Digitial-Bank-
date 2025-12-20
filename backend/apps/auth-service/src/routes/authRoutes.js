/**
 * Auth Routes - Bank Grade Authentication Endpoints
 * Defines all authentication-related API endpoints
 */

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// User registration
// POST /register
// Body: { full_name, email, mobile_number, date_of_birth, password, address }
router.post('/register', AuthController.register);

// User login (email or mobile)
// POST /login
// Body: { identifier: email_or_mobile, password }
router.post('/login', AuthController.login);

// User logout
// POST /logout
// Headers: { Authorization: Bearer <token> }
router.post('/logout', AuthController.logout);

// Token verification (internal API Gateway use)
// POST /verify-token
// Body: { token }
router.post('/verify-token', AuthController.verifyToken);

// Health check
// GET /health
router.get('/health', AuthController.health);

module.exports = router;
