import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const OWNER_EMAIL = 'neocryptz@yahoo.com';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = String(body.token || '');
    const action = String(body.action || 'mine');
    if (!token) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });

    const sb = adminClient();
    const got = await sb.auth.getUser(token);
    if (got.error || !got.data || !got.data.user) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    }
    const user = got.data.user;
    const email = String(user.email || '').toLowerCase();
    const isOwner = email === OWNER_EMAIL;

    if (action === 'send') {
      if (!isOwner) return NextResponse.json({ error: 'This is for the owner only.' }, { status: 403 });
      const text = body.body ? String(body.body).trim() : '';
      if (!text) return NextResponse.json({ error: 'Type the message first.' }, { status: 400 });
      const driverId = body.driverId ? String(body.driverId) : '';
      const row: any = {
        body: text.slice(0, 1000),
        audience: driverId ? 'one' : 'all',
        driver_id: driverId ? driverId : null,
        sent_by: 'owner',
        active: true,
      };
      const ins = await sb.from('driver_alerts').insert(row).select('id, created_at').maybeSingle();
      if (ins.error || !ins.data) {
        return NextResponse.json({ error: 'The alert could not be sent.' }, { status: 500 });
      }
      return NextResponse.json({ ok: true, id: ins.data.id });
    }

    if (action === 'list') {
      if (!isOwner) return NextResponse.json({ error: 'This is for the owner only.' }, { status: 403 });
      const list = await sb
        .from('driver_alerts')
        .select('id, created_at, body, audience, driver_id, active')
        .order('created_at', { ascending: false })
        .limit(30);
      if (list.error) return NextResponse.json({ error: 'Could not read the alerts.' }, { status: 500 });
      const alerts: any[] = list.data ? list.data : [];
      const ids = alerts.map((a: any) => a.id);
      let reads: any[] = [];
      if (ids.length > 0) {
        const rd = await sb.from('driver_alert_reads').select('alert_id, driver_id').in('alert_id', ids);
        reads = rd.data ? rd.data : [];
      }
      const out = alerts.map((a: any) => {
        const mine = reads.filter((r: any) => String(r.alert_id) === String(a.id));
        return { ...a, readCount: mine.length };
      });
      let drivers: any[] = [];
      try {
        const d = await sb
          .from('drivers')
          .select('id, full_name, driver_code')
          .eq('status', 'approved')
          .order('full_name', { ascending: true })
          .limit(100);
        if (!d.error && d.data) drivers = d.data;
      } catch (e) {}
      return NextResponse.json({ ok: true, alerts: out, drivers: drivers });
    }

    if (action === 'off') {
      if (!isOwner) return NextResponse.json({ error: 'This is for the owner only.' }, { status: 403 });
      const id = String(body.id || '');
      if (!id) return NextResponse.json({ error: 'Missing the alert.' }, { status: 400 });
      const upd = await sb.from('driver_alerts').update({ active: false }).eq('id', id);
      if (upd.error) return NextResponse.json({ error: 'Could not turn that alert off.' }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (action === 'read') {
      const id = String(body.id || '');
      if (!id) return NextResponse.json({ error: 'Missing the alert.' }, { status: 400 });
      try {
        await sb.from('driver_alert_reads').insert({ alert_id: id, driver_id: user.id });
      } catch (e) {}
      return NextResponse.json({ ok: true });
    }

    const list = await sb
      .from('driver_alerts')
      .select('id, created_at, body, audience, driver_id, active')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(30);
    if (list.error) {
      return NextResponse.json({ error: 'Could not read your notifications.' }, { status: 500 });
    }
    const all: any[] = list.data ? list.data : [];
    const mine = all.filter((a: any) => {
      if (String(a.audience) === 'all') return true;
      return String(a.driver_id) === String(user.id);
    });
    let readIds: string[] = [];
    if (mine.length > 0) {
      const rd = await sb
        .from('driver_alert_reads')
        .select('alert_id')
        .eq('driver_id', user.id)
        .in('alert_id', mine.map((a: any) => a.id));
      const rows: any[] = rd.data ? rd.data : [];
      readIds = rows.map((r: any) => String(r.alert_id));
    }
    const out = mine.map((a: any) => {
      return { id: a.id, created_at: a.created_at, body: a.body, read: readIds.indexOf(String(a.id)) >= 0 };
    });
    const unread = out.filter((a: any) => a.read !== true);
    return NextResponse.json({ ok: true, alerts: out, unread: unread });
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong with the alerts.' }, { status: 500 });
  }
}
