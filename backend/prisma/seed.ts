import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data in correct order (respecting FK constraints)
  await prisma.fine.deleteMany();
  await prisma.fineType.deleteMany();
  await prisma.user.deleteMany();
  await prisma.player.deleteMany();

  // ── Create Admin Players ────────────────────────────────────────────
  const karstenPlayer = await prisma.player.create({
    data: { name: 'Karsten Bjelde', position: 'Midtbane', number: null },
  });

  const aleksanderPlayer = await prisma.player.create({
    data: { name: 'Aleksander Belland', position: 'Forsvar', number: null },
  });

  // ── Create Admin Users ─────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 12);

  await prisma.user.create({
    data: {
      username: 'karsten',
      email: 'karsten@kaupanger.no',
      password: adminPassword,
      role: 'ADMIN',
      playerId: karstenPlayer.id,
    },
  });

  await prisma.user.create({
    data: {
      username: 'aleksander',
      email: 'aleksander@kaupanger.no',
      password: adminPassword,
      role: 'ADMIN',
      playerId: aleksanderPlayer.id,
    },
  });

  // ── Create Fine Types ──────────────────────────────────────────────
  const fineTypes = await Promise.all([
    prisma.fineType.create({
      data: { name: 'Sein til trening', amount: 100, description: 'Kom for seint til trening', category: 'Trening' },
    }),
    prisma.fineType.create({
      data: { name: 'Sein til kamp', amount: 200, description: 'Kom for seint til kamp', category: 'Kamp' },
    }),
    prisma.fineType.create({
      data: { name: 'Gløymt utstyr', amount: 150, description: 'Gløymde utstyr til trening/kamp', category: 'Utstyr' },
    }),
    prisma.fineType.create({
      data: { name: 'Fråvær trening', amount: 200, description: 'Fråvær utan gyldig grunn', category: 'Trening' },
    }),
    prisma.fineType.create({
      data: { name: 'Gult kort', amount: 250, description: 'Gult kort i kamp', category: 'Kamp' },
    }),
    prisma.fineType.create({
      data: { name: 'Raudt kort', amount: 500, description: 'Raudt kort i kamp', category: 'Kamp' },
    }),
    prisma.fineType.create({
      data: { name: 'Bom på straffe', amount: 100, description: 'Bom på straffespark', category: 'Kamp' },
    }),
    prisma.fineType.create({
      data: { name: 'Dårleg oppføring', amount: 300, description: 'Dårleg oppføring på eller utanfor bana', category: 'Generelt' },
    }),
  ]);

  console.log('');
  console.log('✅ Seed complete!');
  console.log('─────────────────────────────────────');
  console.log('👤 Admin 1: karsten / admin123');
  console.log('👤 Admin 2: aleksander / admin123');
  console.log(`📋 Fine Types: ${fineTypes.length}`);
  console.log('─────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
