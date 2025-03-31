import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class EnableMFADto {
  @IsString()
  @ApiProperty({ example: '123456' })
  mfaToken: string;
}
