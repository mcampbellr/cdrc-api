import { Injectable } from '@nestjs/common';
import { Prisma, UserStatus } from '@prisma/client';
import uid from 'tiny-uid';
import { DatabaseService } from '../database.service';

type CreateUserInput = Omit<Prisma.UserCreateInput, 'username'>;

@Injectable()
export class UsersRepository {
  constructor(private prisma: DatabaseService) {}

  async list(status?: UserStatus | UserStatus[]) {
    if (!status) {
      return this.prisma.user.findMany();
    }

    const where = Array.isArray(status)
      ? {
          status: {
            in: status,
          },
        }
      : {
          status,
        };

    return this.prisma.user.findMany({
      where,
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({
      where: {
        googleId,
      },
    });
  }

  async findByAppleId(appleId: string) {
    return this.prisma.user.findUnique({
      where: {
        appleId,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async update(id: string, data: Prisma.UserUpdateArgs['data']) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data,
    });
  }

  async addRefreshToken(
    userId: string,
    refreshToken: string,
    deviceId: string,
  ) {
    return this.prisma.refreshToken.upsert({
      where: {
        userId_deviceId: {
          userId,
          deviceId,
        },
      },
      create: {
        userId,
        deviceId,
        hashedToken: refreshToken,
      },
      update: {
        hashedToken: refreshToken,
      },
    });
  }

  async addGoogleRefreshToken(id: string, calendarRefreshToken: string) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        calendarRefreshToken,
      },
    });
  }

  async revokeRefreshToken(
    userId: string,
    deviceId: string,
    refreshToken: string,
  ) {
    return this.prisma.refreshToken.update({
      where: {
        user: {
          id: userId,
        },
        hashedToken: refreshToken,
        deviceId,
      },
      data: {
        revoked: true,
      },
    });
  }

  async addUserMfa(id: string, mfaSecret: string) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        twoFactorSecret: mfaSecret,
      },
    });
  }

  async enableMFAForUser(id: string) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        isTwoFactorEnabled: true,
      },
    });
  }

  async create(input: CreateUserInput | Prisma.UserCreateInput) {
    const randomUid = uid();

    const data = input as Prisma.UserCreateInput;
    data.username = `user-${randomUid}`;

    return this.prisma.user.create({
      data,
    });
  }
}
