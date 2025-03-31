import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class MFABodyDto {
  @IsString()
  @ApiProperty({ example: '123456' })
  mfaToken: string;
}

