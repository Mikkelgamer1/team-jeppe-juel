// Al HTML til sitet. Tekster rettes her; tal, heste og resultater kommer fra data/travinfo.json.

export const SITE = {
  // ← Bekræft domænet før lancering (kan også sættes med miljøvariablen SITE_URL). På Vercel bruges projektets adresse.
  url: (process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL && 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL) || 'https://www.teamjeppejuel.dk').replace(/\/$/, ''),
  navn: 'Team Jeppe Juel',
  person: 'Jeppe Juel',
  fornavn: 'Jeppe',
  licens: 56812,
  telefon: '+45 40 14 31 40',
  email: 'abn@godmail.dk', // står som kontaktmail på Team Jeppe Juels Facebook-side
  gade: 'Vilstedvej 157',
  sted: 'Vindblæs',
  postnr: '9670',
  by: 'Løgstør',
  facebook: 'https://www.facebook.com/profile.php?id=100063583749787', // opslag vises som kort, når FB_SIDE/FB_TOKEN er sat i GitHub
  instagram: '', // ← profilens adresse, hvis stalden har en
  travinfo: 'https://travinfo.dk/licenseholder-tabs/56812',
  hjemmebane: 'https://www.aav.dk/',
  kort: 'https://www.google.com/maps/search/?api=1&query=Vilstedvej+157%2C+9670+L%C3%B8gst%C3%B8r',
};

// Samarbejdspartnere med logo. Tom liste = ingen sektion. (Red Mills står på løbsdragten – bekræft og tilføj logo.)
const PARTNERE = [];

// Billeder fra Team Jeppe Juels Facebook-side: navn → [forhold, bredder…]
const BILLEDER = {
  'hero': [0.75, 700, 1100, 1536],
  'portraet': [0.999, 480, 719],
  'fra-sulkyen': [1.333, 800, 1400, 2048],
  'vindercirkel': [1.499, 800, 1400],
  'kusk-klar': [1.5, 800, 1400],
  'aalborg-bane': [1.5, 800, 1400],
  'aalborg-forvarm': [1.5, 800, 1400],
  'aalborg-stald': [0.664, 600, 1000],
  'staldgang': [1.357, 800, 1125],
  'traening-fire': [1.834, 800, 1179],
  'solopgang': [0.75, 600, 1000],
  'fold-trae': [0.563, 600, 1000],
  'fold-spejl': [0.613, 600, 1000],
  'fold-trav': [0.546, 600, 1000],
  'fold-front': [0.75, 600, 1000],
  'fold-tre': [1.333, 800, 1400],
  'hest-portraet': [0.75, 600, 1000],
};
// Hestekort fra Facebook-opslag, hvor hesten er nævnt ved navn (hest-id → billede). Forlader hesten træningslisten, forsvinder kortet.
const HESTEKORT = { 656471: 'entertainment', 656263: 'masai-boy', 661121: 'duke-of-walner', 658994: 'thinker-monkey' };

const BANER = { Sk: 'Skive', 'Ål': 'Aalborg', 'År': 'Aarhus', Od: 'Odense', Ch: 'Charlottenlund', Bi: 'Billund', Bh: 'Bornholm', Ny: 'Nykøbing F.', Bs: 'Skovbo', Kl: 'Klampenborg', 'Åb': 'Åby', 'Jæ': 'Jägersro', Ax: 'Axevalla' };
// Banernes omtrentlige placering [længdegrad, breddegrad] til det skematiske Danmarkskort (svenske baner og Bornholm vises ikke).
const BANE_POS = { Sk: [9.06, 56.56], 'Ål': [9.87, 57.05], 'År': [10.2, 56.14], Od: [10.36, 55.4], Ch: [12.58, 55.75], Bi: [9.12, 55.73], Ny: [11.87, 54.77], Bs: [12.03, 55.46], Kl: [12.59, 55.77] };
const HJEM = 'Ål';
const SVENSKE = ['Åb', 'Jæ', 'Ax'];
const NAV = [['om-jeppe/', 'Om Jeppe'], ['stalden/', 'Stalden'], ['heste/', 'Heste'], ['resultater/', 'Resultater']];

// ---------- små hjælpere ----------

let R = ''; // sti tilbage til roden fra den side, der bygges
let V = ''; // versionsmærke til css/js
let KORT;   // Danmarks omrids og projektionstal fra data/danmark.json

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const nf = (n) => Number(n).toLocaleString('da-DK');
const kr = (n) => `${nf(n)}&nbsp;kr.`;
const d = (iso) => new Date(`${String(iso).slice(0, 10)}T12:00:00Z`);
const langDato = (iso) => new Intl.DateTimeFormat('da-DK', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d(iso));
const kortDato = (iso) => new Intl.DateTimeFormat('da-DK', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(d(iso));
const ugedag = (iso) => new Intl.DateTimeFormat('da-DK', { weekday: 'long', timeZone: 'UTC' }).format(d(iso));
const dkListe = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} og ${a.at(-1)}`);
// API'et giver kun en kode. Ukendte koder er udenlandske baner (alle danske står i BANER), så de vises som Udlandet.
const bane = (kode) => BANER[kode] ?? 'Udlandet';
const tlfLink = SITE.telefon.replace(/\s/g, '');

/** "16,0a" → "1.16,0a". Tomt, hvis der ikke er en tid (fx galop uden tid). */
export const tid = (t) => (/^\d\d,\d/.test(t ?? '') ? `1.${t}` : '');

/** Hurtigste tid i en rekordstreng som "18,7k 14,3m *12,2am" → "1.12,2am". */
export const bedsteRekord = (mark) => {
  const tider = String(mark ?? '').replace(/\*/g, '').split(/\s+/).filter((x) => /^\d\d,\d/.test(x));
  tider.sort((a, b) => parseFloat(a.replace(',', '.')) - parseFloat(b.replace(',', '.')));
  return tider.length ? `1.${tider[0]}` : '';
};

/** Placering som den vises: 1, 2, 3 … "–" for uplaceret, "disk." for diskvalificeret. */
export const plac = (p) => (/^[1-9]\d*$/.test(p) ? p : p === 'd' ? 'disk.' : '–');

const pil = '<svg class="pil" viewBox="0 0 22 10" width="22" height="10" aria-hidden="true"><path d="M0 5h20M16 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
const ud = '<svg class="ud" viewBox="0 0 10 10" width="10" height="10" aria-hidden="true"><path d="M1 9 9 1M3 1h6v6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
// Stjernen fra Jeppes løbsdragt – bruges som holdets kendetegn.
const STJERNE = 'M12 1.6l3.05 6.7 7.3.8-5.45 4.95 1.55 7.2L12 17.6l-6.45 3.65 1.55-7.2L1.65 9.1l7.3-.8z';
const stjerne = (cls = 'stjerne') => `<svg class="${cls}" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="${STJERNE}"/></svg>`;
const nyFane = '<span class="sr"> (åbner i ny fane)</span>';
const ekstern = (href, tekst, cls = 'link') => `<a class="${cls}" href="${href}" target="_blank" rel="noopener">${tekst} ${ud}${nyFane}</a>`;
const knap = (href, tekst, cls = '') => `<a class="knap ${cls}" href="${R}${href}">${tekst} ${pil}</a>`;
const link = (href, tekst, cls = '') => `<a class="link ${cls}" href="${R}${href}">${tekst} ${pil}</a>`;

const billede = (navn, alt, { sizes = '100vw', lazy = true, cls = '' } = {}) => {
  const [forhold, ...bredder] = BILLEDER[navn];
  const max = bredder.at(-1);
  return `<img${cls ? ` class="${cls}"` : ''} src="${R}assets/img/${navn}-${bredder[0]}.webp" srcset="${bredder.map((w) => `${R}assets/img/${navn}-${w}.webp ${w}w`).join(', ')}" sizes="${sizes}" width="${max}" height="${Math.round(max / forhold)}" alt="${esc(alt)}"${lazy ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"'}>`;
};
const etiket = (tekst, attr = '') => `<p class="etiket"${attr}>${stjerne()}${tekst}</p>`;

