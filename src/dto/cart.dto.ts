import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-b2c3-d4e5f6a78901', format: 'uuid' })
  @IsUUID()
  bookId: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CartItemDto {
  @ApiProperty({ example: 'c3d4e5f6-a7b8-9012-c3d4-e5f6a7b89012' })
  id: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-b2c3-d4e5f6a78901' })
  bookId: string;

  @ApiProperty({ example: 'The Midnight Library' })
  bookTitle: string;

  @ApiProperty({ example: 1 })
  quantity: number;

  @ApiProperty({ example: 12.99 })
  unitPrice: number;
}

export class CartResponseDto {
  @ApiProperty({ example: 'e3d4f5a6-b7c8-9012-d3e4-f5a6b7c89012' })
  id: string;

  @ApiProperty({ type: [CartItemDto] })
  items: CartItemDto[];

  @ApiProperty({ example: 27.98 })
  subtotal: number;
}
