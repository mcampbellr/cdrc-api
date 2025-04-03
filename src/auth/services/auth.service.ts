import { ForbiddenException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { User } from '@prisma/client';
import { RefreshTokenRepository, UsersRepository } from '@app/database';
import { GoogleService } from '@app/google';
import { EncryptionService, SecurityService } from '@app/security';
import { SanitizedUser } from 'src/users/data/user.interface';
import { JwtPayload } from '@app/security/strategies/data/strategies.interface';
import { SocialDto } from '../dtos/social.dto';
import { AppleService } from '@app/apple';

@Injectable()
export class AuthService {
  constructor(
    private readonly _googleService: GoogleService,
    private readonly _appleService: AppleService,
    private readonly _usersRepository: UsersRepository,
    private readonly _encryptionService: EncryptionService,
    private readonly _securityService: SecurityService,
    private readonly _refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async createOrUpdateUserWithGoogle(
    googleId: string,
    googleRefreshToken?: string,
  ): Promise<{
    user: SanitizedUser;
    accessToken?: string;
    refreshToken?: string;
  }> {
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

    const sanitizedUser = this._sanitizeUser(user);

    if (user.isTwoFactorEnabled) {
      return {
        user: sanitizedUser,
      };
    }

    const tokens = await this._issueTokensAndPersist(user);

    return {
      user: sanitizedUser,
      ...tokens,
    };
  }

  async createOrUpdateUserWithApple(appleToken: string, userName: string) {
    const appleUser = await this._appleService.validateAppleToken(appleToken);

    let user = await this._usersRepository.findByAppleId(appleUser.sub);

    if (!user) {
      user = await this._usersRepository.findByEmail(appleUser.email);

      if (user) {
        user = await this._usersRepository.update(user.id, {
          appleId: appleUser.sub,
        });
      } else {
        user = await this._usersRepository.create({
          appleId: appleUser.sub,
          email: appleUser.email,
          name: userName,
        });
      }
    }

    const sanitizedUser = this._sanitizeUser(user);

    if (user.isTwoFactorEnabled) {
      return {
        user: sanitizedUser,
      };
    }

    const tokens = await this._issueTokensAndPersist(user);

    return {
      user: sanitizedUser,
      ...tokens,
    };
  }

  async signInWithSocial(socialData: SocialDto) {
    const { token, provider, userName } = socialData;
    let data: {
      user: SanitizedUser;
      accessToken?: string;
      refreshToken?: string;
    };

    switch (provider) {
      case 'google':
        data = await this.createOrUpdateUserWithGoogle(token);
        break;
      case 'apple':
        if (!userName) {
          throw new ForbiddenException('Missing user name');
        }
        data = await this.createOrUpdateUserWithApple(token, userName);
        break;
      default:
        throw new ForbiddenException('Invalid provider');
    }

    const { user } = data;

    if (user.isTwoFactorEnabled) {
      return await this.issuePreAuthToken(user);
    } else {
      return {
        user: user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };
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

    return this._issueTokensAndPersist(user, payload.deviceId);
  }

  async profile(userId: string) {
    const user = await this._usersRepository.findById(userId);
    if (!user) throw new ForbiddenException();

    return this._sanitizeUser(user);
  }

  async logout(userId: string, refreshToken: string) {
    const tokenData = this._securityService.verifyRefreshToken(refreshToken);
    const hashedToken = this._securityService.hashRefreshToken(refreshToken);


    await this._usersRepository.revokeRefreshToken(
      userId,
      tokenData.deviceId,
      hashedToken,
    );
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

  private async _issueTokensAndPersist(user: User, deviceId?: string) {
    const deviceUUID = deviceId || crypto.randomUUID();

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      version: user.tokenVersion,
      deviceId: deviceUUID,
    };

    const { accessToken, refreshToken, hashedRefreshToken } =
      await this._securityService.signAndGenerateTokens(payload);

    await this._usersRepository.addRefreshToken(
      user.id,
      hashedRefreshToken,
      payload.deviceId,
    );

    return {
      user: this._sanitizeUser(user),
      accessToken,
      refreshToken,
      deviceId,
    };
  }

  private async _validateStoredRefreshToken(userId: string, token: string) {
    const user = await this._usersRepository.findById(userId);

    if (!user) throw new ForbiddenException();
    if (!token) throw new ForbiddenException();

    let payload: JwtPayload;
    try {
      payload = this._securityService.verifyRefreshToken(token);
    } catch (err) {
      throw new ForbiddenException('Invalid token');
    }

    if (payload.sub !== user.id) {
      throw new ForbiddenException('User mismatch');
    }

    const hashedToken = this._securityService.hashRefreshToken(token);

    const stored = await this._refreshTokenRepository.findOne(
      user.id,
      payload.deviceId,
      hashedToken,
    );

    if (!stored) throw new ForbiddenException('Token not found or revoked');

    return user;
  }

  private _sanitizeUser(user: User): SanitizedUser {
    const {
      password,
      twoFactorSecret,
      calendarRefreshToken,
      tokenVersion,
      ...safeUser
    } = user;

    return safeUser;
  }
}
