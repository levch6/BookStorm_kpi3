import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [OrdersModule, CartModule],
})
export class AppModule {}
