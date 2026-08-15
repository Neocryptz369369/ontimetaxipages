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
      return NextResponse.json({ ok: true, driver: null, approved: false, rides: [], mine: [], mustRate: null });
    }

    if (String(found.data.status) !== 'approved') {
      return NextResponse.json({ ok: true, driver: found.data, approved: false, rides: [], mine: [], mustRate: null });
    }

    const open = await sb
      .from('rides')
      .select('id, pickup, dropoff, stops, fare, tip, paid, status, created_at, rider_lat, rider_lng, rider_id, rider_name')
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

    const openRows: any[] = open.data ? open.data : [];

    const riderIds: string[] = [];
    for (const r of openRows) {
      if (r.rider_id && riderIds.indexOf(String(r.rider_id)) < 0) riderIds.push(String(r.rider_id));
    }

    const book: any = {};
    if (riderIds.length > 0) {
      const rr = await sb
        .from('ride_ratings')
        .select('ratee_id, stars')
        .eq('ratee_type', 'rider')
        .in('ratee_id', riderIds);
      const list: any[] = rr.data ? rr.data : [];
      for (const x of list) {
        const k = String(x.ratee_id);
        const keep = book[k] ? book[k] : { total: 0, count: 0 };
        keep.total = keep.total + Number(x.stars || 0);
        keep.count = keep.count + 1;
        book[k] = keep;
      }
    }

    const ridesOut = openRows.map((r: any) => {
      const k = r.rider_id ? String(r.rider_id) : '';
      const s = k && book[k] ? book[k] : null;
      const avg = s && s.count > 0 ? Math.round((s.total / s.count) * 10) / 10 : 0;
      return Object.assign({}, r, { riderStars: avg, riderRatings: s ? s.count : 0 });
    });

    let mustRate: any = null;
    const done = await sb
      .from('rides')
      .select('id, rider_id, rider_name, pickup, dropoff, completed_at')
      .eq('driver_id', user.id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(20);

    const dlist: any[] = done.data ? done.data : [];
    if (dlist.length > 0) {
      const ids = dlist.map((d: any) => d.id);
      const rated = await sb.from('ride_ratings').select('ride_id').eq('rater_type', 'driver').in('ride_id', ids);
      const seen: any = {};
      const canRate = rated.error ? false : true;
      const rl: any[] = rated.data ? rated.data : [];
      for (const x of rl) seen[String(x.ride_id)] = true;
      for (const d of dlist) {
        if (!canRate) break;
        if (!seen[String(d.id)] && d.rider_id) {
          mustRate = {
            id: d.id,
            riderName: d.rider_name ? String(d.rider_name) : 'Rider',
            pickup: d.pickup ? String(d.pickup) : '',
            dropoff: d.dropoff ? String(d.dropoff) : '',
          };
          break;
        }
      }
    }

    return NextResponse.json({
      ok: true,
      driver: found.data,
      approved: true,
      rides: ridesOut,
      mine: mine.data || [],
      mustRate: mustRate,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong loading the rides.' }, { status: 500 });
  }
}
