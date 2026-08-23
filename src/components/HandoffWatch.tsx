'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getLang, speakTranslated } from '../lib/i18n';

type Notice = { state: string; rideId: string; message: string };

export default function HandoffWatch() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [listening, setListening] = useState(false);

  const spokenRef = useRef<any>({});
  const noticeRef = useRef<any>(null);
  const recRef = useRef<any>(null);

  useEffect(function () {
    noticeRef.current = notice;
  }, [notice]);

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
    setNotice(null);
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
        if (noticeRef.current) {
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
      let token = '';
      try {
        const s = await supabase.auth.getSession();
        token = s && s.data && s.data.session ? String(s.data.session.access_token) : '';
      } catch (e) {}
      try {
        const r = await fetch('/api/handoff-watch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token }),
        });
        const j: any = await r.json();
        if (!alive || !j || !j.ok) return;
        if (j.state === 'handoff' || j.state === 'refunded') {
          const key = String(j.state) + ':' + String(j.rideId);
          if (spokenRef.current[key]) return;
          spokenRef.current[key] = true;
          setNotice({ state: String(j.state), rideId: String(j.rideId), message: String(j.message) });
          sayIt(String(j.message));
          startListening();
        }
      } catch (e) {}
    };

    pull();
    const t = setInterval(pull, 15000);

    return function () {
      alive = false;
      clearInterval(t);
      stopListening();
    };
  }, []);

  if (!notice) return null;

  const money = notice.state === 'refunded';
  const edge = money ? '#16a34a' : '#f5b301';
  const head = money ? 'ABOUT YOUR FARE' : 'ABOUT YOUR RIDE';

  return (
    <div
      style={{
        position: 'fixed',
        left: 12,
        right: 12,
        top: 74,
        zIndex: 9999,
        background: '#0f172a',
        color: '#fff',
        borderRadius: 16,
        padding: '16px 44px 16px 16px',
        boxShadow: '0 18px 50px rgba(0,0,0,0.45)',
        border: '2px solid ' + edge,
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
          background: edge,
          color: '#0f172a',
          fontWeight: 900,
          fontSize: 18,
          cursor: 'pointer',
          lineHeight: '30px',
        }}
      >
        X
      </button>
      <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.1em', color: edge, marginBottom: 6 }}>{head}</div>
      <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.6 }}>{notice.message}</div>
      <div style={{ marginTop: 8, color: '#94a3b8', fontSize: 12, fontWeight: 700 }}>
        {listening ? 'You can also just say "close notification".' : 'Tap the X when you are done.'}
      </div>
    </div>
  );
}
