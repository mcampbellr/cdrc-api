import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { GoogleModule } from '@app/google';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [GoogleModule, DatabaseModule],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
