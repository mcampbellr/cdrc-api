import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_STRATEGY_NAME } from './data/strategies.constants';
import { JwtPayload } from './data/strategies.interface';

@Injectable()
export class JwtPreAuthStrategy extends PassportStrategy(
  Strategy,
  JWT_STRATEGY_NAME.JWT_PRE_AUTH,
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_PRE_AUTH_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
