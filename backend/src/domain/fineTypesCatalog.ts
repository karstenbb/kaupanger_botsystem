export interface FineTypeSeed {
  name: string;
  amount: number;
  description: string;
  category: string;
}

export const FINE_TYPES_VERSION = '2025-06-18';

export const FINE_TYPE_RENAMES: Record<string, string> = {
  '§ 1-7 Feil farge på treningstøy': '§ 1-7 Feil farge på treningsoverdel',
  '§ 3-2 Provoserende atferd mot botsjef': '§ 3-2 Provoserande åtferd mot botsjef',
  '§ 3-9 Hodeplagg inn i garderoben': '§ 3-9 Hovudplagg inn i garderoben',
  '§ 3-10 Manglande bidrag til botkassen': '§ 3-10 Manglande bidrag til botkassa',
};

export const FINE_TYPES_CATALOG: FineTypeSeed[] = [
  { name: '§ 69 Inkasso', amount: 50, description: 'Å ikkje betale bøter innan fristen, straffast med ei bot på 50 kr per dag.', category: '§ 69' },

  { name: '§ 1-0 Ikkje møte når påmeldt', amount: 150, description: 'Ikkje møte på trening når du er påmeldt.', category: 'Trening' },
  { name: '§ 1-1 Fråvær trening', amount: 100, description: 'Ikkje møte på trening utan gyldig grunn. Gyldig grunn kan vere jobb, sjukdom, skade og planlagt ferie.', category: 'Trening' },
  { name: '§ 1-2 Sein til treningsstart', amount: 100, description: 'Komme forseint til treningsstart. Du er ikkje på plass før treninga startar.', category: 'Trening' },
  { name: '§ 1-3 Sein til oppmøte (trening)', amount: 40, description: 'Komme for seint til oppmøte. Oppmøte er satt minst 15 min før trening.', category: 'Trening' },
  { name: '§ 1-4 Tunnel i firkant', amount: 20, description: 'Du blir slått tunnel på, og medspelar får touch på ballen etter tunnelen (inni firkanten).', category: 'Trening' },
  { name: '§ 1-5 Ball ut av stadion', amount: 20, description: 'Du skyter ballen over nettet bak mål. Gjeld kun på trening.', category: 'Trening' },
  { name: '§ 1-6 Do-pause', amount: 30, description: 'Du forlate ein trening som har starta for å gå på do.', category: 'Trening' },
  { name: '§ 1-7 Feil farge på treningsoverdel', amount: 50, description: 'Du trener i anna farge enn grøn.', category: 'Trening' },
  { name: '§ 1-8 Feil klubblogo', amount: 50, description: 'Du trener med ein anna klubb sin logo på treningstøyet.', category: 'Trening' },
  { name: '§ 1-9 Taper botkonkurranse', amount: 20, description: 'Det gjennomførast botkonkurransar eit par gonger i månaden. Dei som feilar eller taper (3 stk.) konkurransen blir dømt til bot.', category: 'Trening' },
  { name: '§ 1-10 Gløymt personleg utstyr', amount: 50, description: 'Gløymt personleg utstyr (gjeld alt, frå flaske til såle). Grunnsum 50 kr., +25 kr. pr. gjenstand.', category: 'Trening' },
  { name: '§ 1-11 Utstyr inn/ut', amount: 50, description: 'De fire yngste på trening har ansvar for utstyr inn/ut. ALLE spelarar skal hjelpe å samle inn.', category: 'Trening' },

  { name: '§ 2-1 Fråvær kamp', amount: 500, description: 'Ikkje møte på kamp, utan å melde forfall innan rimeleg tid.', category: 'Kamp' },
  { name: '§ 2-2 Forfall sløv prioritering', amount: 100, description: 'Forfall til kamp, som følge av sløv prioritering.', category: 'Kamp' },
  { name: '§ 2-3 Konfirmasjonsbot', amount: 50, description: 'Du går glipp av kamp fordi du prioriterer konfirmasjon.', category: 'Kamp' },
  { name: '§ 2-4 Sein til oppmøte (kamp)', amount: 100, description: 'Komme for seint til oppmøte på kamp.', category: 'Kamp' },
  { name: '§ 2-5 Sein til kampstart', amount: 350, description: 'Komme forseint til kampstart. Gjelder ikkje dersom ein har god dialog med trenarteam/botsjef.', category: 'Kamp' },
  { name: '§ 2-6 Gløymt kamputstyr', amount: 100, description: 'Gløymt nødvendig kamputstyr (sko, leggskinn og evt. anna som ein må ha med).', category: 'Kamp' },
  { name: '§ 2-7 Gløymt utstyr etter kamp', amount: 50, description: 'Gløymt utstyr etter kamp (gjeld alt, frå flaske, sko, bukse osv.). Grunnsum 50 kr., +25 kr. pr. gjenstand.', category: 'Kamp' },
  { name: '§ 2-8 Unødvendig gult kort', amount: 100, description: 'Unødvendig gult kort.', category: 'Kamp' },
  { name: '§ 2-9 Unødvendig rødt kort', amount: 200, description: 'Unødvendig rødt kort.', category: 'Kamp' },
  { name: '§ 2-10 Feilkast', amount: 50, description: 'Feilkast. Dommaren dømmer.', category: 'Kamp' },

  { name: '§ 3-1 Manglande bursdagskake', amount: 200, description: 'Ikkje ta med bursdagskake den veka du har bursdag.', category: 'Uynskt åtferd' },
  { name: '§ 3-2 Provoserande åtferd mot botsjef', amount: 50, description: 'Fått ein klar bot, men klaga likevel til botsjefane. Botsjefane bestemme kva klaging er.', category: 'Uynskt åtferd' },
  { name: '§ 3-3 Idiotbot', amount: 50, description: 'Du oppfører deg, eller fremstår som ein tulling. 10–300 kr. Botsjefane avgjer. Summen avgjerast på alvoret av synda.', category: 'Uynskt åtferd' },
  { name: '§ 3-4 Lygebot', amount: 50, description: 'Du blir tatt i løgn.', category: 'Uynskt åtferd' },
  { name: '§ 3-5 Fylla dagen før kamp', amount: 200, description: 'Du er full på fest dagen før kamp. Vitnar siar du var full.', category: 'Uynskt åtferd' },
  { name: '§ 3-6 Ikkje møte på lagfest', amount: 25, description: 'Ikkje møte på lagfest. 25 kr eller 200 kr. Summen setjast etter kor godt planlagt festen er.', category: 'Uynskt åtferd' },
  { name: '§ 3-7 Pisse i dusjen', amount: 200, description: 'Pisse i dusjen i vårt lags garderobe.', category: 'Uynskt åtferd' },
  { name: '§ 3-8 Mobil i garderoben', amount: 25, description: 'Du bruker mobilen i garderoben i oppmøtetid og etter trening/kamp. Unntak: DJ og botsjefar.', category: 'Uynskt åtferd' },
  { name: '§ 3-9 Hovudplagg inn i garderoben', amount: 20, description: 'Du har på hovudplagg når du går over dørstokken inn i garderoben/klubben.', category: 'Uynskt åtferd' },
  { name: '§ 3-10 Manglande bidrag til botkassa', amount: 75, description: 'Du bidreg ikkje til fellesskapet gjennom botkassa, og straffes for dårleg lagånd.', category: 'Uynskt åtferd' },
  { name: '§ 3-11 Mediebot', amount: 50, description: 'Du intervjus av media utan å gi Kaupanger ein «Shoutout».', category: 'Uynskt åtferd' },

  { name: '§ 4-1 Svarfrist Spond', amount: 50, description: 'Svarfrist søndag for deltaking på denne vekas treningar.', category: 'Spond' },
  { name: '§ 4-2 Forfall etter kl 12', amount: 50, description: 'Forfall til trening grunna uforutsette hendingar etter 12.00 på treningsdag.', category: 'Spond' },
];
