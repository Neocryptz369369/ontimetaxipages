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
    const role = String(body.role || 'rider') === 'driver' ? 'driver' : 'rider';

    if (!token) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    }

    const sb = adminClient();
    const got = await sb.auth.getUser(token);

    if (got.error || !got.data || !got.data.user) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    }

    const me = got.data.user.id;

    const list = await sb
      .from('rides')
      .select('id, rider_id, rider_name, driver_id, driver_name, pickup, dropoff, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, stops, fare, tip, paid, status, created_at, accepted_at, completed_at')
      .eq(role === 'driver' ? 'driver_id' : 'rider_id', me)
      .order('created_at', { ascending: false })
      .limit(100);

    if (list.error) {
      return NextResponse.json({ error: 'Could not read your ride history.' }, { status: 500 });
    }

    const rows: any[] = list.data ? list.data : [];
    const ids = rows.map((r: any) => r.id);

    const mine: any = {};
    if (ids.length > 0) {
      const rated = await sb
        .from('ride_ratings')
        .select('ride_id, stars, review, created_at')
        .eq('rater_type', role)
        .in('ride_id', ids);
      const got2: any[] = rated.data ? rated.data : [];
      for (const g of got2) {
        mine[g.ride_id] = g;
      }
    }

    const rides = rows.map((r: any) => {
      const done = r.status !== 'cancelled' && (r.completed_at || r.status === 'completed');
      const seen = mine[r.id] ? mine[r.id] : null;
      return {
        id: r.id,
        createdAt: r.created_at,
        acceptedAt: r.accepted_at,
        completedAt: r.completed_at,
        pickup: r.pickup ? String(r.pickup) : '',
        dropoff: r.dropoff ? String(r.dropoff) : '',
        pickupLat: r.pickup_lat,
        pickupLng: r.pickup_lng,
        dropoffLat: r.dropoff_lat,
        dropoffLng: r.dropoff_lng,
        stops: r.stops ? r.stops : null,
        fare: Number(r.fare || 0),
        tip: Number(r.tip || 0),
        paid: r.paid === true,
        status: String(r.status || ''),
        riderId: r.rider_id,
        riderName: r.rider_name ? String(r.rider_name) : 'Rider',
        driverId: r.driver_id,
        driverName: r.driver_name ? String(r.driver_name) : '',
        finished: done ? true : false,
        myStars: seen ? Number(seen.stars) : 0,
        myReview: seen && seen.review ? String(seen.review) : '',
      };
    });

    let pending: any = null;
    for (const r of rides) {
      const other = role === 'driver' ? r.riderId : r.driverId;
      if (r.finished && r.myStars === 0 && other) {
        pending = r;
        break;
      }
    }

    return NextResponse.json({ ok: true, role: role, rides: rides, pending: pending });
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong reading your ride history.' }, { status: 500 });
  }
}
