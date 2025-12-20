const config = require('../../../../shared/config');
const { createResponse } = require('../../../../shared/utils');

exports.getInfo = async (req, res, next) => {
  try {
    const payload = {
      service: 'api-gateway',
      version: '1.0.0',
      environment: config.app.nodeEnv,
      timestamp: new Date().toISOString(),
    };

    res.json(createResponse(payload, 'Gateway information'));
  } catch (err) {
    next(err);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    res.json(createResponse({ status: 'ok' }, 'Gateway status'));
  } catch (err) {
    next(err);
  }
};
