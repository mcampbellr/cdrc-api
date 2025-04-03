import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

interface ApplePayload {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string;
  c_hash: string;
  email: string;
  email_verified: boolean;
  auth_time: number;
  nonce_supported: boolean;
}

@Injectable()
export class AppleService {
  private client = jwksClient({
    jwksUri: 'https://appleid.apple.com/auth/keys',
  });

  private async getAppleSigningKey(kid: string): Promise<string> {
    const key = await this.client.getSigningKey(kid);

    return key.getPublicKey();
  }

  async validateAppleToken(idToken: string): Promise<ApplePayload> {
    const decodedHeader = jwt.decode(idToken, { complete: true });

    if (
      !decodedHeader ||
      typeof decodedHeader === 'string' ||
      !decodedHeader.header.kid
    ) {
      throw new UnauthorizedException('Invalid Apple token');
    }

    const publicKey = await this.getAppleSigningKey(decodedHeader.header.kid);

    try {
      const payload = jwt.verify(idToken, publicKey, {
        algorithms: ['RS256'],
      });
      return payload as ApplePayload;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired Apple token');
    }
  }
}
