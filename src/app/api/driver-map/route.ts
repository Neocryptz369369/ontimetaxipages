import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const OWNER_EMAIL = 'neocryptz@yahoo.com';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function num(v: any) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const tk = String(body.token || '');
    if (!tk) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });

    const sb = adminClient();
    const got = await sb.auth.getUser(tk);
    if (got.error || !got.data || !got.data.user) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    }
    const email = String(got.data.user.email || '').toLowerCase();
    if (email !== OWNER_EMAIL) {
      return NextResponse.json({ error: 'This is for the owner only.' }, { status: 403 });
    }

    const res = await sb
      .from('drivers')
      .select('id, full_name, driver_code, status, phone, photo_url, vehicle_make, vehicle_model, vehicle_year, vehicle_color, vehicle_plate, last_lat, last_lng, last_mph, last_limit_mph, last_seen_at')
      .not('last_lat', 'is', null)
      .not('last_lng', 'is', null)
      .order('last_seen_at', { ascending: false })
      .limit(200);

    if (res.error) {
      return NextResponse.json({ error: 'Could not read the driver map.' }, { status: 500 });
    }

    const now = Date.now();
    const rows: any[] = res.data || [];
    const drivers = rows
      .map(function (d: any) {
        const lat = num(d.last_lat);
        const lng = num(d.last_lng);
        const seen = d.last_seen_at ? new Date(d.last_seen_at).getTime() : 0;
        const mins = seen ? Math.max(0, Math.round((now - seen) / 60000)) : null;
        const mph = num(d.last_mph);
        const limit = num(d.last_limit_mph);
        const over = mph !== null && limit !== null && limit > 0 ? Math.round(mph - limit) : null;
        const car = [d.vehicle_color, d.vehicle_year, d.vehicle_make, d.vehicle_model]
          .map(function (x: any) { return x === null || x === undefined ? '' : String(x).trim(); })
          .filter(function (x: string) { return x !== ''; })
          .join(' ');
        return {
          id: String(d.id),
          name: String(d.full_name || 'Driver'),
          code: String(d.driver_code || ''),
          status: String(d.status || ''),
          phone: String(d.phone || ''),
          photo: d.photo_url || null,
          car: car,
          plate: String(d.vehicle_plate || ''),
          lat: lat,
          lng: lng,
          mph: mph === null ? null : Math.round(mph),
          limit_mph: limit === null ? null : Math.round(limit),
          over_by: over,
          minutes_ago: mins,
          live: mins !== null && mins <= 10,
        };
      })
      .filter(function (d: any) { return d.lat !== null && d.lng !== null; });

    const liveCount = drivers.filter(function (d: any) { return d.live; }).length;
    let riders: any[] = [];
    try {
      const rr = await sb
        .from('rides')
        .select('id, rider_name, pickup, dropoff, fare, created_at, rider_lat, rider_lng')
        .eq('status', 'requested')
        .not('rider_lat', 'is', null)
        .not('rider_lng', 'is', null)
        .order('created_at', { ascending: true })
        .limit(200);
      const rlist: any[] = (rr && rr.data) || [];
      riders = rlist
        .map(function (r: any) {
          const rlat = num(r.rider_lat);
          const rlng = num(r.rider_lng);
          const made = r.created_at ? new Date(r.created_at).getTime() : 0;
          const wait = made ? Math.max(0, Math.round((now - made) / 60000)) : null;
          return {
            id: String(r.id),
            name: String(r.rider_name || 'Rider'),
            pickup: String(r.pickup || ''),
            dropoff: String(r.dropoff || ''),
            fare: num(r.fare),
            lat: rlat,
            lng: rlng,
            waiting_minutes: wait,
          };
        })
        .filter(function (r: any) { return r.lat !== null && r.lng !== null; });
    } catch (e) {}

    return NextResponse.json({ ok: true, drivers: drivers, live: liveCount, riders: riders });
  } catch (e: any) {
    return NextResponse.json({ error: 'Could not read the driver map.' }, { status: 500 });
  }
}
