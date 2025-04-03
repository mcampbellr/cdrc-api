import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Redirect,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { GoogleService } from '@app/google';
import { OAuth2Client } from 'google-auth-library';
import { AuthUtils } from 'src/auth/auth.utils';
import { AuthService } from 'src/auth/services/auth.service';

@Controller('admin')
export class AdminController {
  private _oauth2Client: OAuth2Client;
  private frontendUrl: string;

  constructor(
    private readonly _authService: AuthService,
    private readonly _googleService: GoogleService,
    private readonly _configService: ConfigService,
    private readonly _authUtils: AuthUtils,
  ) {
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
    @Res({ passthrough: true }) res: Response,
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
        this._authUtils.setAuthCookies(res, refreshToken, user.id);

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
