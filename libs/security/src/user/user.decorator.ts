// user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUser } from '@security/jwt.strategy';

export const User = createParamDecorator((_data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as JwtUser;
});
