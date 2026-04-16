import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Optional,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateOrderDto,
  CreatePreOrderDto,
  OrderResponseDto,
  OrderStatus,
  PaginatedOrdersResponseDto,
  PreOrderResponseDto,
} from '../dto/order.dto';
import { ErrorResponseDto, MessageResponseDto } from '../dto/common.dto';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { OrderPlacedEvent } from '../events/order-placed.event';

const MOCK_ORDERS: OrderResponseDto[] = [
  {
    id: 'f1e2d3c4-b5a6-7890-f1e2-d3c4b5a67890',
    status: OrderStatus.PAID,
    totalPrice: 44.97,
    deliveryBranch: 'Kyiv, Nova Poshta #42',
    paymentMethod: 'stripe',
    createdAt: '2026-04-05T09:30:00.000Z',
    items: [
      {
        id: 'a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890',
        bookId: 'b2c3d4e5-f6a7-8901-b2c3-d4e5f6a78901',
        bookTitle: 'Dune',
        quantity: 2,
        unitPrice: 14.99,
      },
      {
        id: 'a2b3c4d5-e6f7-8901-a2b3-c4d5e6f78901',
        bookId: 'b3c4d5e6-f7a8-9012-b3c4-d5e6f7a89012',
        bookTitle: 'The Midnight Library',
        quantity: 1,
        unitPrice: 14.99,
      },
    ],
  },
  {
    id: 'f2e3d4c5-b6a7-8901-f2e3-d4c5b6a78901',
    status: OrderStatus.SHIPPED,
    totalPrice: 29.98,
    deliveryBranch: 'Lviv, Ukrposhta #17',
    paymentMethod: 'liqpay',
    createdAt: '2026-04-07T14:15:00.000Z',
    items: [
      {
        id: 'a3b4c5d6-e7f8-9012-a3b4-c5d6e7f89012',
        bookId: 'b4c5d6e7-f8a9-0123-b4c5-d6e7f8a90123',
        bookTitle: 'Project Hail Mary',
        quantity: 2,
        unitPrice: 14.99,
      },
    ],
  },
];

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(
    @Optional() @Inject('RABBITMQ_CLIENT') private readonly rmqClient: ClientProxy | null,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of orders' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiQuery({ name: 'sort', required: false, type: String, example: 'createdAt:desc' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, example: '2025-01-01', description: 'ISO 8601 date — filter orders created on or after this date' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, example: '2025-12-31', description: 'ISO 8601 date — filter orders created on or before this date' })
  @ApiQuery({ name: 'minPrice', required: false, type: Number, description: 'Minimum total order price' })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number, description: 'Maximum total order price' })
  @ApiResponse({ status: 200, type: PaginatedOrdersResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  listOrders(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: OrderStatus,
    @Query('sort') _sort?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ): PaginatedOrdersResponseDto {
    let filtered = status
      ? MOCK_ORDERS.filter((o) => o.status === status)
      : [...MOCK_ORDERS];

    if (dateFrom) filtered = filtered.filter((o) => o.createdAt >= dateFrom);
    if (dateTo) filtered = filtered.filter((o) => o.createdAt <= dateTo + 'T23:59:59.999Z');
    if (minPrice !== undefined) filtered = filtered.filter((o) => o.totalPrice >= Number(minPrice));
    if (maxPrice !== undefined) filtered = filtered.filter((o) => o.totalPrice <= Number(maxPrice));

    return {
      data: filtered,
      meta: {
        currentPage: Number(page),
        pageSize: Number(limit),
        totalItems: filtered.length,
        totalPages: Math.ceil(filtered.length / Number(limit)),
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single order by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  getOrder(@Param('id') id: string): OrderResponseDto {
    const order = MOCK_ORDERS.find((o) => o.id === id);
    if (order) return order;
    return MOCK_ORDERS[0];
  }

  @Post()
  @ApiOperation({ summary: 'Create a new order from cart' })
  @ApiResponse({ status: 201, type: OrderResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  @ApiResponse({ status: 409, type: ErrorResponseDto })
  async createOrder(@Body() dto: CreateOrderDto): Promise<OrderResponseDto> {
    const order: OrderResponseDto = {
      id: 'f3e4d5c6-b7a8-9012-f3e4-d5c6b7a89012',
      status: OrderStatus.PENDING,
      totalPrice: 27.98,
      deliveryBranch: dto.deliveryBranch,
      paymentMethod: dto.paymentMethod,
      createdAt: new Date().toISOString(),
      items: [
        {
          id: 'a4b5c6d7-e8f9-0123-a4b5-c6d7e8f90123',
          bookId: dto.cartId,
          bookTitle: 'Atomic Habits',
          quantity: 2,
          unitPrice: 13.99,
        },
      ],
    };

    const event: OrderPlacedEvent = {
      orderId: order.id,
      userEmail: 'customer@bookstorm.com',
      totalPrice: order.totalPrice,
      bookTitles: order.items.map((i) => i.bookTitle),
      createdAt: order.createdAt,
    };

    try {
      if (this.rmqClient) {
        await lastValueFrom(this.rmqClient.emit('order.placed', event));
      } else {
        this.logger.warn('[RabbitMQ] Client not available — skipping event publish');
      }
    } catch (err) {
      this.logger.warn(`[RabbitMQ] Failed to publish OrderPlacedEvent: ${(err as Error).message}`);
    }

    return order;
  }

  @Post('pre-order')
  @ApiOperation({ summary: 'Create a pre-order for an upcoming book release' })
  @ApiResponse({ status: 201, type: PreOrderResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  @ApiResponse({ status: 409, type: ErrorResponseDto })
  createPreOrder(@Body() dto: CreatePreOrderDto): PreOrderResponseDto {
    return {
      id: 'p1a2b3c4-d5e6-7890-p1a2-b3c4d5e67890',
      bookId: dto.bookId,
      bookTitle: 'Dune Messiah',
      status: 'locked',
      expectedReleaseDate: dto.expectedReleaseDate,
      createdAt: new Date().toISOString(),
    };
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel an order (custom method)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: MessageResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  @ApiResponse({ status: 403, type: ErrorResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ApiResponse({ status: 409, type: ErrorResponseDto })
  cancelOrder(@Param('id') id: string): MessageResponseDto {
    return { message: `Order ${id} has been cancelled successfully.` };
  }

  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm an order' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: MessageResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  @ApiResponse({ status: 403, type: ErrorResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ApiResponse({ status: 409, type: ErrorResponseDto })
  confirmOrder(@Param('id') id: string): MessageResponseDto {
    return { message: `Order ${id} has been confirmed successfully.` };
  }
}
