import { ApiProperty } from '@nestjs/swagger';

export class OrderPlacedEvent {
  @ApiProperty({ example: 'f3e4d5c6-b7a8-9012-f3e4-d5c6b7a89012' })
  orderId: string;

  @ApiProperty({ example: 'customer@bookstorm.com' })
  userEmail: string;

  @ApiProperty({ example: 27.98 })
  totalPrice: number;

  @ApiProperty({ example: ['Atomic Habits', 'Dune'] })
  bookTitles: string[];

  @ApiProperty({ example: '2026-04-17T10:00:00.000Z' })
  createdAt: string;
}
