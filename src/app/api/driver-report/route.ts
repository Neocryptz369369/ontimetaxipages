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
    const driverCode = String(body.driverCode || '').replace(/[^0-9]/g, '');
    const kind = String(body.kind || '');
    const details = String(body.details || '').slice(0, 2000);
    const reporterName = String(body.reporterName || '').slice(0, 120);
    const reporterPhone = String(body.reporterPhone || '').slice(0, 40);
    const rideId = body.rideId ? String(body.rideId) : null;

    if (!token) {
      return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });
    }
    if (driverCode.length !== 12) {
      return NextResponse.json({ error: 'Enter the 12 digit driver ID.' }, { status: 400 });
    }
    if (kind !== 'drugs' && kind !== 'alcohol' && kind !== 'both') {
      return NextResponse.json({ error: 'Choose what you saw.' }, { status: 400 });
    }

    const sb = adminClient();
    const got = await sb.auth.getUser(token);
    if (got.error || !got.data || !got.data.user) {
      return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });
    }
    const user = got.data.user;

    const driver = await sb
      .from('drivers')
      .select('id, full_name, status')
      .eq('driver_code', driverCode)
      .maybeSingle();

    if (driver.error) {
      return NextResponse.json({ error: 'Could not look up that driver ID.' }, { status: 500 });
    }
    if (!driver.data) {
      return NextResponse.json({ error: 'No driver has that ID. Please check the number on your ride screen.' }, { status: 404 });
    }

    const ins = await sb
      .from('driver_reports')
      .insert({
        driver_id: driver.data.id,
        ride_id: rideId,
        reporter_id: user.id,
        reporter_name: reporterName || (user.email || ''),
        reporter_phone: reporterPhone,
        kind: kind,
        details: details,
        status: 'open',
      })
      .select('id')
      .single();

    if (ins.error) {
      return NextResponse.json({ error: 'Could not save the report: ' + ins.error.message }, { status: 500 });
    }

    await sb
      .from('drivers')
      .update({
        status: 'suspended',
        suspended_at: new Date().toISOString(),
        suspended_reason: 'Reported for drug or alcohol use - under investigation',
      })
      .eq('id', driver.data.id)
      .neq('status', 'rejected');

    const after = await sb.from('drivers').select('status').eq('id', driver.data.id).maybeSingle();
    const suspended = !!(after.data && after.data.status === 'suspended');

    return NextResponse.json({
      ok: true,
      id: ins.data ? ins.data.id : '',
      driverName: driver.data.full_name || '',
      suspended: suspended,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
