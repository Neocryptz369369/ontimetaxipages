import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OWNER_EMAIL = 'neocryptz@yahoo.com';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function readTicker(sb: any) {
  try {
    const g = await sb.from('site_settings').select('value').eq('key', 'ticker').maybeSingle();
    const v = g.data && g.data.value ? g.data.value : null;
    const sp = v && v.speed !== null && v.speed !== undefined ? Number(v.speed) : 5;
    return {
      on: v && v.on === true,
      text: v && v.text ? String(v.text) : '',
      speed: isFinite(sp) && sp > 0 ? sp : 5,
    };
  } catch (e) {
    return { on: false, text: '', speed: 5 };
  }
}

export async function GET() {
  try {
    const sb = adminClient();
    const t = await readTicker(sb);
    return NextResponse.json({ ok: true, on: t.on, text: t.text, speed: t.speed });
  } catch (e) {
    return NextResponse.json({ ok: true, on: false, text: '', speed: 5 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = String(body.token || '');
    if (!token) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });

    const sb = adminClient();
    const got = await sb.auth.getUser(token);
    if (got.error || !got.data || !got.data.user) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    }
    const email = String(got.data.user.email || '').toLowerCase();
    if (email !== OWNER_EMAIL) {
      return NextResponse.json({ error: 'This is for the owner only.' }, { status: 403 });
    }

    const action = String(body.action || 'save');
    if (action === 'get') {
      const cur = await readTicker(sb);
      return NextResponse.json({ ok: true, on: cur.on, text: cur.text, speed: cur.speed });
    }

    const on = body.on === true;
    const text = body.text ? String(body.text).slice(0, 600) : '';
    let speed = Math.round(Number(body.speed));
    if (!isFinite(speed) || speed < 1) speed = 5;
    if (speed > 10) speed = 10;

    const up = await sb.from('site_settings').upsert(
      { key: 'ticker', value: { on: on, text: text, speed: speed }, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
    if (up.error) {
      return NextResponse.json({ error: 'Could not save the ticker.' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, on: on, text: text, speed: speed });
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong saving the ticker.' }, { status: 500 });
  }
}
