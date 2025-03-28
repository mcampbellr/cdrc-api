import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule, JwtModule],
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
