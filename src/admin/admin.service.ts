import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { UsersRepository } from '@db';

@Injectable()
export class AdminService {
  private _oauth2Client: OAuth2Client;

  constructor(
    private readonly config: ConfigService,
    private readonly _usersRepository: UsersRepository,
  ) {
    this._oauth2Client = new google.auth.OAuth2(
      this.config.get<string>('GOOGLE_CLIENT_ID'),
      this.config.get<string>('GOOGLE_CLIENT_SECRET'),
      this.config.get<string>('GOOGLE_REDIRECT_URI'),
    );
  }

  googleConnectLinkGeneration() {
    const doctorId = '123'; // This should be the doctor's ID

    return this._oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/calendar'],
      state: doctorId,
    });
  }

  async handleGoogleCallback(code: string) {
    const { tokens } = await this._oauth2Client.getToken(code);

    return tokens;
  }

  async saveGoogleRefreshToken(doctorId: string, refreshToken: string) {
    return this._usersRepository.addGoogleRefreshToken(doctorId, refreshToken);
  }
}
