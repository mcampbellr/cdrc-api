import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { SecurityModule } from '@app/security';
import { AuthModule } from 'src/auth/auth.module';
import { GoogleModule } from '@app/google';
import { AdminService } from './services/admin.service';
import { AdminUsersController } from './controllers/admin.users.controller';
import { AdminUsersService } from './services/admin.users.service';
import { AdminController } from './controllers/admin.controller';

@Module({
  imports: [DatabaseModule, SecurityModule, AuthModule, GoogleModule],
  controllers: [AdminController, AdminUsersController],
  providers: [AdminService, AdminUsersService],
})
export class AdminModule {}
