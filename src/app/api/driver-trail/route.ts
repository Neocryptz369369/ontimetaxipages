import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const OWNER_EMAIL = 'neocryptz@yahoo.com';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function milesBetween(a: any[], b: any[]) {
  const R = 3958.8;
  const p1 = (a[1] * Math.PI) / 180;
  const p2 = (b[1] * Math.PI) / 180;
  const dp = ((b[1] - a[1]) * Math.PI) / 180;
  const dl = ((b[0] - a[0]) * Math.PI) / 180;
  const h = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const tk = String(body.token || '');
    if (!tk) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });

    let minutes = Number(body.minutes);
    if (!isFinite(minutes) || minutes <= 0) minutes = 1440;
    if (minutes > 525600) minutes = 525600;

    const sb = adminClient();
    const got = await sb.auth.getUser(tk);
    if (got.error || !got.data || !got.data.user) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    }
    const me = String(got.data.user.id);
    const email = String(got.data.user.email || '').toLowerCase();
    const owner = email === OWNER_EMAIL;
    const mineOnly = body.mine === true || !owner;

    if (!owner) {
      const dv = await sb.from('drivers').select('id').eq('id', me).maybeSingle();
      if (!dv.data) {
        return NextResponse.json({ error: 'This is for drivers only.' }, { status: 403 });
      }
    }

    const since = new Date(Date.now() - minutes * 60000).toISOString();
    let q: any = sb
      .from('driver_pings')
      .select('driver_id, lat, lng, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: true })
      .limit(8000);
    if (mineOnly) q = q.eq('driver_id', me);

    const res = await q;

    if (res.error) {
      return NextResponse.json({ ok: true, trails: {}, miles: {}, ready: false, points: 0 });
    }

    const rows: any[] = res.data || [];
    const bucket: any = {};
    const stamps: any = {};
    rows.forEach(function (r: any) {
      const id = String(r.driver_id || '');
      if (!id) return;
      const la = Number(r.lat);
      const ln = Number(r.lng);
      if (!isFinite(la) || !isFinite(ln)) return;
      if (!bucket[id]) bucket[id] = [];
      bucket[id].push([ln, la]);
      if (!stamps[id]) stamps[id] = { first: r.created_at, last: r.created_at };
      stamps[id].last = r.created_at;
    });

    const trails: any = {};
    const miles: any = {};
    Object.keys(bucket).forEach(function (id) {
      const pts: any[] = bucket[id];
      let far = 0;
      for (let i = 1; i < pts.length; i++) {
        const step = milesBetween(pts[i - 1], pts[i]);
        if (step < 3) far = far + step;
      }
      miles[id] = Math.round(far * 10) / 10;
      const max = 700;
      if (pts.length <= max) {
        trails[id] = pts;
        return;
      }
      const step = Math.ceil(pts.length / max);
      const thin: any[] = [];
      for (let i = 0; i < pts.length; i = i + step) thin.push(pts[i]);
      thin.push(pts[pts.length - 1]);
      trails[id] = thin;
    });

    return NextResponse.json({ ok: true, trails: trails, miles: miles, stamps: stamps, mine: me, ready: true, points: rows.length });
  } catch (e: any) {
    return NextResponse.json({ error: 'Could not read the driver history.' }, { status: 500 });
  }
}
