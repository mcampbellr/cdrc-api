import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface JWTPayload {
  sub: string;
  email: string;
  version: number;
}

const algorithm = 'aes-256-gcm';

@Injectable()
export class SecurityService {
  private _encryptionKey: Buffer<ArrayBuffer>;
  constructor(
    private readonly config: ConfigService,
    @Inject('JWT_ACCESS') private readonly jwtAccess: JwtService,
    @Inject('JWT_REFRESH') private readonly jwtRefresh: JwtService,
  ) {
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

  signAccessToken(payload: JWTPayload): string {
    return this.jwtAccess.sign(payload);
  }

  signRefreshToken(payload: JWTPayload): string {
    return this.jwtRefresh.sign(payload);
  }

  verifyAccessToken(token: string): any {
    return this.jwtAccess.verify(token);
  }

  verifyRefreshToken(token: string): any {
    return this.jwtRefresh.verify(token);
  }

  async signAndGenerateTokens(payload: JWTPayload): Promise<{
    accessToken: string;
    refreshToken: string;
    hashedRefreshToken: string;
  }> {
    const accessToken = this.signAccessToken(payload);
    const refreshToken = this.signRefreshToken(payload);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    return { accessToken, refreshToken, hashedRefreshToken };
  }
}
