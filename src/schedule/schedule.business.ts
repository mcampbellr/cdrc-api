import { UsersRepository } from '@app/database';
import { ScheduleRepository } from '@app/database/repositories/schedule.repository';
import { GoogleService } from '@app/google';
import { SecurityService } from '@app/security';
import { Injectable } from '@nestjs/common';
import {
  addMinutes,
  areIntervalsOverlapping,
  isWithinInterval,
  isMonday,
  isTuesday,
  isWednesday,
  isThursday,
  isFriday,
  isSaturday,
  isSunday,
  setMinutes,
  setHours,
  roundToNearestHours,
  endOfDay,
  eachMinuteOfInterval,
  addMonths,
} from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { DAYS_OF_WEEK_IN_ORDER } from './types/constants';
import { ScheduleAvailability } from '@prisma/client';

@Injectable()
export class ScheduleBusiness {
  constructor(
    private readonly _scheduleRepository: ScheduleRepository,
    private readonly _googleService: GoogleService,
    private readonly _usersRepository: UsersRepository,
    private readonly _securityService: SecurityService,
  ) {}

  async getValidTimesFromSchedule(
    timesInOrder: Date[],
    event: { doctorId: string; durationInMinutes: number },
  ) {
    const user = await this._usersRepository.findById(event.doctorId);

    const start = timesInOrder[0];
    const end = timesInOrder.at(-1);

    if (start == null || end == null) return [];

    const schedule =
      await this._scheduleRepository.getScheduleAvailabilityByDoctorId(
        event.doctorId,
      );

    if (schedule == null) return [];

    const groupedAvailabilities = Object.groupBy(
      schedule.availability,
      (a) => a.dayOfWeek,
    );

    const decryptedRefreshToken = this._securityService.decrypt(
      user.calendarRefreshToken,
    );

    const eventTimes = await this._googleService.getCalendarEventTimes(
      decryptedRefreshToken,
      {
        start,
        end,
      },
    );

    return timesInOrder.filter((intervalDate) => {
      const availabilities = this.getAvailabilities(
        groupedAvailabilities,
        intervalDate,
        schedule.timezone,
      );
      const eventInterval = {
        start: intervalDate,
        end: addMinutes(intervalDate, event.durationInMinutes),
      };

      return (
        eventTimes.every((eventTime) => {
          return !areIntervalsOverlapping(eventTime, eventInterval);
        }) &&
        availabilities.some((availability) => {
          return (
            isWithinInterval(eventInterval.start, availability) &&
            isWithinInterval(eventInterval.end, availability)
          );
        })
      );
    });
  }

  getAvailabilities(
    groupedAvailabilities: Partial<
      Record<
        (typeof DAYS_OF_WEEK_IN_ORDER)[number],
        Partial<ScheduleAvailability>[]
      >
    >,
    date: Date,
    timezone: string,
  ) {
    let availabilities: Partial<ScheduleAvailability>[] | undefined;

    if (isMonday(date)) {
      availabilities = groupedAvailabilities.MONDAY;
    }
    if (isTuesday(date)) {
      availabilities = groupedAvailabilities.TUESDAY;
    }
    if (isWednesday(date)) {
      availabilities = groupedAvailabilities.WEDNESDAY;
    }
    if (isThursday(date)) {
      availabilities = groupedAvailabilities.THURSDAY;
    }
    if (isFriday(date)) {
      availabilities = groupedAvailabilities.FRIDAY;
    }
    if (isSaturday(date)) {
      availabilities = groupedAvailabilities.SATURDAY;
    }
    if (isSunday(date)) {
      availabilities = groupedAvailabilities.SUNDAY;
    }

    if (availabilities == null) return [];

    return availabilities.map(({ startTime, endTime }) => {
      const start = fromZonedTime(
        setMinutes(
          setHours(date, parseInt(startTime.split(':')[0])),
          parseInt(startTime.split(':')[1]),
        ),
        timezone,
      );

      const end = fromZonedTime(
        setMinutes(
          setHours(date, parseInt(endTime.split(':')[0])),
          parseInt(endTime.split(':')[1]),
        ),
        timezone,
      );

      return { start, end };
    });
  }

  async getDoctorScheduleAvailabilities(doctorId: string): Promise<Date[]> {
    const event = { doctorId, durationInMinutes: 60 };

    const startDate = roundToNearestHours(new Date(), {
      nearestTo: 1,
      roundingMethod: 'ceil',
    });

    const endDate = endOfDay(addMonths(startDate, 1));

    const validTimes = await this.getValidTimesFromSchedule(
      eachMinuteOfInterval({ start: startDate, end: endDate }, { step: 60 }),
      event,
    );

    return validTimes;
  }
}
