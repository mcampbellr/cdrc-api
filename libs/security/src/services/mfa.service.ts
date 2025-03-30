import { Injectable } from '@nestjs/common';

import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import * as b32 from 'hi-base32';

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
      secret: this._beautifySecret(secret),
      encryptSecret,
      otpauthUrl: uri,
      qrCode: qr,
    };
  }

  private async _generateQrImageDataUrl(otpUri: string): Promise<string> {
    try {
      const qrDataUrl = await QRCode.toDataURL(otpUri);
      return qrDataUrl; // formato: "data:image/png;base64,..."
    } catch (error) {
      throw new Error('Error generando código QR');
    }
  }

  private _beautifySecret(secret: string) {
    return secret.match(/.{1,8}/g)?.join(' ') ?? secret;
  }

  private _generateSecret(): MFASecrets {
    const buffer = crypto.randomBytes(20);
    const base32 = b32.encode(buffer).replace(/=/g, '');
    const encryptSecret = this._encryptionService.encrypt(base32);

    return {
      secret: base32.toUpperCase(),
      encryptSecret,
    };
  }
}
