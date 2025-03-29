import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.service';

@Injectable()
export class ScheduleRepository {
  constructor(private prisma: DatabaseService) {}

  async getScheduleAvailabilityByDoctorId(doctorId: string) {
    return this.prisma.schedule.findFirst({
      where: {
        userId: doctorId,
      },
      include: {
        availability: {
          select: {
            dayOfWeek: true,
            endTime: true,
            startTime: true,
          },
        },
      },
    });
  }
}
