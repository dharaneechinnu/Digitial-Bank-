# Digital Banking Application - Backend Setup

A scalable, microservices-based backend for a digital banking application built with Node.js, Express, PostgreSQL, and Redis.

## 🏗️ Architecture

This project is designed as a microservices architecture with the following components:

- **API Gateway** (Port 3000) - Routes requests to appropriate microservices
- **Auth Service** (Port 3001) - Handles authentication and authorization
- **Account Service** (Port 3002) - Manages user accounts and balances
- **Transaction Service** (Port 3003) - Processes financial transactions

## 📁 Project Structure

```
backend/
├── apps/                           # Microservices
│   ├── api-gateway/               # API Gateway service
│   │   ├── src/
│   │   ├── app.js                 # Express app configuration
│   │   ├── server.js              # Server entry point
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── auth-service/              # Authentication service
│   ├── account-service/           # Account management service
│   └── transaction-service/       # Transaction processing service
├── shared/                        # Shared components
│   ├── config/                    # Configuration management
│   │   └── index.js
│   ├── db/                        # Database connections
│   │   ├── postgres.js            # PostgreSQL connection
│   │   ├── redis.js               # Redis connection
│   │   └── index.js
│   ├── middlewares/               # Shared middleware
│   │   ├── errorHandler.js        # Global error handler
│   │   ├── requestLogger.js       # Request logging
│   │   └── index.js
│   └── utils/                     # Utility functions
│       └── index.js
├── init-db/                       # Database initialization scripts
│   └── 01-init.sql
├── docker-compose.yml             # Docker orchestration
├── .env                   # Environment variables template
└── README.md                      # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- PostgreSQL (if running without Docker)
- Redis (if running without Docker)

### Option 1: Docker Setup (Recommended)

1. **Clone and setup environment:**
   ```bash
   cd backend
   cp .env .env
   # Edit .env file with your configuration
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Check service health:**
   ```bash
   # API Gateway
   curl http://localhost:3000/health
   
   # Individual services
   curl http://localhost:3001/health  # Auth Service
   curl http://localhost:3002/health  # Account Service
   curl http://localhost:3003/health  # Transaction Service
   ```

### Option 2: Local Development Setup

1. **Setup environment:**
   ```bash
   cp .env .env
   # Edit .env file with your local database configuration
   ```

2. **Start databases:**
   ```bash
   # Start PostgreSQL and Redis (via Docker or locally)
   docker-compose up postgres redis -d
   ```

3. **Install dependencies and start services:**
   ```bash
   # For each service directory (api-gateway, auth-service, etc.)
   cd apps/api-gateway
   npm install
   npm run dev
   
   # Open new terminal for each service
   cd apps/auth-service
   npm install
   npm run dev
   # ... repeat for other services
   ```

## 🗄️ Database Setup

The project uses PostgreSQL with automatic schema initialization:

- **Schema:** Users, Accounts, Transactions tables
- **Features:** UUID primary keys, timestamps, indexes, triggers
- **Init Script:** `init-db/01-init.sql` runs automatically in Docker

### Manual Database Setup
```bash
# Connect to PostgreSQL
psql -h localhost -p 5432 -U postgres -d fintech_db

# Run the initialization script
\i init-db/01-init.sql
```

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env`):

- `NODE_ENV` - Application environment (development/production)
- `DB_HOST`, `DB_PASSWORD` - Database connection
- `REDIS_HOST`, `REDIS_PASSWORD` - Redis connection
- `JWT_SECRET` - JWT signing secret (change in production!)
- Service ports and hosts

### Service Discovery

Services communicate using configured host/port combinations:
- In Docker: Use service names (`postgres`, `redis`, `auth-service`)
- Local development: Use `localhost` with different ports

## 🔌 API Endpoints

### API Gateway (Port 3000)
- `GET /health` - Health check
- `GET /api` - API documentation
- `POST /api/auth/*` - Proxy to Auth Service
- `GET|POST /api/accounts/*` - Proxy to Account Service  
- `GET|POST /api/transactions/*` - Proxy to Transaction Service

### Auth Service (Port 3001)
- `GET /health` - Health check
- `POST /login` - User login
- `POST /register` - User registration
- `POST /logout` - User logout
- `POST /refresh` - Refresh access token
- `POST /verify` - Verify token

### Account Service (Port 3002)
- `GET /health` - Health check
- `GET /accounts` - Get all accounts
- `GET /accounts/:id` - Get account by ID
- `POST /accounts` - Create new account
- `PUT /accounts/:id` - Update account
- `GET /accounts/:id/balance` - Get account balance

### Transaction Service (Port 3003)
- `GET /health` - Health check
- `GET /transactions` - Get all transactions
- `GET /transactions/:id` - Get transaction by ID
- `POST /transactions/transfer` - Create transfer
- `POST /transactions/deposit` - Create deposit
- `POST /transactions/withdraw` - Create withdrawal
- `GET /transactions/:id/status` - Get transaction status

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Remove volumes (WARNING: deletes data)
docker-compose down -v
```

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing control
- **Rate limiting** - Request rate limiting
- **Input validation** - Ready for express-validator
- **JWT tokens** - Authentication tokens
- **Password hashing** - bcrypt for password security
- **Environment-based config** - No hardcoded secrets

## 📊 Monitoring & Logging

- **Health checks** - All services expose `/health` endpoints
- **Request logging** - Morgan + custom request logger
- **Error handling** - Centralized error handler
- **Docker health checks** - Container health monitoring

## 🔄 Development Workflow

1. **Add new features:** Create in appropriate service
2. **Shared code:** Add to `/shared` directory
3. **Database changes:** Update init scripts
4. **Environment changes:** Update `.env`
5. **Documentation:** Update this README

## 📝 Next Steps (Business Logic Implementation)

This setup provides the foundation. Next steps include:

1. **Authentication logic** - JWT creation, validation, refresh
2. **Account management** - CRUD operations, balance updates
3. **Transaction processing** - Transfer logic, transaction states
4. **Validation** - Input validation with express-validator
5. **Authorization** - Role-based access control
6. **Testing** - Unit and integration tests
7. **API documentation** - OpenAPI/Swagger specs
8. **Monitoring** - Prometheus, Grafana, ELK stack

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include health checks for new services
4. Update documentation
5. Test with Docker setup

## 📄 License

MIT License - see LICENSE file for details