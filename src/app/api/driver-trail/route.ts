import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const OWNER_EMAIL = 'neocryptz@yahoo.com';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
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
    const email = String(got.data.user.email || '').toLowerCase();
    if (email !== OWNER_EMAIL) {
      return NextResponse.json({ error: 'This is for the owner only.' }, { status: 403 });
    }

    const since = new Date(Date.now() - minutes * 60000).toISOString();
    const res = await sb
      .from('driver_pings')
      .select('driver_id, lat, lng, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: true })
      .limit(8000);

    if (res.error) {
      return NextResponse.json({ ok: true, trails: {}, ready: false, points: 0 });
    }

    const rows: any[] = res.data || [];
    const bucket: any = {};
    rows.forEach(function (r: any) {
      const id = String(r.driver_id || '');
      if (!id) return;
      const la = Number(r.lat);
      const ln = Number(r.lng);
      if (!isFinite(la) || !isFinite(ln)) return;
      if (!bucket[id]) bucket[id] = [];
      bucket[id].push([ln, la]);
    });

    const trails: any = {};
    Object.keys(bucket).forEach(function (id) {
      const pts: any[] = bucket[id];
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

    return NextResponse.json({ ok: true, trails: trails, ready: true, points: rows.length });
  } catch (e: any) {
    return NextResponse.json({ error: 'Could not read the driver history.' }, { status: 500 });
  }
}
