import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch (e) {
    body = {};
  }
  const endpoint = String(body.endpoint || '');
  const p256dh = String(body.p256dh || '');
  const auth = String(body.auth || '');
  const who = body.who === 'driver' ? 'driver' : 'admin';
  const label = String(body.label || '');
  const driverId = String(body.driverId || '');
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ ok: false, error: 'Missing alert details' }, { status: 400 });
  }
  try {
    const sb: any = adminClient();
    const row: any = { endpoint: endpoint, p256dh: p256dh, auth: auth, who: who, label: label };
    if (driverId) row.driver_id = driverId;
    const r: any = await sb.from('push_subs').upsert(row, { onConflict: 'endpoint' });
    if (r.error) return NextResponse.json({ ok: false, error: String(r.error.message) }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e && e.message ? e.message : e) }, { status: 500 });
  }
}
