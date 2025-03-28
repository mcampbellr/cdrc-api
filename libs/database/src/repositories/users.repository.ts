import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import uid from 'tiny-uid';
import { DatabaseService } from '../database.service';

type CreateUserInput = Omit<Prisma.UserCreateInput, 'username'>;

@Injectable()
export class UsersRepository {
  constructor(private prisma: DatabaseService) {}

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

  async updateRefreshToken(id: string, refreshToken: string) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        refreshToken,
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

  async removeRefreshToken(id: string) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        refreshToken: null,
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
