'use client';

import { useEffect, useRef, useState } from 'react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

async function placeName(lat: number, lng: number) {
  if (!MAPBOX_TOKEN) return '';
  try {
    const url =
      'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
      lng + ',' + lat +
      '.json?limit=1&access_token=' + MAPBOX_TOKEN;
    const r = await fetch(url);
    if (!r.ok) return '';
    const j: any = await r.json();
    const f = j && j.features && j.features[0] ? j.features[0] : null;
    return f && f.place_name ? String(f.place_name) : '';
  } catch (e) {
    return '';
  }
}

export default function AccidentReport(props: {
  rideId?: any;
  token?: string;
  mph?: number;
  limitMph?: number;
  dark?: boolean;
}) {
  const dark = props.dark === true;

  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState('');
  const [injuries, setInjuries] = useState('');
  const [officerName, setOfficerName] = useState('');
  const [officerBadge, setOfficerBadge] = useState('');
  const [reportNumber, setReportNumber] = useState('');
  const [otherDriver, setOtherDriver] = useState('');
  const [otherVehicle, setOtherVehicle] = useState('');
  const [otherPlate, setOtherPlate] = useState('');
  const [otherInsurance, setOtherInsurance] = useState('');
  const [speedText, setSpeedText] = useState('');
  const [mine, setMine] = useState<any[]>([]);
  const [others, setOthers] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState('');
  const [problem, setProblem] = useState('');
  const [spot, setSpot] = useState<any>(null);
  const [address, setAddress] = useState('');

  const liveMphRef = useRef(-1);
  const liveLimitRef = useRef(0);
  const watchRef = useRef<any>(null);

  useEffect(function () {
    if (typeof props.mph === 'number' && props.mph >= 0) liveMphRef.current = Math.round(props.mph);
  }, [props.mph]);

  useEffect(function () {
    if (typeof props.limitMph === 'number' && props.limitMph > 0) liveLimitRef.current = Math.round(props.limitMph);
  }, [props.limitMph]);

  useEffect(function () {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    watchRef.current = navigator.geolocation.watchPosition(
      function (p: any) {
        setSpot({ lat: p.coords.latitude, lng: p.coords.longitude });
        const raw = p.coords.speed;
        if (typeof raw === 'number' && isFinite(raw) && raw >= 0 && liveMphRef.current < 0) {
          liveMphRef.current = Math.round(raw * 2.2369363);
        }
      },
      function () {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
    return function () {
      try {
        if (watchRef.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchRef.current);
      } catch (e) {}
    };
  }, []);

  function openForm() {
    setOpen(true);
    setSent('');
    setProblem('');
    const m = liveMphRef.current;
    if (m >= 0 && speedText === '') setSpeedText(String(m));
    if (spot && address === '') {
      placeName(spot.lat, spot.lng).then(function (n) {
        if (n) setAddress(n);
      });
    }
  }

  function filesFrom(e: any) {
    const list: any[] = [];
    const f = e && e.target && e.target.files ? e.target.files : null;
    if (!f) return list;
    for (let i = 0; i < f.length; i++) list.push(f[i]);
    return list;
  }

  async function sendPhotos(reportId: string) {
    const groups = [
      { kind: 'my_vehicle', list: mine },
      { kind: 'other_vehicle', list: others },
      { kind: 'officer_card', list: cards },
    ];
    let failed = 0;
    for (const g of groups) {
      for (const file of g.list) {
        try {
          const fd = new FormData();
          fd.append('report_id', reportId);
          fd.append('kind', g.kind);
          fd.append('file', file);
          const r = await fetch('/api/accident', { method: 'POST', body: fd });
          if (!r.ok) failed = failed + 1;
        } catch (e) {
          failed = failed + 1;
        }
      }
    }
    return failed;
  }

  async function send() {
    if (!props.token) {
      setProblem('Please sign in again on your driver page, then send this report.');
      return;
    }
    setBusy(true);
    setProblem('');
    let lat = spot ? spot.lat : null;
    let lng = spot ? spot.lng : null;
    const typed = speedText.trim();
    const mph = typed === '' ? (liveMphRef.current >= 0 ? liveMphRef.current : null) : Number(typed);
    try {
      const r = await fetch('/api/accident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          token: props.token,
          rideId: props.rideId ? String(props.rideId) : null,
          details: details,
          injuries: injuries,
          officerName: officerName,
          officerBadge: officerBadge,
          reportNumber: reportNumber,
          otherDriver: otherDriver,
          otherVehicle: otherVehicle,
          otherPlate: otherPlate,
          otherInsurance: otherInsurance,
          mph: mph,
          limitMph: liveLimitRef.current > 0 ? liveLimitRef.current : null,
          lat: lat,
          lng: lng,
          address: address,
        }),
      });
      const j: any = await r.json();
      if (!r.ok || !j || !j.ok) {
        setProblem(j && j.error ? String(j.error) : 'The report could not be sent. Please try again.');
        setBusy(false);
        return;
      }
      const total = mine.length + others.length + cards.length;
      let failed = 0;
      if (total > 0) failed = await sendPhotos(String(j.id));
      let note = 'Your accident report was sent to the office and to the insurance broker.';
      if (total > 0 && failed === 0) note = note + ' All ' + total + ' pictures went with it.';
      if (failed > 0) note = note + ' ' + failed + ' picture(s) would not upload, but the report itself is filed.';
      setSent(note);
      setOpen(false);
    } catch (e) {
      setProblem('The report could not be sent. Please try again.');
    }
    setBusy(false);
  }

  const box: any = {
    background: dark ? '#0b1220' : '#fff',
    border: '1px solid ' + (dark ? 'rgba(255,255,255,0.14)' : '#e2e8f0'),
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  };
  const label: any = { color: dark ? '#cbd5e1' : '#334155', fontWeight: 800, fontSize: 13, marginBottom: 4 };
  const field: any = {
    width: '100%',
    padding: '12px 12px',
    borderRadius: 12,
    border: '1px solid ' + (dark ? 'rgba(255,255,255,0.16)' : '#cbd5e1'),
    background: dark ? 'rgba(0,0,0,0.3)' : '#fff',
    color: dark ? '#fff' : '#0f172a',
    fontSize: 16,
    marginBottom: 12,
    boxSizing: 'border-box',
  };
  const fileBtn: any = { ...field, padding: 10 };

  return (
    <div style={box}>
      {!open ? (
        <div>
          <button
            type='button'
            onClick={openForm}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 12,
              border: 'none',
              background: '#dc2626',
              color: '#fff',
              fontWeight: 900,
              fontSize: 18,
              cursor: 'pointer',
            }}
          >
            Report an accident
          </button>
          <div style={{ marginTop: 8, color: dark ? '#94a3b8' : '#64748b', fontSize: 13, lineHeight: 1.6 }}>
            Only use this if you have been in a wreck. It goes straight to the office and the insurance broker.
            Everything on the form can be left blank if you do not have it.
          </div>
          {sent ? (
            <div style={{ marginTop: 10, background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: 12, padding: '12px 14px', fontWeight: 700, lineHeight: 1.6 }}>
              {sent}
            </div>
          ) : null}
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: dark ? '#fff' : '#0f172a', marginBottom: 4 }}>Accident report</div>
          <div style={{ color: dark ? '#94a3b8' : '#64748b', fontSize: 13, marginBottom: 12, lineHeight: 1.6 }}>
            Take your time. Fill in what you can and leave the rest blank. If anyone is hurt, call 911 first.
          </div>

          <div style={label}>Is anyone hurt?</div>
          <input value={injuries} onChange={(e) => setInjuries(e.target.value)} placeholder='Nobody hurt, or say who is hurt' style={field} />

          <div style={label}>What happened</div>
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} placeholder='Tell it in your own words' style={{ ...field, resize: 'vertical' }} />

          <div style={label}>How fast were you going, in mph</div>
          <input value={speedText} onChange={(e) => setSpeedText(e.target.value)} inputMode='numeric' placeholder='Filled in from your GPS speed' style={field} />
          <div style={{ marginTop: -6, marginBottom: 12, color: dark ? '#94a3b8' : '#64748b', fontSize: 12 }}>
            {liveLimitRef.current > 0 ? 'The posted limit here is ' + liveLimitRef.current + ' mph.' : 'No posted limit was found for this road.'}
          </div>

          <div style={label}>Where it happened</div>
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder='Street or nearest cross street' style={field} />

          <div style={label}>Pictures of your vehicle</div>
          <input type='file' accept='image/*' multiple onChange={(e) => setMine(filesFrom(e))} style={fileBtn} />
          {mine.length > 0 ? <div style={{ marginTop: -6, marginBottom: 12, color: '#16a34a', fontWeight: 700, fontSize: 13 }}>{mine.length} picture(s) ready</div> : null}

          <div style={label}>Pictures of the other vehicle</div>
          <input type='file' accept='image/*' multiple onChange={(e) => setOthers(filesFrom(e))} style={fileBtn} />
          {others.length > 0 ? <div style={{ marginTop: -6, marginBottom: 12, color: '#16a34a', fontWeight: 700, fontSize: 13 }}>{others.length} picture(s) ready</div> : null}

          <div style={label}>Officer card or police report</div>
          <input type='file' accept='image/*' multiple onChange={(e) => setCards(filesFrom(e))} style={fileBtn} />
          {cards.length > 0 ? <div style={{ marginTop: -6, marginBottom: 12, color: '#16a34a', fontWeight: 700, fontSize: 13 }}>{cards.length} picture(s) ready</div> : null}

          <div style={label}>Officer name</div>
          <input value={officerName} onChange={(e) => setOfficerName(e.target.value)} placeholder='If an officer came out' style={field} />

          <div style={label}>Officer badge number</div>
          <input value={officerBadge} onChange={(e) => setOfficerBadge(e.target.value)} placeholder='If it is on the card' style={field} />

          <div style={label}>Police report number</div>
          <input value={reportNumber} onChange={(e) => setReportNumber(e.target.value)} placeholder='If they gave you one' style={field} />

          <div style={label}>Other driver name</div>
          <input value={otherDriver} onChange={(e) => setOtherDriver(e.target.value)} placeholder='Name of the other driver' style={field} />

          <div style={label}>Other vehicle</div>
          <input value={otherVehicle} onChange={(e) => setOtherVehicle(e.target.value)} placeholder='Year, make, color' style={field} />

          <div style={label}>Other plate number</div>
          <input value={otherPlate} onChange={(e) => setOtherPlate(e.target.value)} placeholder='License plate' style={field} />

          <div style={label}>Other insurance company</div>
          <input value={otherInsurance} onChange={(e) => setOtherInsurance(e.target.value)} placeholder='If they gave it to you' style={field} />

          {problem ? (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 12, padding: '12px 14px', fontWeight: 700, marginBottom: 12 }}>
              {problem}
            </div>
          ) : null}

          <button
            type='button'
            onClick={send}
            disabled={busy}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 12,
              border: 'none',
              background: '#dc2626',
              color: '#fff',
              fontWeight: 900,
              fontSize: 18,
              cursor: 'pointer',
              opacity: busy ? 0.6 : 1,
            }}
          >
            {busy ? 'Sending the report...' : 'Send this report'}
          </button>

          <button
            type='button'
            onClick={() => setOpen(false)}
            disabled={busy}
            style={{
              width: '100%',
              marginTop: 10,
              padding: '12px',
              borderRadius: 12,
              border: '1px solid ' + (dark ? 'rgba(255,255,255,0.2)' : '#cbd5e1'),
              background: 'transparent',
              color: dark ? '#e2e8f0' : '#334155',
              fontWeight: 800,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            Never mind, close this
          </button>
        </div>
      )}
    </div>
  );
}
