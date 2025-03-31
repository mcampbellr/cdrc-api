import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import {
  JwtStrategy,
  SecurityModule,
  JwtStrictStrategy,
  JwtPreAuthStrategy,
} from '@app/security';
import { GoogleModule } from '@app/google';
import { AuthUtils } from './auth.utils';
import { AuthController } from './controllers/auth.controller';
import { AuthMFAController } from './controllers/auth-mfa.controller';
import { AuthService } from './services/auth.service';
import { AuthMFAService } from './services/auth-mfa.service';

@Module({
  imports: [DatabaseModule, SecurityModule, GoogleModule],
  controllers: [AuthController, AuthMFAController],
  providers: [
    AuthService,
    AuthMFAService,
    AuthUtils,
    JwtStrategy,
    JwtStrictStrategy,
    JwtPreAuthStrategy,
  ],
  exports: [
    AuthService,
    AuthMFAService,
    AuthUtils,
    JwtStrategy,
    JwtStrictStrategy,
    JwtPreAuthStrategy,
  ],
})
export class AuthModule {}
