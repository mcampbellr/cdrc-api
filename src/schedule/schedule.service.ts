import { Injectable } from '@nestjs/common';
import { ScheduleBusiness } from './schedule.business';

@Injectable()
export class ScheduleService {
  constructor(private readonly _scheduleBusiness: ScheduleBusiness) {}

  async getDoctorAvaliableSchedule(userId: string) {
    await this._scheduleBusiness.getDoctorScheduleAvailabilities(userId);

    return {};
  }
}
