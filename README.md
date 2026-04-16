# BookStorm — Order Service

A demo NestJS microservice for the BookStorm book e-commerce platform. Handles orders and cart management with an event-driven notification flow via RabbitMQ.

## Features

- **Orders** — create, list, get, cancel, confirm, and pre-order endpoints
- **Cart** — cart management endpoints
- **Event-Driven Architecture** — order creation publishes an `OrderPlacedEvent` to RabbitMQ; a notification consumer logs a simulated confirmation
- **Swagger UI** — full API documentation at `/api`

## Architecture

```
POST /api/v1/orders
       │
       ▼
 OrdersController
       │  publishes OrderPlacedEvent
       ▼
   RabbitMQ (queue: order.placed)
       │
       ▼
 NotificationConsumer
       │  logs simulated notification
       ▼
 [Notification] Order {id} confirmed for {email}. Total: {price} UAH. Books: {titles}
```

## Prerequisites

- Node.js 18+
- Docker (for RabbitMQ)

## Setup

**1. Install dependencies**

```bash
npm install
```

**2. Start RabbitMQ**

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

RabbitMQ management UI: http://localhost:15672 (guest / guest)

**3. Start the app**

```bash
npm run start:dev
```

- API: http://localhost:3000/api/v1
- Swagger: http://localhost:3000/api

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/orders` | List orders (paginated, filterable) |
| GET | `/api/v1/orders/:id` | Get order by ID |
| POST | `/api/v1/orders` | Create order → triggers RabbitMQ event |
| POST | `/api/v1/orders/pre-order` | Create a pre-order |
| POST | `/api/v1/orders/:id/cancel` | Cancel an order |
| POST | `/api/v1/orders/:id/confirm` | Confirm an order |
| GET | `/api/v1/cart` | Get cart |
| POST | `/api/v1/cart` | Add item to cart |
| GET | `/api/v1/events/info` | Event-driven flow description |

## Example: Trigger the Event Flow

```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "cartId": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
    "deliveryBranch": "Kyiv, Nova Poshta #1",
    "paymentMethod": "stripe"
  }'
```

Expected console output:

```
[NotificationConsumer] [Notification] Order f3e4d5c6-b7a8-9012-f3e4-d5c6b7a89012 confirmed for customer@bookstorm.com. Total: 27.98 UAH. Books: Atomic Habits
```

> If RabbitMQ is not running, the order is still created and a warning is logged — no crash.

## Project Structure

```
src/
├── events/
│   ├── order-placed.event.ts     # Event payload class
│   ├── events.controller.ts      # GET /events/info
│   └── events.module.ts
├── notification/
│   ├── notification.consumer.ts  # RabbitMQ consumer
│   └── notification.module.ts
├── orders/
│   ├── orders.controller.ts      # Orders endpoints + event publisher
│   └── orders.module.ts
├── cart/
│   └── cart.controller.ts
├── dto/
│   ├── order.dto.ts
│   ├── cart.dto.ts
│   └── common.dto.ts
├── app.module.ts
└── main.ts                       # Hybrid HTTP + RabbitMQ microservice
```

## Scripts

```bash
npm run start:dev   # development with watch
npm run start       # production
npm run test        # unit tests
npm run test:e2e    # e2e tests
npm run test:cov    # test coverage
```

## License

MIT
