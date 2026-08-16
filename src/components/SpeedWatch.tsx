'use client';

import { useEffect, useRef, useState } from 'react';
import { getLang, speakTranslated } from '../lib/i18n';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

function metersBetween(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371000;
  const p1 = (aLat * Math.PI) / 180;
  const p2 = (bLat * Math.PI) / 180;
  const dp = p2 - p1;
  const dl = ((bLng - aLng) * Math.PI) / 180;
  const x = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function bearingBetween(aLat: number, aLng: number, bLat: number, bLng: number) {
  const p1 = (aLat * Math.PI) / 180;
  const p2 = (bLat * Math.PI) / 180;
  const dl = ((bLng - aLng) * Math.PI) / 180;
  const y = Math.sin(dl) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  const b = (Math.atan2(y, x) * 180) / Math.PI;
  return (b + 360) % 360;
}

function pointAhead(lat: number, lng: number, brg: number, meters: number) {
  const R = 6371000;
  const b = (brg * Math.PI) / 180;
  const l1 = (lat * Math.PI) / 180;
  const g1 = (lng * Math.PI) / 180;
  const d = meters / R;
  const l2 = Math.asin(Math.sin(l1) * Math.cos(d) + Math.cos(l1) * Math.sin(d) * Math.cos(b));
  const g2 = g1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(l1), Math.cos(d) - Math.sin(l1) * Math.sin(l2));
  return [(g2 * 180) / Math.PI, (l2 * 180) / Math.PI];
}

async function lookupLimit(lat: number, lng: number, brg: number): Promise<number> {
  if (!MAPBOX_TOKEN) return 0;
  const p = pointAhead(lat, lng, brg, 700);
  const url =
    'https://api.mapbox.com/directions/v5/mapbox/driving/' +
    lng + ',' + lat + ';' + p[0] + ',' + p[1] +
    '?geometries=geojson&overview=false&annotations=maxspeed&access_token=' + MAPBOX_TOKEN;
  try {
    const r = await fetch(url);
    if (!r.ok) return 0;
    const j: any = await r.json();
    const leg = j && j.routes && j.routes[0] && j.routes[0].legs ? j.routes[0].legs[0] : null;
    const ann = leg && leg.annotation ? leg.annotation : null;
    const list: any[] = ann && ann.maxspeed ? ann.maxspeed : [];
    for (let i = 0; i < list.length; i++) {
      const m = list[i];
      if (!m) continue;
      if (m.none === true) return -1;
      if (m.unknown === true) continue;
      const sp = Number(m.speed);
      if (!isFinite(sp) || sp <= 0) continue;
      const unit = String(m.unit || 'km/h');
      const mph = unit === 'mph' ? sp : sp * 0.621371;
      return Math.round(mph / 5) * 5;
    }
    return 0;
  } catch (e) {
    return 0;
  }
}

