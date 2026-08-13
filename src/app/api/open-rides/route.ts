import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = String(body.token || '');

    if (!token) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    }

    const sb = adminClient();
    const got = await sb.auth.getUser(token);

    if (got.error || !got.data || !got.data.user) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    }

    const user = got.data.user;

    const found = await sb
      .from('drivers')
      .select('driver_code, full_name, phone, status')
      .eq('id', user.id)
      .maybeSingle();

    if (found.error) {
      return NextResponse.json({ error: 'Could not load your driver record.' }, { status: 500 });
    }

    if (!found.data) {
      return NextResponse.json({ ok: true, driver: null, approved: false, rides: [], mine: [] });
    }

    if (String(found.data.status) !== 'approved') {
      return NextResponse.json({ ok: true, driver: found.data, approved: false, rides: [], mine: [] });
    }

    const open = await sb
      .from('rides')
      .select('id, pickup, dropoff, stops, fare, tip, paid, status, created_at, rider_lat, rider_lng')
      .eq('status', 'requested')
      .order('created_at', { ascending: true })
      .limit(25);

    const mine = await sb
      .from('rides')
      .select('id, pickup, dropoff, stops, fare, tip, paid, status, created_at, accepted_at, rider_lat, rider_lng')
      .eq('driver_id', user.id)
      .in('status', ['accepted', 'picked_up'])
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      ok: true,
      driver: found.data,
      approved: true,
      rides: open.data || [],
      mine: mine.data || [],
    });
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong loading the rides.' }, { status: 500 });
  }
}
