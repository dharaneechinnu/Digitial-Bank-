const express = require('express');
const router = express.Router();
const gatewayController = require('../controllers/gatewayController');

router.get('/info', gatewayController.getInfo);
router.get('/status', gatewayController.getStatus);

module.exports = router;