export default function SpeedWatch(props: {
  role: string;
  rideId?: any;
  token?: string;
  dark?: boolean;
  onSpeed?: (mph: number, limitMph: number) => void;
}) {
  const role = props.role === 'owner' ? 'owner' : 'driver';
  const dark = props.dark === true;

  const [mph, setMph] = useState(-1);
  const [limit, setLimit] = useState(0);
  const [geoOff, setGeoOff] = useState('');
  const [armed, setArmed] = useState(false);
  const [removed, setRemoved] = useState('');

  const lastPosRef = useRef<any>(null);
  const brgRef = useRef(0);
  const limitRef = useRef(0);
  const lastLookupRef = useRef(0);
  const lastLookupPosRef = useRef<any>(null);
  const lastSendRef = useRef(0);
  const audioRef = useRef<any>(null);
  const beepRef = useRef<any>(null);
  const overRef = useRef(false);
  const spokeRef = useRef(0);
  const watchRef = useRef<any>(null);
  const tokenRef = useRef('');
  const rideRef = useRef('');
  const removedRef = useRef(false);

  useEffect(function () {
    tokenRef.current = props.token ? String(props.token) : '';
  }, [props.token]);

  useEffect(function () {
    rideRef.current = props.rideId ? String(props.rideId) : '';
  }, [props.rideId]);

  function ctx() {
    if (typeof window === 'undefined') return null;
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    if (!audioRef.current) {
      try { audioRef.current = new AC(); } catch (e) { return null; }
    }
    return audioRef.current;
  }

  function armAudio() {
    const c = ctx();
    if (!c) return;
    try {
      if (c.state === 'suspended') c.resume();
      const o = c.createOscillator();
      const g = c.createGain();
      g.gain.value = 0.0001;
      o.connect(g);
      g.connect(c.destination);
      o.start();
      o.stop(c.currentTime + 0.02);
      setArmed(true);
    } catch (e) {}
  }

  useEffect(function () {
    if (typeof document === 'undefined') return;
    const once = function () { armAudio(); };
    document.addEventListener('touchstart', once, { once: true } as any);
    document.addEventListener('click', once, { once: true } as any);
    return function () {
      try { document.removeEventListener('touchstart', once as any); } catch (e) {}
      try { document.removeEventListener('click', once as any); } catch (e) {}
    };
  }, []);

  function startAlarm() {
    if (beepRef.current) return;
    const c = ctx();
    if (!c) return;
    try { if (c.state === 'suspended') c.resume(); } catch (e) {}
    const fire = function () {
      try {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = 'square';
        o.frequency.value = 900;
        g.gain.value = 0.9;
        o.connect(g);
        g.connect(c.destination);
        o.start();
        o.stop(c.currentTime + 0.35);
      } catch (e) {}
      try { if ((navigator as any).vibrate) (navigator as any).vibrate([350, 150, 350]); } catch (e) {}
    };
    fire();
    beepRef.current = setInterval(fire, 700);
  }

  function stopAlarm() {
    if (beepRef.current) {
      clearInterval(beepRef.current);
      beepRef.current = null;
    }
  }

  function sayIt(text: string) {
    // Read out loud in whatever language this person picked.
    try { speakTranslated(text, getLang()); } catch (e) {}
  }

  async function report(lat: number, lng: number, speed: number, lim: number) {
    const tk = tokenRef.current;
    if (!tk) return;
    const now = Date.now();
    const bad = lim > 0 && speed >= lim + 15;
    const gap = bad ? 4000 : 12000;
    if (now - lastSendRef.current < gap) return;
    lastSendRef.current = now;
    try {
      const res = await fetch('/api/speed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tk,
          rideId: rideRef.current ? rideRef.current : null,
          role: role,
          mph: Math.round(speed),
          limitMph: lim > 0 ? lim : null,
          lat: lat,
          lng: lng,
        }),
      });
      const j: any = await res.json();
      if (j && j.removed === true && !removedRef.current) {
        removedRef.current = true;
        setRemoved(String(j.message || 'You have been taken off this run for going 15 over the speed limit.'));
        sayIt('You have been taken off this run for going fifteen over the speed limit. Another driver is being sent.');
      }
    } catch (e) {}
  }

  useEffect(function () {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoOff('This phone will not give out its location, so the speed cannot be shown.');
      return;
    }
    watchRef.current = navigator.geolocation.watchPosition(
      function (p: any) {
        setGeoOff('');
        const lat = p.coords.latitude;
        const lng = p.coords.longitude;
        const t = p.timestamp ? p.timestamp : Date.now();

        let speed = -1;
        const raw = p.coords.speed;
        if (typeof raw === 'number' && isFinite(raw) && raw >= 0) speed = raw * 2.2369363;

        const prev = lastPosRef.current;
        if (prev) {
          const d = metersBetween(prev.lat, prev.lng, lat, lng);
          const secs = (t - prev.t) / 1000;
          if (secs > 0.5 && secs < 30) {
            if (speed < 0) speed = (d / secs) * 2.2369363;
            if (d > 6) brgRef.current = bearingBetween(prev.lat, prev.lng, lat, lng);
          }
        }
        if (typeof p.coords.heading === 'number' && isFinite(p.coords.heading)) brgRef.current = p.coords.heading;
        if (speed < 0) speed = 0;
        if (speed > 140) speed = 140;

        lastPosRef.current = { lat: lat, lng: lng, t: t };
        setMph(Math.round(speed));

        const now = Date.now();
        const lp = lastLookupPosRef.current;
        const moved = lp ? metersBetween(lp.lat, lp.lng, lat, lng) : 99999;
        const stale = now - lastLookupRef.current > 10000;
        if (stale && (moved > 120 || limitRef.current === 0)) {
          lastLookupRef.current = now;
          lastLookupPosRef.current = { lat: lat, lng: lng };
          lookupLimit(lat, lng, brgRef.current).then(function (v) {
            if (v !== 0) {
              limitRef.current = v;
              setLimit(v);
            }
          });
        }

        const lim = limitRef.current;
        if (props.onSpeed) {
          try { props.onSpeed(Math.round(speed), lim); } catch (e) {}
        }

        if (lim > 0 && speed > lim + 3) {
          if (!overRef.current) {
            overRef.current = true;
            startAlarm();
          }
          if (now - spokeRef.current > 7000) {
            spokeRef.current = now;
            sayIt('Slow down. The speed limit here is ' + lim + '.');
          }
        } else if (overRef.current) {
          overRef.current = false;
          stopAlarm();
        }

        report(lat, lng, speed, lim);
      },
      function () {
        setGeoOff('Location is turned off. Turn it on so your speed and the speed limit can show.');
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
    );
    return function () {
      stopAlarm();
      try {
        if (watchRef.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchRef.current);
      } catch (e) {}
    };
  }, []);

  const over = limit > 0 && mph > limit + 3;
  const box: any = {
    background: dark ? '#0b1220' : '#fff',
    border: '1px solid ' + (dark ? 'rgba(255,255,255,0.14)' : '#e2e8f0'),
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  };
  const label: any = { color: dark ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 800, letterSpacing: '0.08em' };

  return (
    <div style={box}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={label}>YOUR SPEED</div>
          <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.05, color: over ? '#dc2626' : dark ? '#fff' : '#0f172a' }}>
            {mph < 0 ? '--' : mph}
            <span style={{ fontSize: 16, fontWeight: 800, marginLeft: 6, color: dark ? '#94a3b8' : '#64748b' }}>mph</span>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          {limit > 0 ? (
            <div style={{ background: '#fff', border: '4px solid #0f172a', borderRadius: 10, padding: '6px 12px', minWidth: 92 }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: '#0f172a', letterSpacing: '0.06em' }}>SPEED</div>
              <div style={{ fontSize: 10, fontWeight: 900, color: '#0f172a', letterSpacing: '0.06em', marginTop: -2 }}>LIMIT</div>
              <div style={{ fontSize: 34, fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>{limit}</div>
            </div>
          ) : (
            <div style={{ color: dark ? '#94a3b8' : '#64748b', fontSize: 13, fontWeight: 700, maxWidth: 140 }}>
              {limit === -1 ? 'No speed limit posted on this road' : 'Looking up the speed limit'}
            </div>
          )}
        </div>
      </div>

      {over ? (
        <div style={{ marginTop: 12, background: '#dc2626', color: '#fff', borderRadius: 12, padding: '12px 14px', fontWeight: 900, fontSize: 18 }}>
          SLOW DOWN - the limit here is {limit}
        </div>
      ) : null}

      {removed ? (
        <div style={{ marginTop: 12, background: '#7f1d1d', color: '#fff', borderRadius: 12, padding: '12px 14px', fontWeight: 800, lineHeight: 1.6 }}>
          {removed}
        </div>
      ) : null}

      {geoOff ? (
        <div style={{ marginTop: 10, color: '#b45309', fontWeight: 700, fontSize: 13 }}>{geoOff}</div>
      ) : null}

      {!armed ? (
        <button
          type='button'
          onClick={armAudio}
          style={{ marginTop: 12, width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: '#f5b301', color: '#0f172a', fontWeight: 900, fontSize: 15, cursor: 'pointer' }}
        >
          Tap once to turn the speeding alarm on
        </button>
      ) : (
        <div style={{ marginTop: 10, color: dark ? '#86efac' : '#166534', fontWeight: 800, fontSize: 13 }}>
          Speeding alarm is on. You do not need to touch anything else.
        </div>
      )}
    </div>
  );
}
