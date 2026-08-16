'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  role: 'rider' | 'driver' | 'admin';
  rideId?: string | null;
  token?: string | null;
  whoName?: string | null;
  whoPhone?: string | null;
};

const PART_SECONDS = 15;

function niceTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m <= 0) return s + ' seconds';
  return m + ' min ' + s + ' sec';
}

export default function PanicButton(props: Props) {
  const [step, setStep] = useState('idle');
  const [note, setNote] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [parts, setParts] = useState(0);
  const [saved, setSaved] = useState(0);
  const [sentAt, setSentAt] = useState('');
  const [problem, setProblem] = useState('');
  const [gotSound, setGotSound] = useState(false);
  const [gotPicture, setGotPicture] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<any>(null);
  const chunks = useRef<any[]>([]);
  const kindRef = useRef('video');
  const mimeRef = useRef('');
  const idRef = useRef('');
  const startedRef = useRef(0);
  const partStartRef = useRef(0);
  const partNoRef = useRef(0);
  const keepRef = useRef(false);
  const timerRef = useRef<any>(null);
  const busyRef = useRef(0);
  const savedRef = useRef(0);
  const lockRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      keepRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      letScreenSleep();
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

  async function keepScreenAwake() {
    try {
      const nav: any = navigator;
      if (nav && nav.wakeLock && nav.wakeLock.request) {
        lockRef.current = await nav.wakeLock.request('screen');
      }
    } catch (err) {}
  }

  function letScreenSleep() {
    try {
      if (lockRef.current && lockRef.current.release) {
        lockRef.current.release();
      }
    } catch (err) {}
    lockRef.current = null;
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

  async function openCamera(): Promise<any> {
    const md: any = navigator.mediaDevices;
    if (!md || !md.getUserMedia) return null;
    let cam: any = null;
    const asks = [
      { video: { facingMode: 'environment' }, audio: true },
      { video: true, audio: true },
    ];
    for (const ask of asks) {
      try {
        cam = await md.getUserMedia(ask);
      } catch (err) {
        cam = null;
      }
      if (cam) break;
    }
    if (cam) {
      let sound = cam.getAudioTracks();
      if (!sound || sound.length === 0) {
        try {
          const mic = await md.getUserMedia({ audio: true });
          const all = cam.getVideoTracks().concat(mic.getAudioTracks());
          cam = new MediaStream(all);
        } catch (err) {}
      }
      return cam;
    }
    try {
      cam = await md.getUserMedia({ audio: true });
    } catch (err) {
      cam = null;
    }
    if (cam) return cam;
    try {
      cam = await md.getUserMedia({ video: true });
    } catch (err) {
      cam = null;
    }
    return cam;
  }

  function pickMime(kind: string) {
    const picks = kind === 'video'
      ? ['video/webm;codecs=vp8,opus', 'video/webm;codecs=vp9,opus', 'video/webm', 'video/mp4']
      : ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
    const MR: any = (window as any).MediaRecorder;
    for (const p of picks) {
      try {
        if (MR && MR.isTypeSupported && MR.isTypeSupported(p)) return p;
      } catch (err) {}
    }
    return '';
  }

  async function startRecording() {
    const stream = await openCamera();
    if (!stream) {
      setProblem('Help was alerted. The phone did not allow the camera or the microphone, so nothing could be recorded.');
      setStep('done');
      return;
    }
    streamRef.current = stream;
    const vids = stream.getVideoTracks();
    const auds = stream.getAudioTracks();
    kindRef.current = vids && vids.length > 0 ? 'video' : 'audio';
    setGotPicture(!!(vids && vids.length > 0));
    setGotSound(!!(auds && auds.length > 0));
    mimeRef.current = pickMime(kindRef.current);
    if (videoRef.current && kindRef.current === 'video') {
      try {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      } catch (err) {}
    }
    if (!(window as any).MediaRecorder) {
      dropTracks();
      setProblem('Help was alerted. This phone cannot record.');
      setStep('done');
      return;
    }
    keepRef.current = true;
    partNoRef.current = 0;
    savedRef.current = 0;
    busyRef.current = 0;
    setParts(0);
    setSaved(0);
    startedRef.current = Date.now();
    setSeconds(0);
    setStep('recording');
    keepScreenAwake();
    startPart();
    timerRef.current = setInterval(() => {
      setSeconds(Math.round((Date.now() - startedRef.current) / 1000));
      if (!keepRef.current) return;
      if (Date.now() - partStartRef.current >= PART_SECONDS * 1000) {
        const rec = recRef.current;
        if (rec && rec.state !== 'inactive') {
          try {
            rec.stop();
          } catch (err) {}
        }
      }
    }, 1000);
  }

  function startPart() {
    const stream = streamRef.current;
    if (!stream || !keepRef.current) return;
    const MR: any = (window as any).MediaRecorder;
    const opts: any = {};
    if (mimeRef.current) opts.mimeType = mimeRef.current;
    opts.audioBitsPerSecond = 64000;
    if (kindRef.current === 'video') opts.videoBitsPerSecond = 700000;
    let rec: any = null;
    try {
      rec = new MR(stream, opts);
    } catch (err) {
      try {
        rec = new MR(stream);
      } catch (err2) {
        rec = null;
      }
    }
    if (!rec) {
      keepRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      dropTracks();
      letScreenSleep();
      setProblem('Help was alerted. This phone cannot record.');
      setStep('done');
      return;
    }
    recRef.current = rec;
    chunks.current = [];
    const mine = partNoRef.current + 1;
    partNoRef.current = mine;
    const began = Date.now();
    partStartRef.current = began;
    setParts(mine);
    rec.ondataavailable = (ev: any) => {
      if (ev.data && ev.data.size > 0) {
        chunks.current.push(ev.data);
      }
    };
    rec.onstop = () => {
      const bits = chunks.current;
      chunks.current = [];
      const took = Math.round((Date.now() - began) / 1000);
      if (bits.length > 0) {
        const type = mimeRef.current || (kindRef.current === 'video' ? 'video/webm' : 'audio/webm');
        sendPart(new Blob(bits, { type: type }), took);
      }
      if (keepRef.current) {
        startPart();
      } else {
        wrapUp();
      }
    };
    try {
      rec.start(1000);
    } catch (err) {
      try {
        rec.start();
      } catch (err2) {}
    }
  }

  async function sendPart(blob: any, took: number) {
    const type = String(blob.type || '');
    let ext = 'webm';
    if (type.indexOf('mp4') >= 0) ext = kindRef.current === 'video' ? 'mp4' : 'm4a';
    busyRef.current = busyRef.current + 1;
    for (let go = 0; go < 3; go++) {
      try {
        const fd = new FormData();
        fd.append('panic_id', idRef.current);
        fd.append('kind', kindRef.current);
        fd.append('seconds', String(took));
        fd.append('file', blob, 'panic.' + ext);
        const r = await fetch('/api/panic', { method: 'POST', body: fd });
        if (r.ok) {
          savedRef.current = savedRef.current + 1;
          setSaved(savedRef.current);
          busyRef.current = busyRef.current - 1;
          return;
        }
      } catch (err) {}
      await new Promise((ok) => setTimeout(ok, 1500));
    }
    busyRef.current = busyRef.current - 1;
    setProblem('One piece of the recording did not upload. Everything else did.');
  }

  function pressDone() {
    keepRef.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStep('saving');
    const rec = recRef.current;
    if (rec && rec.state !== 'inactive') {
      try {
        rec.stop();
      } catch (err) {
        wrapUp();
      }
    } else {
      wrapUp();
    }
  }

  function wrapUp() {
    dropTracks();
    letScreenSleep();
    let waited = 0;
    const hold = setInterval(() => {
      waited = waited + 500;
      if (busyRef.current <= 0 || waited > 40000) {
        clearInterval(hold);
        setStep('done');
      }
    }, 500);
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
          camera and microphone recording on this phone. It keeps recording until you press Done.
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
          <li>This phone records video and sound together and keeps recording until you press Done. There is no time limit.</li>
          <li>The recording is saved as it goes, so nothing is lost if the phone dies.</li>
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
    return (
      <div style={box}>
        <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6, color: '#fca5a5' }}>
          {step === 'saving' ? 'Saving the recording...' : 'RECORDING NOW'}
        </div>
        <p style={{ margin: '0 0 10px 0', fontSize: 14, opacity: 0.9 }}>
          Help has been alerted. Keep the phone where it can see and hear.
          {step === 'recording' ? ' Recording for ' + niceTime(seconds) + '. It will not stop until you press Done.' : ' Finishing the last piece.'}
        </p>
        <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 8 }}>
          {gotPicture && gotSound ? 'Video and sound are both recording.' : null}
          {gotPicture && !gotSound ? 'The microphone was not allowed, so only video is recording.' : null}
          {!gotPicture && gotSound ? 'The camera was not allowed, so only sound is recording.' : null}
          {' '}
          {saved > 0 ? saved + ' of ' + parts + ' pieces already saved to the panic archive.' : 'Saving the first piece...'}
        </div>
        <video
          ref={videoRef}
          muted
          playsInline
          style={{ width: '100%', maxHeight: 180, borderRadius: 10, background: '#000' }}
        />
        {problem ? (
          <div style={{ color: '#fca5a5', fontSize: 13, marginTop: 8 }}>{problem}</div>
        ) : null}
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <a
            href="tel:911"
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '14px 10px',
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
            onClick={pressDone}
            style={{
              flex: 1,
              padding: '14px 10px',
              borderRadius: 10,
              border: '2px solid #fff',
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 900,
              fontSize: 16,
            }}
          >
            {step === 'saving' ? 'SAVING...' : 'DONE, STOP RECORDING'}
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
        On Time Taxi has your alert{sentAt ? ' from ' + sentAt : ''}.
        {saved > 0 ? ' ' + saved + ' recording pieces covering ' + niceTime(seconds) + ' are filed in the panic archive.' : ''}
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
          onClick={() => { setStep('idle'); setProblem(''); setNote(''); setSeconds(0); setParts(0); setSaved(0); }}
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
          Close
        </button>
      </div>
    </div>
  );
}
