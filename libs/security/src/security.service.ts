import { UsersRepository } from '@db';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SecurityService {
  constructor(
    private jwtService: JwtService,
    private _usersRepository: UsersRepository,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this._usersRepository.findByEmail(email);
    const isValid = user && (await bcrypt.compare(password, user.password));
    return isValid ? user : null;
  }

  async login(user: User) {
    const tokens = await this.generateTokens(user.id, user.email);
    const hashedRefresh = await bcrypt.hash(tokens.refresh_token, 10);

    await this._usersRepository.updateRefreshToken(user.id, hashedRefresh);

    return tokens;
  }

  async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });

    return { access_token, refresh_token };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this._usersRepository.findById(userId);
    if (!user || !user.refreshToken) throw new ForbiddenException();

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) throw new ForbiddenException();

    const tokens = await this.generateTokens(user.id, user.email);
    const hashedNewRefresh = await bcrypt.hash(tokens.refresh_token, 10);
    await this._usersRepository.updateRefreshToken(user.id, hashedNewRefresh);

    return tokens;
  }

  async logout(userId: string) {
    await this._usersRepository.removeRefreshToken(userId);
  }
}
