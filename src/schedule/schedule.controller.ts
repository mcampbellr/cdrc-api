import { Controller, Get, UseGuards } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard, JwtUser, User } from '@app/security';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService,

  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@User() user: JwtUser) {
    return this.scheduleService.findAll();
  }
}
