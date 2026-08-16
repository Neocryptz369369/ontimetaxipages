export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Reads words out loud for languages that a phone has no voice for.
// The phone asks us, we ask the big voice service, and we hand the sound back.

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

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

  const tries = [
    ttsUrl(q, tl, 'translate.google.com', 'tw-ob'),
    ttsUrl(q, tl, 'translate.googleapis.com', 'gtx'),
    ttsUrl(q, String(tl).split('-')[0], 'translate.google.com', 'tw-ob'),
  ];

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
