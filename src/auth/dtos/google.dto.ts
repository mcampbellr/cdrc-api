import { IsString } from 'class-validator';

export class GoogleDto {
  @IsString()
  id: string;

  @IsString()
  email: string;

  @IsString()
  name: string;

  @IsString()
  given_name: string;
  
  @IsString()
  family_name: string;

  @IsString()
  picture: string;
}