// ---------- afledte tal ----------

function afled(data, idag) {
  const heste = [...data.heste].sort((a, b) => b.praemier - a.praemier || a.navn.localeCompare(b.navn, 'da'));
  const navne = new Map(heste.map((h) => [h.id, h.navn]));
  const medNavn = (r) => ({ ...r, hest: navne.get(r.hestId) ?? r.hest });
  const saeson = data.traenerStatistik.find((s) => s.sejre > 0) ?? data.traenerStatistik.find((s) => s.starter > 0) ?? data.traenerStatistik[0];
  const kusk = data.kuskStatistik.find((s) => s.aar === saeson.aar) ?? data.kuskStatistik[0];
  const iAar = data.resultater.filter((r) => r.dato.startsWith(String(saeson.aar)));
  const prNavn = {};
  for (const r of iAar) (prNavn[bane(r.bane)] ??= { kode: r.bane, navn: bane(r.bane), antal: 0 }).antal++;
  const banetal = Object.values(prNavn).sort((a, b) => b.antal - a.antal);
  const traenerAar = data.traenerStatistik.filter((s) => s.starter > 0);
  return {
    heste,
    saeson,
    kusk,
    opdateret: langDato(data.opdateret),
    seneste: data.resultater.slice(0, 10).map(medNavn),
    kommende: data.kommende.filter((k) => k.dato >= idag).map(medNavn),
    banetal,
    banerIAar: [...banetal.filter((b) => b.navn !== 'Udlandet').map((b) => b.navn), ...(prNavn.Udlandet ? ['udenlandske baner'] : [])],
    svenske: banetal.filter((b) => SVENSKE.includes(b.kode)).map((b) => b.navn),
    hjemmestarter: prNavn[bane(HJEM)]?.antal ?? 0,
    ungheste: heste.filter((h) => h.alder <= 2),
    aldre: [Math.min(...heste.map((h) => h.alder)), Math.max(...heste.map((h) => h.alder))],
    femAar: { aar: traenerAar.length, sejre: traenerAar.reduce((s, x) => s + x.sejre, 0), starter: traenerAar.reduce((s, x) => s + x.starter, 0) },
    bedst: traenerAar.reduce((a, b) => (b.sejre > a.sejre ? b : a), traenerAar[0] ?? saeson),
    fb: (data.facebook ?? []).slice(0, 5),
    kortheste: heste.filter((h) => HESTEKORT[h.id]),
  };
}

// ---------- fælles dele ----------

const maerke = (cls = '') => `<span class="maerke ${cls}">${stjerne()}<span class="maerke__ord"><small>Team</small>Jeppe Juel</span></span>`;

// Løbsdragtens kantbånd: beige, bordeaux og grøn.
const baand = (cls = '') => `<div class="baand ${cls}" aria-hidden="true"></div>`;

const top = (sti) => `
<header class="top">
  <div class="top__inner">
    <a class="top__logo" href="${R || './'}" aria-label="${SITE.navn} – til forsiden">${maerke()}</a>
    <nav class="top__nav" aria-label="Primær navigation">
      ${NAV.map(([href, navn]) => `<a href="${R}${href}"${sti.startsWith(href) ? ' aria-current="page"' : ''}>${navn}</a>`).join('\n      ')}
    </nav>
    <a class="top__tlf" href="tel:${tlfLink}"><span class="sr">Ring til ${SITE.fornavn}: </span>${SITE.telefon}</a>
    <a class="knap knap--lille top__cta" href="${R}kontakt/"${sti.startsWith('kontakt/') ? ' aria-current="page"' : ''}>Kontakt</a>
    <button class="burger" type="button" aria-haspopup="dialog" aria-controls="menu" commandfor="menu" command="show-modal"><span>Menu</span><i aria-hidden="true"></i></button>
  </div>
</header>
<dialog class="menu" id="menu" aria-label="Menu">
  <div class="menu__top wrap">
    ${maerke()}
    <button class="burger burger--luk" type="button" data-luk commandfor="menu" command="close"><span>Luk</span><i aria-hidden="true"></i></button>
  </div>
  <nav class="menu__nav wrap" aria-label="Menu">
    <ul>
      ${[['', 'Forside'], ...NAV, ['kontakt/', 'Kontakt']].map(([href, navn], i) => `<li style="--i:${i}"><a href="${R}${href || (R ? '' : './')}"${(href ? sti.startsWith(href) : sti === '') ? ' aria-current="page"' : ''}>${navn}</a></li>`).join('\n      ')}
    </ul>
  </nav>
  <div class="menu__bund wrap">
    <a href="tel:${tlfLink}">${SITE.telefon}</a>
    <a href="mailto:${SITE.email}">${SITE.email}</a>
  </div>
</dialog>`;

const kontaktbaand = () => `
<section class="cta">
  ${baand()}
  <div class="wrap cta__inner">
    <div>
      ${etiket('Kontakt', ' data-vis')}
      <h2 data-vis style="--i:1">Skal din hest i træning hos Team Juel?</h2>
      <p data-vis style="--i:2">Ring, send en sms eller skriv til ${SITE.fornavn} – så tager I en snak om hesten og mulighederne.</p>
    </div>
    <div class="cta__valg" data-vis style="--i:3">
      <a class="cta__tlf" href="tel:${tlfLink}">${SITE.telefon}</a>
      <p class="valg"><a class="knap knap--creme" href="mailto:${SITE.email}">Skriv en mail ${pil}</a> ${link('kontakt/', 'Alle kontaktoplysninger', 'link--lys')}</p>
    </div>
  </div>
</section>`;

const partnere = () => (PARTNERE.length ? `
<section class="sek sek--creme2 sek--smal">
  <div class="wrap partnere">
    <div>
      ${etiket('Samarbejdspartnere', ' data-vis')}
      <h2 data-vis style="--i:1">Med på holdet.</h2>
    </div>
    <ul class="partnere__liste">${PARTNERE.map((p, i) => `
      <li data-vis style="--i:${i + 1}"><a href="${p.url}" target="_blank" rel="noopener"><img src="${R}assets/img/${p.logo}" width="${p.b}" height="${p.h}" alt="${esc(p.navn)}" loading="lazy"><span>${esc(p.tekst)} ${ud}</span>${nyFane}</a></li>`).join('')}
    </ul>
  </div>
</section>` : '');

const bund = (o) => `
<footer class="bund">
  ${baand()}
  <div class="wrap bund__gitter">
    <div class="bund__brand">
      ${maerke('maerke--stor')}
      <p>Professionel travtræning i ${SITE.sted} ved ${SITE.by} – med Spar Nord Arena Aalborg som hjemmebane.</p>
    </div>
    <nav aria-label="Sider">
      <h2>Sider</h2>
      <ul>
        ${[...NAV, ['kontakt/', 'Kontakt']].map(([href, navn]) => `<li><a href="${R}${href}">${navn}</a></li>`).join('')}
      </ul>
    </nav>
    <div>
      <h2>Kontakt</h2>
      <ul>
        <li><a href="tel:${tlfLink}">${SITE.telefon}</a></li>
        <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
        <li><address>${SITE.gade}, ${SITE.sted}<br>${SITE.postnr} ${SITE.by}</address></li>
      </ul>
    </div>
    <div>
      <h2>Følg med</h2>
      <ul>
        ${SITE.facebook ? `<li>${ekstern(SITE.facebook, 'Facebook', '')}</li>` : ''}
        ${SITE.instagram ? `<li>${ekstern(SITE.instagram, 'Instagram', '')}</li>` : ''}
        <li>${ekstern(SITE.travinfo, 'Travinfo', '')}</li>
        <li>${ekstern(SITE.hjemmebane, 'Spar Nord Arena Aalborg', '')}</li>
      </ul>
    </div>
  </div>
  <div class="wrap bund__linje">
    <p>Resultater og statistik: Dansk Hestevæddeløb · opdateret ${o.opdateret}</p>
    <p>Billeder: Team Jeppe Juels Facebook-side · vindercirkel: Kjeld Mikkelsen Photography</p>
    <p>© ${new Date().getFullYear()} ${SITE.navn}</p>
  </div>
</footer>`;

