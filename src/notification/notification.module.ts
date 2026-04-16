import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationConsumer } from './notification.consumer';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'order.placed',
          noAck: false,
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [NotificationConsumer],
})
export class NotificationModule {}
