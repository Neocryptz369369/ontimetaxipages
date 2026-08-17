'use client';

import { useEffect, useRef, useState } from 'react';

function starRow(n: number) {
  const full = Math.round(Number(n || 0));
  let out = '';
  for (let i = 1; i <= 5; i++) out = out + (i <= full ? '\u2605' : '\u2606');
  return out;
}

function when(v: any) {
  if (!v) return '';
  try { return new Date(v).toLocaleString(); } catch (e) { return ''; }
}

export default function DriverRecord(props: { token?: string }) {
  const [data, setData] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const tokenRef = useRef('');

  useEffect(function () {
    tokenRef.current = props.token ? String(props.token) : '';
  }, [props.token]);

  useEffect(function () {
    let alive = true;
    const pull = async function () {
      const tk = tokenRef.current;
      if (!tk) return;
      try {
        const r = await fetch('/api/driver-record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tk }),
        });
        const j: any = await r.json();
        if (alive && r.ok && j && j.ok) setData(j);
      } catch (e) {}
    };
    pull();
    const t = setInterval(pull, 30000);
    return function () { alive = false; clearInterval(t); };
  }, [props.token]);

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
  const box: any = {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '10px 12px',
    marginBottom: 8,
  };

  const stars = data ? Number(data.stars || 0) : 0;
  const starCount = data ? Number(data.starCount || 0) : 0;
  const speeding: any[] = data && data.speeding ? data.speeding : [];
  const accidents: any[] = data && data.accidents ? data.accidents : [];
  const panics: any[] = data && data.panics ? data.panics : [];
  const reviews: any[] = data && data.reviews ? data.reviews : [];
  const strikes = data ? Number(data.strikes || 0) : 0;

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18, color: '#0f172a' }}>Your record</div>
          <div style={{ color: '#64748b', fontSize: 13 }}>
            The same things the owner can see about you: your stars, your speed, your accident reports and your panic button.
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

      <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ ...box, flex: '1 1 130px', marginBottom: 0 }}>
          <div style={{ color: '#64748b', fontSize: 12, fontWeight: 800 }}>YOUR STARS</div>
          <div style={{ color: '#b45309', fontSize: 20, fontWeight: 900 }}>{starRow(stars)}</div>
          <div style={{ color: '#0f172a', fontSize: 13, fontWeight: 700 }}>
            {starCount === 0 ? 'No riders have rated you yet' : stars + ' out of 5 from ' + starCount + (starCount === 1 ? ' rider' : ' riders')}
          </div>
        </div>
        <div style={{ ...box, flex: '1 1 130px', marginBottom: 0, background: speeding.length > 0 ? '#fee2e2' : '#f8fafc', border: speeding.length > 0 ? '1px solid #fca5a5' : '1px solid #e2e8f0' }}>
          <div style={{ color: '#64748b', fontSize: 12, fontWeight: 800 }}>SPEEDING</div>
          <div style={{ color: speeding.length > 0 ? '#991b1b' : '#166534', fontSize: 15, fontWeight: 900 }}>
            {speeding.length === 0 ? 'Clean' : speeding.length + (speeding.length === 1 ? ' time on record' : ' times on record')}
          </div>
          <div style={{ color: '#0f172a', fontSize: 13, fontWeight: 700 }}>
            {strikes > 0 ? strikes + (strikes === 1 ? ' strike' : ' strikes') : 'No strikes'}
          </div>
        </div>
      </div>

      {open ? (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>What riders said about you</div>
          {reviews.length === 0 ? (
            <div style={{ color: '#64748b', marginBottom: 10 }}>Nothing yet.</div>
          ) : (
            reviews.map(function (r: any, i: number) {
              return (
                <div key={i} style={box}>
                  <div style={{ color: '#b45309', fontWeight: 900, fontSize: 16 }}>{starRow(r.stars)}</div>
                  {r.review ? <div style={{ color: '#0f172a', fontSize: 14, marginTop: 3 }}>{r.review}</div> : null}
                  <div style={{ color: '#64748b', fontSize: 12, marginTop: 3 }}>{r.name} - {when(r.createdAt)}</div>
                </div>
              );
            })
          )}

          <div style={{ fontWeight: 900, color: '#0f172a', margin: '12px 0 6px' }}>Times you went over the speed limit</div>
          {speeding.length === 0 ? (
            <div style={{ color: '#166534', fontWeight: 700, marginBottom: 10 }}>None on record. Keep it that way.</div>
          ) : (
            speeding.map(function (s: any) {
              return (
                <div key={s.id} style={{ ...box, background: '#fff1f1', border: '1px solid #fca5a5' }}>
                  <div style={{ color: '#991b1b', fontWeight: 900, fontSize: 15 }}>
                    {Math.round(Number(s.mph || 0))} mph in a {Math.round(Number(s.limit_mph || 0))} zone
                    {s.over_by ? ' - ' + Math.round(Number(s.over_by)) + ' over' : ''}
                  </div>
                  <div style={{ color: '#64748b', fontSize: 12 }}>{when(s.created_at)}</div>
                  {s.removed ? <div style={{ color: '#991b1b', fontSize: 13, fontWeight: 800 }}>You were taken off that run</div> : null}
                </div>
              );
            })
          )}

          <div style={{ fontWeight: 900, color: '#0f172a', margin: '12px 0 6px' }}>Accidents you reported</div>
          {accidents.length === 0 ? (
            <div style={{ color: '#64748b', marginBottom: 10 }}>None.</div>
          ) : (
            accidents.map(function (a: any) {
              return (
                <div key={a.id} style={box}>
                  <div style={{ color: '#0f172a', fontWeight: 700, fontSize: 14 }}>{a.details ? a.details : 'Accident report'}</div>
                  {a.address ? <div style={{ color: '#475569', fontSize: 13 }}>{a.address}</div> : null}
                  <div style={{ color: '#64748b', fontSize: 12, marginTop: 3 }}>
                    {when(a.created_at)}{a.status ? ' - ' + a.status : ''}
                  </div>
                </div>
              );
            })
          )}

          <div style={{ fontWeight: 900, color: '#0f172a', margin: '12px 0 6px' }}>Times you pressed the panic button</div>
          {panics.length === 0 ? (
            <div style={{ color: '#64748b' }}>None.</div>
          ) : (
            panics.map(function (p: any) {
              return (
                <div key={p.id} style={{ ...box, background: '#fff1f1', border: '1px solid #fca5a5' }}>
                  <div style={{ color: '#991b1b', fontWeight: 900, fontSize: 14 }}>Panic button pressed</div>
                  {p.note ? <div style={{ color: '#0f172a', fontSize: 14 }}>{p.note}</div> : null}
                  <div style={{ color: '#64748b', fontSize: 12, marginTop: 3 }}>
                    {when(p.created_at)}{p.status ? ' - ' + p.status : ''}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
