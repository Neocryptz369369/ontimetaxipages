'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

const ADMIN_EMAIL = 'neocryptz@yahoo.com';

const wrap: any = { minHeight: '100vh', background: '#0b0303', color: '#f6eaea', padding: '24px 16px 60px', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' };
const shell: any = { maxWidth: '1000px', margin: '0 auto' };
const card: any = { background: 'linear-gradient(160deg, #170606 0%, #0b0303 100%)', border: '1px solid rgba(255,77,77,0.28)', borderRadius: '16px', padding: '18px', marginBottom: '14px' };
const btn: any = { border: 'none', borderRadius: '10px', padding: '10px 14px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', marginRight: '8px', marginTop: '8px' };

function paperName(kind: string) {
  if (kind === 'fee') return 'The 5 dollar get in fee and the 20 percent';
  return 'Recording agreement for sound and video';
}

function whenText(v: string) {
  if (!v) return 'Date not on file';
  try {
    return new Date(v).toLocaleString();
  } catch (err) {
    return v;
  }
}

export default function AdminSignaturesPage() {
  const [checked, setChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [who, setWho] = useState('all');
  const [openWords, setOpenWords] = useState('');

  const load = useCallback(async () => {
    setMsg('');
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session ? session.data.session.access_token : '';
      const res = await fetch('/api/consents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(String(data.error || 'Could not load the signed agreements.'));
        return;
      }
      setRows(data.consents ? data.consents : []);
    } catch (err) {
      setMsg('Could not load the signed agreements.');
    }
  }, []);

  useEffect(() => {
    let alive = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!alive) return;
      const ok = !!(data.user && (data.user.email || '').toLowerCase() === ADMIN_EMAIL);
      setIsAdmin(ok);
      setChecked(true);
      if (ok) load();
    });
    return () => { alive = false; };
  }, [load]);

  if (!checked) {
    return <div style={wrap}><div style={shell}><p>Loading...</p></div></div>;
  }

  if (!isAdmin) {
    return (
      <div style={wrap}>
        <div style={shell}>
          <h1>Owner only</h1>
          <p style={{ color: '#d9b3b3' }}>Sign in with the owner account to open this page.</p>
          <Link href="/admin" style={{ color: '#ff7b7b' }}>Back to the admin panel</Link>
        </div>
      </div>
    );
  }

  const shown = rows.filter((r) => {
    if (who === 'drivers') return r.personType === 'driver';
    if (who === 'riders') return r.personType !== 'driver';
    return true;
  });

  const driverCount = rows.filter((r) => r.personType === 'driver').length;
  const riderCount = rows.length - driverCount;

  return (
    <div style={wrap}>
      <div style={shell}>
        <Link href="/admin" style={{ color: '#ff7b7b', textDecoration: 'none', fontSize: '14px' }}>Back to the admin panel</Link>
        <h1 style={{ fontSize: '28px', margin: '14px 0 4px' }}>Signed agreements</h1>
        <p style={{ color: '#d9b3b3', margin: '0 0 6px' }}>
          Every driver and every rider signs their name with their finger. This is the real signature they drew, the name they typed, and the day and time they signed.
        </p>
        <p style={{ color: '#9c8080', margin: '0 0 18px', fontSize: '14px' }}>
          {driverCount} signed by drivers and {riderCount} signed by riders.
        </p>

        {msg && <p style={{ color: '#ffd166', fontWeight: 700 }}>{msg}</p>}

        <div style={{ marginBottom: '14px' }}>
          <button type="button" onClick={() => setWho('all')} style={{ ...btn, background: who === 'all' ? '#b81111' : '#2a2a2e', color: '#fff' }}>Everyone</button>
          <button type="button" onClick={() => setWho('drivers')} style={{ ...btn, background: who === 'drivers' ? '#b81111' : '#2a2a2e', color: '#fff' }}>Drivers only</button>
          <button type="button" onClick={() => setWho('riders')} style={{ ...btn, background: who === 'riders' ? '#b81111' : '#2a2a2e', color: '#fff' }}>Riders only</button>
          <button type="button" onClick={load} style={{ ...btn, background: '#128a3d', color: '#fff' }}>Refresh</button>
        </div>

        {shown.length === 0 && <p style={{ color: '#9c8080' }}>Nothing signed yet.</p>}

        {shown.map((r) => (
          <div key={r.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 900, fontSize: '17px' }}>
                {r.fullName || 'No name'}
                <span style={{ color: '#ff9d9d', fontWeight: 700, fontSize: '13px', marginLeft: '8px', textTransform: 'uppercase' }}>
                  {r.personType === 'driver' ? 'Driver' : 'Rider'}
                </span>
              </div>
              <div style={{ color: '#d9b3b3', fontSize: '13px' }}>{whenText(r.signedAt)}</div>
            </div>

            <div style={{ color: '#ffd166', fontWeight: 800, fontSize: '15px', marginTop: '6px' }}>
              {paperName(r.agreementType)}
            </div>

            <div style={{ color: '#d9b3b3', fontSize: '14px', marginTop: '4px' }}>
              {r.email}{r.phone ? ' - ' + r.phone : ''}
            </div>

            <div style={{ marginTop: '12px' }}>
              <div style={{ color: '#9c8080', fontSize: '12px', fontWeight: 800, letterSpacing: '1px' }}>THEIR SIGNATURE</div>
              {r.signatureImage ? (
                <img
                  src={r.signatureImage}
                  alt="Signature"
                  style={{ marginTop: '6px', width: '100%', maxWidth: '420px', background: '#fff', border: '1px solid #d9b3b3', borderRadius: '10px', display: 'block' }}
                />
              ) : (
                <div style={{ marginTop: '6px', color: '#ff9d9d', fontWeight: 700 }}>
                  No drawn signature on file. This one was signed before the signature box was added.
                </div>
              )}
              {r.signatureName ? (
                <div style={{ marginTop: '8px', fontSize: '15px' }}>
                  Typed name: <strong>{r.signatureName}</strong>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setOpenWords(openWords === r.id ? '' : r.id)}
              style={{ ...btn, background: '#2a2a2e', color: '#f6eaea' }}
            >
              {openWords === r.id ? 'Hide what they signed' : 'Read what they signed'}
            </button>

            {openWords === r.id ? (
              <p style={{ marginTop: '10px', lineHeight: 1.6, fontSize: '14px', color: '#f0dcdc', background: 'rgba(0,0,0,0.35)', padding: '12px', borderRadius: '10px' }}>
                {r.agreementText || 'The wording was not saved with this one.'}
              </p>
            ) : null}
          </div>
        ))}

        <p style={{ color: '#9c8080', fontSize: '13px', marginTop: '30px' }}>
          Keep this page for your records. It is what proves everybody agreed to being recorded, and that every driver agreed to the 5 dollar get in fee and the 20 percent.
        </p>
      </div>
    </div>
  );
}
