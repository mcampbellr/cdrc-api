import { UsersRepository } from '@app/database';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class AdminUsersService {
  constructor(private readonly _userRepository: UsersRepository) {}

  listUsers(): Promise<User[]> {
    return this._userRepository.list();
  }
}
