import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function clean(v: any) {
  const s = v === null || v === undefined ? '' : String(v);
  return s.trim().slice(0, 120);
}

function phoneClean(v: any) {
  const d = String(v === null || v === undefined ? '' : v).replace(/[^0-9]/g, '');
  const ten = d.length === 11 && d.charAt(0) === '1' ? d.slice(1) : d;
  if (ten.length === 10) return ten.slice(0, 3) + '-' + ten.slice(3, 6) + '-' + ten.slice(6);
  return ten;
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

    const me = got.data.user.id;

    const mine = await sb.from('drivers').select('id').eq('id', me).maybeSingle();

    if (!mine.data) {
      return NextResponse.json({ error: 'You do not have a driver account yet.' }, { status: 400 });
    }

    const name = clean(body.fullName);
    const phone = phoneClean(body.phone);
    const make = clean(body.make);
    const model = clean(body.model);
    const color = clean(body.color);
    const plate = clean(body.plate).toUpperCase();
    const yearText = clean(body.year);

    if (!name) {
      return NextResponse.json({ error: 'Please put in your name.' }, { status: 400 });
    }

    const patch: any = {
      full_name: name,
      phone: phone,
      vehicle_make: make,
      vehicle_model: model,
      vehicle_color: color,
      vehicle_plate: plate,
    };

    const yearNum = Number(yearText);

    if (!yearText) {
      patch.vehicle_year = null;
    } else if (yearNum > 1900 && yearNum < 2100) {
      patch.vehicle_year = yearNum;
    }

    const cols = 'full_name, phone, vehicle_make, vehicle_model, vehicle_year, vehicle_color, vehicle_plate';

    let saved: any = await sb.from('drivers').update(patch).eq('id', me).select(cols).maybeSingle();

    if (saved.error && patch.vehicle_year) {
      patch.vehicle_year = String(patch.vehicle_year);
      saved = await sb.from('drivers').update(patch).eq('id', me).select(cols).maybeSingle();
    }

    if (saved.error) {
      return NextResponse.json({ error: 'Could not save your details. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, driver: saved.data });
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong saving your details.' }, { status: 500 });
  }
}
