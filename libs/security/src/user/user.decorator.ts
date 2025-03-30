// user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUser } from '../strategies/data/strategies.interface';

export const User = createParamDecorator((_data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as JwtUser;
});
