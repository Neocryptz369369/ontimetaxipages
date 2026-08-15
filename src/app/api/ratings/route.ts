import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const ADMIN_EMAIL = 'neocryptz@yahoo.com';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function average(list: any[]) {
  if (list.length === 0) return 0;
  let total = 0;
  for (const r of list) total = total + Number(r.stars || 0);
  return Math.round((total / list.length) * 10) / 10;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type') === 'rider' ? 'rider' : 'driver';
    const id = String(url.searchParams.get('id') || '');

    if (!id) {
      return NextResponse.json({ ok: true, average: 0, count: 0, reviews: [] });
    }

    const sb = adminClient();
    const got = await sb
      .from('ride_ratings')
      .select('stars, review, rater_name, created_at')
      .eq('ratee_type', type)
      .eq('ratee_id', id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (got.error) {
      return NextResponse.json({ ok: true, average: 0, count: 0, reviews: [] });
    }

    const rows: any[] = got.data ? got.data : [];

    if (type === 'rider') {
      return NextResponse.json({ ok: true, average: average(rows), count: rows.length, reviews: [] });
    }

    const reviews = rows.slice(0, 20).map((r: any) => {
      const name = String(r.rater_name || 'Rider');
      const first = name.split(' ')[0];
      return { stars: Number(r.stars || 0), review: r.review ? String(r.review) : '', name: first, createdAt: r.created_at };
    });

    return NextResponse.json({ ok: true, average: average(rows), count: rows.length, reviews: reviews });
  } catch (err) {
    return NextResponse.json({ ok: true, average: 0, count: 0, reviews: [] });
  }
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

    const email = String(got.data.user.email || '').toLowerCase();

    if (email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Only the owner can read this.' }, { status: 403 });
    }

    const all = await sb
      .from('ride_ratings')
      .select('id, ride_id, rater_type, rater_name, ratee_type, ratee_name, stars, review, flagged, created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    if (all.error) {
      return NextResponse.json({ error: 'Could not read the ratings.' }, { status: 500 });
    }

    const rows: any[] = all.data ? all.data : [];
    const low = rows.filter((r: any) => r.flagged === true);

    return NextResponse.json({ ok: true, ratings: rows, low: low, average: average(rows), count: rows.length });
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong reading the ratings.' }, { status: 500 });
  }
}
