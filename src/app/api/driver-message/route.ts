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
      const text = body.body ? String(body.body).trim() : '';
      if (!text) return NextResponse.json({ error: 'Say or type your message first.' }, { status: 400 });

      let driverName = '';
      let driverCode = '';
      try {
        const who = await sb.from('drivers').select('full_name, driver_code').eq('id', user.id).maybeSingle();
        if (who.data) {
          driverName = String(who.data.full_name || '');
          driverCode = String(who.data.driver_code || '');
        }
      } catch (e) {}

      const row: any = {
        driver_id: user.id,
        driver_name: driverName,
        driver_code: driverCode,
        kind: body.kind ? String(body.kind).slice(0, 40) : 'message',
        body: text.slice(0, 1500),
        status: 'new',
      };

      const ins = await sb.from('driver_messages').insert(row).select('id, created_at').maybeSingle();
      if (ins.error || !ins.data) {
        return NextResponse.json({ error: 'Your message did not go through. Please try again.' }, { status: 500 });
      }
      return NextResponse.json({ ok: true, id: ins.data.id });
    }

    if (action === 'list') {
      if (!isOwner) return NextResponse.json({ error: 'This is for the owner only.' }, { status: 403 });
      const list = await sb
        .from('driver_messages')
        .select('id, created_at, driver_id, driver_name, driver_code, kind, body, status, handled_at')
        .order('created_at', { ascending: false })
        .limit(60);
      if (list.error) return NextResponse.json({ error: 'Could not read the messages.' }, { status: 500 });
      const rows: any[] = list.data ? list.data : [];
      const waiting = rows.filter((r: any) => String(r.status) !== 'handled');
      return NextResponse.json({ ok: true, messages: rows, waiting: waiting.length });
    }

    if (action === 'handled') {
      if (!isOwner) return NextResponse.json({ error: 'This is for the owner only.' }, { status: 403 });
      const id = String(body.id || '');
      if (!id) return NextResponse.json({ error: 'Missing the message.' }, { status: 400 });
      const upd = await sb
        .from('driver_messages')
        .update({ status: 'handled', handled_at: new Date().toISOString() })
        .eq('id', id);
      if (upd.error) return NextResponse.json({ error: 'That did not save.' }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    const mine = await sb
      .from('driver_messages')
      .select('id, created_at, kind, body, status, handled_at')
      .eq('driver_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (mine.error) {
      return NextResponse.json({ ok: true, messages: [] });
    }

    return NextResponse.json({ ok: true, messages: mine.data ? mine.data : [] });
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong with your message.' }, { status: 500 });
  }
}
