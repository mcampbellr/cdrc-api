import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

const algorithm = 'aes-256-gcm';

@Injectable()
export class EncryptionService {
  private _encryptionKey: Buffer<ArrayBuffer>;

  constructor(private readonly config: ConfigService) {
    const key = Buffer.from(this.config.get<string>('ENCRYPTION_KEY'), 'hex');

    if (!key || key.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be 32 characters long');
    }

    this._encryptionKey = key;
  }

  encrypt(value: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(algorithm, this._encryptionKey, iv);

      const encrypted = Buffer.concat([
        cipher.update(value, 'utf8'),
        cipher.final(),
      ]);
      const tag = cipher.getAuthTag();

      return [
        iv.toString('hex'),
        tag.toString('hex'),
        encrypted.toString('hex'),
      ].join('.');
    } catch (err) {
      throw new InternalServerErrorException('Encryption failed');
    }
  }

  decrypt(encryptedString: string): string {
    try {
      const [ivHex, tagHex, encryptedHex] = encryptedString.split('.');
      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');

      const decipher = crypto.createDecipheriv(
        algorithm,
        this._encryptionKey,
        iv,
      );
      decipher.setAuthTag(tag);

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch (err) {
      throw new InternalServerErrorException('Decryption failed');
    }
  }
}
