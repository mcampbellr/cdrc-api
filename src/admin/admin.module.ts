import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { DbModule } from '@db';

@Module({
  imports: [DbModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
