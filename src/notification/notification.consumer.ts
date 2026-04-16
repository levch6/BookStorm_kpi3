import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderPlacedEvent } from '../events/order-placed.event';

@Controller()
export class NotificationConsumer {
  private readonly logger = new Logger(NotificationConsumer.name);

  @MessagePattern('order.placed')
  handleOrderPlaced(@Payload() event: OrderPlacedEvent): void {
    this.logger.log(
      `[Notification] Order ${event.orderId} confirmed for ${event.userEmail}. ` +
        `Total: ${event.totalPrice} UAH. Books: ${event.bookTitles.join(', ')}`,
    );
  }
}
