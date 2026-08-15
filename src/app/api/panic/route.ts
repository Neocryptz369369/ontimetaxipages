import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function whoIsIt(sb: any, token: string) {
  if (!token) return null;
  try {
    const got = await sb.auth.getUser(token);
    if (got.error || !got.data || !got.data.user) return null;
    return got.data.user;
  } catch (err) {
    return null;
  }
}

export async function POST(req: Request) {
  const sb = adminClient();
  const ctype = req.headers.get('content-type') || '';

  // A recording is arriving as a file
  if (ctype.indexOf('multipart/form-data') >= 0) {
    try {
      const form = await req.formData();
      const panicId = String(form.get('panic_id') || '');
      const kind = String(form.get('kind') || 'video');
      const seconds = Number(form.get('seconds') || 0);
      const file: any = form.get('file');
      if (!panicId || !file) {
        return NextResponse.json({ error: 'Missing the alert or the recording.' }, { status: 400 });
      }
      const buf = Buffer.from(await file.arrayBuffer());
      const path = panicId + '/' + kind + '-' + Date.now() + '.webm';
      const up = await sb.storage.from('panic-media').upload(path, buf, {
        contentType: file.type || 'video/webm',
        upsert: true,
      });
      if (up.error) {
        return NextResponse.json({ error: 'Could not save the recording.' }, { status: 500 });
      }
      const ins = await sb.from('panic_media').insert({
        panic_id: panicId,
        kind: kind,
        url: path,
        seconds: Math.round(seconds),
      });
      if (ins.error) {
        return NextResponse.json({ error: 'Could not file the recording.' }, { status: 500 });
      }
      return NextResponse.json({ ok: true, path: path });
    } catch (err) {
      return NextResponse.json({ error: 'Something went wrong saving the recording.' }, { status: 500 });
    }
  }

  try {
    const body = await req.json();
    const action = String(body.action || 'create');
    const token = String(body.token || '');
    const user = await whoIsIt(sb, token);

    if (action === 'create') {
      const role = String(body.role || 'rider');
      const row: any = {
        ride_id: body.ride_id ? String(body.ride_id) : null,
        role: role,
        who_name: body.who_name ? String(body.who_name) : null,
        who_phone: body.who_phone ? String(body.who_phone) : null,
        lat: typeof body.lat === 'number' ? body.lat : null,
        lng: typeof body.lng === 'number' ? body.lng : null,
        note: body.note ? String(body.note) : null,
        status: 'open',
      };
      if (user) {
        if (role === 'rider') {
          row.rider_id = user.id;
        } else {
          row.driver_id = user.id;
        }
      }
      const ins = await sb
        .from('panic_events')
        .insert(row)
        .select('id, created_at')
        .maybeSingle();
      if (ins.error || !ins.data) {
        return NextResponse.json({ error: 'Could not send the alert.' }, { status: 500 });
      }
      return NextResponse.json({ ok: true, id: ins.data.id, created_at: ins.data.created_at });
    }

    if (action === 'consent') {
      if (!user) {
        return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
      }
      const who = String(body.who || 'rider');
      const table = who === 'driver' ? 'drivers' : 'profiles';
      const upd = await sb
        .from(table)
        .update({ recording_consent_at: new Date().toISOString() })
        .eq('id', user.id);
      if (upd.error) {
        return NextResponse.json({ error: 'Could not save your agreement.' }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }

    if (action === 'archive') {
      const ev = await sb
        .from('panic_events')
        .select('id, ride_id, role, driver_id, rider_id, who_name, who_phone, lat, lng, status, note, created_at, resolved_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (ev.error) {
        return NextResponse.json({ error: 'Could not read the panic archive.' }, { status: 500 });
      }
      const events: any[] = ev.data ? ev.data : [];
      const ids = events.map((e: any) => e.id);
      let media: any[] = [];
      if (ids.length > 0) {
        const md = await sb
          .from('panic_media')
          .select('id, panic_id, kind, url, seconds, created_at')
          .in('panic_id', ids)
          .order('created_at', { ascending: true });
        media = md.data ? md.data : [];
      }
      for (const m of media) {
        try {
          const signed = await sb.storage.from('panic-media').createSignedUrl(m.url, 3600);
          m.play = signed.data ? signed.data.signedUrl : null;
        } catch (err) {
          m.play = null;
        }
      }
      const out = events.map((e: any) => {
        const mine = media.filter((m: any) => m.panic_id === e.id);
        return { ...e, media: mine };
      });
      return NextResponse.json({ ok: true, events: out });
    }

    if (action === 'resolve') {
      const id = String(body.id || '');
      if (!id) {
        return NextResponse.json({ error: 'Missing the alert.' }, { status: 400 });
      }
      const upd = await sb
        .from('panic_events')
        .update({ status: 'closed', resolved_at: new Date().toISOString() })
        .eq('id', id);
      if (upd.error) {
        return NextResponse.json({ error: 'Could not close the alert.' }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown request.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong with the panic alert.' }, { status: 500 });
  }
}
