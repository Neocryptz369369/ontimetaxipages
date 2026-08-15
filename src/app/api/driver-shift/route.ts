import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function dayStartIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = String(body.token || '');
    const action = String(body.action || 'status');

    if (!token) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    }

    const sb = adminClient();
    const got = await sb.auth.getUser(token);
    if (got.error || !got.data || !got.data.user) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    }
    const user = got.data.user;

    const found = await sb.from('drivers').select('id, status').eq('id', user.id).maybeSingle();
    if (found.error) {
      return NextResponse.json({ error: 'Could not read your driver record.' }, { status: 500 });
    }
    const isOwner = String(user.email || '').toLowerCase() === 'neocryptz@yahoo.com';
    let me: any = found.data;
    if (!me) {
      if (!isOwner) {
        return NextResponse.json({ error: 'This is not a driver account.' }, { status: 403 });
      }
      me = { id: user.id, status: 'approved' };
    }

    const open = await sb
      .from('driver_shifts')
      .select('id, started_at')
      .eq('driver_id', user.id)
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (open.error) {
      return NextResponse.json({ error: 'The time clock is not set up yet.' }, { status: 500 });
    }

    if (action === 'start') {
      if (me.status !== 'approved') {
        return NextResponse.json({ error: 'You are not approved to drive yet.' }, { status: 403 });
      }
      if (!open.data) {
        const ins = await sb.from('driver_shifts').insert({ driver_id: user.id });
        if (ins.error) {
          return NextResponse.json({ error: 'Could not start your shift.' }, { status: 500 });
        }
      }
    }

    if (action === 'stop' && open.data) {
      const upd = await sb
        .from('driver_shifts')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', open.data.id);
      if (upd.error) {
        return NextResponse.json({ error: 'Could not end your shift.' }, { status: 500 });
      }
    }

    const nowOpen = await sb
      .from('driver_shifts')
      .select('id, started_at')
      .eq('driver_id', user.id)
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const today = await sb
      .from('driver_shifts')
      .select('id, started_at, ended_at')
      .eq('driver_id', user.id)
      .gte('started_at', dayStartIso())
      .order('started_at', { ascending: true });

    const rows: any[] = today.data ? today.data : [];
    let totalMs = 0;
    const list = rows.map((r: any) => {
      const a = new Date(r.started_at).getTime();
      const b = r.ended_at ? new Date(r.ended_at).getTime() : Date.now();
      const ms = b - a > 0 ? b - a : 0;
      totalMs = totalMs + ms;
      return { id: r.id, startedAt: r.started_at, endedAt: r.ended_at, minutes: Math.round(ms / 60000) };
    });

    return NextResponse.json({
      ok: true,
      live: nowOpen.data ? true : false,
      openSince: nowOpen.data ? nowOpen.data.started_at : null,
      today: list,
      totalMinutes: Math.round(totalMs / 60000),
      status: me.status || 'pending',
    });
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong with the time clock.' }, { status: 500 });
  }
}
