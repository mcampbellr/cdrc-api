export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  version: number;
}

export interface JwtUser {
  id: string;
  email: string;
  role: string;
}
