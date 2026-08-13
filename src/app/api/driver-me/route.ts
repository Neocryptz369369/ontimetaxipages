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
      .select('driver_code, full_name, email, phone, photo_url, status, called_in, created_at')
      .eq('id', user.id)
      .maybeSingle();

    if (found.error) {
      return NextResponse.json({ error: 'Could not load your driver record.' }, { status: 500 });
    }

    if (!found.data) {
      return NextResponse.json({ ok: true, driver: null, email: user.email || '' });
    }

    let photoUrl = '';
    if (found.data.photo_url) {
      const pub = sb.storage.from('profile-photos').getPublicUrl(String(found.data.photo_url));
      photoUrl = pub && pub.data ? pub.data.publicUrl : '';
    }

    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    let commissionPct = 20;
    const settings = await sb.from('app_settings').select('commission_pct').limit(1).maybeSingle();
    if (settings.data && settings.data.commission_pct !== null && settings.data.commission_pct !== undefined) {
      commissionPct = Number(settings.data.commission_pct);
    }

    const GET_IN_FEE = 5;
    let rideCount = 0;
    let fares = 0;
    let tips = 0;
    let companyKeeps = 0;
    let youMade = 0;
    let unpaidCount = 0;

    const today = await sb
      .from('rides')
      .select('fare, tip, paid, status, completed_at, accepted_at, created_at')
      .eq('driver_id', user.id)
      .gte('created_at', dayStart);

    if (today.data) {
      today.data.forEach((r: any) => {
        if (r.status === 'cancelled') return;
        rideCount = rideCount + 1;
        const fare = Number(r.fare || 0);
        const tip = Number(r.tip || 0);
        const afterFee = fare - GET_IN_FEE > 0 ? fare - GET_IN_FEE : 0;
        const cut = afterFee * (commissionPct / 100);
        fares = fares + fare;
        tips = tips + tip;
        companyKeeps = companyKeeps + GET_IN_FEE + cut;
        youMade = youMade + (afterFee - cut) + tip;
        if (!r.paid) unpaidCount = unpaidCount + 1;
      });
    }

    const round2 = (n: number) => Math.round(n * 100) / 100;

    return NextResponse.json({
      ok: true,
      email: user.email || '',
      driver: {
        driverCode: found.data.driver_code || '',
        fullName: found.data.full_name || '',
        email: found.data.email || '',
        phone: found.data.phone || '',
        status: found.data.status || 'pending',
        calledIn: found.data.called_in === true,
        photoUrl: photoUrl,
      },
      earnings: {
        rides: rideCount,
        fares: round2(fares),
        tips: round2(tips),
        companyKeeps: round2(companyKeeps),
        youMade: round2(youMade),
        unpaid: unpaidCount,
        getInFee: GET_IN_FEE,
        commissionPct: commissionPct,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong loading your account.' }, { status: 500 });
  }
}
