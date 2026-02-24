import prisma from './prisma';
import bcrypt from 'bcryptjs';

/**
 * Sikrar at alle admin-brukarar finst i databasen.
 * Køyrer ved oppstart — oppretter manglande spelarar/brukarar
 * og oppgraderer eksisterande brukarar til ADMIN.
 */
export async function seedAdmins() {
  const admins = [
    { username: 'karsten', email: 'karsten@kaupanger.no', name: 'Karsten Bjelde', position: 'Midtbane' },
    { username: 'nalawi', email: 'nalawi@kaupanger.no', name: 'Nalawi Foto Solomon', position: 'Angriper' },
  ];

  const password = await bcrypt.hash('admin123', 12);

  for (const admin of admins) {
    // Finn eller opprett spelar
    let player = await prisma.player.findFirst({ where: { name: admin.name } });
    if (!player) {
      player = await prisma.player.create({
        data: { name: admin.name, position: admin.position, number: null },
      });
      console.log(`✅ Oppretta spelar: ${admin.name}`);
    }

    // Finn eller opprett brukar
    const user = await prisma.user.findFirst({ where: { playerId: player.id } });
    if (!user) {
      await prisma.user.create({
        data: {
          username: admin.username,
          email: admin.email,
          password,
          role: 'ADMIN',
          playerId: player.id,
        },
      });
      console.log(`✅ Oppretta admin-brukar: ${admin.username}`);
    } else if (user.role !== 'ADMIN') {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
      });
      console.log(`⬆️  Oppgradert til ADMIN: ${admin.username}`);
    }
  }
}
