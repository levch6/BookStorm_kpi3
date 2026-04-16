import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { NotificationModule } from './notification/notification.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [OrdersModule, CartModule, NotificationModule, EventsModule],
})
export class AppModule {}
