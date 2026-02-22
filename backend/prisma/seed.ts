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

  // ── Seed Rules Page Content ─────────────────────────────────────────
  const rulesContent = `# Kaupanger botsystem

Botsystemet har som funksjon å:

- **Skaffe pengar til fellesskapet.** Sosialistar jævlar er vi.
- **Halde orden i rekkjene.** Oppfør deg!
- **Skape latter (og sinne) i garderoben**

Karsten Bjelde, Aleksander Belland og Nalawi Solomon er botsjefar. Det dei seier er dikkas lov når det gjeld bøtene. Er det nokon som absolutt ikkje vil vere med i botsystemet på grunn av økonomi eller noko anna, gi ein lyd til ein av oss. Du treng ikkje oppgi grunn. Pengane går tilbake til fellesskapet som bidreg.

Null maksgrense for månadleg sats.

**Trekning:**
Dei 3 som bidreg minst til botkassa i løpet av månaden, får delta i ei trekning med herlege premiar (litt ironisk).

**Innbetaling:**
Innbetaling skal skje på siste dagen i månaden, kvar månad. Dersom laget har aktivitet på siste dagen, har botsjef inntil éin time etter at garderoben er forlaten til å føre bøter. Manglande betaling blir straffa med inkasso. Betalast til +4797158329 (Karsten Bjelde på Vipps).

---

## § 69
**Inkasso.** Ikkje betale bøter i tide blir straffa med ei bot på 50 kr per dag.

---

## Kapittel 1: Trening

**§ 1-1**
Ikkje møte på trening utan gyldig grunn. Gyldig grunn kan vere jobb, sjukdom, skade og planlagd ferie. Å gjere lekser eller lese tel ikkje som gyldig grunn med mindre det er skuletur, klassetur osv. **100 kr.**

**§ 1-2**
Komme for seint til treningsstart. **100 kr.**
Du er ikkje klar når trening startar.

**§ 1-3**
Komme for seint til oppmøte. Oppmøte er sett minst 15 min før trening.
Døme: Oppmøte er 18.15. Dersom klokka er 18.15 når du kjem inn døra, så er du for sein.

**§ 1-4**
Tunnel i firkant. Du blir slått tunnel på, der medspelar får touch på ballen etter tunnelen. **20 kr.**

**§ 1-5**
Ball ut av stadion. Du skyt ballen over nettet bak mål. Gjeld kun i kamp. **25 kr.**

**§ 1-6**
Do-pause. **25 kr.**
Du forlèt ei trening som har starta for å gå på do.

**§ 1-7**
Feil farge på treningstøy. **50 kr.**
Du trenar i ein annan farge enn grøn.

**§ 1-8**
Feil klubblogo. **50 kr.**
Du trenar med ein annan klubb sin logo på treningstøyet.

**§ 1-9**
Taper botkonkurranse. **20 kr.**
Det blir gjennomført botkonkurransar eit par gonger i månaden. Dei som feilar eller taper (3 stk.) konkurransen blir dømde til bot.

**§ 1-10**
Gløymt personleg utstyr (gjeld alt frå flaske til såle). **50 kr.** + 25 kr per ekstra gjenstand.

**§ 1-11**
Dei fire yngste på trening har ansvar for å ta ut og inn utstyr (transportere utstyr til og frå feltet, telje og pumpe ballar og koste garderoben). ALLE spelarar skal hjelpe til med å samle inn. **50 kr.**

---

## Kapittel 2: Kamp

**§ 2-1**
Ikkje møte på kamp utan å melde forfall innan rimeleg tid. **500 kr.**
Botsjefane avgjer kva som er rimeleg tid.

**§ 2-2**
Forfall til kamp som følgje av sløv prioritering. **100 kr.**
Du melder forfall fordi du ikkje har strukturert eigen kvardag godt nok.

**§ 2-3**
Konfirmasjonsbot. **50 kr.**
Du går glipp av kamp fordi du prioriterer konfirmasjon.

**§ 2-4**
Komme for seint til oppmøte. **100 kr.**
Døme: Oppmøte er 18.15. Dersom klokka er 18.15 når du kjem inn døra, så er du for sein.

**§ 2-5**
Komme for seint til kampstart. **500 kr.**
Gjeld ikkje dersom ein har god dialog med trenarteam/botsjef (Karsten).

**§ 2-6**
Gløymt nødvendig kamputstyr (sko, leggskinn og eventuelt anna som manglar). **100 kr.**

**§ 2-7**
Gløymt utstyr etter kamp (gjeld alt frå flaske, sko, bukse osv.). **50 kr.**

**§ 2-8**
Unødvendig gult kort. **100 kr.**

**§ 2-9**
Unødvendig raudt kort. **200 kr.**

**§ 2-10**
Feilkast. Dommaren dømer. **50 kr.**

---

## Kapittel 3: Uønskt åtferd

**§ 3-1**
Ikkje ta med bursdagskake den veka du har bursdag. **200 kr.**

**§ 3-2**
Provoserande åtferd mot botsjef. **50 kr.**
Døme: Fått ei klar bot, men klaga likevel til botsjefane. Botsjefane bestemmer kva klaging er.

**§ 3-3**
Idiotbot. Du oppfører deg, eller framstår som ein tull. **10–300 kr.**
Botsjefane avgjer, men er veldig glade i innmelde saker. Summen blir avgjord etter alvorlegheitsgrad av synden.

**§ 3-4**
Lygebot. Du blir teken i løgn. **50 kr.**
Døme: Spør ein av oss botsjefar om du har fått tunnel i firkant og du svarar nei, men vitne i firkanten (minimum 2) seier du har blitt teken tunnel på. Då får du lygebot i tillegg til tunnelen.

**§ 3-5**
Fylla dagen før kamp. **200 kr.**
Du er full på fest dagen før kamp. Vitne seier du var full.

**§ 3-6**
Ikkje møte på lagfest. **25 kr eller 200 kr.**
Summen blir sett etter kor godt planlagd festen er, og eventuell årsak til å ikkje delta.

**§ 3-7**
Pisse i dusjen i laget sin garderobe. **200 kr.**

**§ 3-8**
Mobil i garderoben. **25 kr.**
Du brukar mobilen i garderoben i oppmøtetida. Unntak: DJ kan styre musikk og botsjefar ved relevant arbeid.

**§ 3-9**
Hovudplagg inn i garderoben. **20 kr.**
Du har på hovudplagg når du går over «dørstokken» inn i garderoben/klubben. Døra inn i fotballhallen tel som garderobe når vi ikkje nyttar garderoben/klubben.

**§ 3-10**
Manglande bidrag til botkassa. **75 kr.**
Du bidreg ikkje til fellesskapet gjennom botkassa, og blir straffa for dårleg lagånd.

**§ 3-11**
Mediebot. **50 kr.**
Du blir intervjua av media utan å gi Kaupanger ein «shoutout».
Døme: Manglande klubbtøy, introdusert som Kaupanger-spelar, eller seier noko om Kaupanger fotball.

---

## Kapittel 4: Spond

**§ 4-1**
Svarfrist søndag for deltaking på denne veka sine treningar. **50 kr.**
Unntak: Uforutsette ting. Botsjefar avgjer kva som er godkjent og ikkje.

**§ 4-2**
Forfall til trening grunna uforutsette hendingar etter kl. 12.00 på treningsdagen. **50 kr.**
Unntak: Dersom botsjef meiner du har ein god nok grunn.`;

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
