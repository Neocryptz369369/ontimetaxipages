export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Reads words out loud for languages that a phone has no voice for.
// The phone asks us, we ask the big voice service, and we hand the sound back.
// Every language On Time Taxi offers gets a voice here. If a language has no
// voice of its own, the closest sounding voice reads it so nobody is left in silence.

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// These languages have a real voice of their own.
const HAS_VOICE: string[] = ['af', 'sq', 'en', 'am', 'ar', 'eu', 'my', 'bs', 'yue', 'ca', 'bn', 'bg', 'da', 'hr', 'zh-CN', 'zh-HK', 'zh-TW', 'cs', 'fi', 'nl', 'tl', 'et', 'fr-CA', 'fr', 'el', 'de', 'gu', 'gl', 'hu', 'id', 'iw', 'hi', 'ha', 'is', 'kn', 'it', 'ja', 'jw', 'km', 'ko', 'lv', 'la', 'ms-Arab', 'lt', 'ms', 'mr', 'ml', 'no', 'ne', 'pl', 'ro', 'pt', 'pa', 'ru', 'pa-Arab', 'sr', 'sr-Latn', 'es', 'si', 'su', 'sk', 'ta', 'sv', 'sw', 'te', 'th', 'tr', 'vi', 'ur', 'cy', 'uk'];

// Everything else borrows the voice that sounds the closest.
const NEAR: { [key: string]: string } = {
  'hy': 'ru',
  'ka': 'ru',
  'av': 'ru',
  'ab': 'ru',
  'ce': 'ru',
  'cv': 'ru',
  'ba': 'ru',
  'bua': 'ru',
  'kk': 'ru',
  'ky': 'ru',
  'mn': 'ru',
  'os': 'ru',
  'sah': 'ru',
  'tg': 'ru',
  'tt': 'ru',
  'tyv': 'ru',
  'udm': 'ru',
  'kv': 'ru',
  'mhr': 'ru',
  'be': 'uk',
  'mk': 'bg',
  'crh': 'tr',
  'az': 'tr',
  'uz': 'tr',
  'tk': 'tr',
  'ku': 'tr',
  'az-Arab': 'ar',
  'ckb': 'ar',
  'ug': 'ar',
  'fa': 'ar',
  'fa-AF': 'ar',
  'ps': 'ar',
  'sd': 'ar',
  'bal': 'ar',
  'ber': 'ar',
  'dv': 'ar',
  'yi': 'iw',
  'awa': 'hi',
  'bho': 'hi',
  'doi': 'hi',
  'gom': 'hi',
  'mai': 'hi',
  'mwr': 'hi',
  'new': 'hi',
  'sa': 'hi',
  'sat': 'hi',
  'sat-Deva': 'hi',
  'sat-Olck': 'hi',
  'sd-Deva': 'hi',
  'or': 'hi',
  'bo': 'hi',
  'dz': 'hi',
  'as': 'bn',
  'mni-Mtei': 'bn',
  'trp': 'bn',
  'tcy': 'kn',
  'shn': 'my',
  'lo': 'th',
  'ti': 'am',
  'lus': 'en',
  'cnh': 'en',
  'kac': 'en',
  'jam': 'en',
  'kri': 'en',
  'tpi': 'en',
  'gd': 'cy',
  'ga': 'cy',
  'gv': 'cy',
  'alz': 'sw',
  'ach': 'sw',
  'bem': 'sw',
  'din': 'sw',
  'dov': 'sw',
  'kg': 'sw',
  'rw': 'sw',
  'cgg': 'sw',
  'ktu': 'sw',
  'lg': 'sw',
  'ln': 'sw',
  'luo': 'sw',
  'nr': 'sw',
  'nso': 'sw',
  'nus': 'sw',
  'rn': 'sw',
  'sg': 'sw',
  'sn': 'sw',
  'ss': 'sw',
  'st': 'sw',
  'ts': 'sw',
  'tn': 'sw',
  'tum': 'sw',
  've': 'sw',
  'xh': 'sw',
  'zu': 'sw',
  'ny': 'sw',
  'om': 'sw',
  'so': 'sw',
  'aa': 'sw',
  'bm': 'ha',
  'bci': 'ha',
  'dyu': 'ha',
  'ee': 'ha',
  'fon': 'ha',
  'ff': 'ha',
  'gaa': 'ha',
  'ig': 'ha',
  'kr': 'ha',
  'sus': 'ha',
  'tiv': 'ha',
  'wo': 'ha',
  'yo': 'ha',
  'ak': 'ha',
  'qu': 'es',
  'ay': 'es',
  'gn': 'es',
  'nhe': 'es',
  'yua': 'es',
  'zap': 'es',
  'kek': 'es',
  'mam': 'es',
  'pap': 'es',
  'eo': 'es',
  'rom': 'ro',
  'fo': 'is',
  'fy': 'nl',
  'li': 'nl',
  'fur': 'it',
  'co': 'it',
  'lij': 'it',
  'lmo': 'it',
  'vec': 'it',
  'scn': 'it',
  'mt': 'it',
  'oc': 'ca',
  'lb': 'de',
  'hrx': 'de',
  'szl': 'pl',
  'ltg': 'lv',
  'sl': 'hr',
  'kl': 'da',
  'se': 'fi',
  'br': 'fr',
  'ht': 'fr',
  'mfe': 'fr',
  'pag': 'tl',
  'pam': 'tl',
  'ceb': 'tl',
  'hil': 'tl',
  'ilo': 'tl',
  'war': 'tl',
  'bik': 'tl',
  'iba': 'ms',
  'ban': 'id',
  'ace': 'id',
  'btx': 'id',
  'bts': 'id',
  'bbc': 'id',
  'mad': 'id',
  'mak': 'id',
  'min': 'id',
  'tet': 'id',
  'bew': 'id',
  'mg': 'id',
  'fj': 'id',
  'sm': 'id',
  'to': 'id',
  'ty': 'id',
  'mi': 'id',
  'haw': 'id',
  'mh': 'id',
  'ch': 'id',
  'chk': 'id',
  'hmn': 'vi',
};

