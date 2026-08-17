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

    const fullName = String(body.fullName || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    const password = String(body.password || '');
    const photo = String(body.photo || '');
    const agreedToRecording = body.agreedToRecording === true;
    const agreementText = String(body.agreementText || '');
    const feeAgreementText = String(body.feeAgreementText || '');
    const recordingSignature = body.recordingSignature || {};
    const feeSignature = body.feeSignature || {};
    const recordingSignName = String(recordingSignature.name || '').trim();
    const recordingSignImage = String(recordingSignature.image || '');
    const feeSignName = String(feeSignature.name || '').trim();
    const feeSignImage = String(feeSignature.image || '');
    const signedNow = new Date().toISOString();

    if (!fullName) return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
    if (!email || email.indexOf('@') < 1) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    if (!phone) return NextResponse.json({ error: 'Please enter your phone number.' }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: 'Your password must be at least 8 characters.' }, { status: 400 });
    if (photo.slice(0, 11) !== 'data:image/') return NextResponse.json({ error: 'A clear photo of your face is required.' }, { status: 400 });
    if (!agreedToRecording) return NextResponse.json({ error: 'Please sign the recording agreement.' }, { status: 400 });
    if (recordingSignName.length < 3 || recordingSignImage.slice(0, 11) !== 'data:image/') {
      return NextResponse.json({ error: 'Please type your full name and then sign your name in the recording agreement box.' }, { status: 400 });
    }
    if (feeSignName.length < 3 || feeSignImage.slice(0, 11) !== 'data:image/') {
      return NextResponse.json({ error: 'Please type your full name and then sign your name in the box about the 5 dollar get in fee and the 20 percent.' }, { status: 400 });
    }

    const sb = adminClient();

    const created = await sb.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone: phone, role: 'driver' },
    });

    if (created.error || !created.data || !created.data.user) {
      const msg = String(created.error && created.error.message ? created.error.message : '').toLowerCase();
      if (msg.indexOf('already') >= 0 || msg.indexOf('registered') >= 0) {
        return NextResponse.json({ error: 'An account already exists for that email address. Use the driver sign in instead.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Could not create your account. Please check your details and try again.' }, { status: 400 });
    }

    const userId = created.data.user.id;

    let photoPath: string | null = null;
    try {
      const comma = photo.indexOf(',');
      const contentType = photo.slice(5, comma).split(';')[0];
      const bytes = Buffer.from(photo.slice(comma + 1), 'base64');
      const ext = contentType === 'image/png' ? 'png' : 'jpg';
      const path = userId + '/avatar.' + ext;
      const up = await sb.storage.from('profile-photos').upload(path, bytes, { upsert: true, contentType: contentType });
      if (!up.error) photoPath = path;
    } catch (photoErr) {
      photoPath = null;
    }

    const inserted = await sb
      .from('drivers')
      .insert({
        id: userId,
        full_name: fullName,
        email: email,
        phone: phone,
        photo_url: photoPath,
        status: 'pending',
      })
      .select('driver_code')
      .single();

    if (inserted.error) {
      try {
        await sb.auth.admin.deleteUser(userId);
      } catch (cleanupErr) {
        // If cleanup fails the owner can remove the stray account from the dashboard.
      }
      return NextResponse.json({ error: 'Could not save your application. Please try again.' }, { status: 500 });
    }

    let consentSaved = false;
    try {
      const papers = [
        { kind: 'recording', words: agreementText, who: recordingSignName, ink: recordingSignImage },
        { kind: 'fee', words: feeAgreementText, who: feeSignName, ink: feeSignImage },
      ];
      let allGood = true;
      for (let i = 0; i < papers.length; i++) {
        const paper = papers[i];
        let consent = await sb.from('recording_consents').insert({
          person_type: 'driver',
          full_name: fullName,
          email: email,
          phone: phone,
          user_id: userId,
          agreed: true,
          agreement_text: paper.words,
          agreement_type: paper.kind,
          signature_name: paper.who,
          signature_image: paper.ink,
          signed_at: signedNow,
        });
        if (consent.error) {
          consent = await sb.from('recording_consents').insert({
            person_type: 'driver',
            full_name: fullName,
            email: email,
            phone: phone,
            user_id: userId,
            agreed: true,
            agreement_text: paper.words,
          });
        }
        if (consent.error) allGood = false;
      }
      consentSaved = allGood;
    } catch (consentErr) {
      consentSaved = false;
    }

    try {
      const stamped = await sb
        .from('drivers')
        .update({ recording_consent_at: signedNow, fee_agreement_at: signedNow })
        .eq('id', userId);
      if (stamped.error) {
        await sb.from('drivers').update({ recording_consent_at: signedNow }).eq('id', userId);
      }
    } catch (stampErr) {
      // The date stamps are a nice extra. The signed papers above are the real record.
    }

    return NextResponse.json({
      ok: true,
      driverId: userId,
      driverCode: inserted.data ? inserted.data.driver_code : null,
      photoSaved: photoPath !== null,
      consentSaved: consentSaved,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
