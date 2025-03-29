import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard } from '@app/security';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get(':doctorId')
  @UseGuards(JwtAuthGuard)
  getDoctorAvailableSchedule(@Param('doctorId') doctorId: string) {
    return this.scheduleService.getDoctorAvaliableSchedule(doctorId);
  }
}
