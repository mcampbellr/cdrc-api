import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard } from '@app/security';
import { DoctorIdDtoParam } from './dto/doctor-id.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('schedule')
@ApiTags('Schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get(':doctorId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get doctor available schedule' })
  getDoctorAvailableSchedule(@Param() params: DoctorIdDtoParam) {
    return this.scheduleService.getDoctorAvaliableSchedule(params.doctorId);
  }
}
