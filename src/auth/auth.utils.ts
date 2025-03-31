import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';

export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
export const USER_ID_COOKIE_NAME = 'userId';

@Injectable()
export class AuthUtils {
  private readonly environment: string;
  private readonly cookieOptions: CookieOptions;

  constructor(private readonly _configService: ConfigService) {
    this.environment = this._configService.get<string>('NODE_ENV');
    this.cookieOptions = {
      httpOnly: true,
      secure: this.environment === 'production',
      sameSite: this.environment === 'production' ? 'none' : 'lax',
    };
  }

  setAuthCookies(res: Response, refreshToken: string, userId: string) {
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, this.cookieOptions);
    res.cookie(USER_ID_COOKIE_NAME, userId, this.cookieOptions);
    return {};
  }

  clearAuthCookies(res: Response) {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, this.cookieOptions);
    res.clearCookie(USER_ID_COOKIE_NAME, this.cookieOptions);
    return {};
  }
}
