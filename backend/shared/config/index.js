/**
 * Centralized configuration management
 * Loads environment variables and provides default values
 */

const config = {
  // Application settings
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    logLevel: process.env.LOG_LEVEL || 'info',
    ports: {
      apiGateway: 3000,
      authService: 3001,
      accountService: 3002,
      transactionService: 3003,
      ledgerService: 8005,
      settlementService: 8006,
      disputeService: 8007,
      auditService: 8008,
      notificationService: 8009,
    }
  },

  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'fintech_db',
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      max: parseInt(process.env.DB_POOL_MAX) || 10,
    },
  },

  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || null,
    db: parseInt(process.env.REDIS_DB) || 0,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'fintech:',
  },

  // Security settings
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    jwtExpiry: process.env.JWT_EXPIRY || '24h',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  },

  // Service discovery (for microservices)
  services: {
    apiGateway: {
      host: process.env.API_GATEWAY_HOST || 'localhost',
      port: parseInt(process.env.API_GATEWAY_PORT) || 3000,
    },
    authService: {
      host: process.env.AUTH_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.AUTH_SERVICE_PORT) || 3001,
    },
    accountService: {
      host: process.env.ACCOUNT_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.ACCOUNT_SERVICE_PORT) || 3002,
    },
    transactionService: {
      host: process.env.TRANSACTION_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.TRANSACTION_SERVICE_PORT) || 3003,
    },
    ledgerService: {
      host: process.env.LEDGER_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.LEDGER_SERVICE_PORT) || 8005,
    },
    settlementService: {
      host: process.env.SETTLEMENT_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.SETTLEMENT_SERVICE_PORT) || 8006,
    },
    disputeService: {
      host: process.env.DISPUTE_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.DISPUTE_SERVICE_PORT) || 8007,
    },
    auditService: {
      host: process.env.AUDIT_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.AUDIT_SERVICE_PORT) || 8008,
    },
    notificationService: {
      host: process.env.NOTIFICATION_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.NOTIFICATION_SERVICE_PORT) || 8009,
    },
  },
};

module.exports = config;