import { Router, Request, Response } from 'express';
import prisma from '../services/prisma';

const router = Router();

/** GET /api/public/fines — Offentleg oversikt over alle bøter (ingen innlogging) */
router.get('/fines', async (_req: Request, res: Response) => {
  try {
    const fines = await prisma.fine.findMany({
      include: {
        player: { select: { id: true, name: true, number: true, position: true } },
        fineType: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });

    res.json(fines);
  } catch (error) {
    console.error('Public fines error:', error);
    res.status(500).json({ error: 'Klarte ikkje hente bøter' });
  }
});

/** GET /api/public/summary — Offentleg oppsummering */
router.get('/summary', async (_req: Request, res: Response) => {
  try {
    const [fines, players] = await Promise.all([
      prisma.fine.findMany({ include: { player: true } }),
      prisma.player.findMany(),
    ]);

    const totalAmount = fines.reduce((sum: number, f: { amount: number }) => sum + f.amount, 0);
    const unpaidAmount = fines.filter((f: { status: string }) => f.status === 'UNPAID').reduce((sum: number, f: { amount: number }) => sum + f.amount, 0);
    const paidAmount = fines.filter((f: { status: string }) => f.status === 'PAID').reduce((sum: number, f: { amount: number }) => sum + f.amount, 0);

    // Top offenders
    const playerMap = new Map<string, { name: string; total: number; count: number }>();
    for (const f of fines) {
      const entry = playerMap.get(f.playerId) || { name: f.player.name, total: 0, count: 0 };
      entry.total += f.amount;
      entry.count++;
      playerMap.set(f.playerId, entry);
    }
    const topPlayers = Array.from(playerMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    res.json({
      totalFines: fines.length,
      totalAmount,
      paidAmount,
      unpaidAmount,
      totalPlayers: players.length,
      topPlayers,
    });
  } catch (error) {
    console.error('Public summary error:', error);
    res.status(500).json({ error: 'Klarte ikkje hente oppsummering' });
  }
});

/** GET /api/public/fine-types — Offentleg oversikt over bottypar (ingen innlogging) */
router.get('/fine-types', async (_req: Request, res: Response) => {
  try {
    const fineTypes = await prisma.fineType.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, amount: true, description: true },
    });
    res.json(fineTypes);
  } catch (error) {
    console.error('Public fine-types error:', error);
    res.status(500).json({ error: 'Klarte ikkje hente bottypar' });
  }
});

/** GET /api/public/rules — Offentleg reglar (ingen innlogging) */
router.get('/rules', async (_req: Request, res: Response) => {
  try {
    let row = await prisma.siteContent.findUnique({ where: { key: 'rules' } });

    // Auto-seed default content if table is empty (first deploy)
    if (!row) {
      row = await prisma.siteContent.create({
        data: { key: 'rules', content: DEFAULT_RULES },
      });
    }

    res.json({ content: row.content, updatedAt: row.updatedAt });
  } catch (error) {
    console.error('Public rules error:', error);
    res.status(500).json({ error: 'Klarte ikkje hente reglar' });
  }
});

/* ── Default rules content (auto-seeded on first request) ────────── */
export const DEFAULT_RULES = `# Kaupanger A-lag herrer: Botsystem

## Formål

Botsystemet har ein viktig rolle og funksjon i ein seniorgarderobe og laget. Dei overordna måla med botsystemet er å:

1. Skaffe pengar til fellesskapet. Sosialistiske jævlar som er vi.
2. «Holde orden i rekkene». Bidra til at du oppfører deg!
3. Skape glede (sinne) og latter i gruppa.

## Grunnleggjande info

Karsten Bjelde, Aleksander Belland Eriksen og Nalawi Solomon er botsjefar. Det dei seier er dikkast lov når da gjeld bøtene. Er det nokon som absolutt ikkje vil vere med i botsystemet, ta kontakt med ein av oss. Pengane går tilbake til fellesskapet som bidrar.

Innbetaling:
Innbetaling skal skje på månadens siste dag, kvar månad. Dersom laget har aktivitet på månadens siste dag, har botsjef inntil 2 timar på å føre bøter, etter aktivitetens slutt. Manglande betaling straffes med inkasso. Betalast til +4797158329 (Karsten Bjelde, vipps).

**§ 69:** Inkasso. Å ikkje betale bøter innan fristen, straffast med ei bot på **50 kr.** per dag.

Trekning:
De 3 som bidrar minst økonomisk til botkassa i løpet av månaden, får delta i ein trekning med herlege premiar (litt ironisk).

---

## Ynskje du rettssak?

Dersom ein meina at bota ein har fått er tildelt på feil grunnlag, kan ein krevje rettssak. Dette gjerest på følgjande måte:

- Mottakar av bota må sende melding til ein av botsjefane. Innsendar må vise til kva for ein bot vedkommande klagar på. Krav om rettssak må sendast innan 7 dagar frå bota er registrert. Ved innsending av krav på rettssak vil mottakar motta eit klagegebyr på 50 kr. Gebyret refunderast ved vunne sak. Botsjefane har ansvar for å sette ein dato for rettssak innan rimeleg tid.

Gjennomføring av rettssak:
Rettssaka gjennomførast på ein tradisjonell måte: «Ein er skyldig til da motsette er bevist».

1. Aktor: Botsjefane fungera som aktor
2. Advokat: Om ynskjeleg, har siktande rett på advokat. Botsjefane tildeler ved behov.
3. Jury: Består av minimum 3 spelarar over 18 år. Botsjefane har ansvar for å sette jury. Ein skal etter beste evne forsøke skape ein jury med ulik alderssamansetning.
4. Aktoratet opnar og fortel kva saken gjeld. Den siktande kjem med si forklaring.
5. Aktoratet får tildelt ordet.
6. Før juryen trekker seg tilbake. Når juryen er klar, avleggs dommen.

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
Gløymt personleg utstyr (gjeld alt, frå flaske til såle). Grunnsum **50 kr.**, +**25 kr.** pr. gjenstand.

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
Gløymt utstyr etter kamp (gjeld alt, frå flaske, sko, bukse osv.). Grunnsum **50 kr.**, +**25 kr.** pr. gjenstand.

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
Ikkje møte på lagfest. **25 kr.** eller **200 kr.**
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

Generelt:
Ingen fritak grunna manglande nynorskforståing eller skrivefeil i regelverket.`;

export default router;
