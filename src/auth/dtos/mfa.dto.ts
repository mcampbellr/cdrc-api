import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class MFABodyDto {
  @IsString()
  @ApiProperty({ example: '123456' })
  mfaToken: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'native' })
  source?: string;
}
