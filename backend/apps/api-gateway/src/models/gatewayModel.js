// Simple model placeholder for API Gateway
class GatewayModel {
  constructor() {}

  static info() {
    return {
      name: 'API Gateway',
      description: 'Routes requests to microservices and exposes gateway-level endpoints',
    };
  }
}

module.exports = GatewayModel;
