import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Redirect,
  Res,
} from '@nestjs/common';
import { CookieOptions, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { GoogleService } from '@app/google';
import { OAuth2Client } from 'google-auth-library';
import { AuthService } from 'src/auth/auth.service';

@Controller('admin')
export class AdminController {
  private readonly environment: string;
  private _oauth2Client: OAuth2Client;
  private frontendUrl: string;
  constructor(
    private readonly _authService: AuthService,
    private readonly _googleService: GoogleService,
    private readonly _configService: ConfigService,
  ) {
    this.environment = this._configService.get<string>('NODE_ENV');
    this._oauth2Client = this._googleService.getOauth2Client();

    this.frontendUrl = this._configService.get<string>('APP_FRONTEND_URL');
    if (!this.frontendUrl) {
      throw new Error('APP_FRONTEND_URL is not defined');
    }
  }

  @Get('/google/login')
  connectGoogle() {
    return this._googleService.googleConnectLink();
  }

  @Get('/google/callback')
  @Redirect()
  async googleCalendarCallback(
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    try {
      const { tokens: googleTokens } = await this._oauth2Client.getToken(code);

      if (!googleTokens.access_token || !googleTokens.refresh_token) {
        throw new BadRequestException('Invalid Google code');
      }

      const { user, accessToken, refreshToken } =
        await this._authService.createOrUpdateUserWithGoogle(
          googleTokens.access_token,
          googleTokens.refresh_token,
        );

      if (user.isTwoFactorEnabled) {
        const { preAuthToken } =
          await this._authService.issuePreAuthToken(user);
        return {
          url: `${this.frontendUrl}/google/success?pat=${preAuthToken}&mfa=true&uid=${user.id}`,
        };
      } else {
        const cookieOptions: CookieOptions = {
          httpOnly: true,
          secure: this.environment === 'production',
          sameSite: this.environment === 'production' ? 'none' : 'lax',
        };
        res.cookie('refreshToken', refreshToken, cookieOptions);
        res.cookie('userId', user.id, cookieOptions);

        return {
          url: `${this.frontendUrl}/google/success?at=${accessToken}&uid=${user.id}`,
        };
      }
    } catch (e) {
      return {
        url: `${this.frontendUrl}/google/failure`,
      };
    }
  }
}
