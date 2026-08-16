'use client';

import { useEffect, useState } from 'react';

export default function Ticker(props: { dark?: boolean }) {
  const dark = props.dark === true;
  const [on, setOn] = useState(false);
  const [text, setText] = useState('');
  const [speed, setSpeed] = useState(5);

  useEffect(function () {
    let alive = true;
    const pull = async function () {
      try {
        const r = await fetch('/api/ticker', { cache: 'no-store' });
        const j: any = await r.json();
        if (!alive || !j) return;
        setOn(j.on === true);
        setText(j.text ? String(j.text) : '');
        const sp = Number(j.speed);
        setSpeed(isFinite(sp) && sp > 0 ? sp : 5);
      } catch (e) {}
    };
    pull();
    const t = setInterval(pull, 30000);
    return function () {
      alive = false;
      clearInterval(t);
    };
  }, []);

  if (!on) return null;
  if (!text || text.trim() === '') return null;

  let secs = Math.round(100 / speed);
  if (secs < 6) secs = 6;
  if (secs > 120) secs = 120;

  return (
    <div
      style={{
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        borderRadius: 12,
        padding: '10px 0',
        marginBottom: 14,
        background: dark ? '#1e293b' : '#0f172a',
        border: '1px solid ' + (dark ? 'rgba(255,255,255,0.14)' : '#0f172a'),
      }}
    >
      <style>{'@keyframes otTickerScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }'}</style>
      <div
        style={{
          display: 'flex',
          width: 'max-content',
          animation: 'otTickerScroll ' + secs + 's linear infinite',
        }}
      >
        <span style={{ paddingRight: 80, color: '#ffffff', fontWeight: 800, fontSize: 15 }}>{text}</span>
        <span style={{ paddingRight: 80, color: '#ffffff', fontWeight: 800, fontSize: 15 }}>{text}</span>
      </div>
    </div>
  );
}
