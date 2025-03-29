import {
  AccountType,
  DayOfWeek,
  PrismaClient,
  ScheduleAvailability,
} from '@prisma/client';

const prisma = new PrismaClient();

(async function main() {
  try {
    const branch = await prisma.branch.create({
      data: {
        name: 'Centro de Rejuvenecimiento Escazú',
        address: 'Escazú, San José, Costa Rica',
        phone: '506-2222-2222',
        city: 'San José',
        country: 'Costa Rica',
      },
    });

    const branch2 = await prisma.branch.create({
      data: {
        name: 'Centro de Rejuvenecimiento Santa Marta',
        address: 'Santa Marta, San José, Costa Rica',
        phone: '506-2222-2222',
        city: 'Guanacaste',
        country: 'Costa Rica',
      },
    });

    const user = await prisma.user.create({
      data: {
        name: 'Javier Ulloa',
        email: 'javier@centroderejuvenecimiento.com',
        password: '123456',
        username: 'javierulloa',
        accountType: AccountType.doctor,
        calendarRefreshToken:
          '78829a43db8eb71d74bf14c00af33313.2ac916be1b7435108a1d799aebcc1b28.187a8ed0e80d98d52228f17436ef41ee074a041077bd2ba799a1061388d8429f19539ebd0de2356b2bc31dbbbf6a6d2ef352175ed647abb345a42431697eed9eb14f6685ca404c5db6059c73fbbc7fb20b07f3a2c19d7f118e54320fb40d78a369cbba552c2158',
        doctorBranches: {
          create: [
            {
              branchId: branch.id,
              isDefault: true,
            },
            {
              branchId: branch2.id,
            },
          ],
        },
      },
    });

    const schedule = await prisma.schedule.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
        timezone: 'America/Costa_Rica',
      },
    });

    const availabilities: Partial<ScheduleAvailability>[] = [
      {
        dayOfWeek: DayOfWeek.monday,
        startTime: '08:00',
        endTime: '12:00',
        scheduleId: schedule.id,
      },
      {
        dayOfWeek: DayOfWeek.monday,
        startTime: '14:00',
        endTime: '18:00',
        scheduleId: schedule.id,
      },
      {
        dayOfWeek: DayOfWeek.tuesday,
        startTime: '08:00',
        endTime: '12:00',
        scheduleId: schedule.id,
      },
      {
        dayOfWeek: DayOfWeek.tuesday,
        startTime: '14:00',
        endTime: '18:00',
        scheduleId: schedule.id,
      },
      {
        dayOfWeek: DayOfWeek.wednesday,
        startTime: '08:00',
        endTime: '12:00',
        scheduleId: schedule.id,
      },
      {
        dayOfWeek: DayOfWeek.wednesday,
        startTime: '14:00',
        endTime: '18:00',
        scheduleId: schedule.id,
      },
      {
        dayOfWeek: DayOfWeek.thursday,
        startTime: '08:00',
        endTime: '12:00',
        scheduleId: schedule.id,
      },
      {
        dayOfWeek: DayOfWeek.thursday,
        startTime: '14:00',
        endTime: '18:00',
        scheduleId: schedule.id,
      },
      {
        dayOfWeek: DayOfWeek.friday,
        startTime: '08:00',
        endTime: '12:00',
        scheduleId: schedule.id,
      },
      {
        dayOfWeek: DayOfWeek.friday,
        startTime: '14:00',
        endTime: '18:00',
        scheduleId: schedule.id,
      },
    ];

    for (const availability of availabilities) {
      await prisma.scheduleAvailability.create({
        data: {
          startTime: availability.startTime,
          endTime: availability.endTime,
          dayOfWeek: availability.dayOfWeek,
          schedule: {
            connect: {
              id: schedule.id,
            },
          },
        },
      });
    }
    console.log('Seed successful');
  } catch (error) {
    console.log(`Seeding error: ${error}`);
  }
})();