const organisation = () => ({
  '@type': ['LocalBusiness', 'SportsOrganization'],
  '@id': `${SITE.url}/#stald`,
  name: SITE.navn,
  description: 'Professionel travtræning med Spar Nord Arena Aalborg som hjemmebane: træning af løbsheste og tilkøring af ungheste.',
  url: `${SITE.url}/`,
  telephone: tlfLink,
  email: SITE.email,
  image: `${SITE.url}/assets/img/og.jpg`,
  logo: `${SITE.url}/assets/img/ikon-512.png`,
  sport: 'Travsport',
  address: { '@type': 'PostalAddress', streetAddress: SITE.gade, postalCode: SITE.postnr, addressLocality: SITE.by, addressCountry: 'DK' },
  founder: { '@id': `${SITE.url}/#person` },
  sameAs: [SITE.travinfo, SITE.facebook, SITE.instagram].filter(Boolean),
});
const person = () => ({
  '@type': 'Person',
  '@id': `${SITE.url}/#person`,
  name: SITE.person,
  jobTitle: 'Professionel travtræner og kusk',
  url: `${SITE.url}/om-jeppe/`,
  image: `${SITE.url}/assets/img/portraet-719.webp`,
  worksFor: { '@id': `${SITE.url}/#stald` },
  sameAs: [SITE.travinfo],
});

function layout({ sti, titel, beskrivelse, indhold, o, klasse = '', noindex = false }) {
  const kanonisk = `${SITE.url}/${sti}`;
  const sideNavn = [...NAV, ['kontakt/', 'Kontakt']].find(([href]) => href === sti)?.[1];
  const graf = [
    { '@type': 'WebSite', '@id': `${SITE.url}/#website`, url: `${SITE.url}/`, name: SITE.navn, inLanguage: 'da-DK' },
    organisation(),
    person(),
    ...(sideNavn ? [{ '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Forside', item: `${SITE.url}/` }, { '@type': 'ListItem', position: 2, name: sideNavn, item: kanonisk }] }] : []),
  ];
  return `<!doctype html>
<html lang="da">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titel)}</title>
<meta name="description" content="${esc(beskrivelse)}">
${noindex ? '<meta name="robots" content="noindex">' : '<link rel="canonical" href="' + kanonisk + '">'}
<meta name="theme-color" content="#f4eee2">
<meta property="og:type" content="website">
<meta property="og:locale" content="da_DK">
<meta property="og:site_name" content="${SITE.navn}">
<meta property="og:title" content="${esc(titel)}">
<meta property="og:description" content="${esc(beskrivelse)}">
<meta property="og:url" content="${kanonisk}">
<meta property="og:image" content="${SITE.url}/assets/img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Team Jeppe Juel – travtræner Jeppe Juel, Aalborg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="48x48" href="${R}assets/img/ikon-48.png">
<link rel="apple-touch-icon" href="${R}assets/img/ikon-180.png">
<link rel="preload" href="${R}assets/fonts/fraunces.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${R}assets/fonts/bricolage.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${R}assets/css/site.css?v=${V}">
<script>document.documentElement.classList.add('js');setTimeout(function(){window.__klar||document.documentElement.classList.remove('js')},2500)</script>
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graf }).replace(/</g, '\\u003c')}</script>
</head>
<body class="${klasse}">
<a class="skip" href="#indhold">Spring til indhold</a>
${top(sti)}
<main id="indhold">
${indhold}
</main>
${bund(o)}
<script src="${R}assets/js/site.js?v=${V}" defer></script>
</body>
</html>
`;
}

// Sidehoved på undersider: lyst felt med titel til venstre og et af staldens billeder i en bue til højre.
const sidehoved = ({ sti, h1, tekst, foto, alt = '', pos = '50% 50%', chips = [] }) => `
<section class="sidehoved">
  <div class="wrap sidehoved__gitter">
    <div class="sidehoved__tekst">
      <nav class="sti" aria-label="Brødkrumme"><a href="${R}">Forside</a><span aria-hidden="true">/</span><span aria-current="page">${sti}</span></nav>
      <h1>${h1}</h1>
      <p class="indled">${tekst}</p>
      ${chips.length ? `<ul class="chips">${chips.map(([tal, tekst]) => `<li><b>${tal}</b> ${tekst}</li>`).join('')}</ul>` : ''}
    </div>
    <figure class="sidehoved__foto bue" style="--pos:${pos}">${billede(foto, alt, { sizes: '(min-width: 901px) 42vw, 92vw', lazy: false })}</figure>
  </div>
</section>
${baand()}`;

/**
 * Skematisk Danmarkskort. `punkter` er [{ kode, navn, antal? }]: med antal tegnes en boble med tallet i,
 * uden antal en lille prik. Hjemmebanen får en ring, og der tegnes linjer derfra til de andre baner.
 */
function danmarkskort(punkter, beskrivelse) {
  const { bredde, hoejde, lon0, lat1, kx, ky, sti } = KORT;
  const max = Math.max(1, ...punkter.map((p) => p.antal ?? 0));
  const vist = punkter.filter((p) => BANE_POS[p.kode]).map((p) => {
    const [lon, lat] = BANE_POS[p.kode];
    const r = p.antal ? +(8 + 6 * Math.sqrt(p.antal / max)).toFixed(1) : 7;
    return { ...p, x: +((lon - lon0) * kx).toFixed(1), y: +((lat1 - lat) * ky).toFixed(1), r, ydre: p.kode === HJEM ? r + (p.antal ? 4 : 6) : r };
  });
  const hjem = vist.find((p) => p.kode === HJEM);
  const ruter = hjem ? vist.filter((p) => p !== hjem) : [];

  // Navnet sættes dér, hvor det bedst holder sig inden for kortet og fri af ruter og andre baner.
  const navn = (p) => {
    const w = p.navn.length * 6.4, m = p.ydre + 6;
    const steder = [['start', p.x + m, p.y + 3.7], ['middle', p.x, p.y + m + 9], ['end', p.x - m, p.y + 3.7], ['end', Math.min(p.x + p.ydre, bredde - 4), p.y + m + 9], ['middle', p.x, p.y - m - 2]];
    const straf = ([anker, x, y]) => { // 100 for at stikke ud over kortet, 10 for at ramme en rute eller en anden bane
      const x0 = (anker === 'start' ? x : anker === 'end' ? x - w : x - w / 2) - 3, x1 = x0 + w + 6, y0 = y - 12, y1 = y + 4;
      const inde = (px, py, luft = 0) => px > x0 - luft && px < x1 + luft && py > y0 - luft && py < y1 + luft;
      const udenfor = x0 < 0 || x1 > bredde || y0 < 0 || y1 > hoejde;
      const rammer = vist.some((q) => q !== p && inde(q.x, q.y, q.ydre))
        || ruter.some((q) => { for (let t = 0; t <= 1; t += 0.02) if (inde(hjem.x + (q.x - hjem.x) * t, hjem.y + (q.y - hjem.y) * t)) return true; return false; });
      return (udenfor ? 100 : 0) + (rammer ? 10 : 0);
    };
    // Hjemmebanen helst til venstre, uden for viften af ruter. Ved lige straf vinder det første sted på listen.
    const [anker, x, y] = (p === hjem ? [steder[2], ...steder] : steder).map((sted, i) => [straf(sted) + i / 100, sted]).sort((a, b) => a[0] - b[0])[0][1];
    return `<text class="kort__navn" x="${+x.toFixed(1)}" y="${+y.toFixed(1)}" text-anchor="${anker}">${esc(p.navn)}</text>`;
  };

  return `<svg class="kort__svg" viewBox="0 0 ${bredde} ${hoejde}" role="img" aria-label="${esc(beskrivelse)}">
        <path class="kort__land" d="${sti}"/>${ruter.map((p, i) => `
        <path class="kort__rute" pathLength="1" d="M${hjem.x},${hjem.y}L${p.x},${p.y}" style="--n:${i}"/>`).join('')}${vist.map((p, i) => `
        <g class="kort__bane" style="--n:${i}">${p === hjem ? `<circle class="kort__ring" cx="${p.x}" cy="${p.y}" r="${p.ydre}"/>` : ''}<circle class="kort__prik" cx="${p.x}" cy="${p.y}" r="${p.r}"/>${p.antal ? `<text class="kort__tal" x="${p.x}" y="${+(p.y + 3.3).toFixed(1)}" text-anchor="middle">${p.antal}</text>` : ''}${navn(p)}</g>`).join('')}
      </svg>`;
}

