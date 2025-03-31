import { ForbiddenException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { GoogleDto } from './dtos/google.dto';
import { User } from '@prisma/client';
import { UsersRepository } from '@app/database';
import { GoogleService } from '@app/google';
import { RegisterDto } from './dtos/register.dto';
import { EncryptionService, SecurityService } from '@app/security';
import { SanitizedUser } from 'src/users/data/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly _googleService: GoogleService,
    private readonly _usersRepository: UsersRepository,
    private readonly _encryptionService: EncryptionService,
    private readonly _securityService: SecurityService,
  ) {}
  async register(registerData: RegisterDto) {}

  async createOrUpdateUserWithGoogle(
    googleId: string,
    googleRefreshToken?: string,
  ) {
    const googleUser = await this._googleService.getGoogleUser(googleId);
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
        this._encryptionService.encrypt(googleRefreshToken);

      await this._usersRepository.addGoogleRefreshToken(
        user.id,
        encryptedRefreshToken,
      );
    }

    const tokens = await this._issueTokensAndPersist(user);
    const sanitizedUser = this._sanitizeUser(user);

    return {
      user: sanitizedUser,
      ...tokens,
    };
  }

  async signInWithGoogle(googleCredentials: GoogleDto) {
    const { idToken } = googleCredentials;

    const data = await this.createOrUpdateUserWithGoogle(idToken);

    if (data.user.isTwoFactorEnabled) {
      return await this.issuePreAuthToken(data.user);
    } else {
      return data;
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this._usersRepository.findByEmail(email);
    const isValid =
      user && user.password && (await bcrypt.compare(password, user.password));
    return isValid ? user : null;
  }

  async login(user: User) {
    return this._issueTokensAndPersist(user);
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this._validateStoredRefreshToken(userId, refreshToken);

    const payload = this._securityService.verifyRefreshToken(refreshToken);
    if (payload.version !== user.tokenVersion) {
      throw new ForbiddenException('Token version mismatch');
    }

    return this._issueTokensAndPersist(user);
  }

  async profile(userId: string) {
    const user = await this._usersRepository.findById(userId);
    if (!user) throw new ForbiddenException();

    return this._sanitizeUser(user);
  }

  async logout(userId: string) {
    await this._usersRepository.removeRefreshToken(userId);
  }

  async issuePreAuthToken(user: Partial<User>) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      version: user.tokenVersion,
    };

    const preAuthToken = this._securityService.signPreAuthToken(payload);

    return {
      preAuthToken,
      requiresTwoFactor: true,
    };
  }

  private async _issueTokensAndPersist(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
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

  private async _validateStoredRefreshToken(userId: string, token: string) {
    if (!token) throw new ForbiddenException();

    const user = await this._usersRepository.findById(userId);
    if (!user?.refreshToken) throw new ForbiddenException();

    const isValid = await bcrypt.compare(token, user.refreshToken);
    if (!isValid) throw new ForbiddenException();

    return user;
  }

  private _sanitizeUser(user: User): SanitizedUser {
    const {
      password,
      refreshToken,
      twoFactorSecret,
      calendarRefreshToken,
      tokenVersion,
      ...safeUser
    } = user;

    return safeUser;
  }
}
