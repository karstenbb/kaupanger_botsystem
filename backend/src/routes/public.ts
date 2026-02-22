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
const DEFAULT_RULES = `# Kaupanger botsystem

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

export default router;
