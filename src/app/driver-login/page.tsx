'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import RecordingAgreement, { FeeAgreement, RECORDING_AGREEMENT_TEXT, FEE_AGREEMENT_TEXT, blankSignature, isSigned } from '../../components/RecordingAgreement';
import RatingBox, { starRow } from '../../components/RatingBox';

type DriverInfo = {
  driverCode: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  calledIn: boolean;
  photoUrl: string;
};

const shell = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg,#f8fafc 0%,#eef2ff 100%)',
  fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,sans-serif',
  padding: '32px 16px',
};

const card = {
  background: '#fff',
  borderRadius: 20,
  border: '1px solid #e5e7eb',
  boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
  padding: 28,
};

const label = { display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 };

const input = {
  width: '100%',
  boxSizing: 'border-box' as const,
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid #cbd5e1',
  fontSize: 16,
  marginBottom: 14,
};

const mainButton = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: 12,
  border: 'none',
  background: '#2563eb',
  color: '#fff',
  fontSize: 16,
  fontWeight: 800,
  cursor: 'pointer',
};

function statusLook(status: string) {
  if (status === 'approved') {
    return { text: 'Approved to drive', bg: '#dcfce7', color: '#166534', border: '1px solid #86efac' };
  }
  if (status === 'suspended') {
    return { text: 'Suspended', bg: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' };
  }
  return { text: 'Waiting for approval', bg: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' };
}

function money(n: any) {
  const v = Number(n || 0);
  return '$' + v.toFixed(2);
}

function clockTime(v: any) {
  if (!v) return '';
  try {
    const d = new Date(v);
    let h = d.getHours();
    const m = d.getMinutes();
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    const mm = m < 10 ? '0' + m : String(m);
    return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + h + ':' + mm + ' ' + ap;
  } catch (err) {
    return '';
  }
}

function hoursText(mins: any) {
  const t = Number(mins || 0);
  const h = Math.floor(t / 60);
  const m = t % 60;
  return h + ' hr ' + m + ' min';
}

export default function DriverLoginPage() {
  const [checking, setChecking] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [driver, setDriver] = useState<DriverInfo | null>(null);
  const [earnings, setEarnings] = useState<any>(null);
  const [accountEmail, setAccountEmail] = useState('');
  const [mode, setMode] = useState('signin');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [recordingSign, setRecordingSign] = useState(blankSignature);
  const [feeSign, setFeeSign] = useState(blankSignature);

  const [busy, setBusy] = useState(false);
  const [shift, setShift] = useState<any>(null);
  const [shiftBusy, setShiftBusy] = useState(false);
  const [shiftError, setShiftError] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [pendingRate, setPendingRate] = useState<any>(null);
  const [rateBusy, setRateBusy] = useState(false);
  const [rateError, setRateError] = useState('');

  useEffect(() => {
    loadMe();
  }, []);

  async function loadMe() {
    setChecking(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session ? session.data.session.access_token : '';

      if (!token) {
        setSignedIn(false);
        setDriver(null);
        setChecking(false);
        return;
      }

      const res = await fetch('/api/driver-me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token }),
      });
      const data = await res.json();

      if (!res.ok) {
        setSignedIn(false);
        setDriver(null);
        setChecking(false);
        return;
      }

      setSignedIn(true);
      setAccountEmail(String(data.email || ''));
      setDriver(data.driver ? data.driver : null);
      setEarnings(data.earnings ? data.earnings : null);
      callShift('status');
      loadHistory();
    } catch (err) {
      setSignedIn(false);
      setDriver(null);
    }
    setChecking(false);
  }

  async function callShift(action: string) {
    setShiftError('');
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session ? session.data.session.access_token : '';
      if (!token) return;
      setShiftBusy(true);
      const res = await fetch('/api/driver-shift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token, action: action }),
      });
      const data = await res.json();
      setShiftBusy(false);
      if (res.ok) {
        setShift(data);
      } else if (action !== 'status') {
        setShiftError(String(data.error || 'Could not change your time clock.'));
      }
    } catch (err) {
      setShiftBusy(false);
      if (action !== 'status') setShiftError('Could not change your time clock.');
    }
  }

  async function loadHistory() {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session ? session.data.session.access_token : '';
      if (!token) return;
      const res = await fetch('/api/ride-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token, role: 'driver' }),
      });
      const data = await res.json();
      if (res.ok) {
        setHistory(data.rides ? data.rides : []);
        setPendingRate(data.pending ? data.pending : null);
      }
    } catch (err) {}
  }

  async function sendMyRating(stars: number, review: string) {
    if (!pendingRate) return;
    setRateBusy(true);
    setRateError('');
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session ? session.data.session.access_token : '';
      const res = await fetch('/api/rate-ride', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token, rideId: pendingRate.id, role: 'driver', stars: stars, review: review }),
      });
      const data = await res.json();
      setRateBusy(false);
      if (!res.ok) {
        setRateError(String(data.error || 'Could not save your rating.'));
        return;
      }
      setPendingRate(null);
      setNotice('Thank you. Your rating was saved.');
      await loadHistory();
    } catch (err) {
      setRateBusy(false);
      setRateError('Could not save your rating.');
    }
  }

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!email.trim() || !password) {
      setError('Please enter your email and your password.');
      return;
    }

    setBusy(true);
    const signed = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: password });
    setBusy(false);

    if (signed.error) {
      setError('That email and password did not match. Please try again.');
      return;
    }

    setPassword('');
    await loadMe();
  }

  async function onSignOut() {
    await supabase.auth.signOut();
    setSignedIn(false);
    setDriver(null);
    setNotice('You are signed out.');
  }

  function onPhotoPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    if (!picked) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(String(reader.result || ''));
      setPhotoName(picked.name);
    };
    reader.readAsDataURL(picked);
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!phone.trim()) { setError('Please enter your phone number.'); return; }
    if (password.length < 8) { setError('Please pick a password with at least 8 letters or numbers.'); return; }
    if (!photo) { setError('Please add a picture of yourself.'); return; }
    if (!isSigned(recordingSign)) { setError('Please type your full name and then sign your name in the recording agreement box.'); return; }
    if (!isSigned(feeSign)) { setError('Please type your full name and then sign your name in the box about the 5 dollar get in fee and the 20 percent.'); return; }

    setBusy(true);
    try {
      const res = await fetch('/api/driver-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password: password,
          photo: photo,
          agreedToRecording: true,
          agreementText: RECORDING_AGREEMENT_TEXT,
          recordingSignature: recordingSign,
          feeAgreementText: FEE_AGREEMENT_TEXT,
          feeSignature: feeSign,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(String(data.error || 'Could not create your driver account.'));
        setBusy(false);
        return;
      }

      if (!data || data.consentSaved !== true) {
        const papers = [
          { kind: 'recording', words: RECORDING_AGREEMENT_TEXT, sign: recordingSign },
          { kind: 'fee', words: FEE_AGREEMENT_TEXT, sign: feeSign },
        ];
        for (let i = 0; i < papers.length; i++) {
          try {
            await fetch('/api/recording-consent', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                personType: 'driver',
                agreementType: papers[i].kind,
                fullName: fullName.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
                userId: data && data.driverId ? String(data.driverId) : null,
                agreed: true,
                agreementText: papers[i].words,
                signatureName: papers[i].sign.name,
                signatureImage: papers[i].sign.image,
                signedAt: papers[i].sign.signedAt,
              }),
            });
          } catch (consentErr) {}
        }
      }

      const signed = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: password });
      setBusy(false);
      setPassword('');

      if (signed.error) {
        setNotice('Your driver account was created. Please sign in now.');
        setMode('signin');
        return;
      }

      await loadMe();
    } catch (err) {
      setBusy(false);
      setError('Could not create your driver account. Please try again.');
    }
  }

  const look = driver ? statusLook(driver.status) : statusLook('pending');

  return (
    <main style={shell}>
      <div style={{ maxWidth: 460, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <Link href='/' style={{ color: '#2563eb', fontWeight: 800, fontSize: 20, textDecoration: 'none' }}>
            On Time Taxi
          </Link>
          <div style={{ color: '#64748b', marginTop: 6, fontWeight: 700, letterSpacing: '0.12em', fontSize: 12 }}>
            DRIVER AREA
          </div>
        </div>

        {checking ? (
          <div style={card}>
            <div style={{ color: '#334155', fontWeight: 700 }}>Loading your driver account...</div>
          </div>
        ) : null}

        {!checking && signedIn && driver ? (
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
              {driver.photoUrl ? (
                <img
                  src={driver.photoUrl}
                  alt='Your picture'
                  style={{ width: 76, height: 76, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }}
                />
              ) : (
                <div style={{ width: 76, height: 76, borderRadius: '50%', background: '#e2e8f0' }} />
              )}
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{driver.fullName}</div>
                <div style={{ color: '#64748b', marginTop: 4 }}>{driver.email}</div>
              </div>
            </div>

            <div style={{ background: '#f1f5f9', borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', letterSpacing: '0.12em' }}>YOUR DRIVER ID</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '0.08em', marginTop: 6, fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace' }}>
                {driver.driverCode}
              </div>
            </div>

            <div style={{ background: look.bg, color: look.color, border: look.border, borderRadius: 14, padding: 16, fontWeight: 800, marginBottom: 16 }}>
              {look.text}
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', letterSpacing: '0.12em' }}>WHAT YOU MADE TODAY</div>
              <div style={{ fontSize: 34, fontWeight: 800, color: '#0f172a', marginTop: 6 }}>
                {money(earnings ? earnings.youMade : 0)}
              </div>
              <div style={{ color: '#64748b', marginTop: 6 }}>
                {earnings ? earnings.rides : 0} rides today
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 12, paddingTop: 12, color: '#475569', lineHeight: 1.7, fontSize: 14 }}>
                <div>Fares you drove: {money(earnings ? earnings.fares : 0)}</div>
                <div>Tips: {money(earnings ? earnings.tips : 0)}</div>
                <div>Company keeps: {money(earnings ? earnings.companyKeeps : 0)}</div>
                <div style={{ color: '#94a3b8', marginTop: 6 }}>
                  That is the {money(earnings ? earnings.getInFee : 5)} get in fee on every ride, plus {earnings ? earnings.commissionPct : 20} percent of what is left. Tips are all yours.
                </div>
                {earnings && earnings.unpaid > 0 ? (
                  <div style={{ color: '#b45309', marginTop: 6 }}>
                    {earnings.unpaid} of those were not paid by card, so they were cash runs you collected yourself.
                  </div>
                ) : null}
              </div>
            </div>

            {driver.status !== 'approved' ? (
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#7c2d12', borderRadius: 14, padding: 16, lineHeight: 1.6, marginBottom: 16 }}>
                You cannot take rides yet. Call the owner at 930-216-4166 and talk to him, then he approves you from the admin panel.
                Keep this page handy, your driver ID above is the number he will ask you for.
                <div style={{ marginTop: 10 }}>
                  <a href="tel:9302164166" style={{ display: 'inline-block', padding: '10px 14px', borderRadius: 10, background: '#7c2d12', color: '#fff', fontWeight: 800, textDecoration: 'none' }}>Call 930-216-4166</a>
                </div>
              </div>
            ) : null}

            {pendingRate ? (
              <RatingBox
                heading='Rate your last rider'
                who={pendingRate.riderName ? 'Your rider was ' + pendingRate.riderName : 'Your rider'}
                where={pendingRate.pickup + ' to ' + pendingRate.dropoff}
                note='You need to rate this run before you can take another one.'
                busy={rateBusy}
                error={rateError}
                onSend={sendMyRating}
              />
            ) : null}

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <div style={{ fontWeight: 900, color: '#0f172a', fontSize: 18, marginBottom: 4 }}>Your ride history</div>
              <div style={{ color: '#64748b', fontSize: 13, marginBottom: 12 }}>Every run you have taken, newest first.</div>
              {history.length === 0 ? (
                <div style={{ color: '#64748b' }}>No runs yet.</div>
              ) : (
                history.slice(0, 30).map((r: any) => (
                  <div key={r.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12, marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ color: '#64748b', fontWeight: 700, fontSize: 13 }}>{clockTime(r.createdAt)}</div>
                      <div style={{ fontWeight: 900, color: '#0f172a' }}>{money(r.fare)}</div>
                    </div>
                    <div style={{ color: '#0f172a', fontWeight: 700, marginTop: 4 }}>From {r.pickup}</div>
                    <div style={{ color: '#0f172a', fontWeight: 700 }}>To {r.dropoff}</div>
                    <div style={{ color: '#475569', fontSize: 14, marginTop: 4 }}>
                      Rider {r.riderName}{r.tip > 0 ? '  tip ' + money(r.tip) : ''}{r.paid ? '  paid' : '  not paid'}
                    </div>
                    {r.myStars > 0 ? (
                      <div style={{ color: '#b45309', fontWeight: 800, fontSize: 17, marginTop: 4 }}>
                        {starRow(r.myStars)}
                        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 700 }}> you rated this rider</span>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>

            <Link
              href='/driver-rides'
              style={{ display: 'block', textAlign: 'center', padding: '13px 16px', borderRadius: 12, background: '#16a34a', color: '#fff', fontWeight: 800, textDecoration: 'none', marginBottom: 12 }}
            >
              See open rides and take one
            </Link>

            <Link
              href='/drive/upload-docs'
              style={{ display: 'block', textAlign: 'center', padding: '13px 16px', borderRadius: 12, background: '#0f172a', color: '#fff', fontWeight: 800, textDecoration: 'none', marginBottom: 12 }}
            >
              Send in your documents
            </Link>

            <button type='button' onClick={onSignOut} style={{ ...mainButton, background: '#e2e8f0', color: '#0f172a' }}>
              Sign out
            </button>
          </div>
        ) : null}

        {!checking && signedIn && !driver ? (
          <div style={card}>
            <h1 style={{ fontSize: 22, margin: '0 0 10px', color: '#0f172a' }}>This is not a driver account</h1>
            <p style={{ color: '#475569', lineHeight: 1.6, marginTop: 0 }}>
              You are signed in as {accountEmail}. That account is a rider account, not a driver account.
              Sign out and create a driver account below.
            </p>
            <button type='button' onClick={onSignOut} style={mainButton}>Sign out</button>
          </div>
        ) : null}

        {!checking && !signedIn ? (
          <div style={card}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <button
                type='button'
                onClick={() => { setMode('signin'); setError(''); setNotice(''); }}
                style={{ flex: 1, padding: '11px 12px', borderRadius: 12, border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 800, background: mode === 'signin' ? '#2563eb' : '#fff', color: mode === 'signin' ? '#fff' : '#0f172a' }}
              >
                Sign in
              </button>
              <button
                type='button'
                onClick={() => { setMode('signup'); setError(''); setNotice(''); }}
                style={{ flex: 1, padding: '11px 12px', borderRadius: 12, border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 800, background: mode === 'signup' ? '#2563eb' : '#fff', color: mode === 'signup' ? '#fff' : '#0f172a' }}
              >
                New driver
              </button>
            </div>

            {notice ? (
              <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', borderRadius: 12, padding: 12, marginBottom: 14, fontWeight: 700 }}>
                {notice}
              </div>
            ) : null}

            {error ? (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: 12, padding: 12, marginBottom: 14, fontWeight: 700 }}>
                {error}
              </div>
            ) : null}

            {mode === 'signin' ? (
              <form onSubmit={onSignIn}>
                <h1 style={{ fontSize: 24, margin: '0 0 6px', color: '#0f172a' }}>Driver sign in</h1>
                <p style={{ color: '#64748b', marginTop: 0, marginBottom: 18, lineHeight: 1.6 }}>
                  Use the email and password you set up.
                </p>

                <label style={label}>Email</label>
                <input style={input} type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='you@example.com' />

                <label style={label}>Password</label>
                <input style={input} type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Your password' />

                <button type='submit' disabled={busy} style={{ ...mainButton, opacity: busy ? 0.6 : 1 }}>
                  {busy ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            ) : (
              <form onSubmit={onCreate}>
                <h1 style={{ fontSize: 24, margin: '0 0 6px', color: '#0f172a' }}>Create your driver account</h1>
                <p style={{ color: '#64748b', marginTop: 0, marginBottom: 18, lineHeight: 1.6 }}>
                  You will get your own 12 digit driver ID. You cannot take rides until the owner approves you,
                  and you must call him first at 930-216-4166.
                </p>

                <label style={label}>Full name</label>
                <input style={input} type='text' value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder='First and last name' />

                <label style={label}>Email</label>
                <input style={input} type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='you@example.com' />

                <label style={label}>Phone number</label>
                <input style={input} type='tel' value={phone} onChange={(e) => setPhone(e.target.value)} placeholder='555 555 5555' />

                <label style={label}>Password you want to use</label>
                <input style={input} type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='At least 8 characters' />

                <label style={label}>Your picture</label>
                <input style={{ ...input, padding: '10px 12px' }} type='file' accept='image/*' onChange={onPhotoPicked} />

                {photo ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <img src={photo} alt='Your picture' style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
                    <div style={{ color: '#475569', fontSize: 14 }}>{photoName}</div>
                  </div>
                ) : null}

                <RecordingAgreement value={recordingSign} onChange={setRecordingSign} />

                <FeeAgreement value={feeSign} onChange={setFeeSign} />

                <button type='submit' disabled={busy} style={{ ...mainButton, opacity: busy ? 0.6 : 1 }}>
                  {busy ? 'Creating your account...' : 'Create my driver account'}
                </button>
              </form>
            )}
          </div>
        ) : null}

        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <Link href='/drive' style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
            Back to the driver checks page
          </Link>
        </div>
      </div>
    </main>
  );
}
