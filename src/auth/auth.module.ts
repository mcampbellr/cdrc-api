import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DbModule } from '@db';
import { SecurityModule } from '@security';
import { JwtStrategy } from '@security/jwt.strategy';

@Module({
  imports: [DbModule, SecurityModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy],
})
export class AuthModule {}
