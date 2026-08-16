'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

const ADMIN_EMAIL = "neocryptz@yahoo.com";

type Media = {
  id: string;
  panic_id: string;
  kind: string;
  url: string;
  seconds: number;
  created_at: string;
  play: string | null;
};

type Alert = {
  id: string;
  ride_id: string | null;
  role: string;
  who_name: string | null;
  who_phone: string | null;
  lat: number | null;
  lng: number | null;
  status: string;
  note: string | null;
  created_at: string;
  resolved_at: string | null;
  media: Media[];
};

function shortId(id: string) {
  const s = String(id || '');
  return s.length > 8 ? s.slice(0, 8).toUpperCase() : s.toUpperCase();
}

function whenText(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch (err) {
    return String(iso || '');
  }
}

export default function PanicArchivePage() {
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [token, setToken] = useState('');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState('');

  async function load(tk: string) {
    setNote('');
    try {
      const r = await fetch('/api/panic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive', token: tk }),
      });
      const j = await r.json();
      if (j && j.ok) {
        setAlerts(j.events ? j.events : []);
      } else {
        setNote('Could not read the archive. Try the refresh button.');
      }
    } catch (err) {
      setNote('Could not read the archive. Try the refresh button.');
    }
  }

  useEffect(() => {
    let stopped = false;
    async function boot() {
      const got = await supabase.auth.getSession();
      const sess = got && got.data ? got.data.session : null;
      const email = sess && sess.user ? String(sess.user.email || '').toLowerCase() : '';
      if (stopped) return;
      if (!sess || email !== ADMIN_EMAIL) {
        setAllowed(false);
        setReady(true);
        return;
      }
      setToken(sess.access_token);
      setAllowed(true);
      setReady(true);
      load(sess.access_token);
    }
    boot();
    return () => {
      stopped = true;
    };
  }, []);

  async function markHandled(id: string) {
    setBusy(id);
    try {
      const r = await fetch('/api/panic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve', id: id, token: token }),
      });
      const j = await r.json();
      if (j && j.ok) {
        await load(token);
      } else {
        setNote('Could not close that one.');
      }
    } catch (err) {
      setNote('Could not close that one.');
    }
    setBusy('');
  }

  const openCount = alerts.filter((a) => a.status !== 'closed').length;
  let clips = 0;
  for (const a of alerts) clips = clips + (a.media ? a.media.length : 0);

  const groups = [
    { key: 'driver', title: 'Driver panic buttons', tone: '#2563eb' },
    { key: 'rider', title: 'Rider panic buttons', tone: '#db2777' },
    { key: 'admin', title: 'Your own panic button', tone: '#7c3aed' },
  ];

  const page: React.CSSProperties = { minHeight: '100vh', background: '#0b1220', color: '#e5e7eb', padding: '28px 16px 60px' };
  const wrap: React.CSSProperties = { maxWidth: 900, margin: '0 auto' };
  const card: React.CSSProperties = { background: '#111a2e', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 18, padding: 18, marginBottom: 16 };
  const tile: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 14, marginBottom: 12 };

  if (!ready) {
    return (
      <div style={page}>
        <div style={wrap}>Loading the panic archive...</div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div style={page}>
        <div style={wrap}>
          <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 10 }}>Panic archive</h1>
          <p style={{ lineHeight: 1.7, marginBottom: 16 }}>
            This page is only for you. Sign in with the owner account and come back.
          </p>
          <Link href='/login' style={{ color: '#93c5fd', fontWeight: 800 }}>Go to the sign in page</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={page}>
      <div style={wrap}>
        <div style={{ fontSize: 12, letterSpacing: 2, color: '#f87171', fontWeight: 800, marginBottom: 6 }}>EMERGENCY RECORDINGS</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Panic archive</h1>
        <p style={{ lineHeight: 1.7, opacity: 0.85, marginBottom: 16 }}>
          Every time a driver, a rider or you press PANIC it lands here with the spot on the map and the
          sound and camera recording from that phone. Drivers, riders and your own are kept apart.
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={{ ...tile, marginBottom: 0, minWidth: 150 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>STILL OPEN</div>
            <div style={{ fontSize: 26, fontWeight: 900 }}>{openCount}</div>
          </div>
          <div style={{ ...tile, marginBottom: 0, minWidth: 150 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>ALERTS ON FILE</div>
            <div style={{ fontSize: 26, fontWeight: 900 }}>{alerts.length}</div>
          </div>
          <div style={{ ...tile, marginBottom: 0, minWidth: 150 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>RECORDINGS</div>
            <div style={{ fontSize: 26, fontWeight: 900 }}>{clips}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
          <button
            type='button'
            onClick={() => load(token)}
            style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12, padding: '11px 18px', fontWeight: 800, cursor: 'pointer' }}
          >
            Refresh this page
          </button>
          <Link href='/admin' style={{ color: '#93c5fd', fontWeight: 800, alignSelf: 'center' }}>Back to admin</Link>
        </div>

        {note ? (
          <div style={{ background: '#7f1d1d', borderRadius: 12, padding: '10px 14px', marginBottom: 16 }}>{note}</div>
        ) : null}

        {alerts.length === 0 ? (
          <div style={card}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Nothing here yet, and that is a good thing.</div>
            <div style={{ opacity: 0.8, lineHeight: 1.7 }}>
              The first time anyone presses PANIC it will show up on this page by itself.
            </div>
          </div>
        ) : null}

        {groups.map((g) => {
          const mine = alerts.filter((a) => String(a.role || 'rider') === g.key);
          if (mine.length === 0) return null;
          return (
            <div key={g.key} style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ width: 12, height: 12, borderRadius: 99, background: g.tone, display: 'inline-block' }} />
                <div style={{ fontSize: 19, fontWeight: 900 }}>{g.title}</div>
                <div style={{ opacity: 0.7, fontSize: 14 }}>{mine.length} on file</div>
              </div>

              {mine.map((a) => (
                <div key={a.id} style={tile}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 900 }}>{a.who_name ? a.who_name : 'Name not given'}</div>
                    <div style={{ fontWeight: 800, color: a.status === 'closed' ? '#4ade80' : '#fca5a5' }}>
                      {a.status === 'closed' ? 'Handled' : 'Still open'}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>ID {shortId(a.id)} - {whenText(a.created_at)}</div>
                  {a.who_phone ? <div style={{ fontSize: 14, marginTop: 6 }}>Phone: {a.who_phone}</div> : null}
                  {a.note ? <div style={{ fontSize: 14, marginTop: 6 }}>What they said: {a.note}</div> : null}
                  {a.ride_id ? <div style={{ fontSize: 13, opacity: 0.75, marginTop: 6 }}>Ride {shortId(a.ride_id)}</div> : null}

                  {a.lat !== null && a.lng !== null ? (
                    <a
                      href={'https://www.google.com/maps/search/?api=1&query=' + a.lat + ',' + a.lng}
                      target='_blank'
                      rel='noreferrer'
                      style={{ display: 'inline-block', marginTop: 8, color: '#93c5fd', fontWeight: 800 }}
                    >
                      Open the spot on a map
                    </a>
                  ) : (
                    <div style={{ fontSize: 13, opacity: 0.7, marginTop: 8 }}>No location came with this one.</div>
                  )}

                  <div style={{ marginTop: 12 }}>
                    {a.media && a.media.length > 0 ? (
                      a.media.map((m) => (
                        <div key={m.id} style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>
                            {m.kind === 'audio' ? 'Sound from that phone' : 'Camera and sound from that phone'}
                            {m.seconds ? ' - ' + m.seconds + ' seconds' : ''}
                          </div>
                          {m.play ? (
                            m.kind === 'audio' ? (
                              <audio controls src={m.play} style={{ width: '100%' }} />
                            ) : (
                              <video controls src={m.play} style={{ width: '100%', borderRadius: 12, background: '#000' }} />
                            )
                          ) : (
                            <div style={{ fontSize: 13, opacity: 0.7 }}>The file is saved. Tap refresh to get a fresh play link.</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: 13, opacity: 0.7 }}>No recording came with this one.</div>
                    )}
                  </div>

                  {a.status !== 'closed' ? (
                    <button
                      type='button'
                      disabled={busy === a.id}
                      onClick={() => markHandled(a.id)}
                      style={{ marginTop: 10, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 16px', fontWeight: 800, cursor: 'pointer' }}
                    >
                      {busy === a.id ? 'Saving...' : 'Mark this one handled'}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          );
        })}

        <div style={{ ...card, background: 'rgba(255,255,255,0.04)' }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>How this works</div>
          <div style={{ opacity: 0.85, lineHeight: 1.8, fontSize: 14 }}>
            Riders, drivers and your own alerts stay in their own sections. Every alert carries its own ID.
            Nothing on this page is ever thrown away by itself, so you can come back and look at it later.
            Marking one handled only closes it out for you. It stays on file.
          </div>
        </div>
      </div>
    </div>
  );
}
