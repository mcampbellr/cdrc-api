import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.service';

@Injectable()
export class RefreshTokenRepository {
  constructor(private prisma: DatabaseService) {}

  async findOne(userId: string, deviceId: string, hashedToken: string) {
    return this.prisma.refreshToken.findFirst({
      where: {
        user: {
          id: userId,
        },
        deviceId,
        hashedToken,
        revoked: false,
      },
    });
  }
}
