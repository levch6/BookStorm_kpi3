import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

interface EventFlowInfo {
  scenario: string;
  broker: string;
  queue: string;
  publisher: string;
  consumer: string;
  eventPayload: {
    orderId: string;
    userEmail: string;
    totalPrice: string;
    bookTitles: string;
    createdAt: string;
  };
  description: string;
}

@ApiTags('Events')
@Controller('events')
export class EventsController {
  @Get('info')
  @ApiOperation({ summary: 'Get event-driven architecture flow description' })
  @ApiResponse({ status: 200, description: 'Event flow info' })
  getEventInfo(): EventFlowInfo {
    return {
      scenario: 'OrderPlaced → Notification',
      broker: 'RabbitMQ',
      queue: 'order.placed',
      publisher: 'OrdersController.createOrder',
      consumer: 'NotificationConsumer',
      eventPayload: {
        orderId: 'uuid',
        userEmail: 'string',
        totalPrice: 'number',
        bookTitles: 'string[]',
        createdAt: 'ISO8601',
      },
      description:
        'When POST /api/v1/orders is called, an OrderPlacedEvent is published to RabbitMQ. NotificationConsumer receives it and logs a simulated email notification.',
    };
  }
}
