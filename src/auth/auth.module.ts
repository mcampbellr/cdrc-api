import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from '@app/database';
import { JwtStrategy, SecurityModule, StrictJwtStrategy } from '@app/security';

@Module({
  imports: [DatabaseModule, SecurityModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, StrictJwtStrategy],
  exports: [AuthService, JwtStrategy, StrictJwtStrategy],
})
export class AuthModule {}
