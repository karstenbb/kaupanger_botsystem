import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Legg inn / oppdater alle bottypar frå botsystemreglane.
 * Slettar IKKJE eksisterande bøter — berre upsert av FineType-rader.
 */
async function main() {
  console.log('📋 Legg inn bottypar...\n');

  const fineTypes = [
    // § 69
    { name: '§ 69 Inkasso', amount: 50, description: 'Ikkje betale bøter i tide, straffast med ei bot på 50 kr per dag.', category: '§ 69' },

    // Kapittel 1: Trening
    { name: '§ 1-1 Fråvær trening', amount: 100, description: 'Ikkje møte på trening uten gyldig grunn. Gyldig grunn kan vere jobb, sjukdom, skade og planlagt ferie.', category: 'Trening' },
    { name: '§ 1-2 Sein til treningsstart', amount: 100, description: 'Komme forseint til treningsstart. Du er ikkje klar når trening startar.', category: 'Trening' },
    { name: '§ 1-3 Sein til oppmøte (trening)', amount: 100, description: 'Komme for sent til oppmøte. Oppmøte er satt minst 15 min før trening.', category: 'Trening' },
    { name: '§ 1-4 Tunnel i firkant', amount: 20, description: 'Du blir slått tunnel på, hvor medspiller får touch på ballen etter tunnelen.', category: 'Trening' },
    { name: '§ 1-5 Ball ut av stadion', amount: 25, description: 'Du skyter ballen over nettet bak mål. Gjeld kun på kamp.', category: 'Trening' },
    { name: '§ 1-6 Do-pause', amount: 25, description: 'Du forlater en trening som har startet for å gå på do.', category: 'Trening' },
    { name: '§ 1-7 Feil farge på treningstøy', amount: 50, description: 'Du trener i annen farge enn grønn.', category: 'Trening' },
    { name: '§ 1-8 Feil klubblogo', amount: 50, description: 'Du trener med en annen klubb sin logo på treningstøyet.', category: 'Trening' },
    { name: '§ 1-9 Taper botkonkurranse', amount: 20, description: 'Det gjennomføres botkonkurranser et par ganger i måneden. Dei som feiler eller taper (3 stk.) konkurransen blir dømt til bot.', category: 'Trening' },
    { name: '§ 1-10 Gløymt personleg utstyr', amount: 50, description: 'Gløymt personlig utstyr (gjeld alt, fra flaske til såle).', category: 'Trening' },
    { name: '§ 1-11 Utstyr inn/ut', amount: 50, description: 'De fire yngste på trening har ansvar for å ut og inn utstyr. ALLE spillere skal hjelpe å samle inn.', category: 'Trening' },

    // Kapittel 2: Kamp
    { name: '§ 2-1 Fråvær kamp', amount: 500, description: 'Ikkje møte på kamp, uten å melde forfall innen rimelig tid. Botsjefene avgjør kva som er rimelig tid.', category: 'Kamp' },
    { name: '§ 2-2 Forfall sløv prioritering', amount: 100, description: 'Forfall til kamp, som følge av sløv prioritering. Du melder forfall fordi du ikkje har strukturert eigen kvardag godt nok.', category: 'Kamp' },
    { name: '§ 2-3 Konfirmasjonsbot', amount: 50, description: 'Du går glipp av kamp fordi du prioriterer konfirmasjon.', category: 'Kamp' },
    { name: '§ 2-4 Sein til oppmøte (kamp)', amount: 100, description: 'Komme for sent til oppmøte på kamp.', category: 'Kamp' },
    { name: '§ 2-5 Sein til kampstart', amount: 500, description: 'Komme forseint til kampstart. Gjelder ikkje dersom ein har god dialog med trenerteam/botsjef.', category: 'Kamp' },
    { name: '§ 2-6 Gløymt kamputstyr', amount: 100, description: 'Gløymt nødvendig kamputstyr (sko, leggskinn og evt. annet).', category: 'Kamp' },
    { name: '§ 2-7 Gløymt utstyr etter kamp', amount: 50, description: 'Gløymt utstyr etter kamp (gjeld alt, fra flaske, sko, bukse osv.).', category: 'Kamp' },
    { name: '§ 2-8 Unødvendig gult kort', amount: 100, description: 'Unødvendig gult kort.', category: 'Kamp' },
    { name: '§ 2-9 Unødvendig rødt kort', amount: 200, description: 'Unødvendig rødt kort.', category: 'Kamp' },
    { name: '§ 2-10 Feilkast', amount: 50, description: 'Feilkast. Dommeren dømmer.', category: 'Kamp' },

    // Kapittel 3: Uønsket atferd
    { name: '§ 3-1 Manglande bursdagskake', amount: 200, description: 'Ikkje ta med bursdagskake den uken du har bursdag.', category: 'Uønskt atferd' },
    { name: '§ 3-2 Provoserende atferd mot botsjef', amount: 50, description: 'Fått ein klar bot, men klaga likevel til botsjefane. Botsjefane bestemme kva klaging er.', category: 'Uønskt atferd' },
    { name: '§ 3-3 Idiotbot', amount: 50, description: 'Du oppfører deg, eller fremstår som ein tulling. 10–300 kr. Botsjefene avgjør. Summen avgjøres på alvorlighetsgrad av synden.', category: 'Uønskt atferd' },
    { name: '§ 3-4 Lygebot', amount: 50, description: 'Du blir tatt i løgn.', category: 'Uønskt atferd' },
    { name: '§ 3-5 Fylla dagen før kamp', amount: 200, description: 'Du er full på fest dagen før kamp. Vitner sier du var full.', category: 'Uønskt atferd' },
    { name: '§ 3-6 Ikkje møte på lagfest', amount: 25, description: 'Ikkje møte på lagfest. 25 kr eller 200 kr. Summen settes etter kor godt planlagt festen er.', category: 'Uønskt atferd' },
    { name: '§ 3-7 Pisse i dusjen', amount: 200, description: 'Pisse i dusjen i laget garderobe.', category: 'Uønskt atferd' },
    { name: '§ 3-8 Mobil i garderoben', amount: 25, description: 'Du bruker mobilen i garderoben i oppmøtetid. Unntak: DJ og botsjefer.', category: 'Uønskt atferd' },
    { name: '§ 3-9 Hodeplagg inn i garderoben', amount: 20, description: 'Du har på hodeplagg når du går over dørstokken inn i garderoben/klubben.', category: 'Uønskt atferd' },
    { name: '§ 3-10 Manglande bidrag til botkassen', amount: 75, description: 'Du bidrar ikkje til fellesskapet gjennom botkassen, og straffes for dårlig lagånd.', category: 'Uønskt atferd' },
    { name: '§ 3-11 Mediebot', amount: 50, description: 'Du intervjues av media uten å gi Kaupanger ein «Shoutout».', category: 'Uønskt atferd' },

    // Kapittel 4: Spond
    { name: '§ 4-1 Svarfrist Spond', amount: 50, description: 'Svarfrist søndag for deltakelse på denne ukens treninger. Unntak: Uforutsette ting.', category: 'Spond' },
    { name: '§ 4-2 Forfall etter kl 12', amount: 50, description: 'Forfall til trening grunnet uforutsette hendelser etter 12.00 på treningsdag. Unntak: dersom botsjef meiner du har god nok grunn.', category: 'Spond' },
  ];

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
