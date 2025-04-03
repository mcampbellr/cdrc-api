import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SanitizedUser } from 'src/users/data/user.interface';

export enum SocialProvider {
  GOOGLE = 'google',
  APPLE = 'apple',
}

export class SocialDto {
  @IsString()
  @ApiProperty({ description: 'Social ID Token' })
  token: string;

  @IsString()
  @IsEnum(SocialProvider)
  @ApiProperty({ description: 'Social Provider', enum: SocialProvider })
  provider: SocialProvider;

  @IsOptional()
  @ApiProperty({
    description: 'User Name to be used for the user',
    required: false,
  })
  userName?: string;
}

export class SignInResponseWithSocialDto {
  @ApiProperty()
  user?: SanitizedUser;
  @ApiProperty()
  accessToken?: string;
  @ApiProperty()
  preAuthToken?: string;
  @ApiProperty()
  requiresTwoFactor?: boolean;
}
