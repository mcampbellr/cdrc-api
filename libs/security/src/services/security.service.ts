import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { JWT_TYPE } from '../jwt.enum';
import { JwtPayload } from '../strategies/data/strategies.interface';

@Injectable()
export class SecurityService {
  constructor(
    @Inject(JWT_TYPE.ACCESS) private readonly _jwtAccess: JwtService,
    @Inject(JWT_TYPE.REFRESH) private readonly _jwtRefresh: JwtService,
    @Inject(JWT_TYPE.PRE_AUTH) private readonly _jwtPreAuth: JwtService,
  ) {}

  signAccessToken(payload: JwtPayload): string {
    return this._jwtAccess.sign(payload);
  }

  signRefreshToken(payload: JwtPayload): string {
    return this._jwtRefresh.sign(payload);
  }

  signPreAuthToken(payload: Omit<JwtPayload, 'deviceId'>): string {
    return this._jwtPreAuth.sign(payload);
  }

  verifyPreAuthToken(token: string) {
    return this._jwtPreAuth.verify<JwtPayload>(token);
  }

  verifyAccessToken(token: string) {
    return this._jwtAccess.verify<JwtPayload>(token);
  }

  verifyRefreshToken(token: string) {
    return this._jwtRefresh.verify<JwtPayload>(token);
  }

  async signAndGenerateTokens(payload: JwtPayload): Promise<{
    accessToken: string;
    refreshToken: string;
    hashedRefreshToken: string;
  }> {
    const accessToken = this.signAccessToken(payload);
    const refreshToken = this.signRefreshToken(payload);

    const hashedRefreshToken = this.hashRefreshToken(refreshToken);

    return { accessToken, refreshToken, hashedRefreshToken };
  }

  hashRefreshToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
