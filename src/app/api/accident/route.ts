import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const OWNER_EMAIL = 'neocryptz@yahoo.com';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function signPhotos(sb: any, rows: any[]) {
  for (const p of rows) {
    try {
      const s = await sb.storage.from('accident-media').createSignedUrl(String(p.path), 3600);
      p.view = s.data ? s.data.signedUrl : null;
    } catch (e) {
      p.view = null;
    }
  }
  return rows;
}

export async function POST(req: Request) {
  const sb = adminClient();
  const ctype = req.headers.get('content-type') || '';

  if (ctype.indexOf('multipart/form-data') >= 0) {
    try {
      const form = await req.formData();
      const reportId = String(form.get('report_id') || '');
      const kind = String(form.get('kind') || 'scene');
      const file: any = form.get('file');
      if (!reportId || !file) {
        return NextResponse.json({ error: 'Missing the report or the picture.' }, { status: 400 });
      }
      const buf = Buffer.from(await file.arrayBuffer());
      if (buf.length > 12 * 1024 * 1024) {
        return NextResponse.json({ error: 'That picture is too big. Please pick one under 12 MB.' }, { status: 400 });
      }
      const type = String(file.type || 'image/jpeg');
      let ext = 'jpg';
      if (type.indexOf('png') >= 0) ext = 'png';
      if (type.indexOf('webp') >= 0) ext = 'webp';
      if (type.indexOf('heic') >= 0) ext = 'heic';
      const tail = Math.random().toString(36).slice(2, 7);
      const path = reportId + '/' + kind + '-' + Date.now() + '-' + tail + '.' + ext;
      const up = await sb.storage.from('accident-media').upload(path, buf, { contentType: type, upsert: true });
      if (up.error) {
        return NextResponse.json({ error: 'That picture could not be saved.' }, { status: 500 });
      }
      const ins = await sb.from('accident_photos').insert({ report_id: reportId, kind: kind, path: path, content_type: type });
      if (ins.error) {
        return NextResponse.json({ error: 'That picture could not be filed.' }, { status: 500 });
      }
      return NextResponse.json({ ok: true, path: path });
    } catch (e) {
      return NextResponse.json({ error: 'Something went wrong saving the picture.' }, { status: 500 });
    }
  }

  try {
    const body = await req.json();
    const action = String(body.action || 'create');
    const token = String(body.token || '');
    if (!token) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });

    const got = await sb.auth.getUser(token);
    if (got.error || !got.data || !got.data.user) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    }
    const user = got.data.user;
    const email = String(user.email || '').toLowerCase();
    const isOwner = email === OWNER_EMAIL;

    if (action === 'create') {
      let driver: any = null;
      try {
        const f = await sb.from('drivers').select('id, full_name, email, phone, driver_code, last_mph, last_limit_mph').eq('id', user.id).maybeSingle();
        if (!f.error && f.data) driver = f.data;
      } catch (e) {}

      let mph: any = body.mph === null || body.mph === undefined || body.mph === '' ? null : Math.round(Number(body.mph));
      let limitMph: any = body.limitMph === null || body.limitMph === undefined || body.limitMph === '' ? null : Math.round(Number(body.limitMph));
      if (mph !== null && (!isFinite(mph) || mph < 0)) mph = null;
      if (limitMph !== null && (!isFinite(limitMph) || limitMph <= 0)) limitMph = null;

      if (mph === null && driver && driver.last_mph !== null && driver.last_mph !== undefined) {
        mph = Math.round(Number(driver.last_mph));
      }
      if (limitMph === null && driver && driver.last_limit_mph !== null && driver.last_limit_mph !== undefined) {
        limitMph = Math.round(Number(driver.last_limit_mph));
      }

      let name = email ? email : 'Driver';
      if (driver && driver.full_name) name = String(driver.full_name);
      else if (isOwner) name = 'On Time Taxi owner';

      const row: any = {
        ride_id: body.rideId ? String(body.rideId) : null,
        driver_id: user.id,
        driver_name: name,
        driver_email: driver && driver.email ? String(driver.email) : email,
        driver_phone: driver && driver.phone ? String(driver.phone) : null,
        details: body.details ? String(body.details) : null,
        injuries: body.injuries ? String(body.injuries) : null,
        officer_name: body.officerName ? String(body.officerName) : null,
        officer_badge: body.officerBadge ? String(body.officerBadge) : null,
        report_number: body.reportNumber ? String(body.reportNumber) : null,
        other_driver: body.otherDriver ? String(body.otherDriver) : null,
        other_vehicle: body.otherVehicle ? String(body.otherVehicle) : null,
        other_plate: body.otherPlate ? String(body.otherPlate) : null,
        other_insurance: body.otherInsurance ? String(body.otherInsurance) : null,
        mph: mph,
        limit_mph: limitMph,
        lat: body.lat === null || body.lat === undefined ? null : Number(body.lat),
        lng: body.lng === null || body.lng === undefined ? null : Number(body.lng),
        address: body.address ? String(body.address) : null,
        status: 'open',
      };

      const ins = await sb.from('accident_reports').insert(row).select('id, created_at, mph, limit_mph').maybeSingle();
      if (ins.error || !ins.data) {
        return NextResponse.json({ error: 'The report could not be sent. Please try again.' }, { status: 500 });
      }
      return NextResponse.json({ ok: true, id: ins.data.id, created_at: ins.data.created_at, mph: ins.data.mph, limitMph: ins.data.limit_mph });
    }

    if (action === 'list') {
      if (!isOwner) return NextResponse.json({ error: 'This is for the owner only.' }, { status: 403 });
      const list = await sb
        .from('accident_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(60);
      if (list.error) return NextResponse.json({ error: 'Could not read the accident reports.' }, { status: 500 });
      const reports: any[] = list.data ? list.data : [];
      const ids = reports.map((r: any) => r.id);
      let photos: any[] = [];
      if (ids.length > 0) {
        const ph = await sb.from('accident_photos').select('id, report_id, kind, path, created_at').in('report_id', ids);
        photos = ph.data ? ph.data : [];
        await signPhotos(sb, photos);
      }
      let open = 0;
      const out = reports.map((r: any) => {
        if (String(r.status) === 'open') open = open + 1;
        const mine = photos.filter((p: any) => String(p.report_id) === String(r.id));
        return { ...r, photos: mine };
      });
      return NextResponse.json({ ok: true, reports: out, open: open });
    }

    if (action === 'seen' || action === 'close') {
      if (!isOwner) return NextResponse.json({ error: 'This is for the owner only.' }, { status: 403 });
      const id = String(body.id || '');
      if (!id) return NextResponse.json({ error: 'Missing the report.' }, { status: 400 });
      const patch: any = { owner_seen: true };
      if (action === 'close') {
        patch.status = 'closed';
        patch.closed_at = new Date().toISOString();
      }
      const upd = await sb.from('accident_reports').update(patch).eq('id', id);
      if (upd.error) return NextResponse.json({ error: 'Could not save that.' }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown request.' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong with the accident report.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sb = adminClient();
    const list = await sb
      .from('accident_reports')
      .select('id, created_at, ride_id, driver_id, driver_name, details, injuries, officer_name, officer_badge, report_number, other_driver, other_vehicle, other_plate, other_insurance, mph, limit_mph, lat, lng, address, status')
      .order('created_at', { ascending: false })
      .limit(60);
    if (list.error) {
      return NextResponse.json({ error: 'Could not read the accident reports.' }, { status: 500 });
    }
    const reports: any[] = list.data ? list.data : [];
    const ids = reports.map((r: any) => r.id);
    let photos: any[] = [];
    if (ids.length > 0) {
      const ph = await sb.from('accident_photos').select('id, report_id, kind, path, created_at').in('report_id', ids);
      photos = ph.data ? ph.data : [];
      await signPhotos(sb, photos);
    }
    let codes: any = {};
    const driverIds: string[] = [];
    for (const r of reports) {
      if (r.driver_id && driverIds.indexOf(String(r.driver_id)) < 0) driverIds.push(String(r.driver_id));
    }
    if (driverIds.length > 0) {
      try {
        const d = await sb.from('drivers').select('id, driver_code').in('id', driverIds);
        const rows: any[] = d.data ? d.data : [];
        for (const one of rows) codes[String(one.id)] = one.driver_code ? String(one.driver_code) : '';
      } catch (e) {}
    }
    const out = reports.map((r: any) => {
      const mine = photos.filter((p: any) => String(p.report_id) === String(r.id));
      return { ...r, driver_code: codes[String(r.driver_id)] ? codes[String(r.driver_id)] : '', photos: mine };
    });
    return NextResponse.json({ ok: true, reports: out });
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong reading the accident reports.' }, { status: 500 });
  }
}
