import { AuthRepository } from './repositories/auth.repository';
import { ScheduleRepository } from './repositories/schedule.repository';
import { UsersRepository } from './repositories/users.repository';

export const repositories = [
  AuthRepository,
  ScheduleRepository,
  UsersRepository,
];

export * from './repositories/auth.repository';
export * from './repositories/users.repository';

export * from './database.service';
export * from './database.module';
