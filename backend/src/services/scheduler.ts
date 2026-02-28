import cron from 'node-cron';
import prisma from './prisma';

const DIANA_MONTHLY_FINE_NAME = 'Månedlig Diana-Maria-bot';
const DIANA_MONTHLY_FINE_AMOUNT = 200;
const DIANA_MONTHLY_FINE_DESCRIPTION = 'Automatisk bot for Diana-Maria Teigen Fardal, 200 kr kvar måned';

/**
 * Automatiske bøter:
 *
 * 1. "Botfri månad" — Siste dagen kvar månad kl 08:00
 *    Spelarar som ikkje fekk nokon bot denne månaden → 75 kr
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
  } else if (ft.amount !== amount) {
    ft = await prisma.fineType.update({
      where: { id: ft.id },
      data: { amount, description },
    });
    console.log(`📋 Oppdaterte beløp for ${name}: ${amount} kr`);
  }
  return ft;
}

/** 1. Gi 75 kr bot til spelarar utan bøter denne månaden */
async function checkBotfriMaaned() {
  console.log('⏰ Køyrer sjekk: Botfri månad...');

  const now = new Date();
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  // Alle spelarar
  const allPlayers = await prisma.player.findMany({ select: { id: true, name: true } });

  // Spelarar som fekk minst éin bot denne månaden
  const playersWithFines = await prisma.fine.findMany({
    where: {
      date: { gte: firstOfThisMonth, lt: tomorrow },
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
    console.log('  ✅ Alle spelarar hadde bøter denne månaden — ingen "botfri"-bot.');
    return;
  }

  const fineType = await getOrCreateFineType(
    'Botfri månad',
    75,
    'Automatisk bot for spelarar utan bøter denne månaden'
  );

  for (const player of botfriePlayers) {
    await prisma.fine.create({
      data: {
        playerId: player.id,
        fineTypeId: fineType.id,
        amount: fineType.amount,
        reason: 'Ingen bøter denne månaden — automatisk',
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

/** Automatisk bot til Diana-Maria Teigen Fardal siste dag i månaden */
async function addDianaMonthlyFine() {
  // Finn Diana-Maria (prioriter #40-identiteten, men støtt eldre namn)
  const diana = await prisma.player.findFirst({
    where: {
      OR: [
        { name: 'Diana-Maria Teigen Fardal #40' },
        {
          AND: [
            { name: { contains: 'Diana-Maria Teigen Fardal' } },
            { number: 40 },
          ],
        },
        { name: 'Diana-Maria Teigen Fardal' },
        { name: 'Diana Teigen' },
      ],
    },
  });
  if (!diana) return;

  // Finn eller opprett bøtetype
  let fineType = await prisma.fineType.findFirst({
    where: {
      OR: [
        { name: DIANA_MONTHLY_FINE_NAME },
        { name: 'Månedlig Diana-bot' },
      ],
    },
  });
  if (!fineType) {
    fineType = await prisma.fineType.create({
      data: {
        name: DIANA_MONTHLY_FINE_NAME,
        amount: DIANA_MONTHLY_FINE_AMOUNT,
        description: DIANA_MONTHLY_FINE_DESCRIPTION,
        category: 'Automatisk',
      },
    });
  } else if (
    fineType.name !== DIANA_MONTHLY_FINE_NAME
    || fineType.amount !== DIANA_MONTHLY_FINE_AMOUNT
    || fineType.description !== DIANA_MONTHLY_FINE_DESCRIPTION
  ) {
    fineType = await prisma.fineType.update({
      where: { id: fineType.id },
      data: {
        name: DIANA_MONTHLY_FINE_NAME,
        amount: DIANA_MONTHLY_FINE_AMOUNT,
        description: DIANA_MONTHLY_FINE_DESCRIPTION,
      },
    });
  }

  // Innbetalingsdag = siste dag i månaden
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const paymentDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Ikkje legg inn dobbel bot i same månad
  const existing = await prisma.fine.findFirst({
    where: {
      playerId: diana.id,
      fineTypeId: fineType.id,
      date: { gte: startOfMonth, lte: paymentDay },
    },
  });
  if (existing) return;

  await prisma.fine.create({
    data: {
      playerId: diana.id,
      fineTypeId: fineType.id,
      amount: fineType.amount,
      reason: 'Automatisk månedlig bot',
      status: 'PAID',
      date: paymentDay,
      paidAt: paymentDay,
    },
  });

  console.log('💸 Diana-Maria Teigen Fardal #40 har fått automatisk betalt bot for denne månaden.');
}

/** Start alle automatiske cron-jobbar */
export function startScheduler() {
  console.log('🕐 Automatiske bøter aktivert:');
  console.log('   • Botfri månad — Siste dagen kvar månad kl 08:00');
  console.log('   • DB keep-alive — Kvart 10. minutt');

  // 1. Botfri månad: køyr siste dag kvar månad kl 08:00
  // Køyrer kl 08:00 kvar dag, men sjekkar om det er siste dag i månaden
  cron.schedule('0 8 * * *', () => {
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    // Viss morgondagen er 1. i månaden → i dag er siste dag
    if (tomorrow.getDate() === 1) {
      checkBotfriMaaned().catch((err) => console.error('Botfri-sjekk feila:', err));
      // Legg til Diana-Maria Teigen Fardal sin bot
      addDianaMonthlyFine().catch((err) => console.error('Diana-bot feila:', err));
    }
  });

  // 2. DB keep-alive — ping databasen kvart 10. minutt for å halde tilkoplinga varm
  cron.schedule('*/10 * * * *', async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      console.error('DB keep-alive feila:', err);
    }
  });

  // 4. Self-ping — ping eigen /health kvart 14. minutt for å hindre Render free-tier sleep
  if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
    const url = `${process.env.RENDER_EXTERNAL_URL}/health`;
    cron.schedule('*/14 * * * *', async () => {
      try {
        await fetch(url);
      } catch { /* stille feil */ }
    });
    console.log(`   • Self-ping — Kvart 14. minutt → ${url}`);
  }
}

/** Eksporter funksjonane for manuell køyring / testing */
export { checkBotfriMaaned, checkForseinBetaling, addDianaMonthlyFine };
