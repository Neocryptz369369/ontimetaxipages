'use client';

import { useEffect, useRef, useState } from 'react';
import { getLang, speakTranslated } from '../lib/i18n';

type Alert = {
  id: string;
  kind: string;
  event: string;
  severity: string;
  headline: string;
  area: string;
  what: string;
  doThis: string;
  ends: string;
  loud: boolean;
  say: string;
};

function colours(kind: string) {
  if (kind === 'amber') return { edge: '#f97316', head: 'AMBER ALERT' };
  if (kind === 'emergency') return { edge: '#dc2626', head: 'EMERGENCY ALERT' };
  return { edge: '#38bdf8', head: 'WEATHER ALERT' };
}

export default function SafetyAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showing, setShowing] = useState<Alert | null>(null);
  const [openList, setOpenList] = useState(false);
  const [listening, setListening] = useState(false);
  const [note, setNote] = useState('Looking for alerts where you are...');

  const spotRef = useRef<any>(null);
  const spokenRef = useRef<any>({});
  const showingRef = useRef<any>(null);
  const recRef = useRef<any>(null);
  const watchRef = useRef<any>(null);

  useEffect(function () {
    showingRef.current = showing;
  }, [showing]);

  function sayIt(text: string) {
    try {
      speakTranslated(text, getLang());
    } catch (e) {}
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

  function closeNotice() {
    setShowing(null);
    stopListening();
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
          try {
            r.start();
          } catch (e) {}
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
      const spot = spotRef.current;
      if (!spot) return;
      try {
        const r = await fetch('/api/gov-alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: spot.lat, lng: spot.lng }),
        });
        const j: any = await r.json();
        if (!alive || !j || !j.ok) return;
        const list: Alert[] = j.alerts ? j.alerts : [];
        setAlerts(list);
        setNote(list.length === 0 ? 'Nothing going on where you are right now.' : '');

        let next: Alert | null = null;
        for (let i = 0; i < list.length; i++) {
          if (list[i].loud && !spokenRef.current[String(list[i].id)]) {
            next = list[i];
            break;
          }
        }
        if (next && !showingRef.current) {
          spokenRef.current[String(next.id)] = true;
          setShowing(next);
          sayIt(String(next.say || next.headline));
          startListening();
        }
      } catch (e) {}
    };

    try {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        watchRef.current = navigator.geolocation.watchPosition(
          function (pos) {
            const had = spotRef.current;
            spotRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            if (!had) pull();
          },
          function () {
            setNote('Turn on location if you want alerts for where you are.');
          },
          { enableHighAccuracy: false, maximumAge: 60000, timeout: 20000 }
        );
      } else {
        setNote('This phone will not share a location, so alerts cannot be looked up.');
      }
    } catch (e) {}

    const t = setInterval(pull, 180000);

    return function () {
      alive = false;
      clearInterval(t);
      stopListening();
      try {
        if (watchRef.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchRef.current);
      } catch (e) {}
    };
  }, []);

  const card: any = {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  };

  const loudCount = alerts.filter(function (a) {
    return a.loud;
  }).length;

  return (
    <div>
      {showing ? (
        <div
          style={{
            position: 'fixed',
            left: 12,
            right: 12,
            top: 74,
            zIndex: 9998,
            background: '#0f172a',
            color: '#fff',
            borderRadius: 16,
            padding: '16px 44px 16px 16px',
            boxShadow: '0 18px 50px rgba(0,0,0,0.45)',
            border: '2px solid ' + colours(showing.kind).edge,
            maxHeight: '60vh',
            overflowY: 'auto',
          }}
        >
          <button
            type='button'
            onClick={closeNotice}
            aria-label='Close this alert'
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 32,
              height: 32,
              borderRadius: 16,
              border: 'none',
              background: colours(showing.kind).edge,
              color: '#0f172a',
              fontWeight: 900,
              fontSize: 18,
              cursor: 'pointer',
              lineHeight: '30px',
            }}
          >
            X
          </button>
          <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.1em', color: colours(showing.kind).edge, marginBottom: 6 }}>
            {colours(showing.kind).head}
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.4 }}>{showing.event}</div>
          {showing.area ? <div style={{ fontSize: 14, color: '#94a3b8', fontWeight: 700, marginTop: 2 }}>{showing.area}</div> : null}
          <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.6, marginTop: 8 }}>{showing.headline}</div>
          {showing.doThis ? <div style={{ fontSize: 15, lineHeight: 1.6, marginTop: 8 }}>{showing.doThis}</div> : null}
          <div style={{ marginTop: 8, color: '#94a3b8', fontSize: 12, fontWeight: 700 }}>
            {listening ? 'You can also just say "close notification".' : 'Tap the X when you are done.'}
          </div>
        </div>
      ) : null}

      <div style={card}>
        <button
          type='button'
          onClick={function () {
            setOpenList(!openList);
          }}
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
          <span style={{ fontWeight: 900, color: '#0f172a', fontSize: 16 }}>Weather and emergency alerts</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {loudCount > 0 ? (
              <span style={{ background: '#dc2626', color: '#fff', borderRadius: 999, padding: '2px 9px', fontWeight: 900, fontSize: 13 }}>
                {loudCount}
              </span>
            ) : null}
            <span style={{ color: '#2563eb', fontWeight: 800, fontSize: 14 }}>{openList ? 'Hide' : 'Open'}</span>
          </span>
        </button>

        {openList ? (
          <div style={{ marginTop: 12 }}>
            {alerts.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: 14 }}>{note}</div>
            ) : (
              alerts.map(function (a) {
                const c = colours(a.kind);
                return (
                  <div
                    key={a.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      marginBottom: 10,
                      background: '#f8fafc',
                      borderLeft: '6px solid ' + c.edge,
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', color: c.edge }}>{c.head}</div>
                    <div style={{ color: '#0f172a', fontWeight: 900, lineHeight: 1.5, marginTop: 2 }}>{a.event}</div>
                    {a.area ? <div style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{a.area}</div> : null}
                    <div style={{ color: '#0f172a', fontSize: 14, lineHeight: 1.6, marginTop: 6 }}>{a.headline}</div>
                    {a.doThis ? <div style={{ color: '#334155', fontSize: 14, lineHeight: 1.6, marginTop: 6 }}>{a.doThis}</div> : null}
                    <button
                      type='button'
                      onClick={function () {
                        sayIt(String(a.say || a.headline));
                      }}
                      style={{
                        marginTop: 8,
                        border: '1px solid #cbd5e1',
                        background: '#fff',
                        color: '#0f172a',
                        borderRadius: 10,
                        padding: '8px 12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Read it to me
                    </button>
                  </div>
                );
              })
            )}
            <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 6 }}>
              Straight from the National Weather Service for the spot you are sitting in.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
