'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

const OWNER_PHONE = '(930) 216-4166';
const OWNER_TEL = 'tel:+19302164166';
const GET_IN_FEE = 5;
const COMPANY_PCT = 20;
const BUCKET = 'profile-photos';

type DriverRow = {
  id: string;
  driver_code: string | null;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  photo_url: string | null;
  status: string | null;
  called_in: boolean | null;
  suspended_reason: string | null;
};

function errText(e: any): string {
  if (!e) return 'Something went wrong. Please try again.';
  if (typeof e === 'string') return e;
  return String(e.message || e.error_description || e.hint || 'Something went wrong. Please try again.');
}

function publicPhoto(path: string | null): string | null {
  if (!path) return null;
  if (path.indexOf('http') === 0) return path;
  try {
    const r = supabase.storage.from(BUCKET).getPublicUrl(path);
    return (r && r.data && r.data.publicUrl) ? r.data.publicUrl : null;
  } catch (e) {
    return null;
  }
}

async function uploadDriverPhoto(userId: string, photo: File): Promise<string> {
  const ext = (photo.name.split('.').pop() || 'jpg').toLowerCase();
  const path = userId + '/avatar.' + ext;
  const up = await supabase.storage.from(BUCKET).upload(path, photo, { upsert: true, contentType: photo.type });
  if (up.error) throw up.error;
  return path;
}

