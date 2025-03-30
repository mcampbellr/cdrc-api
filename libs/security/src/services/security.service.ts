import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
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
