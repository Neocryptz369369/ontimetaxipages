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
    if (!token) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });

    const rideId = body.rideId ? String(body.rideId) : '';
    const mph = Number(body.mph);
    const limitMph = body.limitMph === null || body.limitMph === undefined ? 0 : Number(body.limitMph);
    const lat = body.lat === null || body.lat === undefined ? null : Number(body.lat);
    const lng = body.lng === null || body.lng === undefined ? null : Number(body.lng);

    if (!isFinite(mph) || mph < 0) return NextResponse.json({ ok: true, ignored: true });

    const sb = adminClient();
    const got = await sb.auth.getUser(token);
    if (got.error || !got.data || !got.data.user) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    }
    const user = got.data.user;
    const email = String(user.email || '').toLowerCase();

    let driver: any = null;
    try {
      const found = await sb.from('drivers').select('id, full_name, driver_code, status, speeding_strikes').eq('id', user.id).maybeSingle();
      if (!found.error && found.data) driver = found.data;
    } catch (e) {}

    const isOwner = email === OWNER_EMAIL;

    if (driver) {
      try {
        await sb
          .from('drivers')
          .update({
            last_lat: lat,
            last_lng: lng,
            last_mph: Math.round(mph),
            last_limit_mph: limitMph > 0 ? Math.round(limitMph) : null,
            last_seen_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      } catch (e) {}
    }

    if (lat !== null && lng !== null && isFinite(lat) && isFinite(lng)) {
      try {
        const pingSince = new Date(Date.now() - 15000).toISOString();
        const lastPing = await sb
          .from('driver_pings')
          .select('id')
          .eq('driver_id', user.id)
          .gte('created_at', pingSince)
          .limit(1);
        if (!lastPing.error && (!lastPing.data || lastPing.data.length === 0)) {
          await sb.from('driver_pings').insert({
            driver_id: user.id,
            lat: lat,
            lng: lng,
            mph: Math.round(mph),
            limit_mph: limitMph > 0 ? Math.round(limitMph) : null,
          });
        }
      } catch (e) {}
    }
    
    const overBy = limitMph > 0 ? Math.round(mph) - Math.round(limitMph) : 0;

    if (limitMph <= 0 || overBy < 4) {
      return NextResponse.json({ ok: true, logged: false, removed: false });
    }

    if (isOwner && !driver) {
      return NextResponse.json({ ok: true, logged: false, removed: false, owner: true });
    }

    let logged = false;
    try {
      const since = new Date(Date.now() - 20000).toISOString();
      const recent = await sb
        .from('speed_events')
        .select('id')
        .eq('driver_id', user.id)
        .gte('created_at', since)
        .limit(1);
      if (!recent.error && (!recent.data || recent.data.length === 0)) {
        const ins = await sb.from('speed_events').insert({
          driver_id: user.id,
          driver_name: driver && driver.full_name ? String(driver.full_name) : 'On Time Taxi owner',
          driver_code: driver && driver.driver_code ? String(driver.driver_code) : null,
          ride_id: rideId ? rideId : null,
          mph: Math.round(mph),
          limit_mph: Math.round(limitMph),
          over_by: overBy,
          lat: lat,
          lng: lng,
          removed: false,
          seen: false,
        });
        if (!ins.error) logged = true;
      }
    } catch (e) {}

    if (overBy < 15 || !rideId || !driver) {
      return NextResponse.json({ ok: true, logged: logged, removed: false });
    }

    let removed = false;
    try {
      const cur = await sb
        .from('rides')
        .select('id, status, driver_id, no_pay_driver_ids')
        .eq('id', rideId)
        .maybeSingle();
      const row: any = cur.data;
      if (row && String(row.driver_id) === String(user.id) && (String(row.status) === 'accepted' || String(row.status) === 'picked_up')) {
        const list: any[] = Array.isArray(row.no_pay_driver_ids) ? row.no_pay_driver_ids : [];
        if (list.indexOf(String(user.id)) < 0) list.push(String(user.id));
        const upd = await sb
          .from('rides')
          .update({
            status: 'requested',
            driver_id: null,
            driver_name: null,
            driver_phone: null,
            driver_lat: null,
            driver_lng: null,
            accepted_at: null,
            driver_confirmed_pickup: false,
            removed_driver_id: user.id,
            removed_driver_name: String(driver.full_name || ''),
            removed_reason: 'Went ' + overBy + ' mph over the posted speed limit',
            removed_at: new Date().toISOString(),
            handoff_needed: true,
            no_pay_driver_ids: list,
          })
          .eq('id', rideId)
          .eq('driver_id', user.id);
        if (!upd.error) removed = true;
      }
    } catch (e) {}

    if (removed) {
      try {
        const strikes = driver && driver.speeding_strikes ? Number(driver.speeding_strikes) : 0;
        await sb.from('drivers').update({ speeding_strikes: strikes + 1 }).eq('id', user.id);
      } catch (e) {}
      try {
        await sb.from('speed_events').insert({
          driver_id: user.id,
          driver_name: String(driver.full_name || ''),
          driver_code: driver && driver.driver_code ? String(driver.driver_code) : null,
          ride_id: rideId,
          mph: Math.round(mph),
          limit_mph: Math.round(limitMph),
          over_by: overBy,
          lat: lat,
          lng: lng,
          removed: true,
          seen: false,
        });
      } catch (e) {}
    }

    return NextResponse.json({
      ok: true,
      logged: logged,
      removed: removed,
      message: removed
        ? 'You have been taken off this run for going ' + overBy + ' mph over the speed limit. You are not paid for this run. Another driver is being sent to take it over.'
        : '',
    });
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong saving the speed.' }, { status: 500 });
  }
}
