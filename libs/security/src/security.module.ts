import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { DbModule } from '@db';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [DbModule, JwtModule],
  providers: [
    SecurityService,
    {
      provide: 'JWT_ACCESS',
      useFactory: () => {
        return new JwtService({
          secret: process.env.JWT_ACCESS_SECRET,
          signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRATION },
        });
      },
    },
    {
      provide: 'JWT_REFRESH',
      useFactory: () => {
        return new JwtService({
          secret: process.env.JWT_REFRESH_SECRET,
          signOptions: { expiresIn: process.env.JWT_REFRESH_EXPIRATION },
        });
      },
    },
  ],
  exports: [SecurityService],
})
export class SecurityModule {}
