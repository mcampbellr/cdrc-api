import { UsersRepository } from '@app/database';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_STRATEGY_NAME } from './data/strategies.constants';
import { JwtPayload, JwtUser } from './data/strategies.interface';

@Injectable()
export class StrictJwtStrategy extends PassportStrategy(
  Strategy,
  JWT_STRATEGY_NAME.JWT_STRICT.toString(),
) {
  constructor(private readonly usersRepository: UsersRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtUser> {
    const user = await this.usersRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.tokenVersion !== payload.version) {
      throw new UnauthorizedException('Token version mismatch');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
