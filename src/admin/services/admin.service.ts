import { GoogleService } from '@app/google';
import { BadRequestException, Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AdminService {
  private _oauth2Client: OAuth2Client;
  constructor(
    private readonly _googleService: GoogleService,
    private readonly _authService: AuthService,
  ) {
    this._oauth2Client = this._googleService.getOauth2Client();
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
