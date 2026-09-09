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

    const sb = adminClient();
    const got = await sb.auth.getUser(token);
    if (got.error || !got.data || !got.data.user) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    }
    const email = String(got.data.user.email || '').toLowerCase();
    if (email !== OWNER_EMAIL) {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
    }

    const res = await sb.from('profiles').select('id, full_name, phone').limit(3000);
    if (res.error) {
      return NextResponse.json({ error: res.error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, riders: res.data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
