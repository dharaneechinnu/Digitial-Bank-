const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = router;
