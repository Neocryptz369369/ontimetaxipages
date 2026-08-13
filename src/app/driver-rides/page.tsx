'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

type Ride = {
  id: string;
  pickup: string | null;
  dropoff: string | null;
  stops: any;
  fare: number | null;
  tip: number | null;
  paid: boolean | null;
  status: string;
  created_at: string;
  accepted_at?: string | null;
};

const shell: any = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg,#f8fafc 0%,#eef2ff 100%)',
  fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,sans-serif',
  padding: '32px 16px',
};
const wrap: any = { maxWidth: 640, margin: '0 auto' };
const card: any = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 16,
  padding: 20,
  marginBottom: 16,
  boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
};
const takeBtn: any = {
  display: 'block',
  width: '100%',
  marginTop: 14,
  padding: '14px 16px',
  borderRadius: 12,
  border: 'none',
  background: '#16a34a',
  color: '#fff',
  fontWeight: 800,
  fontSize: 16,
  cursor: 'pointer',
};
const rowLine: any = { color: '#0f172a', fontWeight: 700, lineHeight: 1.5 };
const small: any = { color: '#64748b', fontSize: 13, marginTop: 4 };

function money(n: any) {
  const v = Number(n);
  if (!v && v !== 0) return '$0.00';
  return '$' + v.toFixed(2);
}

function waited(iso: string) {
  if (!iso) return '';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins === 1) return '1 minute ago';
  if (mins < 60) return mins + ' minutes ago';
  const h = Math.floor(mins / 60);
  if (h === 1) return '1 hour ago';
  return h + ' hours ago';
}

function stopCount(stops: any) {
  if (!stops) return 0;
  if (Array.isArray(stops)) return stops.length;
  try {
    const p = JSON.parse(String(stops));
    return Array.isArray(p) ? p.length : 0;
  } catch (e) {
    return 0;
  }
}

