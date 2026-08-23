import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runHandoffChecks } from '../../../lib/handoff';

export const runtime = 'nodejs';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

const WIDE =
  'id, status, fare, created_at, handoff_needed, removed_driver_name, removed_reason, removed_at, refunded, refunded_at, refund_reason';

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }
    const token = String(body.token || '');

    const sb = adminClient();

    try {
      await runHandoffChecks(sb);
    } catch (e) {}

    if (!token) return NextResponse.json({ ok: true, state: 'none' });

    const got = await sb.auth.getUser(token);
    if (got.error || !got.data || !got.data.user) {
      return NextResponse.json({ ok: true, state: 'none' });
    }
    const me = String(got.data.user.id);

    const since = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    const q: any = await sb
      .from('rides')
      .select(WIDE)
      .eq('rider_id', me)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(1);

    if (q.error) return NextResponse.json({ ok: true, state: 'none' });

    const rows: any[] = q.data ? q.data : [];
    if (rows.length === 0) return NextResponse.json({ ok: true, state: 'none' });

    const r: any = rows[0];

    if (r.handoff_needed === true && String(r.status) === 'requested') {
      const who = r.removed_driver_name ? String(r.removed_driver_name) : 'Your driver';
      return NextResponse.json({
        ok: true,
        state: 'handoff',
        rideId: String(r.id),
        message:
          who +
          ' was taken off your run for driving too fast. You are not being charged any extra. We are sending the next closest driver to you right now. Please stay where you are.',
      });
    }

    if (r.refunded_at && String(r.status) === 'canceled') {
      const msg =
        r.refunded === true
          ? 'We could not get another driver to you in time, so your whole fare has been put back on your card. It can take a few days to show up on your statement. You are welcome to book another ride any time.'
          : 'We could not get another driver to you in time, so this ride has been called off and you are not being charged. You are welcome to book another ride any time.';
      return NextResponse.json({ ok: true, state: 'refunded', rideId: String(r.id), message: msg });
    }

    return NextResponse.json({ ok: true, state: 'none' });
  } catch (e) {
    return NextResponse.json({ ok: true, state: 'none' });
  }
}
