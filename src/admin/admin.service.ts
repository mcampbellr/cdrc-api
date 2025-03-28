import { BadRequestException, Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AdminService {
  private _oauth2Client: OAuth2Client;

  constructor(
    private readonly config: ConfigService,
    private readonly _authService: AuthService,
  ) {
    this._oauth2Client = new google.auth.OAuth2(
      this.config.get<string>('GOOGLE_CLIENT_ID'),
      this.config.get<string>('GOOGLE_CLIENT_SECRET'),
      this.config.get<string>('GOOGLE_REDIRECT_URI'),
    );
  }

  googleConnectLink(): string {
    return this._oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'openid',
        'profile',
        'email',
        'https://www.googleapis.com/auth/calendar',
      ],
    });
  }

  async handleGoogleCallback(code: string) {
    const { tokens } = await this._oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new BadRequestException('Invalid Google code');
    }

    const { user, accessToken, refreshToken } =
      await this._authService.createOrUpdateUserWithGoogle(
        tokens.access_token,
        tokens.refresh_token,
      );

    return {
      accessToken,
      refreshToken,
      user,
    };
  }
}
