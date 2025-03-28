import { AuthRepository } from './repositories/auth.repository';
import { UsersRepository } from './repositories/users.repository';
/* import { PrismaRefreshTokenRepository } from './repositories/refresh-token.repository'; */

export const repositories = [
  /* PrismaRefreshTokenRepository, */
  AuthRepository,
  UsersRepository,
];
