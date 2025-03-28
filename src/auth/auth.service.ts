import { ForbiddenException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { google } from 'googleapis';

import { GoogleDto } from './dtos/google.dto';
import { SecurityService } from '@security';
import { User } from '@prisma/client';
import { UsersRepository } from '@app/database';

@Injectable()
export class AuthService {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _securityService: SecurityService,
  ) {}

  async signInWithGoogle(googleCredentials: GoogleDto) {
    const { idToken } = googleCredentials;

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: idToken });

    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const response = await oauth2.userinfo.get();

    if (response.status !== 200) {
      throw new ForbiddenException('Invalid Google token');
    }

    const googleUser = response.data;

    let user = await this._usersRepository.findByGoogleId(googleUser.id);

    if (!user) {
      user = await this._usersRepository.findByEmail(googleUser.email);

      if (user) {
        user = await this._usersRepository.update(user.id, {
          googleId: googleUser.id,
        });
      } else {
        user = await this._usersRepository.create({
          googleId: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.picture,
        });
      }
    }

    const { accessToken, refreshToken } = await this.login(user);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this._usersRepository.findByEmail(email);
    const isValid =
      user && user.password && (await bcrypt.compare(password, user.password));
    return isValid ? user : null;
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      version: user.tokenVersion,
    };

    const { accessToken, refreshToken, hashedRefreshToken } =
      await this._securityService.signAndGenerateTokens(payload);

    await this._usersRepository.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this._usersRepository.findById(userId);
    if (!user?.refreshToken) throw new ForbiddenException();

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) throw new ForbiddenException();

    const payload = this._securityService.verifyRefreshToken(refreshToken);
    if (payload.version !== user.tokenVersion) {
      throw new ForbiddenException('Token version mismatch');
    }

    const {
      accessToken,
      refreshToken: newRefreshToken,
      hashedRefreshToken: newHashed,
    } = await this._securityService.signAndGenerateTokens({
      sub: user.id,
      email: user.email,
      version: user.tokenVersion,
    });

    await this._usersRepository.updateRefreshToken(user.id, newHashed);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string) {
    await this._usersRepository.removeRefreshToken(userId);
  }
}
