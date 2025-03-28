import { Request } from 'express';

export interface RequestWithCookies extends Request {
  cookies: {
    refreshToken: string | undefined;
    userId: string | undefined;
  };
}
