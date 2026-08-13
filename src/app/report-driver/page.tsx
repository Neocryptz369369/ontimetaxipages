'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

const KINDS = [
  { id: 'drugs', label: 'Drug use' },
  { id: 'alcohol', label: 'Alcohol use' },
  { id: 'both', label: 'Both' },
];

const wrap: any = { minHeight: '100vh', background: '#0b0b0d', color: '#f4f4f5', padding: '24px 16px 60px', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' };
const shell: any = { maxWidth: '620px', margin: '0 auto' };
const card: any = { background: '#141418', border: '1px solid #26262e', borderRadius: '16px', padding: '20px', marginTop: '16px' };
const label: any = { display: 'block', fontSize: '13px', fontWeight: 700, color: '#b9b9c4', marginBottom: '6px', marginTop: '14px' };
const input: any = { width: '100%', boxSizing: 'border-box', background: '#0b0b0d', border: '1px solid #33333d', borderRadius: '10px', color: '#f4f4f5', padding: '12px 14px', fontSize: '16px' };

export default function ReportDriverPage() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [driverCode, setDriverCode] = useState('');
  const [kind, setKind] = useState('');
  const [details, setDetails] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<any>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const s = data.session;
      setSignedIn(!!s);
      setEmail(s && s.user && s.user.email ? s.user.email : '');
      setReady(true);
    });
    return () => { active = false; };
  }, []);

  async function send() {
    setError('');
    const digits = driverCode.replace(/[^0-9]/g, '');
    if (digits.length !== 12) {
      setError('Please enter the 12 digit driver ID shown on your ride screen.');
      return;
    }
    if (!kind) {
      setError('Please choose what you saw.');
      return;
    }
    setBusy(true);
    try {
      const got = await supabase.auth.getSession();
      const token = got.data.session ? got.data.session.access_token : '';
      const res = await fetch('/api/driver-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          driverCode: digits,
          kind: kind,
          details: details,
          reporterName: name,
          reporterPhone: phone,
        }),
      });
      const j = await res.json();
      if (!res.ok || j.error) {
        setError(j.error || 'Could not send the report.');
        setBusy(false);
        return;
      }
      setDone(j);
    } catch (e) {
      setError('Could not send the report. Please try again.');
    }
    setBusy(false);
  }

  if (!ready) {
    return (
      <div style={wrap}>
        <div style={shell}>
          <p style={{ color: '#8b8b96' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={shell}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/ride" style={{ color: '#f5c518', fontWeight: 800, textDecoration: 'none' }}>On Time Taxi</Link>
          <Link href="/ride" style={{ color: '#b9b9c4', textDecoration: 'none', fontSize: '14px' }}>Back to my ride</Link>
        </div>

        <h1 style={{ fontSize: '26px', margin: '22px 0 6px' }}>Report a driver</h1>
        <p style={{ color: '#b9b9c4', lineHeight: 1.55, margin: 0 }}>
          Use this if your driver seemed to be using drugs or alcohol. The report goes straight to the owner and the driver is suspended right away while it is looked into. Only report what you really saw.
        </p>

        {!signedIn && (
          <div style={card}>
            <p style={{ margin: 0, color: '#f4f4f5' }}>Please sign in first so we know who sent the report.</p>
            <Link href="/login" style={{ display: 'inline-block', marginTop: '12px', background: '#f5c518', color: '#101014', fontWeight: 800, padding: '12px 18px', borderRadius: '10px', textDecoration: 'none' }}>Sign in</Link>
          </div>
        )}

        {signedIn && done && (
          <div style={card}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#4ade80' }}>Report sent</div>
            <p style={{ color: '#d4d4dc', lineHeight: 1.55 }}>
              Thank you. The owner has the report on the admin panel now.
            </p>
            <p style={{ color: done.suspended ? '#4ade80' : '#fbbf24', lineHeight: 1.55, fontWeight: 700 }}>
              {done.suspended ? 'That driver is suspended and cannot take rides.' : 'The report was saved, but the driver was not suspended automatically. The owner will handle it by hand.'}
            </p>
            <Link href="/ride" style={{ display: 'inline-block', marginTop: '6px', background: '#f5c518', color: '#101014', fontWeight: 800, padding: '12px 18px', borderRadius: '10px', textDecoration: 'none' }}>Back to my ride</Link>
          </div>
        )}

        {signedIn && !done && (
          <div style={card}>
            <label style={label}>Driver ID (12 digits)</label>
            <input style={input} value={driverCode} inputMode="numeric" placeholder="000000000000" onChange={(e) => setDriverCode(e.target.value)} />
            <p style={{ color: '#8b8b96', fontSize: '13px', marginTop: '6px' }}>You can find it on the driver card on your ride screen.</p>

            <label style={label}>What did you see</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {KINDS.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setKind(k.id)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '999px',
                    border: kind === k.id ? '1px solid #f5c518' : '1px solid #33333d',
                    background: kind === k.id ? '#f5c518' : '#0b0b0d',
                    color: kind === k.id ? '#101014' : '#d4d4dc',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {k.label}
                </button>
              ))}
            </div>

            <label style={label}>Tell us what happened</label>
            <textarea style={{ ...input, minHeight: '110px', resize: 'vertical' }} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Where you were picked up, what you saw or smelled, anything else that helps." />

            <label style={label}>Your name</label>
            <input style={input} value={name} onChange={(e) => setName(e.target.value)} placeholder={email} />

            <label style={label}>Your phone (so the owner can call you)</label>
            <input style={input} value={phone} inputMode="tel" onChange={(e) => setPhone(e.target.value)} placeholder="555 555 5555" />

            {error && <p style={{ color: '#f87171', fontWeight: 700, marginTop: '14px' }}>{error}</p>}

            <button
              type="button"
              onClick={send}
              disabled={busy}
              style={{ width: '100%', marginTop: '18px', background: busy ? '#7a6a1f' : '#f5c518', color: '#101014', fontWeight: 800, fontSize: '16px', padding: '15px', borderRadius: '12px', border: 'none', cursor: busy ? 'default' : 'pointer' }}
            >
              {busy ? 'Sending...' : 'Send report'}
            </button>

            <p style={{ color: '#8b8b96', fontSize: '13px', marginTop: '12px', lineHeight: 1.5 }}>
              Signed in as {email}. False reports can get your own account closed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
