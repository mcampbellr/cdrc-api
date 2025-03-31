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
  qrCode: string;
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
    const qr = await this._generateQrImageDataUrl(uri);

    return {
      secret: secret.match(/.{1,8}/g).join(' '),
      encryptSecret,
      otpauthUrl: uri,
      qrCode: qr,
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

  private async _generateQrImageDataUrl(otpUri: string): Promise<string> {
    try {
      const qrDataUrl = await QRCode.toDataURL(otpUri);
      return qrDataUrl;
    } catch (error) {
      throw new Error('Error generando código QR');
    }
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
