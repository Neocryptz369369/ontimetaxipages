'use client';

import { useState } from 'react';

export function starRow(value: number) {
  const n = Math.round(Number(value || 0));
  let out = '';
  for (let i = 1; i <= 5; i = i + 1) out = out + (i <= n ? '\u2605' : '\u2606');
  return out;
}

export default function RatingBox(props: {
  heading: string;
  who: string;
  where?: string;
  note?: string;
  busy?: boolean;
  error?: string;
  dark?: boolean;
  onSend: (stars: number, review: string) => void;
}) {
  const [stars, setStars] = useState(0);
  const [review, setReview] = useState('');
  const dark = props.dark === true;

  const box: React.CSSProperties = {
    borderRadius: 18,
    padding: '18px 18px 20px',
    marginBottom: 16,
    background: dark ? 'rgba(0,0,0,0.3)' : '#fff7ed',
    border: dark ? '1px solid rgba(255,255,255,0.14)' : '2px solid #fdba74',
    color: dark ? '#f8fafc' : '#7c2d12',
  };

  return (
    <div style={box}>
      <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 4 }}>{props.heading}</div>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{props.who}</div>
      {props.where ? <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 10 }}>{props.where}</div> : null}
      {props.note ? <div style={{ fontSize: 13, marginBottom: 12, lineHeight: 1.6 }}>{props.note}</div> : null}

      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type='button'
            onClick={() => setStars(n)}
            aria-label={n + ' stars'}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 34,
              lineHeight: 1,
              padding: 0,
              color: n <= stars ? '#f59e0b' : dark ? '#64748b' : '#d6d3d1',
            }}
          >
            {n <= stars ? '\u2605' : '\u2606'}
          </button>
        ))}
      </div>

      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder='Say something if you want to. You can leave this empty.'
        rows={3}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          borderRadius: 12,
          padding: '10px 12px',
          fontSize: 15,
          marginBottom: 12,
          border: '1px solid #cbd5e1',
          fontFamily: 'inherit',
        }}
      />

      {props.error ? (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '9px 12px', borderRadius: 10, fontSize: 14, marginBottom: 12 }}>
          {props.error}
        </div>
      ) : null}

      <button
        type='button'
        disabled={props.busy === true || stars < 1}
        onClick={() => props.onSend(stars, review)}
        style={{
          width: '100%',
          padding: '13px',
          borderRadius: 12,
          border: 'none',
          background: stars < 1 ? '#cbd5e1' : '#ea580c',
          color: '#fff',
          fontWeight: 900,
          fontSize: 16,
          cursor: stars < 1 ? 'default' : 'pointer',
        }}
      >
        {props.busy === true ? 'Sending...' : stars < 1 ? 'Pick your stars first' : 'Send my rating'}
      </button>
    </div>
  );
}
