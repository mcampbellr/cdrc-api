import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from '@app/database';
import {
  JwtStrategy,
  SecurityModule,
  JwtStrictStrategy,
  JwtPreAuthStrategy,
} from '@app/security';
import { GoogleModule } from '@app/google';
import { AuthMFAController } from './auth-mfa.controller';
import { AuthMFAService } from './auth-mfa.service';
import { AuthUtils } from './auth.utils';

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
