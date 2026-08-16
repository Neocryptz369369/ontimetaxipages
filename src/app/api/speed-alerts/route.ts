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
    const token = String(body.token || '');
    const action = String(body.action || 'list');
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

    if (action === 'seen') {
      const ids: any[] = Array.isArray(body.ids) ? body.ids : [];
      try {
        if (ids.length > 0) await sb.from('speed_events').update({ seen: true }).in('id', ids);
        else await sb.from('speed_events').update({ seen: true }).eq('seen', false);
      } catch (e) {}
      return NextResponse.json({ ok: true });
    }

    let events: any[] = [];
    let unseen = 0;
    try {
      const list = await sb
        .from('speed_events')
        .select('id, driver_id, driver_name, driver_code, ride_id, mph, limit_mph, over_by, lat, lng, removed, seen, created_at')
        .order('created_at', { ascending: false })
        .limit(40);
      if (!list.error && list.data) {
        events = list.data;
        for (const e of events) { if (e.seen !== true) unseen = unseen + 1; }
      }
    } catch (e) {}

    let drivers: any[] = [];
    try {
      const d = await sb
        .from('drivers')
        .select('id, full_name, driver_code, status, last_lat, last_lng, last_mph, last_limit_mph, last_seen_at, speeding_strikes')
        .eq('status', 'approved')
        .order('full_name', { ascending: true })
        .limit(100);
      if (!d.error && d.data) drivers = d.data;
    } catch (e) {}

    return NextResponse.json({ ok: true, events: events, unseen: unseen, drivers: drivers });
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong reading the speeding records.' }, { status: 500 });
  }
}
