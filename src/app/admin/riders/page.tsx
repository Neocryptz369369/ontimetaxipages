'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

const ADMIN_EMAIL = 'neocryptz@yahoo.com';

const AGREEMENT_LABEL: any = { recording: 'Recording agreement', fee: 'Get in fee and 20 percent agreement' };

const wrap: any = { minHeight: '100vh', background: '#04070f', color: '#eaf1f6', padding: '24px 16px 60px', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' };
const shell: any = { maxWidth: '1000px', margin: '0 auto' };
const card: any = { background: 'linear-gradient(160deg, #0a1424 0%, #04070f 100%)', border: '1px solid rgba(59,130,246,0.28)', borderRadius: '16px', padding: '18px', marginBottom: '14px' };
const btn: any = { border: 'none', borderRadius: '10px', padding: '10px 14px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', marginRight: '8px', marginTop: '8px' };

function photoLink(raw: string) {
  if (!raw) return '';
  if (raw.indexOf('http') === 0) return raw;
  const pub = supabase.storage.from('profile-photos').getPublicUrl(raw);
  return pub && pub.data ? pub.data.publicUrl : '';
}

function whenText(v: string) {
  if (!v) return '';
  try {
    return new Date(v).toLocaleString();
  } catch (err) {
    return v;
  }
}

function agreementLabel(kind: string) {
  return AGREEMENT_LABEL[kind] || (kind ? kind.charAt(0).toUpperCase() + kind.slice(1) + ' agreement' : 'Agreement');
}

export default function AdminRidersPage() {
  const [checked, setChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [riders, setRiders] = useState<any[]>([]);
  const [consents, setConsents] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setMsg('');
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session ? session.data.session.access_token : '';

      const [ridersRes, consentsRes] = await Promise.all([
        fetch('/api/rider-signups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token }),
        }),
        fetch('/api/consents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token }),
        }),
      ]);

      const ridersData = await ridersRes.json();
      if (!ridersRes.ok) {
        setMsg(String(ridersData.error || 'Could not load riders.'));
        return;
      }
      setRiders(ridersData.riders ? ridersData.riders : []);

      const consentsData = await consentsRes.json();
      if (consentsRes.ok) {
        setConsents(consentsData.consents ? consentsData.consents : []);
      }
    } catch (err) {
      setMsg('Could not load riders.');
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
          <p style={{ color: '#9db3c9' }}>Sign in with the owner account to open this page.</p>
          <Link href="/admin" style={{ color: '#5eb3ff' }}>Back to the admin panel</Link>
        </div>
      </div>
    );
  }

  // The real proof that someone signed is the row they signed in recording_consents
  // (it carries their drawn signature). Match it to this rider by user id first,
  // then by email, and keep only the most recent signature per agreement kind.
  function agreementsFor(r: any): any[] {
    const rid = String(r.id || '');
    const remail = String(r.email || '').toLowerCase();
    const mine = consents.filter((c) => {
      if (c.personType === 'driver') return false;
      if (rid && c.userId && String(c.userId) === rid) return true;
      if (remail && String(c.email || '').toLowerCase() === remail) return true;
      return false;
    });
    const latest: any = {};
    mine.forEach((c) => {
      const kind = c.agreementType || 'recording';
      if (!latest[kind] || new Date(c.signedAt) > new Date(latest[kind].signedAt)) {
        latest[kind] = c;
      }
    });
    return Object.keys(latest).map((k) => latest[k]);
  }

  const words = search.trim().toLowerCase();
  const shown = words
    ? riders.filter((r) => {
        const hay = [r.full_name, r.email, r.phone].filter(Boolean).join(' ').toLowerCase();
        return hay.indexOf(words) !== -1;
      })
    : riders;

  return (
    <div style={wrap}>
      <div style={shell}>
        <Link href="/admin" style={{ color: '#5eb3ff', textDecoration: 'none', fontSize: '14px' }}>Back to the admin panel</Link>
        <h1 style={{ fontSize: '28px', margin: '14px 0 4px' }}>Riders</h1>
        <p style={{ color: '#9db3c9', margin: '0 0 6px' }}>
          Everyone who has signed up to book a ride, with the exact name, email, phone number, and photo they entered at sign up. This list is separate from drivers.
        </p>
        <p style={{ color: '#6c869e', margin: '0 0 18px', fontSize: '14px' }}>
          {riders.length} rider{riders.length === 1 ? '' : 's'} signed up.
        </p>

        {msg && <p style={{ color: '#ffd166', fontWeight: 700 }}>{msg}</p>}

        <div style={{ marginBottom: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone"
            style={{ flex: '1 1 240px', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.35)', background: '#0a1424', color: '#eaf1f6', fontSize: '14px' }}
          />
          <button type="button" onClick={load} style={{ ...btn, background: '#1d7d3a', color: '#fff' }}>Refresh</button>
        </div>

        {shown.length === 0 && <p style={{ color: '#6c869e' }}>{riders.length === 0 ? 'Nobody has signed up as a rider yet.' : 'No riders match that search.'}</p>}

        {shown.map((r) => {
          const src = photoLink(r.photo_url || '');
          const signed = agreementsFor(r);
          return (
            <div key={r.id} style={card}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                {src ? (
                  <img src={src} alt="" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #3b82f6' }} />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#0f1c30', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c869e', fontSize: '12px', textAlign: 'center' }}>No photo</div>
                )}
                <div style={{ flex: '1 1 260px' }}>
                  <div style={{ fontWeight: 800, fontSize: '17px' }}>{r.full_name || 'No name on file'}</div>
                  <div style={{ color: '#9db3c9', fontSize: '14px' }}>{r.email}{r.phone ? ' - ' + r.phone : ''}</div>
                  <div style={{ color: '#6c869e', fontSize: '13px', marginTop: '4px' }}>
                    Signed up {whenText(r.created_at) || 'date not on file'}
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    {signed.length === 0 ? (
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#c9a9a9' }}>No signed agreement on file</div>
                    ) : (
                      signed.map((c) => (
                        <div key={c.agreementType} style={{ fontSize: '13px', marginTop: '3px', fontWeight: 700, color: '#86efac' }}>
                          {agreementLabel(c.agreementType)} signed {whenText(c.signedAt)}
                        </div>
                      ))
                    )}
                  </div>
                  <Link href="/admin/signatures" style={{ display: 'inline-block', marginTop: '6px', color: '#5eb3ff', fontSize: '13px', fontWeight: 800, textDecoration: 'none' }}>
                    Look at their signature
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        <p style={{ color: '#6c869e', fontSize: '13px', marginTop: '30px' }}>
          Driver sign ups, including their license and insurance photos, are kept separately on the <Link href="/admin/drivers" style={{ color: '#5eb3ff' }}>drivers page</Link>.
        </p>
      </div>
    </div>
  );
}
