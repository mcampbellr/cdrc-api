import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { Prisma } from '@prisma/client';
import uid from 'tiny-uid';

type CreateUserInput = Omit<Prisma.UserCreateInput, 'username'>;

@Injectable()
export class UsersRepository {
  constructor(private prisma: DatabaseService) {}

  async findUserByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({
      where: {
        googleId,
      },
    });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async updateUser(id: string, data: Prisma.UserUpdateArgs['data']) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data,
    });
  }

  async addGoogleRefreshToken(id: string, refreshToken: string) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        calendarRefreshToken: refreshToken,
      },
    });
  }

  async createUser(input: CreateUserInput | Prisma.UserCreateInput) {
    const randomUid = uid();

    const data = input as Prisma.UserCreateInput;
    data.username = `user-${randomUid}`;

    return this.prisma.user.create({
      data,
    });
  }
}
