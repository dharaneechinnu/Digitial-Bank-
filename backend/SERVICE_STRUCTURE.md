# Microservices Standardized Structure

All services now follow this consistent structure:

## File Structure
```
apps/
├── {service-name}/
│   ├── src/
│   │   ├── models/
│   │   │   └── {service}Model.js
│   │   ├── controllers/
│   │   │   └── {service}Controller.js
│   │   └── routes/
│   │       └── {service}Routes.js
│   ├── app.js
│   ├── server.js
│   └── package.json
```

## Services Implemented

### ✅ Auth Service
- **Model**: UserModel (Mongoose)
- **Controller**: AuthController  
- **Routes**: /register, /login, /profile, /health
- **Features**: User registration, login, profile management

### ✅ Account Service
- **Model**: AccountModel (Mongoose)
- **Controller**: AccountController
- **Routes**: /accounts, /users/:userId/accounts, /health
- **Features**: Account creation, balance management, account lookup

### ✅ Transaction Service  
- **Model**: TransactionModel (Mongoose)
- **Controller**: TransactionController
- **Routes**: /transactions, /accounts/:accountId/transactions, /health
- **Features**: Transaction creation, processing, account transaction history

### ✅ Ledger Service
- **Model**: LedgerModel (Mongoose) 
- **Controller**: LedgerController
- **Routes**: /entries, /accounts/:accountId/entries, /accounts/:accountId/balance, /health
- **Features**: Ledger entries, account balance tracking, transaction logging

### ✅ Settlement Service
- **Model**: SettlementModel (Mongoose)
- **Controller**: SettlementController  
- **Routes**: /settlements, /settlements/:id/process, /health
- **Features**: Settlement batch creation, processing, bank reconciliation

### ✅ Dispute Service
- **Model**: DisputeModel (Mongoose)
- **Controller**: DisputeController
- **Routes**: /disputes, /users/:userId/disputes, /disputes/:id/resolve, /health  
- **Features**: Dispute creation, investigation, resolution tracking

### ✅ Audit Service
- **Model**: AuditModel (Mongoose)
- **Controller**: AuditController
- **Routes**: /audit-logs, /users/:userId/audit-logs, /resources/:resource/:resourceId/audit-logs, /health
- **Features**: Audit trail logging, user activity tracking, resource change tracking

### ✅ Notification Service
- **Model**: NotificationModel (Mongoose)
- **Controller**: NotificationController
- **Routes**: /notifications, /users/:userId/notifications, /notifications/:id/send, /health
- **Features**: Notification creation, sending, delivery tracking, read status

## Common Features

- **MongoDB Integration**: All services use Mongoose with MongoDB
- **Standardized Responses**: Consistent API response format
- **Console Logging**: All operations logged to console with emojis
- **Health Endpoints**: Each service has a /health endpoint
- **Error Handling**: Centralized error handling middleware
- **CORS & Security**: Helmet, CORS, and security middlewares
- **Request Logging**: Morgan middleware for HTTP request logging

## API Response Format

All endpoints return:
```json
{
  "success": true/false,
  "message": "Human readable message",
  "data": {}, // Response data
  "error": "Error message if failed"
}
```

## Console Output Examples

Each service logs operations with emojis:
- 🏦 Account operations
- 💸 Transaction operations  
- 📖 Ledger operations
- 🏛️ Settlement operations
- ⚖️ Dispute operations
- 📋 Audit operations
- 🔔 Notification operations
- 🏥 Health checks
- ✅ Success operations
- ❌ Error operations
- 🔍 Fetch/Query operations
- 📝 Update operations

All services are ready for deployment and testing!