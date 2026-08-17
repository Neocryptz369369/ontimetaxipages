'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import RideChat from '../../../components/RideChat';
import PanicButton from '../../../components/PanicButton';
import SpeedWatch from '../../../components/SpeedWatch';
import AccidentReport from '../../../components/AccidentReport';
import Ticker from '../../../components/Ticker';
import DriverAlerts from '../../../components/DriverAlerts';
import TellAdmin from '../../../components/TellAdmin';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
let mapboxPromise: Promise<any> | null = null;

function loadMapbox(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject('no window');
  if ((window as any).mapboxgl) return Promise.resolve((window as any).mapboxgl);
  if (mapboxPromise) return mapboxPromise;
  mapboxPromise = new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.css';
    document.head.appendChild(css);
    const s = document.createElement('script');
    s.src = 'https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.js';
    s.onload = () => resolve((window as any).mapboxgl);
    s.onerror = () => reject('failed to load mapbox');
    document.head.appendChild(s);
  });
  return mapboxPromise;
}

async function routeAlong(points: number[][]): Promise<number[][] | null> {
  if (!points || points.length < 2) return null;
  const path = points.map((p: number[]) => p[0] + ',' + p[1]).join(';');
  const url =
    'https://api.mapbox.com/directions/v5/mapbox/driving/' +
    path +
    '?alternatives=false&geometries=geojson&overview=full&steps=false&access_token=' +
    MAPBOX_TOKEN;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data || !data.routes || !data.routes[0] || !data.routes[0].geometry) return null;
    return data.routes[0].geometry.coordinates;
  } catch (e) {
    return null;
  }
}

function drawRouteLine(m: any, coords: number[][]) {
  if (!m || !coords || coords.length < 2) return;
  const data: any = { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } };
  const paint = () => {
    try {
      const existing = m.getSource('drive-route-source');
      if (existing) {
        existing.setData(data);
        return;
      }
      m.addSource('drive-route-source', { type: 'geojson', data });
      m.addLayer({
        id: 'drive-route-layer',
        type: 'line',
        source: 'drive-route-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#0080ff', 'line-width': 6, 'line-opacity': 0.9 },
      });
    } catch (e) {}
  };
  try {
    if (m.isStyleLoaded && m.isStyleLoaded()) paint();
    else m.once('idle', paint);
  } catch (e) {}
}

const shell: any = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg,#f8fafc 0%,#eef2ff 100%)',
  fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,sans-serif',
  padding: '24px 16px 60px',
};
const wrap: any = { maxWidth: 640, margin: '0 auto' };
const card: any = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 16,
  padding: 18,
  marginBottom: 14,
  boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
};
const bigBtn: any = {
  display: 'block',
  width: '100%',
  marginTop: 12,
  padding: '16px',
  borderRadius: 12,
  border: 'none',
  color: '#fff',
  fontWeight: 800,
  fontSize: 17,
  cursor: 'pointer',
};
const rowLine: any = { color: '#0f172a', fontWeight: 700, lineHeight: 1.6 };
const small: any = { color: '#64748b', fontSize: 13, marginTop: 4 };

function money(n: any) {
  const v = Number(n);
  if (!v && v !== 0) return '$0.00';
  return '$' + v.toFixed(2);
}

