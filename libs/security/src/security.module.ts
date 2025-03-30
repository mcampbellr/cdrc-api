import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { DatabaseModule } from '@app/database';
import { JWT_TYPE } from './jwt.enum';

@Module({
  imports: [DatabaseModule, JwtModule],
  providers: [
    SecurityService,
    {
      provide: JWT_TYPE.ACCESS,
      useFactory: () => {
        return new JwtService({
          secret: process.env.JWT_ACCESS_SECRET,
          signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRATION },
        });
      },
    },
    {
      provide: JWT_TYPE.REFRESH,
      useFactory: () => {
        return new JwtService({
          secret: process.env.JWT_REFRESH_SECRET,
          signOptions: { expiresIn: process.env.JWT_REFRESH_EXPIRATION },
        });
      },
    },
    {
      provide: JWT_TYPE.PRE_AUTH,
      useFactory: () => {
        return new JwtService({
          secret: process.env.JWT_PRE_AUTH_SECRET,
          signOptions: { expiresIn: process.env.JWT_PRE_AUTH_EXPIRATION },
        });
      },
    },
  ],
  exports: [SecurityService],
})
export class SecurityModule {}
