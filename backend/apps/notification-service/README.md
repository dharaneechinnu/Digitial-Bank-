# Notification Service

## Overview

The Notification Service is responsible for processing and delivering email notifications asynchronously in the Digital Banking platform. It consumes notification events from Redis queue and sends emails using professional templates.

## Features

- **Asynchronous Processing**: Redis-based queue for handling notification events
- **Email Delivery**: SMTP integration with nodemailer
- **Professional Templates**: Bank-grade HTML email templates
- **Retry Logic**: Automatic retry for failed notifications with exponential backoff
- **Monitoring**: Health checks, statistics, and worker status endpoints
- **Scalable**: Batch processing and configurable worker intervals

## Architecture

```
Auth Service → Redis Queue → Notification Worker → SMTP → Email Delivery
                    ↓
              MongoDB (Notification Records)
```

## API Endpoints

### Health & Monitoring
- `GET /health` - Service health check
- `GET /api/notifications/stats` - Notification statistics
- `GET /api/notifications/worker/status` - Worker status

### User Notifications
- `GET /api/notifications/user/:userId` - Get user notification history

### Worker Management
- `POST /api/notifications/worker/start` - Start worker
- `POST /api/notifications/worker/stop` - Stop worker

### Notification Management
- `POST /api/notifications/:notificationId/retry` - Retry failed notification

## Notification Types

1. **USER_REGISTRATION** - Welcome email after account creation
2. **LOGIN_ALERT** - Security alert for user logins
3. **KYC_PENDING** - Reminder to complete KYC verification
4. **KYC_VERIFIED** - Congratulations for successful KYC

## Environment Variables

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=FinTech Bank
SMTP_FROM_EMAIL=noreply@fintechbank.com

# Service Configuration
NODE_ENV=development
PORT=8009

# Database (shared configuration)
MONGODB_URI=mongodb://localhost:27017/fintech_db
REDIS_URL=redis://localhost:6379
```

## Queue Event Format

```json
{
  "id": "uuid",
  "type": "USER_REGISTRATION",
  "user_id": "user_id",
  "email": "user@example.com",
  "full_name": "John Doe",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "metadata": {
    "registration_date": "2024-01-01T00:00:00.000Z",
    "ip_address": "192.168.1.1"
  }
}
```

## Database Schema

### Notification Model
```javascript
{
  event_id: String,        // Reference to queue event
  type: String,            // Notification type
  user_id: String,         // Target user
  email: String,           // Recipient email
  status: String,          // PENDING, SENT, FAILED, RETRYING
  subject: String,         // Email subject
  template_used: String,   // Template identifier
  retry_count: Number,     // Retry attempts
  error_message: String,   // Error details
  sent_at: Date,          // Delivery timestamp
  metadata: Object,        // Additional data
  provider_response: Object // SMTP response
}
```

## Testing

### End-to-End Test
```bash
# Run the complete flow test
node test-notification-flow.js
```

This script:
1. Registers a new user (triggers welcome email)
2. Logs in user (triggers login alert)
3. Checks worker status and statistics
4. Verifies notification processing

### Manual Testing

#### Start Services
```bash
# Terminal 1: Auth Service
cd backend/apps/auth-service
npm start

# Terminal 2: Notification Service  
cd backend/apps/notification-service
npm start
```

#### Test Registration Flow
```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "mobile_number": "+919876543210",
    "password": "SecurePass123!",
    "date_of_birth": "1990-01-01",
    "address": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra", 
      "postal_code": "400001",
      "country": "India"
    }
  }'
```

#### Check Worker Status
```bash
curl http://localhost:8009/api/notifications/worker/status
```

## Worker Configuration

```javascript
{
  processIntervalMs: 5000,    // Process every 5 seconds
  maxBatchSize: 5,           // Process up to 5 notifications
  maxRetries: 3,             // Maximum retry attempts
  retryDelays: [5, 15, 30]   // Retry delays in minutes
}
```

## Email Templates

Templates are responsive HTML with:
- Professional banking design
- Security messaging
- Clear call-to-action
- Contact information
- Brand consistency

## Error Handling

- **Temporary Errors**: Automatic retry with exponential backoff
- **Permanent Errors**: Marked as failed, manual retry available
- **Rate Limiting**: Respected with appropriate delays
- **SMTP Failures**: Detailed logging and status tracking

## Monitoring

### Metrics Tracked
- Email delivery rates
- Retry statistics  
- Processing latency
- Queue depth
- Error distribution

### Health Indicators
- Worker status (running/stopped)
- Queue connectivity
- SMTP configuration
- Database connections

## Production Considerations

1. **SMTP Provider**: Use professional email service (SendGrid, SES, etc.)
2. **Rate Limiting**: Configure appropriate sending limits
3. **Monitoring**: Set up alerts for failed notifications
4. **Scaling**: Multiple worker instances for high volume
5. **Security**: Secure SMTP credentials and email content