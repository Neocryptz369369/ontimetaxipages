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
    const driverId = String(body.driverId || '').trim();

    if (!driverId) {
      return NextResponse.json({ error: 'No driver was asked for.' }, { status: 400 });
    }

    const sb = adminClient();
    const carCols = 'driver_code, full_name, phone, photo_url, vehicle_make, vehicle_model, vehicle_year, vehicle_color, vehicle_plate';
    const plainCols = 'driver_code, full_name, phone, photo_url';

    let found: any = await sb.from('drivers').select(carCols).eq('id', driverId).maybeSingle();
    if (found.error) {
      found = await sb.from('drivers').select(plainCols).eq('id', driverId).maybeSingle();
    }

    if (found.error || !found.data) {
      return NextResponse.json({ ok: true, driver: null });
    }

    const row: any = found.data;
    let photoUrl = '';
    if (row.photo_url) {
      if (String(row.photo_url).indexOf('http') === 0) {
        photoUrl = String(row.photo_url);
      } else {
        const pub = sb.storage.from('profile-photos').getPublicUrl(String(row.photo_url));
        photoUrl = pub && pub.data ? pub.data.publicUrl : '';
      }
    }

    return NextResponse.json({
      ok: true,
      driver: {
        driver_code: row.driver_code || '',
        full_name: row.full_name || '',
        phone: row.phone || '',
        photo_url: photoUrl,
        vehicle_make: row.vehicle_make || '',
        vehicle_model: row.vehicle_model || '',
        vehicle_year: row.vehicle_year || '',
        vehicle_color: row.vehicle_color || '',
        vehicle_plate: row.vehicle_plate || '',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Could not load the driver details.' }, { status: 500 });
  }
}
