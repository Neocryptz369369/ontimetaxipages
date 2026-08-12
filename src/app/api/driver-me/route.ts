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

    if (!token) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    }

    const sb = adminClient();
    const got = await sb.auth.getUser(token);

    if (got.error || !got.data || !got.data.user) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    }

    const user = got.data.user;

    const found = await sb
      .from('drivers')
      .select('driver_code, full_name, email, phone, photo_url, status, called_in, created_at')
      .eq('id', user.id)
      .maybeSingle();

    if (found.error) {
      return NextResponse.json({ error: 'Could not load your driver record.' }, { status: 500 });
    }

    if (!found.data) {
      return NextResponse.json({ ok: true, driver: null, email: user.email || '' });
    }

    let photoUrl = '';
    if (found.data.photo_url) {
      const pub = sb.storage.from('profile-photos').getPublicUrl(String(found.data.photo_url));
      photoUrl = pub && pub.data ? pub.data.publicUrl : '';
    }

    return NextResponse.json({
      ok: true,
      email: user.email || '',
      driver: {
        driverCode: found.data.driver_code || '',
        fullName: found.data.full_name || '',
        email: found.data.email || '',
        phone: found.data.phone || '',
        status: found.data.status || 'pending',
        calledIn: found.data.called_in === true,
        photoUrl: photoUrl,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong loading your account.' }, { status: 500 });
  }
}
