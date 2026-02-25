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
  await prisma.siteContent.deleteMany();

  // ── Create Admin Players ────────────────────────────────────────────
  const karstenPlayer = await prisma.player.create({
    data: { name: 'Karsten Bjelde', position: 'Midtbane', number: null },
  });

  const nalawiPlayer = await prisma.player.create({
    data: { name: 'Nalawi Foto Solomon', position: 'Angriper', number: null },
  });

  // ── Legg til Diana-Maria Teigen Fardal ──────────────────────────────
  const dianaPlayer = await prisma.player.create({
    data: { name: 'Diana-Maria Teigen Fardal', position: null, number: 40 },
  });

  // Opprett første bot for Diana (denne måneden)
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  // Finn eller opprett bøtetype for Diana
  let dianaFineType = await prisma.fineType.findFirst({ where: { name: 'Månedlig Diana-Maria-bot' } });
  if (!dianaFineType) {
    dianaFineType = await prisma.fineType.create({
      data: {
        name: 'Månedlig Diana-Maria-bot',
        amount: 200,
        description: 'Automatisk bot for Diana-Maria Teigen Fardal, 200 kr kvar måned',
        category: 'Automatisk',
      },
    });
  }
  await prisma.fine.create({
    data: {
      playerId: dianaPlayer.id,
      fineTypeId: dianaFineType.id,
      amount: 200,
      reason: 'Automatisk månedlig bot',
      status: 'PAID',
      date: endOfMonth,
      paidAt: endOfMonth,
    },
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
      username: 'nalawi',
      email: 'nalawi@kaupanger.no',
      password: adminPassword,
      role: 'ADMIN',
      playerId: nalawiPlayer.id,
    },
  });

  // ── Create Fine Types ──────────────────────────────────────────────
  const fineTypes = await Promise.all([
    // § 69
    prisma.fineType.create({ data: { name: '§ 69 Inkasso', amount: 50, description: 'Å ikkje betale bøter innan fristen, straffast med ei bot på 50 kr per dag.', category: '§ 69' } }),

    // Kapittel 1: Trening
    prisma.fineType.create({ data: { name: '§ 1-0 Ikkje møte når påmeldt', amount: 150, description: 'Ikkje møte på trening når du er påmeldt.', category: 'Trening' } }),
    prisma.fineType.create({ data: { name: '§ 1-1 Fråvær trening', amount: 100, description: 'Ikkje møte på trening utan gyldig grunn. Gyldig grunn kan vere jobb, sjukdom, skade og planlagt ferie.', category: 'Trening' } }),
    prisma.fineType.create({ data: { name: '§ 1-2 Sein til treningsstart', amount: 100, description: 'Komme forseint til treningsstart. Du er ikkje på plass før treninga startar.', category: 'Trening' } }),
    prisma.fineType.create({ data: { name: '§ 1-3 Sein til oppmøte (trening)', amount: 40, description: 'Komme for seint til oppmøte. Oppmøte er satt minst 15 min før trening.', category: 'Trening' } }),
    prisma.fineType.create({ data: { name: '§ 1-4 Tunnel i firkant', amount: 20, description: 'Du blir slått tunnel på, og medspelar får touch på ballen etter tunnelen (inni firkanten).', category: 'Trening' } }),
    prisma.fineType.create({ data: { name: '§ 1-5 Ball ut av stadion', amount: 20, description: 'Du skyter ballen over nettet bak mål. Gjeld kun på trening.', category: 'Trening' } }),
    prisma.fineType.create({ data: { name: '§ 1-6 Do-pause', amount: 30, description: 'Du forlate ein trening som har starta for å gå på do.', category: 'Trening' } }),
    prisma.fineType.create({ data: { name: '§ 1-7 Feil farge på treningsoverdel', amount: 50, description: 'Du trener i anna farge enn grøn.', category: 'Trening' } }),
    prisma.fineType.create({ data: { name: '§ 1-8 Feil klubblogo', amount: 50, description: 'Du trener med ein anna klubb sin logo på treningstøyet.', category: 'Trening' } }),
    prisma.fineType.create({ data: { name: '§ 1-9 Taper botkonkurranse', amount: 20, description: 'Det gjennomførast botkonkurransar eit par gonger i månaden. Dei som feilar eller taper (3 stk.) konkurransen blir dømt til bot.', category: 'Trening' } }),
    prisma.fineType.create({ data: { name: '§ 1-10 Gløymt personleg utstyr', amount: 50, description: 'Gløymt personleg utstyr (gjeld alt, frå flaske til såle). Grunnsum 50 kr., +25 kr. pr. gjenstand.', category: 'Trening' } }),
    prisma.fineType.create({ data: { name: '§ 1-11 Utstyr inn/ut', amount: 50, description: 'De fire yngste på trening har ansvar for utstyr inn/ut. ALLE spelarar skal hjelpe å samle inn.', category: 'Trening' } }),

    // Kapittel 2: Kamp
    prisma.fineType.create({ data: { name: '§ 2-1 Fråvær kamp', amount: 500, description: 'Ikkje møte på kamp, utan å melde forfall innan rimeleg tid.', category: 'Kamp' } }),
    prisma.fineType.create({ data: { name: '§ 2-2 Forfall sløv prioritering', amount: 100, description: 'Forfall til kamp, som følge av sløv prioritering.', category: 'Kamp' } }),
    prisma.fineType.create({ data: { name: '§ 2-3 Konfirmasjonsbot', amount: 50, description: 'Du går glipp av kamp fordi du prioriterer konfirmasjon.', category: 'Kamp' } }),
    prisma.fineType.create({ data: { name: '§ 2-4 Sein til oppmøte (kamp)', amount: 100, description: 'Komme for seint til oppmøte på kamp.', category: 'Kamp' } }),
    prisma.fineType.create({ data: { name: '§ 2-5 Sein til kampstart', amount: 350, description: 'Komme forseint til kampstart. Gjelder ikkje dersom ein har god dialog med trenarteam/botsjef.', category: 'Kamp' } }),
    prisma.fineType.create({ data: { name: '§ 2-6 Gløymt kamputstyr', amount: 100, description: 'Gløymt nødvendig kamputstyr (sko, leggskinn og evt. anna som ein må ha med).', category: 'Kamp' } }),
    prisma.fineType.create({ data: { name: '§ 2-7 Gløymt utstyr etter kamp', amount: 50, description: 'Gløymt utstyr etter kamp (gjeld alt, frå flaske, sko, bukse osv.). Grunnsum 50 kr., +25 kr. pr. gjenstand.', category: 'Kamp' } }),
    prisma.fineType.create({ data: { name: '§ 2-8 Unødvendig gult kort', amount: 100, description: 'Unødvendig gult kort.', category: 'Kamp' } }),
    prisma.fineType.create({ data: { name: '§ 2-9 Unødvendig rødt kort', amount: 200, description: 'Unødvendig rødt kort.', category: 'Kamp' } }),
    prisma.fineType.create({ data: { name: '§ 2-10 Feilkast', amount: 50, description: 'Feilkast. Dommaren dømmer.', category: 'Kamp' } }),

    // Kapittel 3: Uynskt åtferd
    prisma.fineType.create({ data: { name: '§ 3-1 Manglande bursdagskake', amount: 200, description: 'Ikkje ta med bursdagskake den veka du har bursdag.', category: 'Uynskt åtferd' } }),
    prisma.fineType.create({ data: { name: '§ 3-2 Provoserande åtferd mot botsjef', amount: 50, description: 'Fått ein klar bot, men klaga likevel til botsjefane. Botsjefane bestemme kva klaging er.', category: 'Uynskt åtferd' } }),
    prisma.fineType.create({ data: { name: '§ 3-3 Idiotbot', amount: 50, description: 'Du oppfører deg, eller fremstår som ein tulling. 10–300 kr. Botsjefane avgjer. Summen avgjerast på alvoret av synda.', category: 'Uynskt åtferd' } }),
    prisma.fineType.create({ data: { name: '§ 3-4 Lygebot', amount: 50, description: 'Du blir tatt i løgn.', category: 'Uynskt åtferd' } }),
    prisma.fineType.create({ data: { name: '§ 3-5 Fylla dagen før kamp', amount: 200, description: 'Du er full på fest dagen før kamp. Vitnar siar du var full.', category: 'Uynskt åtferd' } }),
    prisma.fineType.create({ data: { name: '§ 3-6 Ikkje møte på lagfest', amount: 25, description: 'Ikkje møte på lagfest. 25 kr eller 200 kr. Summen setjast etter kor godt planlagt festen er.', category: 'Uynskt åtferd' } }),
    prisma.fineType.create({ data: { name: '§ 3-7 Pisse i dusjen', amount: 200, description: 'Pisse i dusjen i vårt lags garderobe.', category: 'Uynskt åtferd' } }),
    prisma.fineType.create({ data: { name: '§ 3-8 Mobil i garderoben', amount: 25, description: 'Du bruker mobilen i garderoben i oppmøtetid og etter trening/kamp. Unntak: DJ og botsjefar.', category: 'Uynskt åtferd' } }),
    prisma.fineType.create({ data: { name: '§ 3-9 Hovudplagg inn i garderoben', amount: 20, description: 'Du har på hovudplagg når du går over dørstokken inn i garderoben/klubben.', category: 'Uynskt åtferd' } }),
    prisma.fineType.create({ data: { name: '§ 3-10 Manglande bidrag til botkassa', amount: 75, description: 'Du bidreg ikkje til fellesskapet gjennom botkassa, og straffes for dårleg lagånd.', category: 'Uynskt åtferd' } }),
    prisma.fineType.create({ data: { name: '§ 3-11 Mediebot', amount: 50, description: 'Du intervjus av media utan å gi Kaupanger ein «Shoutout».', category: 'Uynskt åtferd' } }),

    // Kapittel 4: Spond
    prisma.fineType.create({ data: { name: '§ 4-1 Svarfrist Spond', amount: 50, description: 'Svarfrist søndag for deltaking på denne vekas treningar.', category: 'Spond' } }),
    prisma.fineType.create({ data: { name: '§ 4-2 Forfall etter kl 12', amount: 50, description: 'Forfall til trening grunna uforutsette hendingar etter 12.00 på treningsdag.', category: 'Spond' } }),
  ]);

  // ── Seed Rules Page Content ─────────────────────────────────────────
  const rulesContent = `# Kaupanger A-lag herrer: Botsystem

## Formål

Botsystemet har ein viktig rolle og funksjon i ein seniorgarderobe og laget. Dei overordna måla med botsystemet er å:

1. **Skaffe pengar til fellesskapet.** Sosialistiske jævlar som er vi.
2. **«Holde orden i rekkene».** Bidra til at du oppfører deg!
3. **Skape glede (sinne) og latter i gruppa.**

## Grunnleggjande info

Karsten Bjelde, Aleksander Belland Eriksen og Nalawi Solomon er botsjefar. Det dei seier er dikkast lov når da gjeld bøtene. Er det nokon som absolutt ikkje vil vere med i botsystemet, ta kontakt med ein av oss. Pengane går tilbake til fellesskapet som bidrar.

**Innbetaling:**
Innbetaling skal skje på månadens siste dag, kvar månad. Dersom laget har aktivitet på månadens siste dag, har botsjef inntil 2 timar på å føre bøter, etter aktivitetens slutt. Manglande betaling straffes med inkasso. Betalast til +4797158329 (Karsten Bjelde, vipps).

**§ 69: Inkasso.** Å ikkje betale bøter innan fristen, straffast med ei bot på 50 kr per dag.

**Trekning:**
De 3 som bidrar minst økonomisk til botkassa i løpet av månaden, får delta i ein trekning med herlege premiar (litt ironisk).

---

## Ynskje du rettssak?

Dersom ein meina at bota ein har fått er tildelt på feil grunnlag, kan ein krevje rettssak. Dette gjerest på følgjande måte:

- Mottakar av bota må sende melding til ein av botsjefane. Innsendar må vise til kva for ein bot vedkommande klagar på. Krav om rettssak må sendast innan 7 dagar frå bota er registrert. Ved innsending av krav på rettssak vil mottakar motta eit klagegebyr på 50 kr. Gebyret refunderast ved vunne sak. Botsjefane har ansvar for å sette ein dato for rettssak innan rimeleg tid.

**Gjennomføring av rettssak:**
Rettssaka gjennomførast på ein tradisjonell måte: «Ein er skyldig til da motsette er bevist».

1. **Aktor:** Botsjefane fungera som aktor
2. **Advokat:** Om ynskjeleg, har siktande rett på advokat. Botsjefane tildeler ved behov.
3. **Jury:** Består av minimum 3 spelarar over 18 år. Botsjefane har ansvar for å sette jury. Ein skal etter beste evne forsøke skape ein jury med ulik alderssamansetning.
4. **Aktoratet opnar** og fortel kva saken gjeld. Den siktande kjem med si forklaring.
5. **Aktoratet får tildelt ordet.**
6. **Før juryen trekker seg tilbake.** Når juryen er klar, avleggs dommen.

Ved tap i rettssaka, vil bota dobles, og gebyr betalast ikkje tilbake.

---

## Kapittel 1: Trening

**§ 1-0**
Ikkje møte på trening når du er påmeldt. **150 kr.**

**§ 1-1**
Ikkje møte på trening utan gyldig grunn. **100 kr.**
Gyldig grunn kan vere jobb, sjukdom, skade og planlagt ferie. Å gjere lekser/lese teller ikkje som gyldig grunn med mindre det er skuletur, klassetur osv.

**§ 1-2**
Komme forseint til treningsstart. **100 kr.**
Du er ikkje på plass før treninga startar.

**§ 1-3**
Komme for seint til oppmøte. Oppmøte er satt minst 15 min før trening. **40 kr.**
Døme: Oppmøte er 18.15, dersom klokken er 18.15 når du kjem inn døra, så er du for sein.

**§ 1-4**
Tunnel i firkant. Du blir slått tunnel på, og medspelar får touch på ballen etter tunnelen (inni firkanten). **20 kr.**

**§ 1-5**
Ball ut av stadion. Du skyter ballen over nettet bak mål. Gjeld kun på trening. **20 kr.**

**§ 1-6**
Do-pause. **30 kr.**
Du forlate ein trening som har starta for å gå på do.

**§ 1-7**
Feil farge på treningsoverdel. **50 kr.**
Du trener i anna farge enn grøn.

**§ 1-8**
Feil klubblogo. **50 kr.**
Du trener med ein anna klubb sin logo på treningstøyet.

**§ 1-9**
Taper botkonkurranse. **20 kr.**
Det gjennomførast botkonkurransar eit par gonger i månaden. Dei som feilar, eller taper (3 stk.) konkurransen blir dømt til bot.

**§ 1-10**
Gløymt personleg utstyr (gjeld alt, frå flaske til såle). **Grunnsum 50 kr., +25 kr. pr. gjenstand.**

**§ 1-11**
De fire yngste på trening har ansvar for å ut og inn utstyr. (Transportere utstyr til og frå feltet, telle og pumpe balla og koste garderoben). ALLE spelarar skal hjelpe å samle inn. **50 kr.**

---

## Kapittel 2: Kamp

**§ 2-1**
Ikkje møte på kamp, utan å melde forfall innan rimeleg tid. **500 kr.**
Botsjefane avgjer kva som er rimeleg tid.

**§ 2-2**
Forfall til kamp, som følge av sløv prioritering. **100 kr.**
Du melder forfall fordi du ikkje har strukturert eigen kvardag godt nok.

**§ 2-3**
Konfirmasjonsbot. **50 kr.**
Du går glipp av kamp fordi du prioriterer konfirmasjon.

**§ 2-4**
Komme for seint til oppmøte. **100 kr.**
Døme: Oppmøte er 18.15, dersom klokken er 18.15 når du kjem inn døra, så er du for sein.

**§ 2-5**
Komme forseint til kampstart. **350 kr.**
Gjelder ikkje dersom ein har god dialog med trenarteam/botsjef (Karsten).

**§ 2-6**
Gløymt nødvendig kamputstyr (sko, leggskinn og evt. anna som ein må ha med). **100 kr.**

**§ 2-7**
Gløymt utstyr etter kamp (gjeld alt, frå flaske, sko, bukse osv.). **Grunnsum 50 kr., +25 kr. pr. gjenstand.**

**§ 2-8**
Unødvendig gult kort. **100 kr.**

**§ 2-9**
Unødvendig rødt kort. **200 kr.**

**§ 2-10**
Feilkast. Dommaren dømmer. **50 kr.**

---

## Kapittel 3: Uynskt åtferd

**§ 3-1**
Ikkje ta med bursdagskake den veka du har bursdag. **200 kr.**

**§ 3-2**
Provoserande åtferd mot botsjef. **50 kr.**
Eksempel: fått ein klar bot, men klaga likevel til botsjefane. Botsjefane bestemme kva klaging er.

**§ 3-3**
Idiotbot. Du oppfører deg, eller fremstår som ein tulling. **10–300 kr.**
Botsjefane avgjer. Vi er veldig glad i innmeldte saker. Summen avgjerast på alvoret av synda.

**§ 3-4**
Lygebot. Du blir tatt i løgn. **50 kr.**
Døme: Spør ein av oss botsjefar om du har fått tunnel i firkant og du svarar nei, men vitnar i firkanten (minimum 2) seier du har blitt tatt tunnel på. Da får du lygebot, i tillegg til tunnelen.

**§ 3-5**
Fylla dagen før kamp. **200 kr.**
Du er full på fest dagen før kamp. Vitnar siar du var full.

**§ 3-6**
Ikkje møte på lagfest. **25 kr. eller 200 kr.**
Summen setjast etter kor godt planlagt festen er, og evt. årsak for å ikkje delta.

**§ 3-7**
Pisse i dusjen i vårt lags garderobe. **200 kr.**

**§ 3-8**
Mobil i garderoben. **25 kr.**
Du bruker mobilen i garderoben i oppmøtetid og etter trening/kamp, så lenge laget er samla. Området rundt benkene teller som garderobe når vi er i hallen.
Unntak: DJ kan styre musikk og botsjefar for relevant arbeid.

**§ 3-9**
Hovudplagg inn i garderoben. **20 kr.**
Du har på hovudplagg når du går over «dørstokken» inn i garderoben/klubben. Døra inn i fotballhallen teller som garderobe når vi ikkje benytter garderobe/klubben.

**§ 3-10**
Manglande bidrag til botkassa. **75 kr.**
Du bidreg ikkje til fellesskapet gjennom botkassa, og straffes for dårleg lagånd.

**§ 3-11**
Mediebot. **50 kr.**
Du intervjus av media utan å gi Kaupanger ein «Shoutout».
Døme: Manglande klubbtøy, introdusert som Kaupanger-spelar, eller ikkje siar noko om Kaupanger fotball.

---

## Kapittel 4: Spond

**§ 4-1**
Svarfrist søndag for deltaking på denne vekas treningar. **50 kr.**
Unntak: Uforutsette ting. Botsjefar avgjer kva som er godkjent og ikkje.

**§ 4-2**
Forfall til trening grunna uforutsette hendingar etter 12.00 på treningsdag. **50 kr.**
Unntak: dersom botsjefar meinar du har ein god nok grunn.

---

**Generelt:**
Ingen fritak grunna manglande nynorskforståing eller skrivefeil i regelverket.`;

  await prisma.siteContent.upsert({
    where: { key: 'rules' },
    update: {},
    create: { key: 'rules', content: rulesContent },
  });

  console.log('');
  console.log('✅ Seed complete!');
  console.log('─────────────────────────────────────');
  console.log('👤 Admin 1: karsten / admin123');
  console.log('👤 Admin 2: nalawi / admin123');
  console.log(`📋 Fine Types: ${fineTypes.length}`);
  console.log('📜 Rules page content seeded');
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
