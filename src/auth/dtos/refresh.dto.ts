import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsOptional, IsUUID } from 'class-validator';

export class RefreshTokenDto {
  @IsJWT()
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VJZCI6IjEiLCJpYXQiOjE2MjYwNjIwMzcsImV4cCI6MTYyNjA2MjA5N30.1',
  })
  @IsOptional()
  refreshToken?: string;

  @IsUUID()
  @ApiProperty({
    example: 'f7b6e7a9-2c4b-4e7b-9e5e-2a4a0b9e9e6d',
  })
  userId?: string;
}

export class RefreshTokensResponeseDto {
  @IsJWT()
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VJZCI6IjEiLCJpYXQiOjE2MjYwNjIwMzcsImV4cCI6MTYyNjA2MjA5N30.1',
  })
  accessToken: string;

  @IsUUID()
  @ApiProperty({
    example: 'f7b6e7a9-2c4b-4e7b-9e5e-2a4a0b9e9e6d',
  })
  deviceId: string;

  @IsJWT()
  @ApiProperty({
    nullable: true,
    required: false,
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VJZCI6IjEiLCJpYXQiOjE2MjYwNjIwMzcsImV4cCI6MTYyNjA2MjA5N30.1',
  })
  refreshToken?: string;
}
