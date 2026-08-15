'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import RatingBox, { starRow } from '../../components/RatingBox';

const shell: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg,#f8fafc 0%,#eef2ff 100%)',
  fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,sans-serif',
  padding: '28px 16px 60px',
};

const card: React.CSSProperties = {
  background: '#fff',
  borderRadius: 18,
  border: '1px solid #e5e7eb',
  boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
  padding: 18,
  marginBottom: 14,
};

function money(n: any) {
  return '$' + Number(n || 0).toFixed(2);
}

function whenText(v: any) {
  if (!v) return '';
  try {
    const d = new Date(v);
    let h = d.getHours();
    const m = d.getMinutes();
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    const mm = m < 10 ? '0' + m : String(m);
    return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear() + '  ' + h + ':' + mm + ' ' + ap;
  } catch (err) {
    return '';
  }
}

export default function RideHistoryPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [rides, setRides] = useState<any[]>([]);
  const [pending, setPending] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function tokenNow() {
    const session = await supabase.auth.getSession();
    return session.data.session ? session.data.session.access_token : '';
  }

  async function load() {
    setChecking(true);
    try {
      const token = await tokenNow();
      if (!token) {
        setSignedIn(false);
        setChecking(false);
        return;
      }
      setSignedIn(true);
      const res = await fetch('/api/ride-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token, role: 'rider' }),
      });
      const data = await res.json();
      if (res.ok) {
        setRides(data.rides ? data.rides : []);
        setPending(data.pending ? data.pending : null);
      } else {
        setError(String(data.error || 'Could not read your ride history.'));
      }
    } catch (err) {
      setError('Could not read your ride history.');
    }
    setChecking(false);
  }

  async function sendRating(stars: number, review: string) {
    if (!pending) return;
    setBusy(true);
    setError('');
    try {
      const token = await tokenNow();
      const res = await fetch('/api/rate-ride', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token, rideId: pending.id, role: 'rider', stars: stars, review: review }),
      });
      const data = await res.json();
      setBusy(false);
      if (!res.ok) {
        setError(String(data.error || 'Could not save your rating.'));
        return;
      }
      setNotice('Thank you. Your rating was saved.');
      await load();
    } catch (err) {
      setBusy(false);
      setError('Could not save your rating.');
    }
  }

  function useAgain(r: any) {
    try {
      sessionStorage.setItem(
        'otRebook',
        JSON.stringify({
          pickup: r.pickup,
          dropoff: r.dropoff,
          pickupLat: r.pickupLat,
          pickupLng: r.pickupLng,
          dropoffLat: r.dropoffLat,
          dropoffLng: r.dropoffLng,
          stops: r.stops,
        })
      );
    } catch (err) {}
    router.push('/ride');
  }

  return (
    <main style={shell}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <Link href='/' style={{ color: '#2563eb', fontWeight: 800, fontSize: 20, textDecoration: 'none' }}>
            On Time Taxi
          </Link>
          <div style={{ color: '#64748b', marginTop: 6, fontWeight: 800, letterSpacing: '0.12em', fontSize: 12 }}>
            YOUR RIDE HISTORY
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <Link href='/ride' style={{ flex: 1, textAlign: 'center', textDecoration: 'none', background: '#2563eb', color: '#fff', fontWeight: 800, padding: '11px 14px', borderRadius: 12 }}>
            Book a ride
          </Link>
        </div>

        {checking ? (
          <div style={card}>
            <div style={{ color: '#334155', fontWeight: 700 }}>Loading your rides...</div>
          </div>
        ) : null}

        {!checking && !signedIn ? (
          <div style={card}>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a', marginBottom: 8 }}>Please sign in</div>
            <p style={{ color: '#475569', lineHeight: 1.6, marginTop: 0 }}>Sign in to see the rides you have taken.</p>
            <Link href='/login' style={{ display: 'inline-block', background: '#2563eb', color: '#fff', padding: '11px 18px', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>
              Go to sign in
            </Link>
          </div>
        ) : null}

        {!checking && signedIn && pending ? (
          <RatingBox
            heading='Rate your last ride'
            who={pending.driverName ? 'Your driver was ' + pending.driverName : 'Your driver'}
            where={pending.pickup + ' to ' + pending.dropoff}
            note='You need to rate this ride before you can book another one.'
            busy={busy}
            error={error}
            onSend={sendRating}
          />
        ) : null}

        {notice ? (
          <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '10px 12px', borderRadius: 12, fontWeight: 700, marginBottom: 14 }}>
            {notice}
          </div>
        ) : null}

        {!checking && signedIn && rides.length === 0 ? (
          <div style={card}>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a', marginBottom: 6 }}>No rides yet</div>
            <p style={{ color: '#475569', lineHeight: 1.6, margin: 0 }}>Once you take a ride it shows up here, and you can book the same trip again with one tap.</p>
          </div>
        ) : null}

        {rides.map((r: any) => (
          <div key={r.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
              <div style={{ color: '#64748b', fontWeight: 700, fontSize: 13 }}>{whenText(r.createdAt)}</div>
              <div style={{ fontWeight: 900, color: '#0f172a' }}>{money(r.fare)}</div>
            </div>
            <div style={{ color: '#0f172a', fontWeight: 700, marginBottom: 4 }}>From {r.pickup}</div>
            <div style={{ color: '#0f172a', fontWeight: 700, marginBottom: 8 }}>To {r.dropoff}</div>
            <div style={{ color: '#475569', fontSize: 14, marginBottom: 4 }}>
              {r.driverName ? 'Driver: ' + r.driverName : 'No driver on this one'}
            </div>
            <div style={{ color: '#475569', fontSize: 14, marginBottom: 10 }}>
              {r.tip > 0 ? 'Tip ' + money(r.tip) + '  ' : ''}
              {r.paid ? 'Paid' : 'Not paid'}
              {r.status ? '  ' + r.status : ''}
            </div>
            {r.myStars > 0 ? (
              <div style={{ color: '#b45309', fontWeight: 800, marginBottom: 10, fontSize: 18 }}>
                {starRow(r.myStars)}
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 700 }}> you rated this driver</span>
              </div>
            ) : null}
            <button
              type='button'
              onClick={() => useAgain(r)}
              style={{ width: '100%', padding: '11px', borderRadius: 12, border: '1px solid #2563eb', background: '#eff6ff', color: '#1d4ed8', fontWeight: 800, cursor: 'pointer' }}
            >
              Use these places again
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
