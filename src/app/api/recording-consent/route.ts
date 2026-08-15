import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.agreed !== true) {
      return NextResponse.json({ error: 'The recording agreement was not accepted.' }, { status: 400 });
    }

    const row = {
      person_type: String(body.personType || 'rider'),
      full_name: String(body.fullName || ''),
      email: String(body.email || '').toLowerCase(),
      phone: String(body.phone || ''),
      user_id: body.userId ? String(body.userId) : null,
      agreed: true,
      agreement_text: String(body.agreementText || ''),
    };

    const sb = adminClient();
    const saved = await sb.from('recording_consents').insert(row);

    if (saved.error) {
      return NextResponse.json({ error: 'Could not save the recording agreement.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong saving the recording agreement.' }, { status: 500 });
  }
}
