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

    if (!token) {
      return NextResponse.json({ error: 'Please sign in with the owner account.' }, { status: 401 });
    }

    const sb = adminClient();

    const who = await sb.auth.getUser(token);
    const email = who.data && who.data.user ? String(who.data.user.email || '').toLowerCase() : '';

    if (!email || email !== OWNER_EMAIL) {
      return NextResponse.json({ error: 'Owner only.' }, { status: 403 });
    }

    let rows = await sb
      .from('recording_consents')
      .select('*')
      .order('signed_at', { ascending: false })
      .limit(300);

    if (rows.error) {
      rows = await sb
        .from('recording_consents')
        .select('*')
        .order('agreed_at', { ascending: false })
        .limit(300);
    }

    if (rows.error) {
      rows = await sb.from('recording_consents').select('*').limit(300);
    }

    if (rows.error) {
      return NextResponse.json({ error: 'Could not load the signed agreements.' }, { status: 500 });
    }

    const list = (rows.data || []).map(function (r: any) {
      return {
        id: String(r.id),
        personType: String(r.person_type || 'rider'),
        agreementType: String(r.agreement_type || 'recording'),
        fullName: String(r.full_name || ''),
        email: String(r.email || ''),
        phone: String(r.phone || ''),
        userId: r.user_id ? String(r.user_id) : '',
        signatureName: String(r.signature_name || ''),
        signatureImage: String(r.signature_image || ''),
        signedAt: String(r.signed_at || r.created_at || ''),
        agreementText: String(r.agreement_text || ''),
      };
    });

    return NextResponse.json({ ok: true, consents: list });
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong loading the signed agreements.' }, { status: 500 });
  }
}
