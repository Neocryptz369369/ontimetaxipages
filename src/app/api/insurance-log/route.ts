import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function carText(d: any) {
  if (!d) return '';
  const bits: string[] = [];
  if (d.vehicle_color) bits.push(String(d.vehicle_color));
  if (d.vehicle_year) bits.push(String(d.vehicle_year));
  if (d.vehicle_make) bits.push(String(d.vehicle_make));
  if (d.vehicle_model) bits.push(String(d.vehicle_model));
  return bits.join(' ');
}

export async function GET() {
  try {
    const sb = adminClient();

    const rides = await sb
      .from('rides')
      .select('id, driver_id, driver_name, driver_phone, pickup, dropoff, fare, status, created_at, accepted_at, completed_at')
      .not('driver_id', 'is', null)
      .order('accepted_at', { ascending: false })
      .limit(500);

    if (rides.error) {
      return NextResponse.json({ error: 'Could not read the run record.' }, { status: 500 });
    }

    const rows: any[] = rides.data ? rides.data : [];

    const ids: string[] = [];
    for (const r of rows) {
      if (r.driver_id && ids.indexOf(r.driver_id) < 0) {
        ids.push(r.driver_id);
      }
    }

    const book: any = {};
    if (ids.length > 0) {
      let dr: any = await sb.from('drivers').select('id, driver_code, full_name, phone, status, vehicle_make, vehicle_model, vehicle_year, vehicle_color, vehicle_plate').in('id', ids);
      if (dr.error) {
        dr = await sb.from('drivers').select('id, driver_code, full_name, phone, status').in('id', ids);
      }
      const list: any[] = dr.data ? dr.data : [];
      for (const d of list) {
        book[d.id] = d;
      }
    }

    const runs = rows.map((r: any) => {
      const d = book[r.driver_id] ? book[r.driver_id] : null;
      const startIso = r.accepted_at ? r.accepted_at : r.created_at;
      const endIso = r.completed_at ? r.completed_at : null;
      let minutes = 0;
      if (startIso && endIso) {
        const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
        minutes = ms > 0 ? Math.round(ms / 60000) : 0;
      }
      return {
        id: r.id,
        driverId: r.driver_id,
        driverCode: d && d.driver_code ? String(d.driver_code) : '',
        driverName: d && d.full_name ? String(d.full_name) : String(r.driver_name || 'Driver'),
        driverPhone: d && d.phone ? String(d.phone) : String(r.driver_phone || ''),
        driverStatus: d && d.status ? String(d.status) : '',
        driverCar: carText(d),
        driverPlate: d && d.vehicle_plate ? String(d.vehicle_plate) : '',
        pickup: r.pickup ? String(r.pickup) : '',
        dropoff: r.dropoff ? String(r.dropoff) : '',
        fare: typeof r.fare === 'number' ? r.fare : Number(r.fare || 0),
        status: String(r.status || ''),
        startedAt: startIso,
        endedAt: endIso,
        minutes: minutes,
      };
    });

    const perDriver: any = {};
    for (const run of runs) {
      const keep = perDriver[run.driverId] ? perDriver[run.driverId] : { driverId: run.driverId, driverCode: run.driverCode, driverName: run.driverName, driverPhone: run.driverPhone, driverStatus: run.driverStatus, driverCar: run.driverCar, driverPlate: run.driverPlate, runs: 0, minutes: 0, firstAt: null, lastAt: null };
      keep.runs = keep.runs + 1;
      keep.minutes = keep.minutes + run.minutes;
      if (run.startedAt) {
        if (!keep.firstAt || new Date(run.startedAt).getTime() < new Date(keep.firstAt).getTime()) keep.firstAt = run.startedAt;
        if (!keep.lastAt || new Date(run.startedAt).getTime() > new Date(keep.lastAt).getTime()) keep.lastAt = run.startedAt;
      }
      perDriver[run.driverId] = keep;
    }

    const drivers = Object.keys(perDriver).map((k: string) => perDriver[k]);

    return NextResponse.json({ ok: true, runs: runs, drivers: drivers });
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong reading the run record.' }, { status: 500 });
  }
}
