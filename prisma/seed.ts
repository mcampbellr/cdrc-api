import { PrismaClient, RoleType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.role.create({
    data: { type: RoleType.ADMIN },
  });

  await prisma.role.create({
    data: { type: RoleType.USER },
  });

  await prisma.role.create({
    data: { type: RoleType.ASSISTANT },
  });
}

main()
  .then(() => {
    console.log('Seed completado ✅');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error('Error en el seed ❌', e);
    return prisma.$disconnect().then(() => process.exit(1));
  });
