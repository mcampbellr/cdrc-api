import {
  AccountType,
  DayOfWeek,
  PrismaClient,
  RoleType,
  ScheduleAvailability,
} from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

(async function main() {
  const patients = [];

  for (let i = 1; i <= 12; i++) {
    const personName = faker.person.firstName();
    const personLastName = faker.person.lastName();

    const fullName = `${personName} ${personLastName}`;

    const personEmail = faker.internet.email({
      firstName: personName,
      lastName: personLastName,
    });

    const personPassword = '123456';
    const personUsername = faker.internet.username({
      firstName: personName,
      lastName: personLastName,
    });

    patients.push({
      name: fullName,
      email: personEmail,
      avatar: faker.image.avatar(),
      password: personPassword,
      username: personUsername,
    });
  }

  for (const patient of patients) {
    await prisma.user.create({
      data: {
        name: patient.name,
        email: patient.email,
        password: patient.password,
        username: patient.username,
        accountType: AccountType.PATIENT,
      },
    });
  }

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
        role: RoleType.ADMIN,
        accountType: AccountType.DOCTOR,
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
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '08:00',
        endTime: '12:00',
        scheduleId: schedule.id,
      },
      {
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '14:00',
        endTime: '18:00',
        scheduleId: schedule.id,
      },
      {
        dayOfWeek: DayOfWeek.TUESDAY,
        startTime: '08:00',
        endTime: '12:00',
        scheduleId: schedule.id,
      },
      {
        dayOfWeek: DayOfWeek.TUESDAY,
        startTime: '14:00',
        endTime: '18:00',
        scheduleId: schedule.id,
      },
      {
        dayOfWeek: DayOfWeek.WEDNESDAY,
        startTime: '08:00',
        endTime: '12:00',
        scheduleId: schedule.id,
      },
      {
        dayOfWeek: DayOfWeek.WEDNESDAY,
        startTime: '14:00',
        endTime: '18:00',
        scheduleId: schedule.id,
      },
      {
        dayOfWeek: DayOfWeek.THURSDAY,
        startTime: '08:00',
        endTime: '12:00',
        scheduleId: schedule.id,
      },
      {
        dayOfWeek: DayOfWeek.THURSDAY,
        startTime: '14:00',
        endTime: '18:00',
        scheduleId: schedule.id,
      },
      {
        dayOfWeek: DayOfWeek.FRIDAY,
        startTime: '08:00',
        endTime: '12:00',
        scheduleId: schedule.id,
      },
      {
        dayOfWeek: DayOfWeek.FRIDAY,
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
