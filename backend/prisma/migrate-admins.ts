import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Migrerer admin-brukarar...\n');

  const password = await bcrypt.hash('admin123', 12);

  // ── 1. Opprett Karsten Bjelde ────────────────────────────────────
  let karstenPlayer = await prisma.player.findFirst({ where: { name: 'Karsten Bjelde' } });
  if (!karstenPlayer) {
    karstenPlayer = await prisma.player.create({
      data: { name: 'Karsten Bjelde', position: 'Midtbane', number: null },
    });
    console.log('✅ Oppretta spelar: Karsten Bjelde');
  } else {
    console.log('ℹ️  Spelar finst allereie: Karsten Bjelde');
  }

  const karstenUser = await prisma.user.findFirst({ where: { playerId: karstenPlayer.id } });
  if (!karstenUser) {
    await prisma.user.create({
      data: {
        username: 'karsten',
        email: 'karsten@kaupanger.no',
        password,
        role: 'ADMIN',
        playerId: karstenPlayer.id,
      },
    });
    console.log('✅ Oppretta admin-brukar: karsten');
  } else {
    // Oppgrader til admin om ikkje allereie
    await prisma.user.update({
      where: { id: karstenUser.id },
      data: { role: 'ADMIN' },
    });
    console.log('ℹ️  Brukar oppdatert til ADMIN: karsten');
  }

  // ── 2. Opprett Nalawi Foto Solomon ───────────────────────────────
  let nalawiPlayer = await prisma.player.findFirst({ where: { name: 'Nalawi Foto Solomon' } });
  if (!nalawiPlayer) {
    nalawiPlayer = await prisma.player.create({
      data: { name: 'Nalawi Foto Solomon', position: 'Angriper', number: null },
    });
    console.log('✅ Oppretta spelar: Nalawi Foto Solomon');
  } else {
    console.log('ℹ️  Spelar finst allereie: Nalawi Foto Solomon');
  }

  const nalawiUser = await prisma.user.findFirst({ where: { playerId: nalawiPlayer.id } });
  if (!nalawiUser) {
    await prisma.user.create({
      data: {
        username: 'nalawi',
        email: 'nalawi@kaupanger.no',
        password,
        role: 'ADMIN',
        playerId: nalawiPlayer.id,
      },
    });
    console.log('✅ Oppretta admin-brukar: nalawi');
  } else {
    await prisma.user.update({
      where: { id: nalawiUser.id },
      data: { role: 'ADMIN' },
    });
    console.log('ℹ️  Brukar oppdatert til ADMIN: nalawi');
  }

  // ── 3. Fjern gammal "admin" brukar og "Admin" spelar ─────────────
  const oldAdmin = await prisma.user.findFirst({ where: { username: 'admin' } });
  if (oldAdmin) {
    // Flytt eventuelle bøter som peikar på Admin-spelaren
    const adminPlayer = await prisma.player.findFirst({ where: { name: 'Admin' } });
    if (adminPlayer) {
      const adminFines = await prisma.fine.count({ where: { playerId: adminPlayer.id } });
      if (adminFines > 0) {
        console.log(`⚠️  Admin-spelaren har ${adminFines} bøter — slettar dei`);
        await prisma.fine.deleteMany({ where: { playerId: adminPlayer.id } });
      }
    }

    await prisma.user.delete({ where: { id: oldAdmin.id } });
    console.log('🗑️  Sletta brukar: admin');

    if (adminPlayer) {
      await prisma.player.delete({ where: { id: adminPlayer.id } });
      console.log('🗑️  Sletta spelar: Admin');
    }
  } else {
    console.log('ℹ️  Ingen "admin" brukar å fjerne');
  }

  console.log('\n─────────────────────────────────────');
  console.log('👤 Admin 1: karsten / admin123');
  console.log('👤 Admin 2: nalawi / admin123');
  console.log('─────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('Migrering feila:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
