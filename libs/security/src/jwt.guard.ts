import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JWT_STRATEGY_NAME } from './strategies/data/strategies.constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard(JWT_STRATEGY_NAME.JWT) {}

@Injectable()
export class JwtStrictAuthGuard extends AuthGuard(
  JWT_STRATEGY_NAME.JWT_STRICT,
) {}

@Injectable()
export class JwtPreAuthGuard extends AuthGuard(
  JWT_STRATEGY_NAME.JWT_PRE_AUTH,
) {}
