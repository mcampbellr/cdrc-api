import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { Prisma, RoleType } from '@prisma/client';

const includeRoles = {
  role: {
    select: {
      type: true,
    },
  },
};

interface CreateUserInput {
  email: string;
  name: string;
  avatar: string;
  googleId: string;
}

@Injectable()
export class UsersRepository {
  constructor(private prisma: DatabaseService) {}

  async findUserByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({
      where: {
        googleId,
      },
      include: {
        ...includeRoles,
      },
    });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        ...includeRoles,
      },
    });
  }

  async updateUser(id: string, data: Prisma.UserUpdateArgs['data']) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data,
      include: {
        ...includeRoles,
      },
    });
  }

  async createUser(input: CreateUserInput) {
    return this.prisma.user.create({
      data: {
        ...input,
        role: {
          connect: {
            type: RoleType.USER,
          },
        },
      },
      include: {
        ...includeRoles,
      },
    });
  }
}
