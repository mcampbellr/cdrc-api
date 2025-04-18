import { Injectable } from '@nestjs/common';

import * as QRCode from 'qrcode';
import * as speakeasy from 'speakeasy';

import { EncryptionService } from './encryption.service';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

interface MFASecrets {
  secret: string;
  encryptSecret: string;
}

export interface MFA extends MFASecrets {
  otpauthUrl: string;
}

@Injectable()
export class MFAService {
  constructor(
    private readonly _configService: ConfigService,
    private readonly _encryptionService: EncryptionService,
  ) {}

  async generateUserMFA(user: User): Promise<MFA> {
    const { secret, encryptSecret } = this._generateSecret();

    const label = encodeURIComponent(user.email);
    const issuer = encodeURIComponent(
      this._configService.get<string>('APP_NAME'),
    );

    const uri = `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}`;

    return {
      secret: secret.match(/.{1,8}/g).join(' '),
      encryptSecret,
      otpauthUrl: uri,
    };
  }

  async verifyMFACode(user: User, code: string) {
    const secret = this._encryptionService.decrypt(user.twoFactorSecret);

    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
    });
  }

  private _generateSecret(): MFASecrets {
    var secret = speakeasy.generateSecret({ length: 20 });

    const encryptSecret = this._encryptionService.encrypt(secret.base32);

    return {
      secret: secret.base32.toUpperCase(),
      encryptSecret,
    };
  }
}
