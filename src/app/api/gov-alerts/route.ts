import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Live public safety alerts for wherever the person is standing right now.
// Source is the United States National Weather Service, which carries severe
// weather warnings, civil emergency messages and Amber (child abduction) alerts.
// It is free and needs no key. A User-Agent is required by their rules.

const AGENT = 'OnTimeTaxi/1.0 (https://ontimetaxi.biz)';

function kindOf(event: string) {
  const e = String(event || '').toLowerCase();
  if (e.indexOf('child abduction') >= 0 || e.indexOf('amber') >= 0) return 'amber';
  if (
    e.indexOf('emergency') >= 0 ||
    e.indexOf('evacuation') >= 0 ||
    e.indexOf('shelter in place') >= 0 ||
    e.indexOf('hazardous materials') >= 0 ||
    e.indexOf('nuclear') >= 0 ||
    e.indexOf('radiological') >= 0 ||
    e.indexOf('law enforcement') >= 0
  ) {
    return 'emergency';
  }
  return 'weather';
}

function shorten(s: string, n: number) {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  if (t.length <= n) return t;
  return t.slice(0, n) + '...';
}

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }
    const lat = Number(body.lat);
    const lng = Number(body.lng);
    if (!isFinite(lat) || !isFinite(lng)) {
      return NextResponse.json({ ok: true, alerts: [], why: 'no location yet' });
    }

    const url = 'https://api.weather.gov/alerts/active' + '?point=' + lat.toFixed(4) + ',' + lng.toFixed(4);

    const r = await fetch(url, {
      headers: { 'User-Agent': AGENT, Accept: 'application/geo+json' },
      cache: 'no-store',
    });

    if (!r.ok) {
      return NextResponse.json({ ok: true, alerts: [], why: 'feed busy' });
    }

    const j: any = await r.json();
    const feats: any[] = j && j.features ? j.features : [];

    const out: any[] = [];
    feats.forEach(function (f: any) {
      const p = f && f.properties ? f.properties : null;
      if (!p) return;
      const event = String(p.event || '');
      if (!event) return;
      const kind = kindOf(event);
      const sev = String(p.severity || '');
      const head = p.headline ? String(p.headline) : event;
      const area = p.areaDesc ? String(p.areaDesc) : '';
      const what = p.description ? shorten(p.description, 700) : '';
      const doThis = p.instruction ? shorten(p.instruction, 400) : '';

      let say = event + '.';
      if (area) say = say + ' For ' + area + '.';
      if (head && head !== event) say = say + ' ' + head + '.';
      if (doThis) say = say + ' ' + doThis;

      // The owner wants weather, emergency and amber alerts all read out loud.
      // Each one is only ever read once, so nobody hears the same thing twice.
      const loud = true;

      out.push({
        id: String(f.id || p.id || event + area),
        kind: kind,
        event: event,
        severity: sev,
        urgency: p.urgency ? String(p.urgency) : '',
        headline: head,
        area: area,
        what: what,
        doThis: doThis,
        ends: p.ends ? String(p.ends) : p.expires ? String(p.expires) : '',
        loud: loud,
        say: shorten(say, 900),
      });
    });

    const rank: any = { amber: 0, emergency: 1, weather: 2 };
    out.sort(function (a, b) {
      if (rank[a.kind] !== rank[b.kind]) return rank[a.kind] - rank[b.kind];
      if (a.loud !== b.loud) return a.loud ? -1 : 1;
      return 0;
    });

    return NextResponse.json({ ok: true, alerts: out.slice(0, 12) });
  } catch (e) {
    return NextResponse.json({ ok: true, alerts: [], why: 'could not reach the alert feed' });
  }
}
