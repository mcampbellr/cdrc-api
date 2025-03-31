import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GoogleDto {
  @IsString()
  @ApiProperty({ description: 'Google ID Token' })
  idToken: string;
}
