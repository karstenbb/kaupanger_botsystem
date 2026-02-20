import cron from 'node-cron';
import prisma from './prisma';

/**
 * Automatiske bøter:
 *
 * 1. "Botfri månad" — 1. kvar månad kl 08:00
 *    Spelarar som ikkje fekk nokon bot førre månad → 70 kr
 *
 * 2. "Forsein betaling" — 3. kvar månad kl 08:00 (2 dagar inn i ny månad)
 *    Spelarar med ubetalte bøter frå førre månad(ar) → 100 kr
 */

/** Finn eller opprett ein FineType med gitt namn, beløp og kategori */
async function getOrCreateFineType(name: string, amount: number, description: string) {
  let ft = await prisma.fineType.findFirst({ where: { name } });
  if (!ft) {
    ft = await prisma.fineType.create({
      data: { name, amount, description, category: 'Automatisk' },
    });
    console.log(`📋 Oppretta automatisk bøtetype: ${name}`);
  }
  return ft;
}

/** 1. Gi 70 kr bot til spelarar utan bøter førre månad */
async function checkBotfriMaaned() {
  console.log('⏰ Køyrer sjekk: Botfri månad...');

  const now = new Date();
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Alle spelarar
  const allPlayers = await prisma.player.findMany({ select: { id: true, name: true } });

  // Spelarar som fekk minst éin bot i førre månad
  const playersWithFines = await prisma.fine.findMany({
    where: {
      date: { gte: firstOfLastMonth, lt: firstOfThisMonth },
    },
    select: { playerId: true },
    distinct: ['playerId'],
  });

  const playersWithFinesSet = new Set(playersWithFines.map((f: { playerId: string }) => f.playerId));

  // Filtrer ut dei som IKKJE fekk bot (og ikkje er admin-spelar)
  const botfriePlayers = allPlayers.filter(
    (p: { id: string; name: string }) => !playersWithFinesSet.has(p.id) && p.name !== 'Admin'
  );

  if (botfriePlayers.length === 0) {
    console.log('  ✅ Alle spelarar hadde bøter i førre månad — ingen "botfri"-bot.');
    return;
  }

  const fineType = await getOrCreateFineType(
    'Botfri månad',
    70,
    'Automatisk bot for spelarar utan bøter førre månad'
  );

  for (const player of botfriePlayers) {
    await prisma.fine.create({
      data: {
        playerId: player.id,
        fineTypeId: fineType.id,
        amount: fineType.amount,
        reason: 'Ingen bøter i førre månad — automatisk',
        date: new Date(),
      },
    });
    console.log(`  💸 Botfri-bot til ${player.name} (${fineType.amount} kr)`);
  }

  console.log(`  ✅ Botfri-bot gjeven til ${botfriePlayers.length} spelar(ar).`);
}

/** 2. Gi 100 kr forsein-betaling bot til spelarar med ubetalte bøter */
async function checkForseinBetaling() {
  console.log('⏰ Køyrer sjekk: Forsein betaling...');

  // Finn spelarar med minst éi ubetalt bot
  const playersWithUnpaid = await prisma.fine.findMany({
    where: { status: 'UNPAID' },
    select: { playerId: true },
    distinct: ['playerId'],
  });

  if (playersWithUnpaid.length === 0) {
    console.log('  ✅ Ingen spelarar har ubetalte bøter — ingen forsein-bot.');
    return;
  }

  const fineType = await getOrCreateFineType(
    'Forsein betaling',
    100,
    'Automatisk bot for ubetalte bøter etter 2 dagar inn i ny månad'
  );

  // Finn kva spelarar som allereie har fått forsein-bot denne månaden
  const now = new Date();
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const alreadyFined = await prisma.fine.findMany({
    where: {
      fineTypeId: fineType.id,
      date: { gte: firstOfThisMonth },
    },
    select: { playerId: true },
    distinct: ['playerId'],
  });
  const alreadyFinedSet = new Set(alreadyFined.map((f: { playerId: string }) => f.playerId));

  let count = 0;
  for (const { playerId } of playersWithUnpaid) {
    // Ikkje gi dobbelbot same månad
    if (alreadyFinedSet.has(playerId)) continue;

    // Sjekk at det ikkje er admin
    const player = await prisma.player.findUnique({ where: { id: playerId }, select: { name: true } });
    if (!player || player.name === 'Admin') continue;

    await prisma.fine.create({
      data: {
        playerId,
        fineTypeId: fineType.id,
        amount: fineType.amount,
        reason: 'Ubetalte bøter — automatisk forsein-bot',
        date: new Date(),
      },
    });
    console.log(`  💸 Forsein-bot til ${player.name} (${fineType.amount} kr)`);
    count++;
  }

  console.log(`  ✅ Forsein-bot gjeven til ${count} spelar(ar).`);
}

/** Start alle automatiske cron-jobbar */
export function startScheduler() {
  console.log('🕐 Automatiske bøter aktivert:');
  console.log('   • Botfri månad — 1. kvar månad kl 08:00');
  console.log('   • Forsein betaling — 3. kvar månad kl 08:00');

  // 1. Botfri månad: køyr 1. kvar månad kl 08:00
  cron.schedule('0 8 1 * *', () => {
    checkBotfriMaaned().catch((err) => console.error('Botfri-sjekk feila:', err));
  });

  // 2. Forsein betaling: køyr 3. kvar månad kl 08:00 (2 dagar inn i ny månad)
  cron.schedule('0 8 3 * *', () => {
    checkForseinBetaling().catch((err) => console.error('Forsein-sjekk feila:', err));
  });
}

/** Eksporter funksjonane for manuell køyring / testing */
export { checkBotfriMaaned, checkForseinBetaling };
