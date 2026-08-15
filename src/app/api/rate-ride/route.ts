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
    const rideId = String(body.rideId || '');
    const role = String(body.role || 'rider') === 'driver' ? 'driver' : 'rider';
    const stars = Math.round(Number(body.stars || 0));
    const review = String(body.review || '').slice(0, 1000);

    if (!token) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    }
    if (!rideId) {
      return NextResponse.json({ error: 'No ride was picked.' }, { status: 400 });
    }
    if (stars < 1 || stars > 5) {
      return NextResponse.json({ error: 'Please pick 1 to 5 stars.' }, { status: 400 });
    }

    const sb = adminClient();
    const got = await sb.auth.getUser(token);

    if (got.error || !got.data || !got.data.user) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    }

    const me = got.data.user.id;

    const found = await sb
      .from('rides')
      .select('id, rider_id, rider_name, driver_id, driver_name, status, completed_at')
      .eq('id', rideId)
      .maybeSingle();

    if (found.error || !found.data) {
      return NextResponse.json({ error: 'That ride was not found.' }, { status: 404 });
    }

    const ride: any = found.data;

    if (role === 'rider' && ride.rider_id !== me) {
      return NextResponse.json({ error: 'That ride is not yours.' }, { status: 403 });
    }
    if (role === 'driver' && ride.driver_id !== me) {
      return NextResponse.json({ error: 'That ride is not yours.' }, { status: 403 });
    }

    let raterName = '';
    let rateeType = '';
    let rateeId: any = null;
    let rateeName = '';

    if (role === 'rider') {
      raterName = ride.rider_name ? String(ride.rider_name) : 'Rider';
      rateeType = 'driver';
      rateeId = ride.driver_id;
      rateeName = ride.driver_name ? String(ride.driver_name) : 'Driver';
    } else {
      raterName = ride.driver_name ? String(ride.driver_name) : 'Driver';
      rateeType = 'rider';
      rateeId = ride.rider_id;
      rateeName = ride.rider_name ? String(ride.rider_name) : 'Rider';
    }

    if (!rateeId) {
      return NextResponse.json({ error: 'There is nobody to rate on that ride yet.' }, { status: 400 });
    }

    const saved = await sb.from('ride_ratings').insert({
      ride_id: rideId,
      rater_type: role,
      rater_id: me,
      rater_name: raterName,
      ratee_type: rateeType,
      ratee_id: rateeId,
      ratee_name: rateeName,
      stars: stars,
      review: review,
      flagged: stars <= 2,
    });

    if (saved.error) {
      const msg = String(saved.error.message || '');
      if (msg.indexOf('duplicate') >= 0 || msg.indexOf('unique') >= 0) {
        return NextResponse.json({ ok: true, already: true });
      }
      return NextResponse.json({ error: 'Could not save your rating.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, flagged: stars <= 2 });
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong saving your rating.' }, { status: 500 });
  }
}