// ---------- genbrugte blokke ----------

const plKlasse = (p) => (p === '1' ? ' pl--1' : /^[23]$/.test(p) ? ' pl--23' : p === 'd' ? ' pl--tekst' : '');

const resultatRaekke = (r) => `
      <li class="res__r">
        <span class="pl${plKlasse(r.placering)}"><span class="sr">Placering: </span>${plac(r.placering)}</span>
        <span class="res__hest">${esc(r.hest)}</span>
        <span class="res__info"><time datetime="${r.dato}">${kortDato(r.dato)}</time> · ${esc(bane(r.bane))} · ${r.loeb}. løb · ${nf(r.distance)}&nbsp;m</span>
        <span class="res__tid">${tid(r.tid) || '<span aria-hidden="true">–</span><span class="sr">ingen tid</span>'}</span>
        <span class="res__kr">${r.praemie ? kr(r.praemie) : '<span aria-hidden="true">–</span><span class="sr">ingen præmie</span>'}</span>
      </li>`;
const resultatliste = (liste) => `<ol class="res">${liste.map(resultatRaekke).join('')}
    </ol>`;

const kommendeListe = (liste) => `<ul class="kom">${liste.map((k) => `
      <li>
        <time datetime="${k.dato}"><b>${new Date(`${k.dato}T12:00:00Z`).getUTCDate()}</b>${kortDato(k.dato).replace(/^\d+\.\s*/, '')}</time>
        <span class="kom__hest">${esc(k.hest)}</span>
        <span class="kom__bane">${ugedag(k.dato)} · ${esc(bane(k.bane))} · ${k.loeb}. løb${k.kusk ? ` · ${esc(k.kusk)}` : ''}</span>
      </li>`).join('')}
    </ul>`;
const ingenStarter = () => `<p class="tom">Ingen af staldens heste er startmeldt lige nu. Nye startlister kommer på ${ekstern(SITE.travinfo, 'Travinfo')}.</p>`;

const omHest = (h) => `${h.alder}-årig ${esc(h.koen.toLowerCase())}`;
const afstamning = (h) => (h.far ? `e. ${esc(h.far)} – ${esc(h.mor)}` : '');
const sejre = (h) => Number(h.placeringer.split('-')[0]) || 0;

// Profilkort for de mest vindende heste.
const profilkort = (h, i) => `
      <a class="profil" href="https://travinfo.dk/horse_tabs/${h.id}" target="_blank" rel="noopener" data-vis style="--i:${i % 6}">
        <span class="profil__nr" aria-hidden="true">${i + 1}</span>
        <h3>${esc(h.navn)}</h3>
        <p>${omHest(h)}${afstamning(h) ? `<br>${afstamning(h)}` : ''}</p>
        <p class="profil__kr">${kr(h.praemier)}<small>indkørt</small></p>
        <dl>
          <div><dt>Starter</dt><dd>${h.starter}</dd></div>
          <div><dt>Sejre</dt><dd>${sejre(h)}</dd></div>
          <div><dt>Rekord</dt><dd>${bedsteRekord(h.rekord) || '–'}</dd></div>
        </dl>
        <span class="profil__ud">Se på Travinfo ${ud}${nyFane}</span>
      </a>`;

// Hestekort med billeder fra Facebook-opslagene.
const hestekort = (heste) => `<ul class="hestekort" aria-label="Heste fra Team Jeppe Juels Facebook">${heste.map((h, i) => `
      <li data-vis style="--i:${i}"><a href="https://travinfo.dk/horse_tabs/${h.id}" target="_blank" rel="noopener"><img src="${R}assets/img/hest-${HESTEKORT[h.id]}-400.webp" srcset="${R}assets/img/hest-${HESTEKORT[h.id]}-400.webp 400w, ${R}assets/img/hest-${HESTEKORT[h.id]}-560.webp 560w" sizes="(min-width: 1100px) 22vw, 70vw" width="560" height="700" alt="${esc(h.navn)}" loading="lazy" decoding="async"><span class="hestekort__navn"><b>${esc(h.navn)}</b><small>${omHest(h)}</small></span>${nyFane}</a></li>`).join('')}
    </ul>`;

// Hesterække til den fulde træningsliste.
const hesteraekke = (h, i) => `
      <li class="hest" data-vis style="--i:${i % 6}">
        <div class="hest__navn">
          <h3><a href="https://travinfo.dk/horse_tabs/${h.id}" target="_blank" rel="noopener">${esc(h.navn)}${nyFane}</a></h3>
          <p>${omHest(h)}${afstamning(h) ? ` · ${afstamning(h)}` : ''}</p>
        </div>
        ${h.starter ? `<dl class="hest__tal">
          <div><dt>Starter</dt><dd>${h.starter} <small>${esc(h.placeringer)}</small></dd></div>
          <div><dt>Indkørt</dt><dd>${kr(h.praemier)}</dd></div>
          <div><dt>Rekord</dt><dd>${bedsteRekord(h.rekord) || '–'}</dd></div>
        </dl>` : '<p class="hest__tal hest__tal--tom">Ustartet</p>'}
      </li>`;
const hestegruppe = (titel, heste) => (heste.length ? `
    <div class="gruppe">
      <h2 class="gruppe__titel" data-vis>${titel} <span>${heste.length}</span></h2>
      <ul class="hesteliste">${heste.map(hesteraekke).join('')}
      </ul>
    </div>` : '');

const ydelser = (o) => `
    <ul class="ydelser">
      <li data-vis>
        ${stjerne('ydelser__ikon')}
        <h3>Træning af løbsheste</h3>
        <p>Stalden træner og starter løbsheste på baner i hele landet. I ${o.saeson.aar} har staldens heste været til start i ${dkListe(o.banerIAar)}.</p>
      </li>
      <li data-vis style="--i:1">
        ${stjerne('ydelser__ikon')}
        <h3>Tilkøring af ungheste</h3>
        <p>Ungheste køres til og bygges op mod deres første starter.${o.ungheste.length > 1 ? ` Lige nu står ${o.ungheste.length} åringer og 2-årige på træningslisten.` : ''}</p>
      </li>
      <li data-vis style="--i:2">
        ${stjerne('ydelser__ikon')}
        <h3>Træner og kusk</h3>
        <p>${SITE.fornavn} kører selv i løb – i ${o.kusk.aar} er det blevet til ${o.kusk.starter} starter og ${o.kusk.sejre} sejre som kusk.</p>
      </li>
    </ul>`;

