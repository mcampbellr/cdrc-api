import { User } from '@prisma/client';

export type SanitizedUser = Omit<
  User,
  | 'password'
  | 'calendarRefreshToken'
  | 'tokenVersion'
  | 'twoFactorSecret'
>;
