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
    // § 69
    prisma.fineType.create({ data: { name: '§ 69 Inkasso', amount: 50, description: 'Ikkje betale bøter i tide, straffast med ei bot på 50 kr per dag.', category: '§ 69' } }),

    // Kapittel 1: Trening
    prisma.fineType.create({ data: { name: '§ 1-1 Fråvær trening', amount: 100, description: 'Ikkje møte på trening uten gyldig grunn.', category: 'Trening' } }),
    prisma.fineType.create({ data: { name: '§ 1-2 Sein til treningsstart', amount: 100, description: 'Komme forseint til treningsstart.', category: 'Trening' } }),
    prisma.fineType.create({ data: { name: '§ 1-3 Sein til oppmøte (trening)', amount: 100, description: 'Komme for sent til oppmøte.', category: 'Trening' } }),
    prisma.fineType.create({ data: { name: '§ 1-4 Tunnel i firkant', amount: 20, description: 'Du blir slått tunnel på, hvor medspiller får touch på ballen etter tunnelen.', category: 'Trening' } }),
    prisma.fineType.create({ data: { name: '§ 1-5 Ball ut av stadion', amount: 25, description: 'Du skyter ballen over nettet bak mål. Gjeld kun på kamp.', category: 'Trening' } }),
    prisma.fineType.create({ data: { name: '§ 1-6 Do-pause', amount: 25, description: 'Du forlater en trening som har startet for å gå på do.', category: 'Trening' } }),
    prisma.fineType.create({ data: { name: '§ 1-7 Feil farge på treningstøy', amount: 50, description: 'Du trener i annen farge enn grønn.', category: 'Trening' } }),
    prisma.fineType.create({ data: { name: '§ 1-8 Feil klubblogo', amount: 50, description: 'Du trener med en annen klubb sin logo på treningstøyet.', category: 'Trening' } }),
    prisma.fineType.create({ data: { name: '§ 1-9 Taper botkonkurranse', amount: 20, description: 'Dei som feiler eller taper konkurransen blir dømt til bot.', category: 'Trening' } }),
    prisma.fineType.create({ data: { name: '§ 1-10 Gløymt personleg utstyr', amount: 50, description: 'Gløymt personlig utstyr (gjeld alt, fra flaske til såle).', category: 'Trening' } }),
    prisma.fineType.create({ data: { name: '§ 1-11 Utstyr inn/ut', amount: 50, description: 'De fire yngste på trening har ansvar for å ut og inn utstyr.', category: 'Trening' } }),

    // Kapittel 2: Kamp
    prisma.fineType.create({ data: { name: '§ 2-1 Fråvær kamp', amount: 500, description: 'Ikkje møte på kamp, uten å melde forfall innen rimelig tid.', category: 'Kamp' } }),
    prisma.fineType.create({ data: { name: '§ 2-2 Forfall sløv prioritering', amount: 100, description: 'Forfall til kamp, som følge av sløv prioritering.', category: 'Kamp' } }),
    prisma.fineType.create({ data: { name: '§ 2-3 Konfirmasjonsbot', amount: 50, description: 'Du går glipp av kamp fordi du prioriterer konfirmasjon.', category: 'Kamp' } }),
    prisma.fineType.create({ data: { name: '§ 2-4 Sein til oppmøte (kamp)', amount: 100, description: 'Komme for sent til oppmøte på kamp.', category: 'Kamp' } }),
    prisma.fineType.create({ data: { name: '§ 2-5 Sein til kampstart', amount: 500, description: 'Komme forseint til kampstart.', category: 'Kamp' } }),
    prisma.fineType.create({ data: { name: '§ 2-6 Gløymt kamputstyr', amount: 100, description: 'Gløymt nødvendig kamputstyr (sko, leggskinn osv.).', category: 'Kamp' } }),
    prisma.fineType.create({ data: { name: '§ 2-7 Gløymt utstyr etter kamp', amount: 50, description: 'Gløymt utstyr etter kamp.', category: 'Kamp' } }),
    prisma.fineType.create({ data: { name: '§ 2-8 Unødvendig gult kort', amount: 100, description: 'Unødvendig gult kort.', category: 'Kamp' } }),
    prisma.fineType.create({ data: { name: '§ 2-9 Unødvendig rødt kort', amount: 200, description: 'Unødvendig rødt kort.', category: 'Kamp' } }),
    prisma.fineType.create({ data: { name: '§ 2-10 Feilkast', amount: 50, description: 'Feilkast. Dommeren dømmer.', category: 'Kamp' } }),

    // Kapittel 3: Uønskt atferd
    prisma.fineType.create({ data: { name: '§ 3-1 Manglande bursdagskake', amount: 200, description: 'Ikkje ta med bursdagskake den uken du har bursdag.', category: 'Uønskt atferd' } }),
    prisma.fineType.create({ data: { name: '§ 3-2 Provoserende atferd mot botsjef', amount: 50, description: 'Klaga på ein klar bot til botsjefane.', category: 'Uønskt atferd' } }),
    prisma.fineType.create({ data: { name: '§ 3-3 Idiotbot', amount: 50, description: 'Du oppfører deg, eller fremstår som ein tulling. 10–300 kr.', category: 'Uønskt atferd' } }),
    prisma.fineType.create({ data: { name: '§ 3-4 Lygebot', amount: 50, description: 'Du blir tatt i løgn.', category: 'Uønskt atferd' } }),
    prisma.fineType.create({ data: { name: '§ 3-5 Fylla dagen før kamp', amount: 200, description: 'Du er full på fest dagen før kamp.', category: 'Uønskt atferd' } }),
    prisma.fineType.create({ data: { name: '§ 3-6 Ikkje møte på lagfest', amount: 25, description: 'Ikkje møte på lagfest. 25 eller 200 kr.', category: 'Uønskt atferd' } }),
    prisma.fineType.create({ data: { name: '§ 3-7 Pisse i dusjen', amount: 200, description: 'Pisse i dusjen i laget garderobe.', category: 'Uønskt atferd' } }),
    prisma.fineType.create({ data: { name: '§ 3-8 Mobil i garderoben', amount: 25, description: 'Du bruker mobilen i garderoben i oppmøtetid.', category: 'Uønskt atferd' } }),
    prisma.fineType.create({ data: { name: '§ 3-9 Hodeplagg inn i garderoben', amount: 20, description: 'Du har på hodeplagg når du går inn i garderoben.', category: 'Uønskt atferd' } }),
    prisma.fineType.create({ data: { name: '§ 3-10 Manglande bidrag til botkassen', amount: 75, description: 'Du bidrar ikkje til fellesskapet gjennom botkassen.', category: 'Uønskt atferd' } }),
    prisma.fineType.create({ data: { name: '§ 3-11 Mediebot', amount: 50, description: 'Du intervjues av media uten å gi Kaupanger ein Shoutout.', category: 'Uønskt atferd' } }),

    // Kapittel 4: Spond
    prisma.fineType.create({ data: { name: '§ 4-1 Svarfrist Spond', amount: 50, description: 'Svarfrist søndag for deltakelse på denne ukens treninger.', category: 'Spond' } }),
    prisma.fineType.create({ data: { name: '§ 4-2 Forfall etter kl 12', amount: 50, description: 'Forfall til trening etter 12.00 på treningsdag.', category: 'Spond' } }),
  ]);

  // ── Seed Rules Page Content ─────────────────────────────────────────
  const rulesContent = `# Kaupanger botsystem

Botsystemet har som funksjon å:

1. **Skaffe penger til fellesskapet.** Sosialister jævler er vi.
2. **Holde orden i rekkene.** Oppfør deg!
3. **Skape latter (og sinne) i garderoben**

Karsten Bjelde, Aleksander Belland og Nalawi Solomon er bot sjefar, det dei seier er dikkas lov når da gjeld bøtene. Er det noken som absolutt ikkje vil vere med i bot systemet pga. økonomi eller noke ant gi ein lyd til ein av oss, du treng ikkje oppgi grunn. Pengene går tilbake til fellesskapet som bidrar.

Null max grense for månedlig sats.

**Trekning:**
De 3 som bidrar minst til botkassen i løpet av måneden, får delta i en trekning, med herlige premiar (litt ironisk).

**Innbetaling:**
Innbetaling skal skje på månedens siste dag, hver måned. Dersom laget har aktivitet på månedens siste dag, har botsjef inntil 1 time etter forlatt garderobe på å føre bøter. Manglende betaling straffes med inkasso. Betales til +4797158329 (Karsten Bjelde på vipps).

---

## § 69
**Inkasso.** Ikkje betale bøter i tide, straffast med ei bot på 50 kr per dag.

---

## Kapittel 1: Trening

**§ 1-1**
Ikkje møte på trening uten gyldig grunn. Gyldig grunn kan vere jobb, sjukdom, skade og planlagt ferie. Å gjere lekser/lese teller ikkje som gyldig grunn med mindre det er skuletur, klassetur osv. **100 kr.**

**§ 1-2**
Komme forseint til treningsstart. **100 kr.**
Du er ikke klar når trening starter.

**§ 1-3**
Komme for sent til oppmøte. Oppmøte er satt minst 15 min før trening.
Døme: Oppmøte er 18.15, dersom klokken er 18.15 når du kommer inn døren, så er du for sen.

**§ 1-4**
Tunnel i firkant. Du blir slått tunnel på, hvor medspiller får touch på ballen etter tunnelen. **20 kr.**

**§ 1-5**
Ball ut av stadion. Du skyter ballen over nettet bak mål. Gjeld kun på kamp. **25 kr.**

**§ 1-6**
Do-pause. **25 kr.**
Du forlater en trening som har startet for å gå på do.

**§ 1-7**
Feil farge på treningstøy. **50 kr.**
Du trener i annen farge enn grønn.

**§ 1-8**
Feil klubblogo. **50 kr.**
Du trener med en annen klubb sin logo på treningstøyet.

**§ 1-9**
Taper botkonkurranse. **20 kr.**
Det gjennomføres botkonkurranser et par ganger i måneden. De som feiler, eller taper (3 stk.) konkurransen blir dømt til bot.

**§ 1-10**
Gløymt personlig utstyr (gjeld alt, fra flaske til såle). **50 kr.**

**§ 1-11**
De fire yngste på trening har ansvar for å ut og inn utstyr. (Transportere utstyr til og fra feltet, telle og pumpe balla og koste garderoben). ALLE spillere skal hjelpe å samle inn. **50 kr.**

---

## Kapittel 2: Kamp

**§ 2-1**
Ikkje møte på kamp, uten å melde forfall innen rimelig tid. **500 kr.**
Botsjefene avgjør hva som er rimelig tid.

**§ 2-2**
Forfall til kamp, som følge av sløv prioritering. **100 kr.**
Du melder forfall fordi du ikke har strukturert egen hverdag godt nok.

**§ 2-3**
Konfirmasjonsbot. **50 kr.**
Du går glipp av kamp fordi du prioriterer komfirmasjon.

**§ 2-4**
Komme for sent til oppmøte. **100 kr.**
Døme: Oppmøte er 18.15, dersom klokken er 18.15 når du kommer inn døren, så er du for sen.

**§ 2-5**
Komme forseint til Kampstart. **500 kr.**
Gjelder ikke dersom en har god dialog med trenerteam/botsjef (Karsten).

**§ 2-6**
Gløymt nødvendig kamputstyr (Sko, leggskinn og evt. Annet som ikke). **100 kr.**

**§ 2-7**
Gløymt utstyr etter kamp (gjeld alt, fra flaske, sko, bukse osv.). **50 kr.**

**§ 2-8**
Unødvendig gult kort. **100 kr.**

**§ 2-9**
Unødvendig rødt kort. **200 kr.**

**§ 2-10**
Feilkast. Dommeren dømmer. **50 kr.**

---

## Kapittel 3: Uønsket atferd

**§ 3-1**
Ikkje ta med bursdagskake den uken du har bursdag. **200 kr.**

**§ 3-2**
Provoserende atferd mot botsjef. **50 kr.**
Eksempel: fått ein klar bot, men klaga likevel til botsjefane. Botsjefane bestemme kva klaging er.

**§ 3-3**
Idiotbot. Du oppfører deg, eller fremstår som en tulling. **10–300 kr.**
Botsjefene avgjør, men er veldig glad i innmeldte saker. Summen avgjøres på alvorlighetsgrad av synden.

**§ 3-4**
Lygebot. Du blir tatt i løgn. **50 kr.**
Døme: Spør ein av oss botsjefar om du har fått tunnel i firkant og du svarar nei, men vitner i firkanten (minimum 2) seier du har blitt tatt tunnel på. Da får du lygebot i tillegg til tunnellen.

**§ 3-5**
Fylla dagen før kamp. **200 kr.**
Du er full på fest dagen før kamp. Vitner sier du var full.

**§ 3-6**
Ikke møte på lagfest. **25 kr. eller 200 kr.**
Summen settes etter hvor godt planlagt festen er, og evt. Årsak for å ikke delta.

**§ 3-7**
Pisse i dusjen i laget garderobe. **200 kr.**

**§ 3-8**
Mobil i garderoben. **25 kr.**
Du bruker mobilen i garderoben i oppmøtetid. Unntak: DJ kan styre musikk og botsjefer for relevant arbeid.

**§ 3-9**
Hodeplagg inn i garderoben. **20 kr.**
Du har på hodeplagg når du går over «dørstokken» inn i garderoben/klubben. Døren inn i fotballhallen teller som garderobe når vi ikke benytter garderobe/klubben.

**§ 3-10**
Manglende bidrag til botkassen. **75 kr.**
Du bidrar ikke til fellesskapet gjennom botkassen, og straffes for dårlig lagånd.

**§ 3-11**
Mediebot. **50 kr.**
Du intervjues av media uten gi Kaupanger en «Shoutout».
Døme: Manglende klubbtøy, introdusert som Kaupanger-spiller, eller sier noe om Kaupanger fotball.

---

## Kapittel 4: Spond

**§ 4-1**
Svarfrist søndag for deltakelse på denne ukens treninger. **50 kr.**
Unntak: Uforutsette ting. Botsjefer avgjør hva som er godkjent og ikke.

**§ 4-2**
Forfall til trening grunnet uforutsette hendelser etter 12.00 på treningsdag. **50 kr.**
Unntak: dersom botsjef mener du har en god nok grunn.`;

  await prisma.siteContent.upsert({
    where: { key: 'rules' },
    update: {},
    create: { key: 'rules', content: rulesContent },
  });

  console.log('');
  console.log('✅ Seed complete!');
  console.log('─────────────────────────────────────');
  console.log('👤 Admin 1: karsten / admin123');
  console.log('👤 Admin 2: aleksander / admin123');
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
