import prisma from './prisma';
import { DEFAULT_RULES } from '../routes/public';
import {
  FINE_TYPES_CATALOG,
  FINE_TYPE_RENAMES,
  FINE_TYPES_VERSION,
} from '../domain/fineTypesCatalog';

/**
 * Seed / oppdater bottypar og reglar ved serverstart.
 * Bruker versjonering og upsert-logikk slik at endringar i summar vert oppdatert.
 */
export async function seedDefaultFineTypes() {
  const EXPECTED_VERSION = FINE_TYPES_VERSION;

  // Sjekk om denne versjonen allereie er seeda
  const versionRow = await prisma.siteContent.findUnique({ where: { key: 'fineTypesVersion' } });
  if (versionRow?.content === EXPECTED_VERSION) return;

  console.log('📋 Oppdaterer bottypar...');

  const fineTypes = FINE_TYPES_CATALOG;

  // Namn-mapping for omdøypte typar
  const renames = FINE_TYPE_RENAMES;

  for (const [oldName, newName] of Object.entries(renames)) {
    const existing = await prisma.fineType.findFirst({ where: { name: oldName } });
    if (existing) {
      await prisma.fineType.update({ where: { id: existing.id }, data: { name: newName } });
      console.log(`  🔄 Omdøypt: ${oldName} → ${newName}`);
    }
  }

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

  // Slett gamle typar som ikkje er i den nye lista og har 0 bøter
  const newNames = new Set(fineTypes.map((ft) => ft.name));
  const allTypes = await prisma.fineType.findMany({
    where: { category: { not: 'Automatisk' } },
    include: { _count: { select: { fines: true } } },
  });
  for (const t of allTypes) {
    if (!newNames.has(t.name) && t._count.fines === 0) {
      await prisma.fineType.delete({ where: { id: t.id } });
      console.log(`  🗑️  Sletta gammal type: ${t.name}`);
    }
  }

  // Oppdater regelsida med nyaste innhald
  await prisma.siteContent.upsert({
    where: { key: 'rules' },
    update: { content: DEFAULT_RULES },
    create: { key: 'rules', content: DEFAULT_RULES },
  });
  console.log('  📜 Regelsida oppdatert.');

  await prisma.siteContent.upsert({
    where: { key: 'fineTypesVersion' },
    update: { content: EXPECTED_VERSION },
    create: { key: 'fineTypesVersion', content: EXPECTED_VERSION },
  });

  console.log(`  ✅ ${fineTypes.length} bottypar oppdatert (v${EXPECTED_VERSION}).`);
}
