// schedule.business.spec.ts (test para nueva versión con getValidTimesFromSchedule)
import { ScheduleBusiness } from './schedule.business';
import { ScheduleRepository } from '@app/database/repositories/schedule.repository';
import { GoogleService } from '@app/google';
import { UsersRepository } from '@app/database';
import { SecurityService } from '@app/security';

describe('ScheduleBusiness - getDoctorScheduleAvailabilities', () => {
  let service: ScheduleBusiness;

  const mockDoctor = {
    id: '8dbc5c2e-86aa-4d0e-b606-93971bff604b',
    calendarRefreshToken: 'encrypted-token',
  };

  const mockSchedule = {
    id: 'd53c2198-d7de-410b-8146-3b6f657a6a7e',
    userId: mockDoctor.id,
    timezone: 'America/Costa_Rica',
    availability: [
      {
        dayOfWeek: 'monday',
        startTime: '08:00',
        endTime: '12:00',
      },
    ],
  };

  const mockEvents = [
    {
      start: new Date('2025-03-31T16:00:00.000Z'),
      end: new Date('2025-03-31T17:00:00.000Z'),
    },
    {
      start: new Date('2025-03-31T17:00:00.000Z'),
      end: new Date('2025-03-31T18:00:00.000Z'),
    },
    {
      start: new Date('2025-03-31T18:00:00.000Z'),
      end: new Date('2025-03-31T19:00:00.000Z'),
    },
    {
      start: new Date('2025-03-31T19:00:00.000Z'),
      end: new Date('2025-03-31T20:00:00.000Z'),
    },
    {
      start: new Date('2025-03-31T21:00:00.000Z'),
      end: new Date('2025-03-31T22:00:00.000Z'),
    },
  ];

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-03-31T12:00:00Z'));

    service = new ScheduleBusiness(
      {
        getScheduleAvailabilityByDoctorId: jest
          .fn()
          .mockResolvedValue(mockSchedule),
      } as any as ScheduleRepository,
      {
        getCalendarEventTimes: jest.fn().mockResolvedValue(mockEvents),
      } as any as GoogleService,
      {
        findById: jest.fn().mockResolvedValue(mockDoctor),
      } as any as UsersRepository,
      {
        decrypt: jest.fn().mockReturnValue('decrypted-token'),
      } as any as SecurityService,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return only available time slots (08:00 and 09:00 local)', async () => {
    const result = await service.getDoctorScheduleAvailabilities(mockDoctor.id);

    expect(result).toEqual([
      new Date('2025-03-31T14:00:00.000Z'), // 08:00 local
      new Date('2025-03-31T15:00:00.000Z'), // 09:00 local
    ]);
  });
});