const FOTOS = [
  ['fra-sulkyen', 'Træning på banen en klar dag, set fra sulkyen'],
  ['fold-front', 'Nysgerrig travhest kigger ind i kameraet på folden'],
  ['aalborg-forvarm', 'Hest og kusk i staldens farver på Aalborg Væddeløbsbane'],
  ['fold-spejl', 'Hest spejler sig i vandet på en våd fold'],
  ['traening-fire', 'Fire heste i træning på grusvejen'],
  ['aalborg-stald', 'Hest gjort klar i staldene på Aalborg Væddeløbsbane'],
  ['fold-tre', 'Tre heste ved hegnet i solskin'],
  ['solopgang', 'Solopgang en frostklar morgen ved stalden'],
  ['fold-trav', 'Hest i trav på folden'],
  ['staldgang', 'Staldgangen med hestene i boksene'],
  ['hest-portraet', 'Mørkebrun hest fotograferet ved hegnet'],
  ['fold-trae', 'Hest på marken ved søen og det store træ'],
];
// Galleriet er murværk: billederne beholder deres egne formater i spalter.
const galleri = (n = FOTOS.length) => `<ul class="galleri">${FOTOS.slice(0, n).map(([navn, alt], i) => `
      <li data-vis style="--i:${i % 3}">${billede(navn, alt, { sizes: '(min-width: 1000px) 30vw, 46vw' })}</li>`).join('')}
    </ul>`;

const banebjaelker = (banetal) => {
  const max = Math.max(1, ...banetal.map((b) => b.antal));
  return `<ul class="baner">${banetal.map((b) => `
        <li style="--w:${Math.round((b.antal / max) * 100)}%"><span>${esc(b.navn)}</span><b>${b.antal}</b></li>`).join('')}
      </ul>`;
};

const kortfigur = (o) => `<figure class="kort" data-vis style="--i:2">
      ${danmarkskort(o.banetal, `Danmarkskort med staldens starter pr. bane i ${o.saeson.aar}: ${o.banetal.map((b) => `${b.navn} ${b.antal}`).join(', ')}.`)}
      <figcaption>Starter pr. dansk bane i ${o.saeson.aar}. Ringen markerer hjemmebanen.</figcaption>
    </figure>`;

