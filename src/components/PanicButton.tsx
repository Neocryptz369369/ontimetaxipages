'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  role: 'rider' | 'driver' | 'admin';
  rideId?: string | null;
  token?: string | null;
  whoName?: string | null;
  whoPhone?: string | null;
};

const MAX_SECONDS = 45;

export default function PanicButton(props: Props) {
  const [step, setStep] = useState('idle');
  const [note, setNote] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [sentAt, setSentAt] = useState('');
  const [problem, setProblem] = useState('');

  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<any>(null);
  const chunks = useRef<any[]>([]);
  const kindRef = useRef('video');
  const idRef = useRef('');
  const startedRef = useRef(0);
  const timerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      dropTracks();
    };
  }, []);

  function dropTracks() {
    const s = streamRef.current;
    if (s) {
      try {
        s.getTracks().forEach((t: any) => t.stop());
      } catch (err) {}
    }
    streamRef.current = null;
  }

  function getSpot(): Promise<any> {
    return new Promise((resolve) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        resolve({ lat: null, lng: null });
        return;
      }
      let finished = false;
      const t = setTimeout(() => {
        if (!finished) {
          finished = true;
          resolve({ lat: null, lng: null });
        }
      }, 6000);
      navigator.geolocation.getCurrentPosition(
        (p) => {
          if (!finished) {
            finished = true;
            clearTimeout(t);
            resolve({ lat: p.coords.latitude, lng: p.coords.longitude });
          }
        },
        () => {
          if (!finished) {
            finished = true;
            clearTimeout(t);
            resolve({ lat: null, lng: null });
          }
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    });
  }

  async function sendAlert() {
    setProblem('');
    setStep('sending');
    const spot = await getSpot();
    try {
      const r = await fetch('/api/panic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          role: props.role,
          ride_id: props.rideId || null,
          token: props.token || '',
          who_name: props.whoName || null,
          who_phone: props.whoPhone || null,
          note: note || null,
          lat: spot.lat,
          lng: spot.lng,
        }),
      });
      const j = await r.json();
      if (!r.ok || !j.id) {
        setProblem(j.error || 'The alert did not go through. Call 911 right now.');
        setStep('confirm');
        return;
      }
      idRef.current = j.id;
      setSentAt(new Date().toLocaleString());
    } catch (err) {
      setProblem('The alert did not go through. Call 911 right now.');
      setStep('confirm');
      return;
    }
    startRecording();
  }

  async function startRecording() {
    let stream: any = null;
    kindRef.current = 'video';
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: true });
    } catch (err) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        kindRef.current = 'audio';
      } catch (err2) {
        stream = null;
      }
    }
    if (!stream) {
      setProblem('Help was alerted. The phone did not allow the camera or the microphone, so nothing was recorded.');
      setStep('done');
      return;
    }
    streamRef.current = stream;
    if (videoRef.current && kindRef.current === 'video') {
      try {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      } catch (err) {}
    }
    chunks.current = [];
    const picks = kindRef.current === 'video'
      ? ['video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4']
      : ['audio/webm', 'audio/mp4'];
    let mime = '';
    const MR: any = (window as any).MediaRecorder;
    for (const p of picks) {
      try {
        if (MR && MR.isTypeSupported && MR.isTypeSupported(p)) {
          mime = p;
          break;
        }
      } catch (err) {}
    }
    let rec: any = null;
    try {
      rec = mime ? new MR(stream, { mimeType: mime }) : new MR(stream);
    } catch (err) {
      dropTracks();
      setProblem('Help was alerted. This phone cannot record.');
      setStep('done');
      return;
    }
    recRef.current = rec;
    rec.ondataavailable = (ev: any) => {
      if (ev.data && ev.data.size > 0) {
        chunks.current.push(ev.data);
      }
    };
    rec.onstop = () => {
      saveRecording();
    };
    try {
      rec.start(1000);
    } catch (err) {
      rec.start();
    }
    startedRef.current = Date.now();
    setSeconds(0);
    setStep('recording');
    timerRef.current = setInterval(() => {
      const s = Math.round((Date.now() - startedRef.current) / 1000);
      setSeconds(s);
      if (s >= MAX_SECONDS) {
        stopRecording();
      }
    }, 1000);
  }

  function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const rec = recRef.current;
    if (rec && rec.state !== 'inactive') {
      try {
        rec.stop();
      } catch (err) {}
    }
  }

  async function saveRecording() {
    setStep('saving');
    const took = Math.round((Date.now() - startedRef.current) / 1000);
    dropTracks();
    try {
      const blob = new Blob(chunks.current, { type: kindRef.current === 'video' ? 'video/webm' : 'audio/webm' });
      const fd = new FormData();
      fd.append('panic_id', idRef.current);
      fd.append('kind', kindRef.current);
      fd.append('seconds', String(took));
      fd.append('file', blob, 'panic.webm');
      const r = await fetch('/api/panic', { method: 'POST', body: fd });
      if (!r.ok) {
        setProblem('Help was alerted, but the recording did not upload.');
      }
    } catch (err) {
      setProblem('Help was alerted, but the recording did not upload.');
    }
    setStep('done');
  }

  const box: any = {
    border: '1px solid rgba(239,68,68,0.55)',
    background: 'rgba(127,29,29,0.18)',
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
  };

  if (step === 'idle') {
    return (
      <div style={box}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>Emergency</div>
        <p style={{ margin: '0 0 12px 0', opacity: 0.85, fontSize: 14 }}>
          If you feel unsafe, press this. It sends your location to On Time Taxi and starts a
          camera and microphone recording on this phone as evidence.
        </p>
        <button
          onClick={() => setStep('confirm')}
          style={{
            width: '100%',
            padding: '18px 14px',
            fontSize: 20,
            fontWeight: 900,
            letterSpacing: 1,
            color: '#fff',
            background: '#dc2626',
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
          }}
        >
          PANIC
        </button>
      </div>
    );
  }

  if (step === 'confirm' || step === 'sending') {
    return (
      <div style={box}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>Send the panic alert</div>
        <p style={{ margin: '0 0 10px 0', fontSize: 14, opacity: 0.9 }}>
          Please read this before you send it:
        </p>
        <ul style={{ margin: '0 0 12px 18px', padding: 0, fontSize: 14, opacity: 0.9 }}>
          <li>On Time Taxi is alerted right away with your location, the date and the time.</li>
          <li>This phone will record video and sound for up to 45 seconds.</li>
          <li>The recording is saved for the company and can be given to police.</li>
          <li>Your phone will ask you to allow the camera and the microphone. Please say allow.</li>
        </ul>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What is happening (optional)"
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.18)',
            background: 'rgba(0,0,0,0.35)',
            color: '#fff',
            marginBottom: 12,
          }}
        />
        {problem ? (
          <div style={{ color: '#fca5a5', fontSize: 14, marginBottom: 10 }}>{problem}</div>
        ) : null}
        <button
          disabled={step === 'sending'}
          onClick={sendAlert}
          style={{
            width: '100%',
            padding: '18px 14px',
            fontSize: 18,
            fontWeight: 900,
            color: '#fff',
            background: step === 'sending' ? '#7f1d1d' : '#dc2626',
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
          }}
        >
          {step === 'sending' ? 'SENDING...' : 'YES, SEND IT AND RECORD'}
        </button>
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <a
            href="tel:911"
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '12px 10px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Call 911
          </a>
          <button
            onClick={() => { setStep('idle'); setProblem(''); }}
            style={{
              flex: 1,
              padding: '12px 10px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.25)',
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (step === 'recording' || step === 'saving') {
    const left = MAX_SECONDS - seconds;
    return (
      <div style={box}>
        <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6, color: '#fca5a5' }}>
          {step === 'saving' ? 'Saving the recording...' : 'RECORDING NOW'}
        </div>
        <p style={{ margin: '0 0 10px 0', fontSize: 14, opacity: 0.9 }}>
          Help has been alerted. Keep the phone where it can see and hear.
          {step === 'recording' ? ' Time left: ' + (left > 0 ? left : 0) + ' seconds.' : ''}
        </p>
        <video
          ref={videoRef}
          muted
          playsInline
          style={{ width: '100%', maxHeight: 180, borderRadius: 10, background: '#000' }}
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <a
            href="tel:911"
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '12px 10px',
              borderRadius: 10,
              background: '#dc2626',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 800,
            }}
          >
            Call 911
          </a>
          <button
            disabled={step === 'saving'}
            onClick={stopRecording}
            style={{
              flex: 1,
              padding: '12px 10px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.25)',
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Stop and save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={box}>
      <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6, color: '#86efac' }}>
        Alert sent
      </div>
      <p style={{ margin: '0 0 10px 0', fontSize: 14, opacity: 0.9 }}>
        On Time Taxi has your alert{sentAt ? ' from ' + sentAt : ''}. The recording is filed in the
        panic archive.
      </p>
      {problem ? (
        <div style={{ color: '#fca5a5', fontSize: 14, marginBottom: 10 }}>{problem}</div>
      ) : null}
      <div style={{ display: 'flex', gap: 10 }}>
        <a
          href="tel:911"
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '12px 10px',
            borderRadius: 10,
            background: '#dc2626',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 800,
          }}
        >
          Call 911
        </a>
        <button
          onClick={() => { setStep('idle'); setProblem(''); setNote(''); }}
          style={{
            flex: 1,
            padding: '12px 10px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.25)',
            background: 'transparent',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}
