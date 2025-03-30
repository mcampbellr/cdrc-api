import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard } from '@app/security';
import { DoctorIdDtoParam } from './dto/doctor-id.dto';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get(':doctorId')
  @UseGuards(JwtAuthGuard)
  getDoctorAvailableSchedule(@Param() params: DoctorIdDtoParam) {
    return this.scheduleService.getDoctorAvaliableSchedule(params.doctorId);
  }
}
