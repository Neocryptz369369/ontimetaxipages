'use client';

import { useEffect, useRef, useState } from 'react';

type Alert = { id: string; created_at: string; body: string; read: boolean };

export default function DriverAlerts(props: { token?: string }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showing, setShowing] = useState<Alert | null>(null);
  const [openList, setOpenList] = useState(false);
  const [listening, setListening] = useState(false);

  const tokenRef = useRef('');
  const spokenRef = useRef<any>({});
  const recRef = useRef<any>(null);
  const showingRef = useRef<any>(null);

  useEffect(function () {
    tokenRef.current = props.token ? String(props.token) : '';
  }, [props.token]);

  useEffect(function () {
    showingRef.current = showing;
  }, [showing]);

  function sayIt(text: string) {
    try {
      const w: any = window;
      if (!w.speechSynthesis || !w.SpeechSynthesisUtterance) return;
      const u = new w.SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.volume = 1;
      u.rate = 1;
      w.speechSynthesis.speak(u);
    } catch (e) {}
  }

  async function markRead(id: string) {
    const tk = tokenRef.current;
    if (!tk || !id) return;
    try {
      await fetch('/api/driver-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tk, action: 'read', id: id }),
      });
    } catch (e) {}
    setAlerts(function (old) {
      return old.map(function (a) {
        return String(a.id) === String(id) ? { ...a, read: true } : a;
      });
    });
  }

  function closeNotice() {
    const cur = showingRef.current;
    if (!cur) return;
    setShowing(null);
    stopListening();
    markRead(String(cur.id));
  }

  function stopListening() {
    setListening(false);
    try {
      if (recRef.current) {
        recRef.current.onresult = null;
        recRef.current.onend = null;
        recRef.current.stop();
      }
    } catch (e) {}
    recRef.current = null;
  }

  function startListening() {
    try {
      const w: any = window;
      const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
      if (!SR) return;
      if (recRef.current) return;
      const r = new SR();
      r.lang = 'en-US';
      r.continuous = true;
      r.interimResults = true;
      r.onresult = function (ev: any) {
        let heard = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          heard = heard + ' ' + String(ev.results[i][0].transcript);
        }
        const said = heard.toLowerCase();
        if (said.indexOf('close notification') >= 0 || said.indexOf('close notifications') >= 0) {
          closeNotice();
        }
      };
      r.onend = function () {
        if (showingRef.current) {
          try { r.start(); } catch (e) {}
        }
      };
      r.onerror = function () {};
      recRef.current = r;
      r.start();
      setListening(true);
    } catch (e) {}
  }

  useEffect(function () {
    let alive = true;
    const pull = async function () {
      const tk = tokenRef.current;
      if (!tk) return;
      try {
        const r = await fetch('/api/driver-alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tk, action: 'mine' }),
        });
        const j: any = await r.json();
        if (!alive || !r.ok || !j || !j.ok) return;
        const list: Alert[] = j.alerts ? j.alerts : [];
        setAlerts(list);
        const un: Alert[] = j.unread ? j.unread : [];
        if (un.length > 0 && !showingRef.current) {
          const next = un[0];
          if (!spokenRef.current[String(next.id)]) {
            spokenRef.current[String(next.id)] = true;
            setShowing(next);
            sayIt(String(next.body));
            startListening();
          }
        }
      } catch (e) {}
    };
    pull();
    const t = setInterval(pull, 12000);
    return function () {
      alive = false;
      clearInterval(t);
      stopListening();
    };
  }, [props.token]);

  const unreadCount = alerts.filter(function (a) { return a.read !== true; }).length;

  const card: any = {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  };

  return (
    <div>
      {showing ? (
        <div
          style={{
            position: 'fixed',
            left: 12,
            right: 12,
            top: 12,
            zIndex: 9999,
            background: '#0f172a',
            color: '#fff',
            borderRadius: 16,
            padding: '16px 44px 16px 16px',
            boxShadow: '0 18px 50px rgba(0,0,0,0.45)',
            border: '2px solid #f5b301',
          }}
        >
          <button
            type='button'
            onClick={closeNotice}
            aria-label='Close this notice'
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 32,
              height: 32,
              borderRadius: 16,
              border: 'none',
              background: '#f5b301',
              color: '#0f172a',
              fontWeight: 900,
              fontSize: 18,
              cursor: 'pointer',
              lineHeight: '30px',
            }}
          >
            X
          </button>
          <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.1em', color: '#f5b301', marginBottom: 6 }}>
            MESSAGE FROM THE OFFICE
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.6 }}>{showing.body}</div>
          <div style={{ marginTop: 8, color: '#94a3b8', fontSize: 12, fontWeight: 700 }}>
            {listening ? 'You can also just say "close notification".' : 'Tap the X when you are done.'}
          </div>
        </div>
      ) : null}

      <div style={card}>
        <button
          type='button'
          onClick={function () { setOpenList(!openList); }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <span style={{ fontWeight: 900, color: '#0f172a', fontSize: 16 }}>Notifications</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {unreadCount > 0 ? (
              <span style={{ background: '#dc2626', color: '#fff', borderRadius: 999, padding: '2px 9px', fontWeight: 900, fontSize: 13 }}>
                {unreadCount}
              </span>
            ) : null}
            <span style={{ color: '#2563eb', fontWeight: 800, fontSize: 14 }}>{openList ? 'Hide' : 'Open'}</span>
          </span>
        </button>

        {openList ? (
          <div style={{ marginTop: 12 }}>
            {alerts.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: 14 }}>Nothing from the office yet.</div>
            ) : (
              alerts.map(function (a) {
                return (
                  <div
                    key={a.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      marginBottom: 10,
                      background: a.read ? '#f8fafc' : '#fffbeb',
                      border: '1px solid ' + (a.read ? '#e2e8f0' : '#fde68a'),
                    }}
                  >
                    <div style={{ color: '#0f172a', fontWeight: 700, lineHeight: 1.6 }}>{a.body}</div>
                    <div style={{ color: '#64748b', fontSize: 12, marginTop: 6 }}>
                      {a.created_at ? new Date(a.created_at).toLocaleString() : ''}
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                      <button
                        type='button'
                        onClick={function () { sayIt(String(a.body)); }}
                        style={{ border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a', borderRadius: 10, padding: '8px 12px', fontWeight: 800, cursor: 'pointer' }}
                      >
                        Read it to me
                      </button>
                      {a.read ? (
                        <span style={{ color: '#166534', fontWeight: 800, fontSize: 13, alignSelf: 'center' }}>Read</span>
                      ) : (
                        <button
                          type='button'
                          onClick={function () { markRead(String(a.id)); }}
                          style={{ border: 'none', background: '#0f172a', color: '#fff', borderRadius: 10, padding: '8px 12px', fontWeight: 800, cursor: 'pointer' }}
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
