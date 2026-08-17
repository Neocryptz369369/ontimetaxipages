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
    if (!token) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });

    const sb = adminClient();
    const got = await sb.auth.getUser(token);
    if (got.error || !got.data || !got.data.user) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    }
    const me = got.data.user.id;

    let stars = 0;
    let starCount = 0;
    let reviews: any[] = [];
    try {
      const rt = await sb
        .from('ride_ratings')
        .select('stars, review, rater_name, created_at')
        .eq('ratee_type', 'driver')
        .eq('ratee_id', me)
        .order('created_at', { ascending: false })
        .limit(50);
      const rows: any[] = rt.data ? rt.data : [];
      starCount = rows.length;
      if (starCount > 0) {
        let total = 0;
        rows.forEach((r: any) => { total = total + Number(r.stars || 0); });
        stars = Math.round((total / starCount) * 10) / 10;
      }
      reviews = rows.slice(0, 10).map((r: any) => {
        const nm = String(r.rater_name || 'Rider');
        return { stars: Number(r.stars || 0), review: r.review ? String(r.review) : '', name: nm.split(' ')[0], createdAt: r.created_at };
      });
    } catch (e) {}

    let speeding: any[] = [];
    let strikes = 0;
    try {
      const sp = await sb
        .from('speed_events')
        .select('id, created_at, mph, limit_mph, over_by, removed')
        .eq('driver_id', me)
        .order('created_at', { ascending: false })
        .limit(20);
      speeding = sp.data ? sp.data : [];
    } catch (e) {}
    try {
      const dv = await sb.from('drivers').select('speeding_strikes').eq('id', me).maybeSingle();
      if (dv.data && dv.data.speeding_strikes) strikes = Number(dv.data.speeding_strikes);
    } catch (e) {}

    let accidents: any[] = [];
    try {
      const ac = await sb
        .from('accident_reports')
        .select('id, created_at, details, injuries, officer_name, report_number, address, status')
        .eq('driver_id', me)
        .order('created_at', { ascending: false })
        .limit(20);
      accidents = ac.data ? ac.data : [];
    } catch (e) {}

    let panics: any[] = [];
    try {
      const pa = await sb
        .from('panic_events')
        .select('id, created_at, role, status, note, resolved_at')
        .eq('driver_id', me)
        .order('created_at', { ascending: false })
        .limit(20);
      panics = pa.data ? pa.data : [];
    } catch (e) {}

    return NextResponse.json({
      ok: true,
      stars: stars,
      starCount: starCount,
      reviews: reviews,
      speeding: speeding,
      strikes: strikes,
      accidents: accidents,
      panics: panics,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong reading your record.' }, { status: 500 });
  }
}
