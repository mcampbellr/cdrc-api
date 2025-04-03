import { ApiProperty } from '@nestjs/swagger';
import { $Enums, User } from '@prisma/client';

export type PrismaSanitizedUser = Omit<
  User,
  'password' | 'calendarRefreshToken' | 'tokenVersion' | 'twoFactorSecret'
>;

export class SanitizedUser implements PrismaSanitizedUser {
  @ApiProperty()
  name: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  role: $Enums.RoleType;

  @ApiProperty()
  accountType: $Enums.AccountType;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  appleId: string;

  @ApiProperty()
  invitedBy: string;

  @ApiProperty()
  invitationCode: string;

  @ApiProperty()
  lastLoginAt: Date;

  @ApiProperty()
  status: $Enums.UserStatus;

  @ApiProperty()
  isTwoFactorEnabled: boolean;

  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  googleId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
