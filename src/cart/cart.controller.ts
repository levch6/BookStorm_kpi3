import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AddCartItemDto, CartItemDto, CartResponseDto } from '../dto/cart.dto';
import { ErrorResponseDto } from '../dto/common.dto';

const MOCK_CART: CartResponseDto = {
  id: 'e3d4f5a6-b7c8-9012-d3e4-f5a6b7c89012',
  items: [
    {
      id: 'c3d4e5f6-a7b8-9012-c3d4-e5f6a7b89012',
      bookId: 'b2c3d4e5-f6a7-8901-b2c3-d4e5f6a78901',
      bookTitle: 'The Midnight Library',
      quantity: 1,
      unitPrice: 12.99,
    },
    {
      id: 'c4d5e6f7-a8b9-0123-c4d5-e6f7a8b90123',
      bookId: 'b5c6d7e8-f9a0-1234-b5c6-d7e8f9a01234',
      bookTitle: 'Sapiens: A Brief History of Humankind',
      quantity: 1,
      unitPrice: 14.99,
    },
  ],
  subtotal: 27.98,
};

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  @Get()
  @ApiOperation({ summary: "Get current user's cart" })
  @ApiResponse({ status: 200, type: CartResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  getCart(): CartResponseDto {
    return MOCK_CART;
  }

  @Post('items')
  @ApiOperation({ summary: 'Add a book to the cart' })
  @ApiResponse({ status: 201, type: CartResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  addItem(@Body() dto: AddCartItemDto): CartResponseDto {
    const newItem: CartItemDto = {
      id: 'd1e2f3a4-b5c6-7890-d1e2-f3a4b5c67890',
      bookId: dto.bookId,
      bookTitle: 'Brave New World',
      quantity: dto.quantity,
      unitPrice: 11.99,
    };
    const updatedItems = [...MOCK_CART.items, newItem];
    const subtotal = updatedItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    return {
      ...MOCK_CART,
      items: updatedItems,
      subtotal: Math.round(subtotal * 100) / 100,
    };
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove an item from the cart' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Item removed successfully' })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  removeItem(@Param('id') id: string): void {
    // Mock: no-op, returns 204
  }
}
