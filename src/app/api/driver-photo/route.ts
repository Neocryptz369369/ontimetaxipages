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
    const photo = String(body.photo || '');
    const email = String(body.email || '').trim().toLowerCase();

    if (photo.slice(0, 11) !== 'data:image/') {
      return NextResponse.json({ error: 'Please choose a picture file.' }, { status: 400 });
    }

    const comma = photo.indexOf(',');
    if (comma < 1) {
      return NextResponse.json({ error: 'That picture could not be read.' }, { status: 400 });
    }

    const contentType = photo.slice(5, comma).split(';')[0];
    const bytes = Buffer.from(photo.slice(comma + 1), 'base64');

    if (bytes.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Please choose a picture smaller than 5 MB.' }, { status: 400 });
    }

    let ext = 'jpg';
    if (contentType.indexOf('png') >= 0) ext = 'png';
    if (contentType.indexOf('webp') >= 0) ext = 'webp';

    const stamp = String(Date.now());
    const tail = Math.random().toString(36).slice(2, 8);
    const path = 'uploads/driver-' + stamp + '-' + tail + '.' + ext;

    const sb = adminClient();

    const up = await sb.storage.from('profile-photos').upload(path, bytes, { upsert: true, contentType: contentType });
    if (up.error) {
      return NextResponse.json({ error: 'The picture could not be saved. Please try again.' }, { status: 500 });
    }

    const pub = sb.storage.from('profile-photos').getPublicUrl(path);
    const publicUrl = pub && pub.data ? pub.data.publicUrl : '';

    if (email) {
      await sb.from('drivers').update({ photo_url: path }).eq('email', email);
    }

    return NextResponse.json({ ok: true, path: path, url: publicUrl });
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong saving the picture.' }, { status: 500 });
  }
}
