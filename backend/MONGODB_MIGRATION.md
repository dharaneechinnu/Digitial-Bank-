# MongoDB Migration Guide

## Overview
This application has been migrated from PostgreSQL to MongoDB. The following changes have been implemented:

## Changes Made

### 1. Database Configuration
- ✅ Updated `.env` file to use MongoDB connection string
- ✅ Replaced PostgreSQL config with MongoDB config in `shared/config/index.js`
- ✅ Created new MongoDB connection manager in `shared/db/mongodb.js`
- ✅ Updated database index file to use MongoDB instead of PostgreSQL

### 2. Auth Service Updates
- ✅ Updated `package.json` to use `mongoose` instead of `pg`
- ✅ Completely rewritten `userModel.js` to use Mongoose schemas
- ✅ Added proper MongoDB error handling
- ✅ Maintained backward compatibility with existing API

### 3. Infrastructure Updates
- ✅ Updated `docker-compose.yml` to remove PostgreSQL service
- ✅ Updated environment variables for all services
- ✅ Removed PostgreSQL initialization scripts
- ✅ Updated error handler for MongoDB-specific errors

### 4. Files Removed
- ❌ `shared/db/postgres.js` - PostgreSQL connection file
- ❌ `init-db/` directory - PostgreSQL initialization scripts

### 5. Files Modified
- 📝 `.env` - Updated database configuration
- 📝 `shared/config/index.js` - MongoDB configuration
- 📝 `shared/db/index.js` - Database connections index
- 📝 `shared/db/mongodb.js` - New MongoDB connection manager
- 📝 `apps/auth-service/src/models/userModel.js` - Mongoose-based user model
- 📝 `apps/auth-service/package.json` - Updated dependencies
- 📝 `docker-compose.yml` - Removed PostgreSQL, updated env vars
- 📝 `shared/middlewares/errorHandler.js` - MongoDB error handling

## Setup Instructions

### 1. Update Environment Variables
Update your `.env` file with your actual MongoDB password:

```env
DB_PASSWORD=your_actual_mongodb_password
```

### 2. Install Dependencies
```bash
cd apps/auth-service
npm install
```

### 3. Test Connection
Run the test script to verify MongoDB connection:

```bash
node test-mongodb-connection.js
```

### 4. Start Services
```bash
# Using Docker
docker-compose up -d --build

# Or manually
cd apps/auth-service
npm run dev
```

## MongoDB Connection Details

**Connection String**: `mongodb+srv://dharaneedharanchinnusamy:<db_password>@cluster0.vn0hbeq.mongodb.net/?appName=Cluster0`

**Database Name**: `fintech_db`

## User Schema

The user schema in MongoDB includes:
- `_id` (String): Unique identifier (UUID v4)
- `email` (String): User email (unique, lowercase, required)
- `password` (String): Hashed password (required)
- `first_name` (String): First name (optional)
- `last_name` (String): Last name (optional)
- `phone` (String): Phone number (optional)
- `status` (String): Account status (active, inactive, pending, suspended)
- `created_at` (Date): Creation timestamp
- `updated_at` (Date): Last update timestamp

## API Compatibility

The user model maintains backward compatibility with the previous PostgreSQL implementation:
- All existing API endpoints continue to work
- Response format remains the same
- Authentication flow is unchanged

## Notes

- The MongoDB connection uses connection pooling for optimal performance
- Error handling has been updated to handle MongoDB-specific errors
- The application still uses Redis for caching (unchanged)
- All other microservices will need similar migration to be fully functional with MongoDB