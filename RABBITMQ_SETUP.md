# RabbitMQ Setup

## Run RabbitMQ locally via Docker

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

## Verify it's running

Open http://localhost:15672 in your browser and log in with `guest` / `guest`.

## Start the app

```bash
npm run start:dev
```

## Trigger the event

Send a POST request to create an order:

```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "cartId": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
    "deliveryBranch": "Kyiv, Nova Poshta #1",
    "paymentMethod": "stripe"
  }'
```

Or use the Swagger UI at http://localhost:3000/api.

## Expected console output

```
[NotificationConsumer] [Notification] Order f3e4d5c6-b7a8-9012-f3e4-d5c6b7a89012 confirmed for customer@bookstorm.com. Total: 27.98 UAH. Books: Atomic Habits
```

## Notes

- If RabbitMQ is not running, the app still works — a warning is logged and the order response is returned normally.
- The event flow: `POST /api/v1/orders` → `OrdersController` publishes `OrderPlacedEvent` → RabbitMQ queue `order.placed` → `NotificationConsumer` logs notification.
