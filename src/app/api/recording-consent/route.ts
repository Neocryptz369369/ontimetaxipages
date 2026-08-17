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
      return NextResponse.json({ error: 'The agreement was not accepted.' }, { status: 400 });
    }

    const signatureName = String(body.signatureName || body.fullName || '').trim();
    const signatureImage = String(body.signatureImage || '');
    const signedAt = body.signedAt ? String(body.signedAt) : new Date().toISOString();

    const basic = {
      person_type: String(body.personType || 'rider'),
      full_name: String(body.fullName || ''),
      email: String(body.email || '').toLowerCase(),
      phone: String(body.phone || ''),
      user_id: body.userId ? String(body.userId) : null,
      agreed: true,
      agreement_text: String(body.agreementText || ''),
    };

    const full = {
      person_type: basic.person_type,
      full_name: basic.full_name,
      email: basic.email,
      phone: basic.phone,
      user_id: basic.user_id,
      agreed: true,
      agreement_text: basic.agreement_text,
      agreement_type: String(body.agreementType || 'recording'),
      signature_name: signatureName,
      signature_image: signatureImage,
      signed_at: signedAt,
    };

    const sb = adminClient();

    let saved = await sb.from('recording_consents').insert(full);

    if (saved.error) {
      saved = await sb.from('recording_consents').insert(basic);
    }

    if (saved.error) {
      return NextResponse.json({ error: 'Could not save the signed agreement.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong saving the signed agreement.' }, { status: 500 });
  }
}
