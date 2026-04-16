import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'order.placed',
      noAck: false,
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.setGlobalPrefix('api/v1', { exclude: ['api', 'api-json'] });

  const config = new DocumentBuilder()
    .setTitle('BookStorm — Order Service API')
    .setDescription('Order and Cart domain API. Part of BookStorm e-commerce platform.')
    .setVersion('1.0.0')
    .addTag('Orders')
    .addTag('Cart')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    jsonDocumentUrl: 'api-json',
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`Swagger UI: http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
