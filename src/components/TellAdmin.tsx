'use client';

import { useEffect, useRef, useState } from 'react';
import { getLang, speakTranslated } from '../lib/i18n';

type Sent = { id: string; created_at: string; kind: string; body: string; status: string; handled_at: string | null };

const QUICK = [
  'I am running late',
  'Car trouble',
  'Traffic or the road is closed',
  'Problem with the rider',
  'I need help right now',
];

export default function TellAdmin(props: { token?: string; compact?: boolean }) {
  const [text, setText] = useState('');
  const [kind, setKind] = useState('message');
  const [sent, setSent] = useState<Sent[]>([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const [open, setOpen] = useState(true);

  const tokenRef = useRef('');
  const recRef = useRef<any>(null);
  const textRef = useRef('');
  const keepRef = useRef(false);

  useEffect(function () {
    tokenRef.current = props.token ? String(props.token) : '';
  }, [props.token]);

  useEffect(function () {
    textRef.current = text;
  }, [text]);

  function sayIt(words: string) {
    try { speakTranslated(words, getLang()); } catch (e) {}
  }

  async function loadMine() {
    const tk = tokenRef.current;
    if (!tk) return;
    try {
      const r = await fetch('/api/driver-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tk, action: 'mine' }),
      });
      const j: any = await r.json();
      if (r.ok && j && j.ok) setSent(j.messages ? j.messages : []);
    } catch (e) {}
  }

  useEffect(function () {
    loadMine();
    const t = setInterval(loadMine, 20000);
    return function () { clearInterval(t); };
  }, [props.token]);

  function stopListening() {
    keepRef.current = false;
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

  async function sendIt(words: string, why: string) {
    const tk = tokenRef.current;
    const clean = String(words || '').trim();
    setError('');
    setNote('');
    if (!tk) { setError('Please sign in again.'); return; }
    if (!clean) { setError('Say or type your message first.'); return; }
    setBusy(true);
    try {
      const r = await fetch('/api/driver-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tk, action: 'send', body: clean, kind: why || 'message' }),
      });
      const j: any = await r.json();
      setBusy(false);
      if (!r.ok || !j || !j.ok) {
        const msg = j && j.error ? String(j.error) : 'Your message did not go through.';
        setError(msg);
        sayIt(msg);
        return;
      }
      setText('');
      textRef.current = '';
      setKind('message');
      setNote('Sent to the owner.');
      sayIt('Your message was sent to the owner.');
      loadMine();
    } catch (e) {
      setBusy(false);
      setError('Your message did not go through.');
    }
  }

  function startListening() {
    const w: any = window;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setError('This phone will not let me listen. Please type it instead.');
      return;
    }
    if (recRef.current) return;
    try {
      const r = new SR();
      r.lang = 'en-US';
      r.continuous = true;
      r.interimResults = false;
      r.onresult = function (ev: any) {
        let heard = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          heard = heard + ' ' + String(ev.results[i][0].transcript);
        }
        heard = heard.replace(/\s+/g, ' ').trim();
        if (!heard) return;
        const low = heard.toLowerCase();
        const cut = low.lastIndexOf('send');
        if (cut >= 0 && low.slice(cut).replace(/[^a-z]/g, '') === 'send') {
          const words = (textRef.current + ' ' + heard.slice(0, cut)).replace(/\s+/g, ' ').trim();
          setText(words);
          textRef.current = words;
          stopListening();
          sendIt(words, kind);
          return;
        }
        const joined = (textRef.current + ' ' + heard).replace(/\s+/g, ' ').trim();
        setText(joined);
        textRef.current = joined;
      };
      r.onend = function () {
        if (keepRef.current) {
          try { r.start(); } catch (e) {}
        }
      };
      r.onerror = function () {};
      recRef.current = r;
      keepRef.current = true;
      r.start();
      setListening(true);
      sayIt('Go ahead. Say your message, then say send.');
    } catch (e) {
      setError('This phone will not let me listen. Please type it instead.');
    }
  }

  useEffect(function () {
    return function () { stopListening(); };
  }, []);

  const waiting = sent.filter(function (s) { return String(s.status) !== 'handled'; }).length;

  const card: any = {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  };
  const btn: any = {
    border: 'none',
    borderRadius: 12,
    padding: '12px 14px',
    fontWeight: 800,
    fontSize: 15,
    cursor: 'pointer',
  };
  const chip: any = {
    border: '1px solid #cbd5e1',
    background: '#f8fafc',
    color: '#0f172a',
    borderRadius: 999,
    padding: '8px 12px',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    marginRight: 6,
    marginBottom: 6,
  };

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18, color: '#0f172a' }}>Tell the owner</div>
          <div style={{ color: '#64748b', fontSize: 13 }}>
            Send a message straight to the admin panel. You can speak it so you never touch the phone while driving.
          </div>
        </div>
        <button
          type='button'
          onClick={function () { setOpen(!open); }}
          style={{ ...btn, background: open ? '#e2e8f0' : '#0f172a', color: open ? '#0f172a' : '#fff' }}
        >
          {open ? 'Hide' : 'Open'}
        </button>
      </div>

      {waiting > 0 ? (
        <div style={{ marginTop: 10, background: '#fef3c7', border: '1px solid #fcd34d', color: '#92400e', borderRadius: 12, padding: '9px 12px', fontWeight: 800, fontSize: 13 }}>
          {waiting === 1 ? '1 message is waiting on the owner.' : waiting + ' messages are waiting on the owner.'}
        </div>
      ) : null}

      {open ? (
        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 8 }}>
            {QUICK.map(function (q) {
              return (
                <button
                  key={q}
                  type='button'
                  onClick={function () {
                    const joined = (textRef.current + ' ' + q).replace(/\s+/g, ' ').trim();
                    setText(joined);
                    textRef.current = joined;
                    setKind(q);
                  }}
                  style={chip}
                >
                  {q}
                </button>
              );
            })}
          </div>

          <textarea
            value={text}
            onChange={function (e) { setText(e.target.value); textRef.current = e.target.value; }}
            placeholder='What do you need the owner to know?'
            rows={props.compact ? 2 : 3}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              borderRadius: 12,
              border: '1px solid #cbd5e1',
              padding: '11px 12px',
              fontSize: 16,
              marginBottom: 10,
            }}
          />

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type='button'
              onClick={function () { if (listening) { stopListening(); } else { startListening(); } }}
              style={{ ...btn, background: listening ? '#b81111' : '#f5b301', color: listening ? '#fff' : '#111', flex: '1 1 180px' }}
            >
              {listening ? 'Listening - say send when you are done' : 'Speak it instead of typing'}
            </button>
            <button
              type='button'
              disabled={busy}
              onClick={function () { sendIt(text, kind); }}
              style={{ ...btn, background: '#128a3d', color: '#fff', flex: '1 1 120px', opacity: busy ? 0.6 : 1 }}
            >
              {busy ? 'Sending...' : 'Send to the owner'}
            </button>
          </div>

          {note ? (
            <div style={{ marginTop: 10, background: '#dcfce7', border: '1px solid #86efac', color: '#166534', borderRadius: 12, padding: '9px 12px', fontWeight: 800 }}>
              {note}
            </div>
          ) : null}
          {error ? (
            <div style={{ marginTop: 10, background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: 12, padding: '9px 12px', fontWeight: 800 }}>
              {error}
            </div>
          ) : null}

          {sent.length > 0 ? (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>What you have sent</div>
              {sent.slice(0, 8).map(function (s) {
                const done = String(s.status) === 'handled';
                return (
                  <div
                    key={s.id}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 12,
                      padding: '10px 12px',
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ color: '#0f172a', fontWeight: 700, fontSize: 14 }}>{s.body}</div>
                    <div style={{ color: done ? '#166534' : '#92400e', fontWeight: 800, fontSize: 12, marginTop: 4 }}>
                      {done ? 'The owner handled this' : 'Waiting on the owner'}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
