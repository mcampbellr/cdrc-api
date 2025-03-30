import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { DatabaseModule } from '@app/database';
import { JWT_TYPE } from './jwt.enum';
import { SecurityBusiness } from './security.business';
import { SecurityService } from './services/security.service';
import { EncryptionService } from './services/encryption.service';
import { MFAService } from './services/mfa.service';

@Module({
  imports: [DatabaseModule, JwtModule],
  providers: [
    SecurityService,
    SecurityBusiness,
    EncryptionService,
    MFAService,
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
  exports: [SecurityService, EncryptionService, MFAService],
})
export class SecurityModule {}