const statTabel = (titel, raekker) => `
      <div class="tabelboks" role="region" aria-label="${titel}" tabindex="0">
        <table class="tabel">
          <caption>${titel}</caption>
          <thead><tr><th scope="col">År</th><th scope="col">Starter</th><th scope="col">1.–2.–3.</th><th scope="col">Sejrs&shy;procent</th><th scope="col">Præmiesum</th></tr></thead>
          <tbody>${raekker.filter((s) => s.starter > 0).map((s) => `
            <tr><th scope="row">${s.aar}</th><td>${s.starter}</td><td>${s.sejre}–${s.toer}–${s.treer}</td><td>${s.procent}&nbsp;%</td><td>${kr(s.praemier)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>`;

const formkurve = (liste) => `<ol class="form" aria-label="Placeringer i de seneste ${liste.length} starter, nyeste først">${liste.map((r) => `<li class="pl${plKlasse(r.placering)}"><span class="sr">${esc(r.hest)}: </span>${plac(r.placering)}</li>`).join('')}</ol>`;

/** Lang tekst forkortes ved et ordskifte. */
const kortTekst = (s, max = 240) => (s.length <= max ? s : `${s.slice(0, s.lastIndexOf(' ', max))}…`);

// De seneste Facebook-opslag (hentet af build.mjs) som kort. Vises kun, når der er opslag.
const fbKort = (liste) => `
    <ul class="fbkort" aria-label="Seneste opslag fra Facebook">${liste.map((p, i) => `
      <li data-vis style="--i:${i}">
        <a href="${esc(p.link)}" target="_blank" rel="noopener">
          ${p.billede ? `<img src="${R}assets/fb/${p.billede}" alt="" loading="lazy" decoding="async">` : ''}
          <time datetime="${p.dato}">${langDato(p.dato)}</time>
          ${p.tekst ? `<p>${esc(kortTekst(p.tekst))}</p>` : ''}
          <span class="fbkort__mere">Se opslaget på Facebook ${ud}</span>${nyFane}
        </a>
      </li>`).join('')}
    </ul>`;

const foelg = (fb = []) => (SITE.facebook || SITE.instagram || fb.length ? `
<section class="sek sek--creme2">
  <div class="wrap foelg">
    <div>
      ${etiket('Følg med', ' data-vis')}
      <h2 data-vis style="--i:1">Nyt fra Team Juel.</h2>
      <p data-vis style="--i:2">På Facebook deler holdet dagens starter, nye heste i stalden og hverdagen derhjemme${fb.length ? ' – her er de seneste opslag' : ''}.</p>
      <p class="valg" data-vis style="--i:3">
        ${SITE.facebook ? ekstern(SITE.facebook, 'Team Jeppe Juel på Facebook', 'knap') : ''}
        ${SITE.instagram ? ekstern(SITE.instagram, 'Instagram', 'knap knap--kant') : ''}
      </p>
    </div>
    <div>
      ${SITE.facebook && !fb.length ? `<div class="fb" data-fb="${SITE.facebook}">
        <button class="knap knap--kant" type="button">Vis de seneste opslag ${pil}</button>
        <p class="fb__note">Opslagene hentes fra Facebook og sætter cookies derfra.</p>
      </div>` : ''}
    </div>
  </div>
  ${fb.length ? `<div class="wrap">${fbKort(fb)}</div>` : ''}
</section>` : '');

// ---------- sider ----------

const forside = (o, data) => `
<section class="hero">
  <svg class="hero__stjerne" viewBox="0 0 24 24" aria-hidden="true"><path d="${STJERNE}"/></svg>
  <div class="wrap hero__gitter">
    <div class="hero__tekst">
      ${etiket('Travtræner &amp; kusk · Aalborg')}
      <h1><small>Team</small> Jeppe Juel</h1>
      <p class="hero__indled">Professionel travtræner og kusk med ${esc(data.traener.licens)}-licens og Spar Nord Arena Aalborg som hjemmebane. Stalden ligger i ${SITE.sted} ved ${SITE.by} og har ${o.heste.length} heste i træning.</p>
      <p class="valg">${knap('kontakt/', `Kontakt ${SITE.fornavn}`)} ${knap('heste/', 'Se hestene', 'knap--kant')}</p>
    </div>
    <div class="hero__billede">
      <figure class="bue hero__bue">${billede('hero', 'Udsigt fra sulkyen: travhest i træning langs en grøn mark', { sizes: '(min-width: 901px) 40vw, 92vw', lazy: false })}</figure>
      <figure class="hero__portraet">${billede('portraet', 'Jeppe Juel i løbsfarverne', { sizes: '180px', lazy: false })}</figure>
    </div>
  </div>
</section>

<section class="tavle" aria-label="Sæsonen i tal">
  <div class="wrap">
    <div class="tavle__kort">
      <div class="tavle__titel"><span>Sæson</span><b>${o.saeson.aar}</b><span>som træner</span></div>
      <dl>
        <div><dt>Starter</dt><dd>${o.saeson.starter}</dd></div>
        <div><dt>Sejre</dt><dd>${o.saeson.sejre}</dd></div>
        <div><dt>Sejrsprocent</dt><dd>${o.saeson.procent}<small>%</small></dd></div>
        <div><dt>Indkørt</dt><dd>${nf(o.saeson.praemier)}<small>kr.</small></dd></div>
      </dl>
      <div class="tavle__naeste">
        <span>Næste start</span>
        ${o.kommende.length ? `<b>${esc(o.kommende[0].hest)}</b><em>${ugedag(o.kommende[0].dato)} ${kortDato(o.kommende[0].dato)} · ${esc(bane(o.kommende[0].bane))}</em>` : '<b>Ingen startmeldte</b><em>Startlister på Travinfo</em>'}
      </div>
    </div>
  </div>
</section>

<section class="sek">
  <div class="wrap traener">
    <div class="traener__fotos" data-vis>
      <figure class="traener__stor">${billede('kusk-klar', 'Kusk i staldens løbsfarver gør klar på Aalborg Væddeløbsbane', { sizes: '(min-width: 901px) 44vw, 92vw' })}</figure>
      <figure class="traener__lille">${billede('vindercirkel', 'Fejring i vindercirklen med blomster og dækken', { sizes: '(min-width: 901px) 24vw, 56vw' })}<figcaption>Foto: Kjeld Mikkelsen Photography</figcaption></figure>
    </div>
    <div>
      ${etiket('Træneren', ' data-vis')}
      <h2 data-vis style="--i:1">Træneren bag Team Juel.</h2>
      <p class="indled" data-vis style="--i:2">${SITE.person} er født i ${data.traener.foedt} og har ${esc(data.traener.licens)}-licens som både træner og kusk. Hestene trænes hjemme i ${SITE.sted} ved ${SITE.by}, og løbene køres over hele landet med Aalborg som base.</p>
      <p data-vis style="--i:3">I ${o.kusk.aar} har ${SITE.fornavn} kørt ${o.kusk.starter} løb${o.kusk.starter > o.saeson.starter ? ' – flere end staldens egne starter, så mange af turene er for andre trænere' : ''}.</p>
      <dl class="nogle" data-vis style="--i:4">
        <div><dt>Sejre de seneste ${o.femAar.aar} sæsoner</dt><dd>${o.femAar.sejre}</dd></div>
        <div><dt>Bedste sæson: ${o.bedst.aar}</dt><dd>${o.bedst.sejre}<small> sejre</small></dd></div>
        <div><dt>Sejre som kusk i ${o.kusk.aar}</dt><dd>${o.kusk.sejre}</dd></div>
      </dl>
      <p class="valg" data-vis style="--i:5">${link('om-jeppe/', `Mere om ${SITE.fornavn}`)}</p>
    </div>
  </div>
</section>

<section class="sek sek--groen">
  <div class="wrap">
    <div class="sekhoved">
      <div>
        ${etiket('Hestene', ' data-vis')}
        <h2 data-vis style="--i:1">Holdet lige nu.</h2>
      </div>
      <p data-vis style="--i:2">${o.heste.length} heste står på træningslisten${o.ungheste.length > 1 ? ` – ${o.heste.length - o.ungheste.length} i løbsalderen og ${o.ungheste.length} ungheste på vej` : ''}.</p>
    </div>
    ${o.kortheste.length ? hestekort(o.kortheste) : ''}
    <h3 class="mini" data-vis>Mest vindende på listen</h3>
    <div class="profiler">${o.heste.slice(0, 6).map(profilkort).join('')}
    </div>
    <p class="midt" data-vis>${knap('heste/', `Hele træningslisten (${o.heste.length})`, 'knap--creme')}</p>
  </div>
</section>

<section class="sek">
  <div class="wrap">
    <div class="sekhoved">
      <div>
        ${etiket('Hverdagen', ' data-vis')}
        <h2 data-vis style="--i:1">Fra folden til banen.</h2>
      </div>
      <p data-vis style="--i:2">Træning, fritid på foldene og løbsdage i Aalborg – billeder fra Team Jeppe Juels Facebook-side.</p>
    </div>
    ${galleri(9)}
  </div>
</section>

<section class="sek sek--creme2">
  <div class="wrap">
    <div class="sekhoved">
      <div>
        ${etiket('Fra banen', ' data-vis')}
        <h2 data-vis style="--i:1">Seneste resultater.</h2>
      </div>
      <p data-vis style="--i:2">Opdateret ${o.opdateret} fra Dansk Hestevæddeløb.</p>
    </div>
    <div class="resgitter">
      <div class="panel" data-vis>
        <h3 class="mini">Seneste starter</h3>
        ${resultatliste(o.seneste.slice(0, 6))}
        <p class="valg">${link('resultater/', 'Alle resultater og statistik')}</p>
      </div>
      <div class="panel panel--groen" data-vis style="--i:1">
        <h3 class="mini">Kommende starter</h3>
        ${o.kommende.length ? kommendeListe(o.kommende.slice(0, 5)) : ingenStarter()}
        <h3 class="mini mini--luft">Formkurve</h3>
        ${formkurve(o.seneste)}
      </div>
    </div>
  </div>
</section>

<section class="sek">
  <div class="wrap duo">
    <div>
      ${etiket('Banerne', ' data-vis')}
      <h2 data-vis style="--i:1">Hjemme i Aalborg – ude i hele landet.</h2>
      <p class="indled" data-vis style="--i:2">Spar Nord Arena Aalborg er hjemmebanen${o.hjemmestarter ? `, hvor stalden har haft ${o.hjemmestarter} starter i ${o.saeson.aar}` : ''}.${o.svenske.length ? ` Stalden har også været til start i Sverige, bl.a. på ${dkListe(o.svenske)}.` : ''}</p>
      <div data-vis style="--i:3">${banebjaelker(o.banetal)}</div>
    </div>
    ${kortfigur(o)}
  </div>
</section>
${partnere()}
${foelg(o.fb)}
${kontaktbaand()}`;

const omJeppe = (o, data) => `
${sidehoved({
  sti: 'Om Jeppe',
  h1: 'Jeppe Juel',
  tekst: `Professionel travtræner og kusk med ${esc(data.traener.licens)}-licens og manden bag Team Jeppe Juel. Født i ${data.traener.foedt} – med stald i ${SITE.sted} ved ${SITE.by} og Spar Nord Arena Aalborg som hjemmebane.`,
  foto: 'aalborg-forvarm',
  alt: 'Hest og kusk i staldens farver på Aalborg Væddeløbsbane',
  pos: '50% 50%',
  chips: [[o.femAar.sejre, `sejre de seneste ${o.femAar.aar} sæsoner`], [o.heste.length, 'heste i træning'], [esc(data.traener.licens), 'licens']],
})}

<section class="sek">
  <div class="wrap artikel">
    <aside class="fakta" data-vis>
      <figure class="fakta__foto">${billede('portraet', 'Jeppe Juel i løbsfarverne', { sizes: '(min-width: 901px) 340px, 92vw' })}</figure>
      <dl>
        <div><dt>Født</dt><dd>${data.traener.foedt}</dd></div>
        <div><dt>Licens</dt><dd>${esc(data.traener.licens)} – professionel træner og kusk</dd></div>
        <div><dt>Hjemmebane</dt><dd>${esc(data.traener.hjemmebane)}</dd></div>
        <div><dt>Løbsfarver</dt><dd>Beige og grøn med reklame</dd></div>
        <div><dt>Stald</dt><dd>${SITE.navn}, ${SITE.sted}</dd></div>
        <div><dt>Heste i træning</dt><dd>${o.heste.length}</dd></div>
      </dl>
    </aside>
    <div class="prosa">
      ${etiket('Træneren', ' data-vis')}
      <h2 data-vis>Team Jeppe Juel.</h2>
      <p class="indled" data-vis>${SITE.person} træner travheste fra stalden på ${SITE.gade} i ${SITE.sted} ved ${SITE.by} – med Spar Nord Arena Aalborg som hjemmebane.</p>
      <p data-vis>Lige nu står ${o.heste.length} heste på træningslisten – fra åringer til rutinerede løbsheste. Over de seneste ${o.femAar.aar} sæsoner har stalden vundet ${o.femAar.sejre} løb på ${nf(o.femAar.starter)} starter, og den bedste sæson var ${o.bedst.aar} med ${o.bedst.sejre} sejre. I ${o.saeson.aar} står stalden indtil videre på ${o.saeson.sejre} sejre på ${o.saeson.starter} starter.</p>
      <h2 data-vis>Kusken.</h2>
      <p data-vis>${SITE.fornavn} sidder også selv i sulkyen. I ${o.kusk.aar} er det blevet til ${o.kusk.starter} starter og ${o.kusk.sejre} sejre som kusk${o.kusk.starter > o.saeson.starter ? ' – flere starter, end staldens egne heste har haft, så mange af løbene køres for andre trænere' : ''}.</p>
      <figure class="prosa__foto" data-vis>${billede('vindercirkel', 'Fejring i vindercirklen med blomster og dækken', { sizes: '(min-width: 1000px) 60vw, 92vw' })}<figcaption>Foto: Kjeld Mikkelsen Photography</figcaption></figure>
      <p class="valg" data-vis>${ekstern(SITE.travinfo, `Se ${SITE.fornavn}s profil på Travinfo`)}</p>
    </div>
  </div>
</section>

<section class="sek sek--groen">
  <div class="wrap">
    <div class="sekhoved">
      <div>
        ${etiket('Statistik', ' data-vis')}
        <h2 data-vis style="--i:1">Sæson for sæson.</h2>
      </div>
      <p data-vis style="--i:2">Officielle tal fra Dansk Hestevæddeløb, opdateret ${o.opdateret}.</p>
    </div>
    <div class="tabeller" data-vis>
      ${statTabel('Som træner', data.traenerStatistik)}
      ${statTabel('Som kusk', data.kuskStatistik)}
    </div>
  </div>
</section>
${partnere()}
${kontaktbaand()}`;

const stalden = (o) => `
${sidehoved({
  sti: 'Stalden',
  h1: `Stalden i ${SITE.sted}`,
  tekst: `${SITE.navn} træner ${o.heste.length} heste – fra åringer til rutinerede løbsheste – med Spar Nord Arena Aalborg som hjemmebane.`,
  foto: 'staldgang',
  alt: 'Staldgangen med hestene i boksene',
  pos: '50% 50%',
  chips: [[o.heste.length, 'heste i træning'], [`${o.aldre[0]}–${o.aldre[1]}`, 'år gamle'], [o.banetal.length, `baner i ${o.saeson.aar}`]],
})}

<section class="sek">
  <div class="wrap">
    <div class="sekhoved">
      <div>
        ${etiket('Det tilbyder stalden', ' data-vis')}
        <h2 data-vis style="--i:1">Fra første tilkøring til målstregen.</h2>
      </div>
      <p data-vis style="--i:2">Kontakt ${SITE.fornavn} for pris.</p>
    </div>
    ${ydelser(o)}
  </div>
</section>

<section class="sek sek--creme2">
  <div class="wrap">
    <div class="sekhoved">
      <div>
        ${etiket('Hverdagen', ' data-vis')}
        <h2 data-vis style="--i:1">Træning og fritid.</h2>
      </div>
      <p data-vis style="--i:2">Billeder fra Team Jeppe Juels Facebook-side.</p>
    </div>
    ${galleri()}
  </div>
</section>

<section class="sek">
  <div class="wrap duo">
    <div>
      ${etiket('Hjemmebanen', ' data-vis')}
      <h2 data-vis style="--i:1">Spar Nord Arena Aalborg.</h2>
      <p class="indled" data-vis style="--i:2">Aalborg Væddeløbsbane – i dag Spar Nord Arena Aalborg – er staldens hjemmebane${o.hjemmestarter ? `, og i ${o.saeson.aar} har stalden haft ${o.hjemmestarter} starter her` : ''}.</p>
      <p data-vis style="--i:3">Banen ligger på Skydebanevej i Aalborg.${o.banerIAar.length > 1 ? ` Herudover har stalden i ${o.saeson.aar} kørt løb i ${dkListe(o.banerIAar.filter((b) => b !== 'Aalborg'))}.` : ''}</p>
      <div data-vis style="--i:4">${banebjaelker(o.banetal)}</div>
      <p class="valg" data-vis style="--i:5">${ekstern(SITE.hjemmebane, 'aav.dk')}</p>
    </div>
    ${kortfigur(o)}
  </div>
</section>

<section class="sek sek--top0">
  <div class="wrap">
    <div class="adresse" data-vis>
      <div>
        ${etiket('Adresse')}
        <address class="adresse__stor">${SITE.navn}<br>${SITE.gade}, ${SITE.sted}<br>${SITE.postnr} ${SITE.by}</address>
      </div>
      <p>${ekstern(SITE.kort, 'Åbn i Google Maps', 'knap')}</p>
    </div>
  </div>
</section>
${partnere()}
${kontaktbaand()}`;

const heste = (o) => `
${sidehoved({
  sti: 'Heste',
  h1: 'Heste i træning',
  tekst: 'Træningslisten kommer direkte fra Dansk Hestevæddeløb og følger automatisk med, når heste kommer til eller rejser videre.',
  foto: 'fold-front',
  alt: 'Nysgerrig travhest kigger ind i kameraet på folden',
  pos: '50% 30%',
  chips: [[o.heste.length - o.ungheste.length, 'løbsheste'], [o.ungheste.length, 'ungheste']],
})}

${o.kortheste.length ? `
<section class="sek sek--groen sek--smal">
  <div class="wrap">
    ${etiket('Nye i stalden og på banen', ' data-vis')}
    ${hestekort(o.kortheste)}
  </div>
</section>` : ''}

<section class="sek">
  <div class="wrap">
    ${hestegruppe('Løbsheste', o.heste.filter((h) => h.alder >= 3))}
    ${hestegruppe('2-årige', o.heste.filter((h) => h.alder === 2))}
    ${hestegruppe('Åringer', o.heste.filter((h) => h.alder <= 1))}
    <p class="note" data-vis>Starter, placeringer (1.–2.–3.), præmiesum og rekord er livstal. Rekorden er hestens hurtigste kilometertid; a = autostart, k/m/l = kort, mellem og lang distance. Klik på en hest for at se den på Travinfo. Kilde: Dansk Hestevæddeløb, opdateret ${o.opdateret}.</p>
  </div>
</section>
${kontaktbaand()}`;

const resultater = (o, data) => `
${sidehoved({
  sti: 'Resultater',
  h1: 'Resultater',
  tekst: `Staldens seneste starter, kommende løb og sæsonens tal. Data kommer fra Dansk Hestevæddeløb og er senest opdateret ${o.opdateret}.`,
  foto: 'aalborg-bane',
  alt: 'Hest og kusk på banen i Aalborg',
  pos: '50% 55%',
  chips: [[o.saeson.sejre, `sejre i ${o.saeson.aar}`], [`${o.saeson.procent} %`, 'sejrsprocent']],
})}

<section class="sek">
  <div class="wrap">
    ${etiket(`Sæson ${o.saeson.aar}`, ' data-vis')}
    <dl class="kpi" data-vis>
      <div><dt>Starter</dt><dd>${o.saeson.starter}</dd></div>
      <div><dt>Sejre</dt><dd>${o.saeson.sejre}</dd></div>
      <div><dt>2.-pladser</dt><dd>${o.saeson.toer}</dd></div>
      <div><dt>3.-pladser</dt><dd>${o.saeson.treer}</dd></div>
      <div><dt>Sejrsprocent</dt><dd>${o.saeson.procent}<small>%</small></dd></div>
      <div><dt>Indkørt</dt><dd>${nf(o.saeson.praemier)}<small>kr.</small></dd></div>
    </dl>
    <div class="formboks" data-vis style="--i:1">
      <h3 class="mini">Formkurve – de seneste ${o.seneste.length} starter</h3>
      ${formkurve(o.seneste)}
    </div>
  </div>
</section>

<section class="sek sek--creme2">
  <div class="wrap resgitter">
    <div class="panel" data-vis>
      <h2 class="mini">De seneste ${o.seneste.length} starter</h2>
      ${resultatliste(o.seneste)}
      <p class="note">Tider er kilometertider. a = autostart, g = galop undervejs. – = uplaceret, disk. = diskvalificeret.</p>
    </div>
    <div class="panel panel--groen" data-vis style="--i:1">
      <h2 class="mini">Kommende starter</h2>
      ${o.kommende.length ? kommendeListe(o.kommende) : ingenStarter()}
    </div>
  </div>
</section>

<section class="sek sek--groen">
  <div class="wrap">
    <div class="sekhoved">
      <div>
        ${etiket('Statistik', ' data-vis')}
        <h2 data-vis style="--i:1">Sæson for sæson.</h2>
      </div>
      <p data-vis style="--i:2">Alle resultater og detaljer findes hos Dansk Hestevæddeløb. ${ekstern(SITE.travinfo, 'Åbn Travinfo')}</p>
    </div>
    <div class="tabeller" data-vis>
      ${statTabel('Som træner', data.traenerStatistik)}
      ${statTabel('Som kusk', data.kuskStatistik)}
    </div>
  </div>
</section>
${kontaktbaand()}`;

const kontakt = () => `
${sidehoved({
  sti: 'Kontakt',
  h1: `Kontakt ${SITE.fornavn}`,
  tekst: 'Har du en hest, der skal i træning, eller et spørgsmål til stalden? Ring, send en sms eller skriv en mail.',
  foto: 'solopgang',
  alt: 'Solopgang en frostklar morgen ved stalden',
  pos: '50% 60%',
})}

<section class="sek">
  <div class="wrap kontakt">
    <div class="kontakt__felt kontakt__felt--tlf" data-vis>
      <h2 class="mini">Telefon</h2>
      <p class="kontakt__stor"><a href="tel:${tlfLink}">${SITE.telefon}</a></p>
      <p class="valg"><a class="knap knap--creme" href="tel:${tlfLink}">Ring op ${pil}</a> <a class="link link--lys" href="sms:${tlfLink}">Send en sms ${pil}</a></p>
    </div>
    <div class="kontakt__felt" data-vis style="--i:1">
      <h2 class="mini">E-mail</h2>
      <p class="kontakt__stor kontakt__stor--mail"><a href="mailto:${SITE.email}">${SITE.email}</a></p>
      <p class="valg"><a class="knap" href="mailto:${SITE.email}?subject=${encodeURIComponent('Henvendelse fra hjemmesiden')}">Skriv en mail ${pil}</a></p>
    </div>
    <div class="kontakt__felt kontakt__felt--kort" data-vis style="--i:2">
      <div>
        <h2 class="mini">Stalden</h2>
        <address class="kontakt__adr">${SITE.navn}<br>${SITE.gade}, ${SITE.sted}<br>${SITE.postnr} ${SITE.by}</address>
        <p class="valg">${ekstern(SITE.kort, 'Find vej')}</p>
      </div>
      <div class="kort kort--mini">${danmarkskort([{ kode: HJEM, navn: 'Aalborg' }], 'Danmarkskort, hvor Aalborg er markeret')}</div>
    </div>
  </div>
</section>
${foelg()}`;

const ikkeFundet = () => `
${sidehoved({
  sti: 'Fejl 404',
  h1: 'Siden findes ikke',
  tekst: `Adressen er forkert, eller siden er flyttet. <a class="link" href="${R}">Til forsiden ${pil}</a>`,
  foto: 'fold-trae',
  pos: '50% 50%',
})}`;

/** Alle sider som [{ sti, html }]. `idag` er YYYY-MM-DD, `v` et versionsmærke til css/js. */
export function sider(data, { v, idag, kort }) {
  V = v;
  KORT = kort;
  const o = afled(data, idag);
  const side = (sti, def) => {
    R = sti === '404.html' ? new URL(SITE.url + '/').pathname : sti ? '../' : '';
    return { sti: sti.endsWith('.html') ? sti : `${sti}index.html`, url: sti, html: layout({ sti, o, ...def() }) };
  };
  return [
    side('', () => ({
      titel: `${SITE.navn} – travtræner ${SITE.person}, Aalborg`,
      beskrivelse: `${SITE.person} og Team Jeppe Juel: professionel travtræning med Spar Nord Arena Aalborg som hjemmebane. ${o.heste.length} heste i træning i ${SITE.sted} ved ${SITE.by}.`,
      klasse: 'forside',
      indhold: forside(o, data),
    })),
    side('om-jeppe/', () => ({
      titel: `Om ${SITE.person} – travtræner og kusk | ${SITE.navn}`,
      beskrivelse: `Mød ${SITE.person}: professionel travtræner og kusk med ${data.traener.licens}-licens og manden bag Team Jeppe Juel i ${SITE.sted} med Spar Nord Arena Aalborg som hjemmebane.`,
      indhold: omJeppe(o, data),
    })),
    side('stalden/', () => ({
      titel: `Stalden i ${SITE.sted} – travtræning ved ${SITE.by} | ${SITE.navn}`,
      beskrivelse: `${SITE.navn} holder til på ${SITE.gade} i ${SITE.sted} ved ${SITE.by} med Spar Nord Arena Aalborg som hjemmebane. Træning af løbsheste og tilkøring af ungheste.`,
      indhold: stalden(o),
    })),
    side('heste/', () => ({
      titel: `Heste i træning | ${SITE.navn}`,
      beskrivelse: `Se de ${o.heste.length} travheste, der lige nu er i træning hos ${SITE.person} – med afstamning, starter, præmiesum og rekord.`,
      indhold: heste(o),
    })),
    side('resultater/', () => ({
      titel: `Resultater og statistik | ${SITE.navn}`,
      beskrivelse: `Seneste resultater, kommende starter og sæsonstatistik for travtræner ${SITE.person}: ${o.saeson.sejre} sejre på ${o.saeson.starter} starter i ${o.saeson.aar}.`,
      indhold: resultater(o, data),
    })),
    side('kontakt/', () => ({
      titel: `Kontakt ${SITE.person} – ${SITE.navn}, ${SITE.by}`,
      beskrivelse: `Kontakt ${SITE.navn}: telefon ${SITE.telefon}, ${SITE.email}. Stalden ligger på ${SITE.gade}, ${SITE.sted}, ${SITE.postnr} ${SITE.by}.`,
      indhold: kontakt(),
    })),
    side('404.html', () => ({
      titel: `Siden findes ikke | ${SITE.navn}`,
      beskrivelse: `Siden findes ikke. Gå til forsiden for ${SITE.navn} – travtræner ${SITE.person} i ${SITE.sted} ved ${SITE.by}.`,
      noindex: true,
      indhold: ikkeFundet(),
    })),
  ];
}