export default function DriverRidesPage() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [hasDriver, setHasDriver] = useState(false);
  const [approved, setApproved] = useState(false);
  const [name, setName] = useState('');
  const [rides, setRides] = useState<Ride[]>([]);
  const [mine, setMine] = useState<Ride[]>([]);
  const [msg, setMsg] = useState('');
  const [busyId, setBusyId] = useState('');
  const busyRef = useRef(false);

  const load = useCallback(async function load() {
    const got = await supabase.auth.getSession();
    const token = got.data.session ? got.data.session.access_token : '';
    if (!token) {
      setSignedIn(false);
      setReady(true);
      return;
    }
    setSignedIn(true);
    try {
      const res = await fetch('/api/open-rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const j = await res.json();
      if (j && j.ok) {
        setHasDriver(!!j.driver);
        setApproved(!!j.approved);
        setName(j.driver && j.driver.full_name ? String(j.driver.full_name) : '');
        setRides(j.rides || []);
        setMine(j.mine || []);
      }
    } catch (e) {}
    setReady(true);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(function tick() {
      if (!busyRef.current) load();
    }, 5000);
    return () => clearInterval(t);
  }, [load]);

  async function take(id: string) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusyId(id);
    setMsg('');
    const got = await supabase.auth.getSession();
    const token = got.data.session ? got.data.session.access_token : '';
    try {
      const res = await fetch('/api/claim-ride', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rideId: id }),
      });
      const j = await res.json();
      if (j && j.ok && j.got) setMsg('You got it. That ride is yours now.');
      else if (j && j.ok) setMsg('Another driver took that one first.');
      else setMsg(j && j.error ? String(j.error) : 'Could not take that ride.');
    } catch (e) {
      setMsg('Could not take that ride.');
    }
    busyRef.current = false;
    setBusyId('');
    load();
  }

  return (
    <main style={shell}>
      <div style={wrap}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h1 style={{ fontSize: 26, margin: 0, color: '#0f172a' }}>Open rides</h1>
          <Link href='/driver-login' style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>My driver page</Link>
        </div>

        <p style={{ color: '#475569', marginTop: 0, marginBottom: 18, lineHeight: 1.6 }}>
          Every approved driver sees the same list. The first driver to tap Take this ride gets it, and it disappears for everyone else.
        </p>

        {!ready ? <div style={card}>Loading...</div> : null}

        {ready && !signedIn ? (
          <div style={card}>
            <div style={rowLine}>You are not signed in.</div>
            <div style={small}>Sign in on your driver page first, then come back here.</div>
            <Link href='/driver-login' style={{ display: 'inline-block', marginTop: 12, color: '#2563eb', fontWeight: 800, textDecoration: 'none' }}>Go to driver sign in</Link>
          </div>
        ) : null}

        {ready && signedIn && !hasDriver ? (
          <div style={card}>
            <div style={rowLine}>This sign in does not have a driver account.</div>
            <div style={small}>Create your driver account first, then call 930-216-4166 to get approved.</div>
            <Link href='/driver-login' style={{ display: 'inline-block', marginTop: 12, color: '#2563eb', fontWeight: 800, textDecoration: 'none' }}>Go to driver sign in</Link>
          </div>
        ) : null}

        {ready && signedIn && hasDriver && !approved ? (
          <div style={{ ...card, background: '#fff7ed', border: '1px solid #fed7aa', color: '#7c2d12' }}>
            <div style={{ fontWeight: 800 }}>You cannot take rides yet.</div>
            <div style={{ marginTop: 6, lineHeight: 1.6 }}>Call the owner at 930-216-4166 and talk to him. Once he approves you in the admin panel, rides will show up on this page.</div>
            <a href='tel:9302164166' style={{ display: 'inline-block', marginTop: 12, padding: '10px 14px', borderRadius: 10, background: '#7c2d12', color: '#fff', fontWeight: 800, textDecoration: 'none' }}>Call 930-216-4166</a>
          </div>
        ) : null}

        {msg ? (
          <div style={{ ...card, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e3a8a', fontWeight: 700 }}>{msg}</div>
        ) : null}

        {ready && approved && mine.length > 0 ? (
          <div style={{ ...card, background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
            <div style={{ fontWeight: 800, color: '#065f46', marginBottom: 8 }}>The ride you are on now</div>
            {mine.map((r) => (
              <div key={r.id} style={{ paddingTop: 8 }}>
                <div style={rowLine}>Pick up: {r.pickup || 'Not given'}</div>
                <div style={rowLine}>Drop off: {r.dropoff || 'Not given'}</div>
                <div style={small}>{money(r.fare)} fare. Status: {r.status}.</div>
                <a
                  href={'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(String(r.pickup || ''))}
                  target='_blank'
                  rel='noreferrer'
                  style={{ display: 'inline-block', marginTop: 10, color: '#065f46', fontWeight: 800 }}
                >
                  Open directions to the pick up
                </a>
              </div>
            ))}
          </div>
        ) : null}

        {ready && approved && rides.length === 0 ? (
          <div style={card}>
            <div style={rowLine}>No rides waiting right now{name ? ', ' + name : ''}.</div>
            <div style={small}>This page checks again every few seconds by itself. Leave it open.</div>
          </div>
        ) : null}

        {ready && approved && rides.map((r) => (
          <div key={r.id} style={card}>
            <div style={rowLine}>Pick up: {r.pickup || 'Not given'}</div>
            <div style={rowLine}>Drop off: {r.dropoff || 'Not given'}</div>
            {stopCount(r.stops) > 0 ? <div style={small}>Extra stops on the way: {stopCount(r.stops)}</div> : null}
            <div style={{ marginTop: 10, fontSize: 20, fontWeight: 900, color: '#0f172a' }}>{money(r.fare)}</div>
            <div style={small}>Called in {waited(String(r.created_at))}</div>
            {r.paid ? (
              <div style={{ ...small, color: '#166534', fontWeight: 700 }}>Paid by card already.</div>
            ) : (
              <div style={{ ...small, color: '#b45309', fontWeight: 700 }}>Not paid by card. Collect this one as a cash run.</div>
            )}
            <button style={{ ...takeBtn, opacity: busyId === r.id ? 0.6 : 1 }} onClick={() => take(r.id)} disabled={busyId === r.id}>
              {busyId === r.id ? 'Taking it...' : 'Take this ride'}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
