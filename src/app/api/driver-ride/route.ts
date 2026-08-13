import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const RIDE_COLS =
  'id, status, fare, tip, paid, pickup, dropoff, stops, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, rider_lat, rider_lng, driver_lat, driver_lng, rider_name, rider_phone, driver_confirmed_pickup, created_at, accepted_at';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = String(body.token || '');
    const rideId = String(body.rideId || '');
    const action = String(body.action || 'get');

    if (!token) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    }
    if (!rideId) {
      return NextResponse.json({ error: 'No ride was picked.' }, { status: 400 });
    }

    const sb = adminClient();
    const got = await sb.auth.getUser(token);

    if (got.error || !got.data || !got.data.user) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    }

    const user = got.data.user;

    const drv = await sb
      .from('drivers')
      .select('status, full_name, phone')
      .eq('id', user.id)
      .maybeSingle();

    if (drv.error) {
      return NextResponse.json({ error: 'Could not load your driver record.' }, { status: 500 });
    }
    if (!drv.data) {
      return NextResponse.json({ error: 'You do not have a driver account yet.' }, { status: 403 });
    }
    if (String(drv.data.status) !== 'approved') {
      return NextResponse.json({ error: 'You are not approved to drive yet.' }, { status: 403 });
    }

    const own = await sb
      .from('rides')
      .select(RIDE_COLS)
      .eq('id', rideId)
      .eq('driver_id', user.id)
      .maybeSingle();

    if (own.error) {
      return NextResponse.json({ error: 'Could not load that ride.' }, { status: 500 });
    }
    if (!own.data) {
      return NextResponse.json({ error: 'That ride is not yours.' }, { status: 404 });
    }

    if (action === 'get') {
      return NextResponse.json({ ok: true, ride: own.data });
    }

    let patch: any = null;

    if (action === 'ping') {
      const lat = Number(body.lat);
      const lng = Number(body.lng);
      if (!isFinite(lat) || !isFinite(lng)) {
        return NextResponse.json({ error: 'No location was sent.' }, { status: 400 });
      }
      patch = { driver_lat: lat, driver_lng: lng, updated_at: new Date().toISOString() };
    } else if (action === 'pickup') {
      patch = { driver_confirmed_pickup: true };
      if (String(own.data.status) === 'accepted') patch.status = 'picked_up';
    } else if (action === 'finish') {
      if (String(own.data.status) === 'completed') {
        return NextResponse.json({ ok: true, ride: own.data });
      }
      patch = { status: 'completed', completed_at: new Date().toISOString() };
    } else {
      return NextResponse.json({ error: 'That is not something I can do.' }, { status: 400 });
    }

    const up = await sb
      .from('rides')
      .update(patch)
      .eq('id', rideId)
      .eq('driver_id', user.id)
      .select(RIDE_COLS)
      .maybeSingle();

    if (up.error) {
      return NextResponse.json({ error: 'Could not save that.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, ride: up.data || own.data });
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong on that ride.' }, { status: 500 });
  }
}
