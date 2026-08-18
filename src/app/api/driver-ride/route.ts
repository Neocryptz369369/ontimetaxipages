import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const RIDE_COLS =
  'id, rider_id, status, fare, tip, paid, pickup, dropoff, stops, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, rider_lat, rider_lng, driver_lat, driver_lng, rider_name, rider_phone, driver_confirmed_pickup, created_at, accepted_at';

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

    let drv = await sb
      .from('drivers')
      .select('status, full_name, phone, vehicle_make, vehicle_model, vehicle_year, vehicle_color, vehicle_plate')
      .eq('id', user.id)
      .maybeSingle();

    if (drv.error) {
      drv = await sb
        .from('drivers')
        .select('status, full_name, phone')
        .eq('id', user.id)
        .maybeSingle();
    }

    if (drv.error) {
      return NextResponse.json({ error: 'Could not load your driver record.' }, { status: 500 });
    }
    if (!drv.data) {
      return NextResponse.json({ error: 'You do not have a driver account yet.' }, { status: 403 });
    }
    if (String(drv.data.status) !== 'approved') {
      return NextResponse.json({ error: 'You are not approved to drive yet.' }, { status: 403 });
    }

    const dv: any = drv.data || {};
    const carBits = [dv.vehicle_color, dv.vehicle_year, dv.vehicle_make, dv.vehicle_model]
      .map((x: any) => (x === null || x === undefined ? '' : String(x).trim()))
      .filter((x: string) => x !== '');
    const myCar = carBits.join(' ');
    const myPlate = dv.vehicle_plate === null || dv.vehicle_plate === undefined ? '' : String(dv.vehicle_plate).trim();

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

    let commissionPct = 20;
    try {
      const st = await sb.from('app_settings').select('commission_pct').limit(1).maybeSingle();
      if (st.data && st.data.commission_pct !== null && st.data.commission_pct !== undefined) {
        commissionPct = Number(st.data.commission_pct);
      }
    } catch (e) {}

    const terms = { getInFee: 5, commissionPct: commissionPct };

    let riderPhoto = '';
    let riderFullName = '';
    let riderPhoneAlt = '';
    try {
      const riderId = (own.data as any).rider_id;
      if (riderId) {
        const pf = await sb.from('profiles').select('full_name, phone, photo_url').eq('id', riderId).maybeSingle();
        if (pf.data) {
          riderFullName = pf.data.full_name ? String(pf.data.full_name) : '';
          riderPhoneAlt = pf.data.phone ? String(pf.data.phone) : '';
          const raw = pf.data.photo_url ? String(pf.data.photo_url) : '';
          if (raw) {
            if (raw.indexOf('http') === 0) riderPhoto = raw;
            else riderPhoto = String(process.env.NEXT_PUBLIC_SUPABASE_URL || '') + '/storage/v1/object/public/profile-photos/' + raw;
          }
        }
      }
    } catch (e) {}

    const decorate = (row: any) => {
      if (!row) return row;
      const out: any = {};
      const keys = Object.keys(row);
      for (let i = 0; i < keys.length; i++) out[keys[i]] = row[keys[i]];
      out.rider_photo = riderPhoto;
      if (!out.rider_name && riderFullName) out.rider_name = riderFullName;
      if (!out.rider_phone && riderPhoneAlt) out.rider_phone = riderPhoneAlt;
      out.terms = terms;
      out.my_car = myCar;
      out.my_plate = myPlate;
      return out;
    };

    if (action === 'get') {
      return NextResponse.json({ ok: true, ride: decorate(own.data) });
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
        return NextResponse.json({ ok: true, ride: decorate(own.data) });
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

    return NextResponse.json({ ok: true, ride: decorate(up.data || own.data) });
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong on that ride.' }, { status: 500 });
  }
}
