import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { DatabaseModule } from '@app/database';
import { SecurityModule } from '@app/security';
import { AuthModule } from 'src/auth/auth.module';
import { GoogleModule } from '@app/google';

@Module({
  imports: [DatabaseModule, SecurityModule, AuthModule, GoogleModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
