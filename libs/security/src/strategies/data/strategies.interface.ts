export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  version: number;
  deviceId: string;
}

export interface JwtUser {
  id: string;
  email: string;
  role: string;
}
