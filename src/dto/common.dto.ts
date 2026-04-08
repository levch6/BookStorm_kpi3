import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 'https://tools.ietf.org/html/rfc7807' })
  type: string;

  @ApiProperty({ example: 'Not Found' })
  title: string;

  @ApiProperty({ example: 404 })
  status: number;

  @ApiProperty({ example: 'Order with id abc123 was not found.' })
  detail: string;

  @ApiProperty({ example: '/api/v1/orders/abc123' })
  instance: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  traceId: string;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Order cancelled successfully.' })
  message: string;
}
