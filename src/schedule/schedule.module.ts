import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { GoogleModule } from '@app/google';
import { DatabaseModule } from '@app/database';
import { SecurityModule } from '@app/security';
import { ScheduleBusiness } from './schedule.business';

@Module({
  imports: [GoogleModule, DatabaseModule, SecurityModule],
  controllers: [ScheduleController],
  providers: [ScheduleService, ScheduleBusiness],
})
export class ScheduleModule {}
