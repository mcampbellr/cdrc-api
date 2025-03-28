import { ForbiddenException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { google } from 'googleapis';

import { GoogleDto } from './dtos/google.dto';
import { User } from '@prisma/client';
import { UsersRepository } from '@app/database';
import { SecurityService } from '@app/security';

@Injectable()
export class AuthService {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _securityService: SecurityService,
  ) {}

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

  async createOrUpdateUserWithGoogle(
    googleId: string,
    googleRefreshToken?: string,
  ) {
    const googleUser = await this.getGoogleUser(googleId);
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

    if (googleRefreshToken) {
      const encryptedRefreshToken =
        this._securityService.encrypt(googleRefreshToken);

      await this._usersRepository.addGoogleRefreshToken(
        user.id,
        encryptedRefreshToken,
      );
    }

    const { accessToken, refreshToken } = await this.login(user);

    return {
      rawUser: user,
      user: await this._returnUserWithoutSensitiveData(user),
      accessToken,
      refreshToken,
    };
  }

  async signInWithGoogle(googleCredentials: GoogleDto) {
    const { idToken } = googleCredentials;

    const { user, rawUser } = await this.createOrUpdateUserWithGoogle(idToken);

    const { accessToken, refreshToken } = await this.login(rawUser);

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
    if (!refreshToken) throw new ForbiddenException();

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

  async profile(userId: string) {
    const user = await this._usersRepository.findById(userId);
    if (!user) throw new ForbiddenException();

    return this._returnUserWithoutSensitiveData(user);
  }

  async logout(userId: string) {
    await this._usersRepository.removeRefreshToken(userId);
  }

  async _returnUserWithoutSensitiveData(user: User) {
    const {
      password,
      refreshToken,
      calendarRefreshToken,
      tokenVersion,
      ...userWithoutPassword
    } = user;

    return userWithoutPassword;
  }
}
