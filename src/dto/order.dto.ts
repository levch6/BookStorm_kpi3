import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export enum PaymentMethod {
  STRIPE = 'stripe',
  LIQPAY = 'liqpay',
}

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  SHIPPED = 'shipped',
}

export class CreateOrderDto {
  @ApiProperty({ example: 'e3d4f5a6-b7c8-9012-d3e4-f5a6b7c89012', format: 'uuid' })
  @IsUUID()
  cartId: string;

  @ApiProperty({ example: 'Kyiv, Nova Poshta #42' })
  @IsString()
  @IsNotEmpty()
  deliveryBranch: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.STRIPE })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}

export class OrderItemDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890' })
  id: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-b2c3-d4e5f6a78901' })
  bookId: string;

  @ApiProperty({ example: 'Dune' })
  bookTitle: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 14.99 })
  unitPrice: number;
}

export class OrderResponseDto {
  @ApiProperty({ example: 'f1e2d3c4-b5a6-7890-f1e2-d3c4b5a67890' })
  id: string;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING })
  status: OrderStatus;

  @ApiProperty({ example: 44.97 })
  totalPrice: number;

  @ApiProperty({ example: 'Kyiv, Nova Poshta #42' })
  deliveryBranch: string;

  @ApiProperty({ example: 'stripe' })
  paymentMethod: string;

  @ApiProperty({ example: '2026-04-08T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ type: [OrderItemDto] })
  items: OrderItemDto[];
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  currentPage: number;

  @ApiProperty({ example: 10 })
  pageSize: number;

  @ApiProperty({ example: 42 })
  totalItems: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

export class PaginatedOrdersResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  data: OrderResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
