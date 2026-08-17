'use client';

import { useEffect, useRef } from 'react';

export const RECORDING_AGREEMENT_TEXT =
  'I agree that On Time Taxi may record sound and video from my phone when an emergency or panic button is pressed during a ride, by me or by the other person in the car. The recording is saved as evidence in the On Time Taxi panic archive and it may be given to the police, to the insurance company and to the owner of On Time Taxi. My phone will also ask me for permission at the moment it starts recording.';

export const FEE_AGREEMENT_TEXT =
  'I understand and agree that On Time Taxi keeps a 5 dollar get in fee out of every single ride I drive. After that 5 dollar get in fee is taken out, On Time Taxi also keeps 20 percent of the fare that is left over. What I am paid for a ride is the fare that is left after the 5 dollar get in fee and the 20 percent are taken out. All tips are mine to keep. I agree that these amounts come out of every ride I drive for On Time Taxi.';

export type Signature = { name: string; image: string; signedAt: string };

export const blankSignature: Signature = { name: '', image: '', signedAt: '' };

export function isSigned(sig: Signature | null | undefined) {
  if (!sig) return false;
  if (String(sig.name || '').trim().length < 3) return false;
  return String(sig.image || '').slice(0, 11) === 'data:image/';
}

function paintBlank(c: HTMLCanvasElement) {
  const ctx = c.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

export function SignHere(props: {
  title: string;
  text: string;
  dark?: boolean;
  value: Signature;
  onChange: (value: Signature) => void;
}) {
  const dark = props.dark === true;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const wide = c.clientWidth > 40 ? Math.round(c.clientWidth) : 320;
    c.width = wide * 2;
    c.height = 300;
    paintBlank(c);
  }, []);

  function spot(e: any) {
    const c = canvasRef.current;
    if (!c) return { x: 0, y: 0 };
    const box = c.getBoundingClientRect();
    const px = e.clientX - box.left;
    const py = e.clientY - box.top;
    const wide = box.width > 0 ? box.width : 1;
    const tall = box.height > 0 ? box.height : 1;
    return { x: px * (c.width / wide), y: py * (c.height / tall) };
  }

  function down(e: any) {
    const c = canvasRef.current;
    if (!c) return;
    if (e.preventDefault) e.preventDefault();
    drawing.current = true;
    last.current = spot(e);
    try { c.setPointerCapture(e.pointerId); } catch (err) {}
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.arc(last.current.x, last.current.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
    }
  }

  function move(e: any) {
    if (!drawing.current) return;
    const c = canvasRef.current;
    if (!c) return;
    if (e.preventDefault) e.preventDefault();
    const ctx = c.getContext('2d');
    const p = spot(e);
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(last.current.x, last.current.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    last.current = p;
  }

  function up() {
    if (!drawing.current) return;
    drawing.current = false;
    const c = canvasRef.current;
    if (!c) return;
    let picture = '';
    try { picture = c.toDataURL('image/png'); } catch (err) { picture = ''; }
    props.onChange({ name: props.value.name, image: picture, signedAt: new Date().toISOString() });
  }

  function clearIt() {
    const c = canvasRef.current;
    if (c) paintBlank(c);
    props.onChange({ name: props.value.name, image: '', signedAt: '' });
  }

  const box: React.CSSProperties = {
    borderRadius: 14,
    padding: '14px 16px',
    marginBottom: 16,
    background: dark ? 'rgba(0,0,0,0.24)' : '#f8fafc',
    border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #cbd5e1',
    color: dark ? '#e8fff5' : '#334155',
  };

  const done = isSigned(props.value);
  const today = new Date().toLocaleDateString();

  return (
    <div style={box}>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8, color: dark ? '#ffffff' : '#0f172a' }}>
        {props.title}
      </div>
      <p style={{ margin: '0 0 12px', fontSize: 14, lineHeight: 1.7 }}>{props.text}</p>

      <label style={{ display: 'block', fontSize: 13, fontWeight: 800, marginBottom: 6 }}>
        Type your full legal name
      </label>
      <input
        type='text'
        value={props.value.name}
        onChange={(e) => props.onChange({ name: e.target.value, image: props.value.image, signedAt: props.value.signedAt })}
        placeholder='First and last name'
        style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 16, marginBottom: 12, background: '#ffffff', color: '#0f172a' }}
      />

      <label style={{ display: 'block', fontSize: 13, fontWeight: 800, marginBottom: 6 }}>
        Sign your name in the box with your finger or your mouse
      </label>
      <canvas
        ref={canvasRef}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
        onPointerCancel={up}
        style={{ width: '100%', height: 150, display: 'block', background: '#ffffff', border: '2px dashed #94a3b8', borderRadius: 12, touchAction: 'none', cursor: 'crosshair' }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: done ? '#15803d' : dark ? '#fca5a5' : '#b91c1c' }}>
          {done ? 'Signed on ' + today : 'Not signed yet'}
        </div>
        <button
          type='button'
          onClick={clearIt}
          style={{ border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', borderRadius: 10, padding: '8px 12px', fontWeight: 800, cursor: 'pointer' }}
        >
          Clear and sign again
        </button>
      </div>

      <div style={{ fontSize: 12, marginTop: 8, color: dark ? '#cbd5e1' : '#64748b' }}>
        Today is {today}. Your typed name, your signature and this date are all saved with this agreement.
      </div>
    </div>
  );
}

export default function RecordingAgreement(props: { dark?: boolean; value: Signature; onChange: (value: Signature) => void }) {
  return (
    <SignHere
      title='Recording agreement - please sign your name'
      text={RECORDING_AGREEMENT_TEXT}
      dark={props.dark}
      value={props.value}
      onChange={props.onChange}
    />
  );
}

export function FeeAgreement(props: { dark?: boolean; value: Signature; onChange: (value: Signature) => void }) {
  return (
    <SignHere
      title='The 5 dollar get in fee and the 20 percent - please sign your name'
      text={FEE_AGREEMENT_TEXT}
      dark={props.dark}
      value={props.value}
      onChange={props.onChange}
    />
  );
}
