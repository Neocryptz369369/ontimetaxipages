import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { freeDrivers, turnInfo } from '../../../lib/dispatch';
import { blockedFor } from '../../../lib/dispatch';

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
    const rideId = String(body.rideId || '');

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

    let wide = true;
    let found: any = await sb
      .from('drivers')
      .select('driver_code, full_name, phone, status, vehicle_make, vehicle_model, vehicle_plate')
      .eq('id', user.id)
      .maybeSingle();

    if (found.error) {
      wide = false;
      found = await sb
        .from('drivers')
        .select('driver_code, full_name, phone, status')
        .eq('id', user.id)
        .maybeSingle();
    }

    if (found.error) {
      return NextResponse.json({ error: 'Could not load your driver record.' }, { status: 500 });
    }
    if (!found.data) {
      return NextResponse.json({ error: 'You do not have a driver account yet.' }, { status: 403 });
    }
    if (String(found.data.status) !== 'approved') {
      return NextResponse.json({ error: 'You are not approved to take rides yet.' }, { status: 403 });
    }

    if (wide) {
      const hasCar = !!(found.data.vehicle_make || found.data.vehicle_model);
      const hasPlate = !!found.data.vehicle_plate;
      if (!hasCar || !hasPlate) {
        return NextResponse.json({ error: 'Put your car and your licence plate in My details on your driver page first. A rider has to be able to see what car is picking them up.' }, { status: 403 });
      }
    }

    const ahead = await sb
      .from('rides')
      .select('id, status, created_at, rider_lat, rider_lng, pickup_lat, pickup_lng, no_pay_driver_ids, removed_driver_id, removed_driver_name, handoff_needed')
      .eq('id', rideId)
      .maybeSingle();
    
    let ahead2: any = ahead;
    if (ahead.error) {
      ahead2 = await sb
        .from('rides')
        .select('id, status, created_at, rider_lat, rider_lng, pickup_lat, pickup_lng')
        .eq('id', rideId)
        .maybeSingle();
    }

    if (ahead2.data && blockedFor(ahead2.data)[String(user.id)]) {
      return NextResponse.json(
        { error: 'You were taken off this run for speeding. Another driver has to take it over. You are not paid for this one.' },
        { status: 403 }
      );
    }
    if (ahead2.data && String(ahead2.data.status) === 'requested') {
      const freeList = await freeDrivers(sb);
      const turn = turnInfo(ahead2.data, freeList, String(user.id));
      if (!turn.mine) {
        return NextResponse.json(
          { error: 'A driver closer to this rider is being offered it first. If they do not take it, it opens up to you in about ' + turn.waitSecs + ' seconds.' },
          { status: 409 }
        );
      }
    }
    
    const taken = await sb
      .from('rides')
      .update({
        status: 'accepted',
        driver_id: user.id,
        accepted_at: new Date().toISOString(),
        driver_name: String(found.data.full_name || ''),
        driver_phone: String(found.data.phone || ''),
      })
      .eq('id', rideId)
      .eq('status', 'requested')
      .select('id, pickup, dropoff, fare, status');

    if (taken.error) {
      return NextResponse.json({ error: 'Could not take that ride.' }, { status: 500 });
    }

    try {
      await sb.from('rides').update({ handoff_needed: false }).eq('id', rideId);
    } catch (e) {}

    if (!taken.data || taken.data.length === 0) {
      return NextResponse.json({ ok: true, got: false });
    }

    return NextResponse.json({ ok: true, got: true, ride: taken.data[0] });
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong taking that ride.' }, { status: 500 });
  }
}