function pickVoice(code: string): string[] {
  const raw = String(code || 'en').trim();
  const base = raw.split('-')[0];
  const out: string[] = [];
  const add = function (v: string) {
    if (v && out.indexOf(v) < 0) out.push(v);
  };
  if (HAS_VOICE.indexOf(raw) >= 0) add(raw);
  if (HAS_VOICE.indexOf(base) >= 0) add(base);
  if (NEAR[raw]) add(NEAR[raw]);
  if (NEAR[base]) add(NEAR[base]);
  add(raw);
  add(base);
  add('en');
  return out;
}

function ttsUrl(q: string, tl: string, host: string, client: string) {
  return (
    'https://' +
    host +
    '/translate_tts\u003Fie=UTF-8&client=' +
    client +
    '&ttsspeed=1&total=1&idx=0&textlen=' +
    String(q.length) +
    '&tl=' +
    encodeURIComponent(tl) +
    '&q=' +
    encodeURIComponent(q)
  );
}

export async function GET(req: Request) {
  let q = '';
  let tl = 'en';
  try {
    const u = new URL(req.url);
    q = String(u.searchParams.get('q') || '').slice(0, 200);
    tl = String(u.searchParams.get('tl') || 'en').slice(0, 12);
  } catch (e) {}

  if (!q.trim()) return new Response('no words', { status: 400 });

  const voices = pickVoice(tl);
  const tries: string[] = [];
  for (let v = 0; v < voices.length; v++) {
    tries.push(ttsUrl(q, voices[v], 'translate.google.com', 'tw-ob'));
    tries.push(ttsUrl(q, voices[v], 'translate.googleapis.com', 'gtx'));
  }

  for (let i = 0; i < tries.length; i++) {
    try {
      const r = await fetch(tries[i], {
        headers: { 'User-Agent': UA, Referer: 'https://translate.google.com/' },
        cache: 'no-store',
      });
      if (!r.ok) continue;
      const buf = await r.arrayBuffer();
      if (!buf || buf.byteLength < 200) continue;
      return new Response(buf, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    } catch (e) {}
  }

  return new Response('no voice', { status: 404 });
}