const card: any = { background: '#fff', borderRadius: 18, border: '1px solid #e5e7eb', boxShadow: '0 10px 30px rgba(15,23,42,0.06)', padding: 24 };
const label: any = { display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', margin: '0 0 6px' };
const input: any = { width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 15, marginBottom: 14, background: '#fff', color: '#0f172a' };
const primary: any = { width: '100%', padding: '14px 18px', borderRadius: 12, border: 'none', background: '#2563eb', color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer' };

export default function DrivePage() {
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [driver, setDriver] = useState<DriverRow | null>(null);

  const [mode, setMode] = useState<'apply' | 'signin'>('apply');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function load() {
    try {
      const got = await supabase.auth.getUser();
      const u = (got && got.data) ? got.data.user : null;
      if (!u) {
        setUserId(null);
        setUserEmail(null);
        setDriver(null);
        setReady(true);
        return;
      }
      setUserId(u.id);
      setUserEmail(u.email || null);
      const res = await supabase.from('drivers').select('*').eq('id', u.id).maybeSingle();
      const row = (res && res.data) ? (res.data as DriverRow) : null;
      setDriver(row);
      if (!row) {
        const md: any = u.user_metadata || {};
        if (md.full_name) setFullName(String(md.full_name));
        if (md.phone) setPhone(String(md.phone));
      }
    } catch (e) {
      setError(errText(e));
    }
    setReady(true);
  }

  useEffect(() => { load(); }, []);

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = (e.target.files && e.target.files[0]) ? e.target.files[0] : null;
    setPhoto(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function saveApplication(uid: string, mail: string) {
    let photoPath: string | null = null;
    if (photo) {
      try { photoPath = await uploadDriverPhoto(uid, photo); } catch (e) { photoPath = null; }
    }
    const payload: any = {
      id: uid,
      email: mail,
      full_name: fullName.trim(),
      phone: phone.trim(),
    };
    if (photoPath) payload.photo_url = photoPath;
    const res = await supabase.from('drivers').upsert(payload, { onConflict: 'id' });
    if (res.error) throw res.error;
  }

  async function onApply(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!phone.trim()) { setError('Please enter your phone number.'); return; }
    if (password.length < 6) { setError('Your password must be at least 6 characters.'); return; }
    if (password !== confirmPw) { setError('The two passwords do not match.'); return; }
    if (!photo) { setError('Please add a photo of yourself. Riders will see it so they know who is picking them up.'); return; }
    setBusy(true);
    try {
      const out = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: { full_name: fullName.trim(), phone: phone.trim(), driver_application: true },
          emailRedirectTo: window.location.origin + '/drive',
        },
      });
      if (out.error) throw out.error;
      const u = (out.data && out.data.user) ? out.data.user : null;
      const hasSession = !!(out.data && out.data.session);
      if (u && hasSession) {
        await saveApplication(u.id, email.trim());
        await load();
      } else {
        setCheckEmail(true);
      }
    } catch (e) {
      setError(errText(e));
    }
    setBusy(false);
  }

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const out = await supabase.auth.signInWithPassword({ email: email.trim(), password: password });
      if (out.error) throw out.error;
      await load();
    } catch (e) {
      setError(errText(e));
    }
    setBusy(false);
  }

  async function onFinish(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!userId) return;
    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    if (!phone.trim()) { setError('Please enter your phone number.'); return; }
    if (!photo) { setError('Please add a photo of yourself.'); return; }
    setBusy(true);
    try {
      await saveApplication(userId, userEmail || email.trim());
      await load();
      setNotice('Your application was sent to On Time Taxi.');
    } catch (e) {
      setError(errText(e));
    }
    setBusy(false);
  }

  async function onSignOut() {
    setBusy(true);
    try { await supabase.auth.signOut(); } catch (e) {}
    setDriver(null);
    setUserId(null);
    setUserEmail(null);
    setBusy(false);
  }

  const status = driver && driver.status ? String(driver.status) : null;
  const shot = driver ? publicPhoto(driver.photo_url) : null;

  const payTerms = (
    <div style={card}>
      <h2 style={{ margin: '0 0 10px', fontSize: 22, color: '#0f172a' }}>How you get paid</h2>
      <p style={{ margin: '0 0 14px', color: '#475569', lineHeight: 1.7 }}>
        Every ride you run is paid out to you by On Time Taxi. Two things come out of each ride first:
      </p>
      <ul style={{ margin: '0 0 14px', padding: '0 0 0 20px', color: '#334155', lineHeight: 1.9 }}>
        <li>A get-in fee of five dollars from each ride goes to On Time Taxi.</li>
        <li>On Time Taxi keeps twenty percent of what is left after the get-in fee.</li>
        <li>The rest is yours.</li>
      </ul>
      <div style={{ background: '#f1f5ff', border: '1px solid #dbe4ff', borderRadius: 12, padding: 16, color: '#1e3a8a', lineHeight: 1.8 }}>
        <strong>Example on a twenty five dollar ride:</strong>
        <br />Twenty five dollars, minus the five dollar get-in fee, leaves twenty dollars.
        <br />Twenty percent of that is four dollars for On Time Taxi.
        <br />You keep sixteen dollars.
      </div>
      <p style={{ margin: '14px 0 0', color: '#475569', lineHeight: 1.7 }}>
        Your driver area shows what you made each day with the get-in fees and the twenty percent already taken out, so the number you see is the number you keep.
      </p>
    </div>
  );

  const requirements = (
    <div style={card}>
      <h2 style={{ margin: '0 0 10px', fontSize: 22, color: '#0f172a' }}>What you need before you can drive</h2>
      <ul style={{ margin: 0, padding: '0 0 0 20px', color: '#334155', lineHeight: 1.9 }}>
        <li>A valid driver license.</li>
        <li>A clean driving record.</li>
        <li>A background check.</li>
        <li>A clear photo of your face for your profile. Riders see this photo.</li>
        <li>
          You must call On Time Taxi at <a href={OWNER_TEL} style={{ color: '#2563eb', fontWeight: 700 }}>{OWNER_PHONE}</a> and talk to Dennis. Nobody is approved to drive until Dennis approves them.
        </li>
      </ul>
    </div>
  );

  const photoField = (
    <div style={{ marginBottom: 16 }}>
      <span style={label}>Your photo (required)</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', background: '#e2e8f0', flex: '0 0 auto', border: '1px solid #cbd5e1' }}>
          {preview ? <img src={preview} alt="Your photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
        </div>
        <input type="file" accept="image/*" onChange={onPhoto} style={{ fontSize: 14 }} />
      </div>
      <p style={{ margin: '8px 0 0', fontSize: 13, color: '#64748b' }}>Riders will see this photo so they know who is picking them up.</p>
    </div>
  );

  let body: any = null;

  if (!ready) {
    body = <div style={card}><p style={{ margin: 0, color: '#475569' }}>Loading...</p></div>;
  } else if (checkEmail) {
    body = (
      <div style={card}>
        <h2 style={{ margin: '0 0 10px', fontSize: 22, color: '#0f172a' }}>Check your email</h2>
        <p style={{ margin: '0 0 14px', color: '#475569', lineHeight: 1.7 }}>
          We sent a confirmation link to <strong data-notranslate="1">{email}</strong>. Open it, then come back to this page and sign in to finish your driver application.
        </p>
        <button type="button" style={primary} onClick={() => { setCheckEmail(false); setMode('signin'); }}>Sign in now</button>
      </div>
    );
  } else if (driver) {
    body = (
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', background: '#e2e8f0', flex: '0 0 auto' }}>
            {shot ? <img src={shot} alt="Driver photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }} data-notranslate="1">{driver.full_name || userEmail}</div>
            <div style={{ fontSize: 14, color: '#64748b' }}>
              Driver ID: <strong data-notranslate="1">{driver.driver_code || 'being assigned'}</strong>
            </div>
          </div>
        </div>

        {status === 'pending' ? (
          <div style={{ background: '#fff7e6', border: '1px solid #fde68a', borderRadius: 12, padding: 16, color: '#7c4a03', lineHeight: 1.8 }}>
            <strong>Your application is waiting on approval.</strong>
            <br />Call On Time Taxi at <a href={OWNER_TEL} style={{ color: '#7c4a03', fontWeight: 800 }}>{OWNER_PHONE}</a> and talk to Dennis. You cannot take rides until Dennis approves you.
          </div>
        ) : null}

        {status === 'approved' ? (
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, padding: 16, color: '#065f46', lineHeight: 1.8 }}>
            <strong>You are approved to drive.</strong>
            <br />Your driver area is being finished. Keep your driver ID handy, you will sign in with it.
          </div>
        ) : null}

        {status === 'suspended' ? (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 16, color: '#991b1b', lineHeight: 1.8 }}>
            <strong>Your account is suspended while a report is investigated.</strong>
            <br />You cannot take rides right now. Call On Time Taxi at <a href={OWNER_TEL} style={{ color: '#991b1b', fontWeight: 800 }}>{OWNER_PHONE}</a>.
            {driver.suspended_reason ? <span><br />Reason on file: <span data-notranslate="1">{driver.suspended_reason}</span></span> : null}
          </div>
        ) : null}

        {status === 'rejected' ? (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 16, color: '#991b1b', lineHeight: 1.8 }}>
            <strong>This application was not approved.</strong>
            <br />Call On Time Taxi at <a href={OWNER_TEL} style={{ color: '#991b1b', fontWeight: 800 }}>{OWNER_PHONE}</a> if you think this is a mistake.
          </div>
        ) : null}

        {notice ? <p style={{ margin: '14px 0 0', color: '#065f46', fontWeight: 700 }}>{notice}</p> : null}

        <button type="button" onClick={onSignOut} disabled={busy} style={{ marginTop: 18, padding: '10px 16px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: 700, cursor: 'pointer' }}>Sign out</button>
      </div>
    );
  } else if (userId) {
    body = (
      <div style={card}>
        <h2 style={{ margin: '0 0 6px', fontSize: 22, color: '#0f172a' }}>Finish your driver application</h2>
        <p style={{ margin: '0 0 18px', color: '#475569', lineHeight: 1.7 }}>You are signed in as <strong data-notranslate="1">{userEmail}</strong>. Fill this in and your application goes straight to Dennis.</p>
        <form onSubmit={onFinish}>
          <span style={label}>Full name</span>
          <input style={input} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="First and last name" />
          <span style={label}>Phone number</span>
          <input style={input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your cell number" />
          {photoField}
          {error ? <p style={{ margin: '0 0 12px', color: '#b91c1c', fontWeight: 700 }}>{error}</p> : null}
          <button type="submit" style={primary} disabled={busy}>{busy ? 'Sending...' : 'Send my application'}</button>
        </form>
        <button type="button" onClick={onSignOut} disabled={busy} style={{ marginTop: 14, padding: '10px 16px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: 700, cursor: 'pointer' }}>Sign out</button>
      </div>
    );
  } else if (mode === 'signin') {
    body = (
      <div style={card}>
        <h2 style={{ margin: '0 0 6px', fontSize: 22, color: '#0f172a' }}>Driver sign in</h2>
        <p style={{ margin: '0 0 18px', color: '#475569', lineHeight: 1.7 }}>Already applied? Sign in to see where your application stands.</p>
        <form onSubmit={onSignIn}>
          <span style={label}>Email address</span>
          <input style={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <span style={label}>Password</span>
          <input style={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
          {error ? <p style={{ margin: '0 0 12px', color: '#b91c1c', fontWeight: 700 }}>{error}</p> : null}
          <button type="submit" style={primary} disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
        </form>
        <p style={{ margin: '16px 0 0', color: '#475569' }}>
          Not applied yet? <button type="button" onClick={() => { setMode('apply'); setError(null); }} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 800, cursor: 'pointer', padding: 0, fontSize: 15 }}>Start a driver application</button>
        </p>
      </div>
    );
  } else {
    body = (
      <div style={card}>
        <h2 style={{ margin: '0 0 6px', fontSize: 22, color: '#0f172a' }}>Apply to drive</h2>
        <p style={{ margin: '0 0 18px', color: '#475569', lineHeight: 1.7 }}>Fill this in once. Dennis reviews every application himself and you must call him before you are approved.</p>
        <form onSubmit={onApply}>
          <span style={label}>Full name</span>
          <input style={input} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="First and last name" />
          <span style={label}>Email address</span>
          <input style={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <span style={label}>Phone number</span>
          <input style={input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your cell number" />
          <span style={label}>Create a password</span>
          <input style={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          <span style={label}>Type the password again</span>
          <input style={input} type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Same password again" />
          {photoField}
          {error ? <p style={{ margin: '0 0 12px', color: '#b91c1c', fontWeight: 700 }}>{error}</p> : null}
          <button type="submit" style={primary} disabled={busy}>{busy ? 'Sending...' : 'Send my driver application'}</button>
        </form>
        <p style={{ margin: '16px 0 0', color: '#475569' }}>
          Already applied? <button type="button" onClick={() => { setMode('signin'); setError(null); }} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 800, cursor: 'pointer', padding: 0, fontSize: 15 }}>Sign in here</button>
        </p>
      </div>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fb', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg,#0b1a3a,#123a7a)', color: '#fff', padding: '54px 20px 60px' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#8fdcff', marginBottom: 10 }}>Drive with us</div>
          <h1 style={{ margin: 0, fontSize: 40, lineHeight: 1.08 }}>Become an On Time Taxi driver</h1>
          <p style={{ margin: '12px 0 0', color: '#d9e5ff', fontSize: 17, lineHeight: 1.7, maxWidth: 780 }}>
            Apply below and you get your own driver ID and your own sign in. Once Dennis approves you, ride requests come to you and the first driver to accept gets the ride.
          </p>
          <div style={{ marginTop: 20 }}>
            <Link href="/" style={{ color: '#8fdcff', textDecoration: 'underline', fontWeight: 700 }}>Back to home</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1040, margin: '-28px auto 60px', padding: '0 20px', display: 'grid', gap: 20, gridTemplateColumns: 'minmax(0,1fr)' }}>
        {body}
        {payTerms}
        {requirements}
      </div>
    </main>
  );
}
