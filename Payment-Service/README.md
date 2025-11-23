# Payment Service - Event Ticketing System

## Overview
Production-ready microservice for handling payment processing using Stripe API with RabbitMQ messaging integration.

## Technology Stack
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Build Tool**: Maven
- **Payment Gateway**: Stripe API v24.0.0
- **Message Queue**: RabbitMQ (Spring AMQP)
- **Service Discovery**: Netflix Eureka Client
- **Server Port**: 8084

## Features
✅ Stripe Payment Intent creation
✅ Payment confirmation and verification
✅ RabbitMQ messaging to Booking Service
✅ Eureka service registration
✅ CORS enabled for frontend integration
✅ Comprehensive error handling
✅ Production-ready logging
✅ Health check endpoints

## Prerequisites
1. Java 17 or higher
2. Maven 3.6+
3. RabbitMQ running on localhost:5672
4. Eureka Server running on localhost:8761
5. Stripe API Key (Test or Live)

## Configuration

### Stripe API Key
Update `application.yml` with your Stripe API key:
```yaml
stripe:
  api:
    key: sk_test_your_key_here  # Replace with your Stripe key
```

Or set environment variable:
```bash
export STRIPE_API_KEY=sk_test_your_key_here
```

### Get Stripe API Key
1. Sign up at https://stripe.com
2. Navigate to Developers → API keys
3. Copy the Secret key (starts with `sk_test_` for test mode)

## Build & Run

### Build the project
```bash
mvn clean install
```

### Run the service
```bash
mvn spring-boot:run
```

Or run the JAR:
```bash
java -jar target/payment-service-1.0.0.jar
```

### Docker Build & Run
```bash
# Build
mvn clean package
docker build -t payment-service .

# Run
docker run -p 8084:8084 payment-service
```

## API Endpoints

### 1. Create Payment Intent
**POST** `/api/payments/create-intent`

Creates a Stripe Payment Intent and returns client secret for frontend.

**Request Body:**
```json
{
  "bookingId": 123,
  "amount": 99.99,
  "currency": "usd",
  "description": "Event Ticket Purchase",
  "customerEmail": "customer@example.com"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxxxxxxxxx",
  "amount": 9999,
  "currency": "usd",
  "status": "requires_payment_method",
  "bookingId": 123
}
```

### 2. Confirm Payment
**POST** `/api/payments/confirm`

Confirms payment and sends message to RabbitMQ for Booking Service.

**Request Body:**
```json
{
  "bookingId": 123,
  "paymentIntentId": "pi_xxxxxxxxxx",
  "amount": 99.99,
  "currency": "usd"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment confirmed and notification sent to booking service",
  "bookingId": 123,
  "paymentIntentId": "pi_xxxxxxxxxx"
}
```

### 3. Get Payment Intent
**GET** `/api/payments/intent/{paymentIntentId}`

Retrieves payment intent details from Stripe.

### 4. Cancel Payment Intent
**POST** `/api/payments/cancel/{paymentIntentId}`

Cancels a payment intent.

### 5. Health Check
**GET** `/api/payments/health`

Returns service health status.

## RabbitMQ Integration

### Configuration
- **Exchange**: `payment_exchange` (Topic Exchange)
- **Queue**: `payment_queue`
- **Routing Key**: `payment_routing_key`

### Message Format
```json
{
  "bookingId": 123,
  "status": "SUCCESS",
  "transactionId": "pi_xxxxxxxxxx",
  "amount": 99.99,
  "currency": "usd",
  "timestamp": "2025-11-23T10:30:00",
  "message": "Payment completed successfully"
}
```

## Testing

### Test Payment Intent Creation
```bash
curl -X POST http://localhost:8084/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": 1,
    "amount": 50.00,
    "currency": "usd",
    "description": "Test Event Ticket"
  }'
```

### Test Payment Confirmation
```bash
curl -X POST http://localhost:8084/api/payments/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": 1,
    "paymentIntentId": "pi_xxxxxxxxxx",
    "amount": 50.00,
    "currency": "usd"
  }'
```

## Stripe Test Cards

Use these test card numbers in Stripe test mode:

| Card Number | Result |
|------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 9995 | Declined |
| 4000 0025 0000 3155 | Requires authentication |

- **Expiry**: Any future date
- **CVC**: Any 3 digits
- **ZIP**: Any 5 digits

## Monitoring

### Actuator Endpoints
- Health: `http://localhost:8084/actuator/health`
- Info: `http://localhost:8084/actuator/info`
- Metrics: `http://localhost:8084/actuator/metrics`

### Eureka Dashboard
View registered services at: `http://localhost:8761`

## Error Handling

The service provides comprehensive error responses:

```json
{
  "error": "Payment processing failed",
  "message": "Your card was declined",
  "code": "card_declined"
}
```

## Logging

Logs are configured for:
- Payment operations (DEBUG level)
- Stripe API calls (DEBUG level)
- RabbitMQ messaging (DEBUG level)

## Production Considerations

1. **Environment Variables**: Use environment variables for sensitive data
2. **HTTPS**: Enable HTTPS in production
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **Webhook Security**: Verify Stripe webhook signatures
5. **Database**: Store payment records in a database
6. **Monitoring**: Integrate with monitoring tools (Prometheus, Grafana)

## Integration with Frontend

Use Stripe Elements or Stripe.js in your frontend:

```javascript
// 1. Create Payment Intent
const response = await fetch('http://localhost:8084/api/payments/create-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bookingId: 123,
    amount: 99.99,
    currency: 'usd'
  })
});

const { clientSecret } = await response.json();

// 2. Use Stripe.js to confirm payment
const { error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: { name: 'Customer Name' }
  }
});

// 3. Confirm payment with backend
if (!error) {
  await fetch('http://localhost:8084/api/payments/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookingId: 123,
      paymentIntentId: paymentIntent.id,
      amount: 99.99,
      currency: 'usd'
    })
  });
}
```

## Support

For issues or questions:
- Check logs in the console
- Verify Stripe API key is valid
- Ensure RabbitMQ and Eureka are running
- Review Stripe documentation: https://stripe.com/docs

## License

MIT License
