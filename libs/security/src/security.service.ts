import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

interface JWTPayload {
  sub: string;
  email: string;
  version: number;
}

@Injectable()
export class SecurityService {
  constructor(
    @Inject('JWT_ACCESS') private readonly jwtAccess: JwtService,
    @Inject('JWT_REFRESH') private readonly jwtRefresh: JwtService,
  ) {}

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
