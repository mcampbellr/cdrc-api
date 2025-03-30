import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JWT_TYPE } from './jwt.enum';
import { JwtPayload } from './strategies/data/strategies.interface';

const algorithm = 'aes-256-gcm';

@Injectable()
export class SecurityService {
  private _encryptionKey: Buffer<ArrayBuffer>;
  constructor(
    private readonly config: ConfigService,
    @Inject(JWT_TYPE.ACCESS) private readonly _jwtAccess: JwtService,
    @Inject(JWT_TYPE.REFRESH) private readonly _jwtRefresh: JwtService,
    @Inject(JWT_TYPE.PRE_AUTH) private readonly _jwtPreAuth: JwtService,
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

  signAccessToken(payload: JwtPayload): string {
    return this._jwtAccess.sign(payload);
  }

  signRefreshToken(payload: JwtPayload): string {
    return this._jwtRefresh.sign(payload);
  }

  signPreAuthToken(payload: JwtPayload): string {
    return this._jwtPreAuth.sign(payload);
  }

  verifyPreAuthToken(token: string): any {
    return this._jwtPreAuth.verify(token);
  }

  verifyAccessToken(token: string): any {
    return this._jwtAccess.verify(token);
  }

  verifyRefreshToken(token: string): any {
    return this._jwtRefresh.verify(token);
  }

  async signAndGenerateTokens(payload: JwtPayload): Promise<{
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