export default function DriveRidePage() {
  const [rideId, setRideId] = useState('');
  const [ride, setRide] = useState<any>(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [geoErr, setGeoErr] = useState('');
  const [busy, setBusy] = useState('');
  const [pos, setPos] = useState<any>(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [myToken, setMyToken] = useState('');
  const [liveMph, setLiveMph] = useState(-1);
  const [liveLimit, setLiveLimit] = useState(0);

  const mapDivRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const meMarkerRef = useRef<any>(null);
  const riderMarkerRef = useRef<any>(null);
  const watchRef = useRef<any>(null);
  const lastSentRef = useRef(0);
  const rideIdRef = useRef('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = new URLSearchParams(window.location.search);
    const id = q.get('ride') || '';
    rideIdRef.current = id;
    setRideId(id);
  }, []);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then((got: any) => {
      const t = got && got.data && got.data.session ? got.data.session.access_token : '';
      if (alive) setMyToken(t || '');
    });
    return () => {
      alive = false;
    };
  }, []);

  async function call(action: string, extra?: any) {
    const id = rideIdRef.current;
    if (!id) return null;
    const got = await supabase.auth.getSession();
    const token = got.data.session ? got.data.session.access_token : '';
    if (!token) {
      setErr('Please sign in again on your driver page.');
      return null;
    }
    const payload: any = { token: token, rideId: id, action: action };
    if (extra) {
      if (extra.lat !== undefined) payload.lat = extra.lat;
      if (extra.lng !== undefined) payload.lng = extra.lng;
    }
    try {
      const res = await fetch('/api/driver-ride', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (j && j.ok && j.ride) {
        setRide(j.ride);
        setErr('');
        return j.ride;
      }
      if (j && j.error) setErr(String(j.error));
      return null;
    } catch (e) {
      return null;
    }
  }

  useEffect(() => {
    if (!rideId) return;
    call('get');
    const t = setInterval(() => { call('get'); }, 8000);
    return () => clearInterval(t);
  }, [rideId]);

  useEffect(() => {
    let alive = true;
    loadMapbox().then(() => { if (alive) setMapsReady(true); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoErr('This phone will not give out its location.');
      return;
    }
    watchRef.current = navigator.geolocation.watchPosition(
      (p) => {
        const lat = p.coords.latitude;
        const lng = p.coords.longitude;
        setGeoErr('');
        setPos({ lat: lat, lng: lng });
        const now = Date.now();
        if (now - lastSentRef.current > 5000) {
          lastSentRef.current = now;
          call('ping', { lat: lat, lng: lng });
        }
      },
      () => { setGeoErr('Location is turned off. Turn it on so the rider can watch you coming.'); },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
    return () => {
      if (watchRef.current !== null && navigator.geolocation) {
        try { navigator.geolocation.clearWatch(watchRef.current); } catch (e) {}
      }
    };
  }, []);

  useEffect(() => {
    if (!mapsReady || !mapDivRef.current || mapRef.current) return;
    const mapboxgl = (window as any).mapboxgl;
    if (!mapboxgl) return;
    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      const center = pos ? [pos.lng, pos.lat] : [-85.755, 38.3981];
      const m = new mapboxgl.Map({
        container: mapDivRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: center,
        zoom: 13,
      });
      mapRef.current = m;
      [200, 700, 1500].forEach((d) => setTimeout(() => { try { m.resize(); } catch (e) {} }, d));
    } catch (e) {}
  }, [mapsReady, pos]);

  useEffect(() => {
    const m = mapRef.current;
    const mapboxgl = typeof window !== 'undefined' ? (window as any).mapboxgl : null;
    if (!m || !mapboxgl) return;

    if (pos) {
      const c: [number, number] = [pos.lng, pos.lat];
      if (!meMarkerRef.current) meMarkerRef.current = new mapboxgl.Marker({ color: '#16a34a' }).setLngLat(c).addTo(m);
      else meMarkerRef.current.setLngLat(c);
    }

    if (ride) {
      const started = String(ride.status) === 'picked_up';
      const rLat = ride.rider_lat !== null && ride.rider_lat !== undefined ? Number(ride.rider_lat) : (ride.pickup_lat !== null ? Number(ride.pickup_lat) : null);
      const rLng = ride.rider_lng !== null && ride.rider_lng !== undefined ? Number(ride.rider_lng) : (ride.pickup_lng !== null ? Number(ride.pickup_lng) : null);
      if (!started && rLat !== null && rLng !== null && isFinite(rLat) && isFinite(rLng)) {
        const c: [number, number] = [rLng, rLat];
        if (!riderMarkerRef.current) riderMarkerRef.current = new mapboxgl.Marker({ color: '#1a73e8' }).setLngLat(c).addTo(m);
        else riderMarkerRef.current.setLngLat(c);
      }

      const pts: number[][] = [];
      if (pos) pts.push([pos.lng, pos.lat]);
      else if (ride.driver_lat !== null && ride.driver_lng !== null) pts.push([Number(ride.driver_lng), Number(ride.driver_lat)]);
      if (!started && rLat !== null && rLng !== null) pts.push([rLng, rLat]);
      if (Array.isArray(ride.stops)) {
        for (let si = 0; si < ride.stops.length; si++) {
          const st: any = ride.stops[si];
          if (st && st.lat !== null && st.lat !== undefined && st.lng !== null && st.lng !== undefined) {
            const sla = Number(st.lat);
            const slo = Number(st.lng);
            if (isFinite(sla) && isFinite(slo)) pts.push([slo, sla]);
          }
        }
      }
      if (ride.dropoff_lat !== null && ride.dropoff_lat !== undefined && ride.dropoff_lng !== null) pts.push([Number(ride.dropoff_lng), Number(ride.dropoff_lat)]);

      if (pts.length >= 2) {
        routeAlong(pts).then((coords) => {
          if (coords) drawRouteLine(m, coords);
        });
        try {
          const b = new mapboxgl.LngLatBounds();
          pts.forEach((p) => b.extend(p as any));
          m.fitBounds(b, { padding: 70, maxZoom: 15, duration: 500 });
        } catch (e) {}
      } else if (pos) {
        try { m.easeTo({ center: [pos.lng, pos.lat], zoom: 14, duration: 400 }); } catch (e) {}
      }
    }
  }, [pos, ride, mapsReady]);

  async function onPickup() {
    setBusy('pickup');
    setMsg('');
    const r = await call('pickup');
    if (r) setMsg('Pick up confirmed. Head for the drop off.');
    setBusy('');
  }

  async function onFinish() {
    setBusy('finish');
    setMsg('');
    const r = await call('finish');
    if (r) setMsg('Ride finished. It is counted in what you made today.');
    setBusy('');
  }

  const status = ride ? String(ride.status) : '';
  const done = status === 'completed';
  const terms: any = ride && ride.terms ? ride.terms : null;
  const getInFee = terms && terms.getInFee !== undefined && terms.getInFee !== null ? Number(terms.getInFee) : 5;
  const commissionPct = terms && terms.commissionPct !== undefined && terms.commissionPct !== null ? Number(terms.commissionPct) : 20;
  const fareNum = ride ? Number(ride.fare || 0) : 0;
  const tipNum = ride ? Number(ride.tip || 0) : 0;
  const afterFee = fareNum - getInFee > 0 ? fareNum - getInFee : 0;
  const driverKeeps = afterFee - afterFee * (commissionPct / 100) + tipNum;
  const rideStops: any[] = ride && Array.isArray(ride.stops) ? ride.stops : [];

  return (
    <main style={shell}>
      <div style={wrap}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h1 style={{ fontSize: 24, margin: 0, color: '#0f172a' }}>Driving this ride</h1>
          <Link href='/driver-rides' style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Open rides</Link>
        </div>

        {!rideId ? (
          <div style={card}>
            <div style={rowLine}>No ride was picked.</div>
            <div style={small}>Go back to the open rides page and take a ride first.</div>
          </div>
        ) : null}

        {err ? (
          <div style={{ ...card, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontWeight: 700 }}>{err}</div>
        ) : null}

        {geoErr ? (
          <div style={{ ...card, background: '#fff7ed', border: '1px solid #fed7aa', color: '#7c2d12', fontWeight: 700 }}>{geoErr}</div>
        ) : null}

        {msg ? (
          <div style={{ ...card, background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', fontWeight: 700 }}>{msg}</div>
        ) : null}

        <Ticker />

        <DriverAlerts token={myToken} />

        <TellAdmin token={myToken} compact={true} />

        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <div ref={mapDivRef} style={{ width: '100%', height: 320 }} />
        </div>

        <SpeedWatch
          role='driver'
          rideId={ride ? ride.id : null}
          token={myToken}
          onSpeed={(m: number, l: number) => { setLiveMph(m); setLiveLimit(l); }}
        />

        <AccidentReport rideId={ride ? ride.id : null} token={myToken} mph={liveMph} limitMph={liveLimit} />

        {ride ? (
          <div style={card}>
            <div style={rowLine}>Pick up: {ride.pickup || 'Not given'}</div>
            <div style={rowLine}>Drop off: {ride.dropoff || 'Not given'}</div>
            {rideStops.length > 0 ? (
              <div style={{ marginTop: 4 }}>
                {rideStops.map((st: any, si: number) => (
                  <div key={si} style={rowLine}>Stop {si + 1}: {st && st.address ? st.address : 'Not given'}</div>
                ))}
              </div>
            ) : null}
            <div style={{ marginTop: 10, fontSize: 22, fontWeight: 900, color: '#0f172a' }}>{money(ride.fare)}</div>
            {ride.paid ? (
              <div style={{ ...small, color: '#166534', fontWeight: 700 }}>Paid by card already.</div>
            ) : (
              <div style={{ ...small, color: '#b45309', fontWeight: 700 }}>Not paid by card. Collect this one as a cash run.</div>
            )}
            <div style={{ marginTop: 8, color: '#334155', fontSize: 14, lineHeight: 1.7 }}>
              {tipNum > 0 ? <div>Tip from the rider: {money(tipNum)} - that is all yours</div> : null}
              <div style={{ fontWeight: 800, color: '#0f172a' }}>You keep about {money(driverKeeps)}</div>
              <div style={{ ...small, marginTop: 2 }}>
                That is the {money(getInFee)} get in fee, plus {commissionPct} percent of what is left, going to the company. Tips are all yours.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
              {ride.rider_photo ? (
                <img src={ride.rider_photo} alt='Rider' style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
              ) : (
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#e2e8f0' }} />
              )}
              <div>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>{ride.rider_name || 'Your rider'}</div>
                <div style={small}>Your rider</div>
              </div>
            </div>
            {ride.rider_phone ? (
              <a href={'tel:' + String(ride.rider_phone)} style={{ display: 'inline-block', marginTop: 10, color: '#2563eb', fontWeight: 800, textDecoration: 'none' }}>
                Call the rider
              </a>
            ) : null}
            <div style={{ marginTop: 8 }}>
              <a
                href={'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(String(status === 'picked_up' ? (ride.dropoff || '') : (ride.pickup || '')))}
                target='_blank'
                rel='noreferrer'
                style={{ color: '#0f172a', fontWeight: 800 }}
              >
                Open turn by turn in Maps
              </a>
            </div>
          </div>
        ) : null}

        {ride && !done ? (
          <div style={card}>
            <div style={small}>The rider can watch you moving on their screen while this page is open.</div>
            {status === 'accepted' ? (
              <button style={{ ...bigBtn, background: '#2563eb', opacity: busy ? 0.6 : 1 }} onClick={onPickup} disabled={busy !== ''}>
                {busy === 'pickup' ? 'Saving...' : 'I have the rider, start the trip'}
              </button>
            ) : null}
            <button style={{ ...bigBtn, background: '#16a34a', opacity: busy ? 0.6 : 1 }} onClick={onFinish} disabled={busy !== ''}>
              {busy === 'finish' ? 'Saving...' : 'Finish this ride'}
            </button>
          </div>
        ) : null}

        {ride && !done ? (
          <div style={{ ...card, background: '#0f172a', border: '1px solid #0f172a', paddingTop: 6 }}>
            <RideChat rideId={ride.id} role='driver' handsFree={true} />
          </div>
        ) : null}

        {!done ? (
          <div style={{ ...card, background: '#0f172a', border: '1px solid #0f172a' }}>
            <PanicButton role='driver' rideId={ride ? ride.id : null} token={myToken} />
          </div>
        ) : null}

        {done ? (
          <div style={{ ...card, background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
            <div style={{ fontWeight: 800, color: '#065f46' }}>This ride is finished.</div>
            <Link href='/driver-rides' style={{ display: 'inline-block', marginTop: 10, color: '#065f46', fontWeight: 800 }}>Back to open rides</Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
