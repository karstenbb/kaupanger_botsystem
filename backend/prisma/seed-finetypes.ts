import { PrismaClient } from '@prisma/client';
import { FINE_TYPES_CATALOG } from '../src/domain/fineTypesCatalog';

const prisma = new PrismaClient();

/**
 * Legg inn / oppdater alle bottypar frå botsystemreglane.
 * Slettar IKKJE eksisterande bøter — berre upsert av FineType-rader.
 */
async function main() {
  console.log('📋 Legg inn bottypar...\n');

  const fineTypes = FINE_TYPES_CATALOG;

  // Slett gamle bottypar som ikkje har bøter knytt til seg
  const existingTypes = await prisma.fineType.findMany({
    include: { _count: { select: { fines: true } } },
  });

  // Finn namn på nye typar
  const newNames = new Set(fineTypes.map((ft) => ft.name));

  for (const existing of existingTypes) {
    // Ikkje slett automatiske typar (Botfri, Forsein betaling)
    if (existing.category === 'Automatisk') continue;
    // Viss eksisterande type ikkje er i den nye lista OG har 0 bøter, slett den
    if (!newNames.has(existing.name) && existing._count.fines === 0) {
      await prisma.fineType.delete({ where: { id: existing.id } });
      console.log(`  🗑️  Sletta gammal type: ${existing.name}`);
    }
  }

  // Upsert alle nye bottypar
  for (const ft of fineTypes) {
    const existing = await prisma.fineType.findFirst({ where: { name: ft.name } });
    if (existing) {
      await prisma.fineType.update({
        where: { id: existing.id },
        data: { amount: ft.amount, description: ft.description, category: ft.category },
      });
      console.log(`  ✏️  Oppdatert: ${ft.name} (${ft.amount} kr)`);
    } else {
      await prisma.fineType.create({ data: ft });
      console.log(`  ✅ Oppretta: ${ft.name} (${ft.amount} kr)`);
    }
  }

  console.log(`\n🎉 Ferdig! ${fineTypes.length} bottypar lagt inn.`);
}

main()
  .catch((e) => {
    console.error('Feil:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
