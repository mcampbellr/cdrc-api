import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

@Injectable()
export class GoogleService {
  private _oauth2Client: OAuth2Client;
  constructor(private readonly config: ConfigService) {
    this._oauth2Client = new google.auth.OAuth2(
      this.config.get<string>('GOOGLE_CLIENT_ID'),
      this.config.get<string>('GOOGLE_CLIENT_SECRET'),
      this.config.get<string>('GOOGLE_REDIRECT_URI'),
    );
  }

  getOauth2Client() {
    return this._oauth2Client;
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

  async getGoogleUser(accessToken: string) {
    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
      const response = await oauth2.userinfo.get();

      if (response.status !== 200) {
        throw new ForbiddenException('Invalid Google token');
      }

      return response.data;
    } catch (error) {
      console.log('Error: ', error);
    }
  }
}
