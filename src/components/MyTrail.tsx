'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { snapToRoads } from '../lib/snaproads';

const MAP_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

let mapLoader: Promise<any> | null = null;

function loadMapbox(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if ((window as any).mapboxgl) return Promise.resolve((window as any).mapboxgl);
  if (mapLoader) return mapLoader;
  mapLoader = new Promise(function (resolve, reject) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.css';
    document.head.appendChild(css);
    const s = document.createElement('script');
    s.src = 'https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.js';
    s.onload = function () { resolve((window as any).mapboxgl); };
    s.onerror = function () { reject(new Error('map did not load')); };
    document.head.appendChild(s);
  });
  return mapLoader;
}

type Props = {
  token: string;
};

const SPANS = [
  { mins: 1440, label: 'Today' },
  { mins: 10080, label: 'Last 7 days' },
  { mins: 43200, label: 'Last 30 days' },
  { mins: 525600, label: 'Last year' },
];

export default function MyTrail(props: Props) {
  const [open, setOpen] = useState(false);
  const [mins, setMins] = useState(1440);
  const [note, setNote] = useState('');
  const [miles, setMiles] = useState(0);
  const [line, setLine] = useState<any[]>([]);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);

  const load = useCallback(async function (m: number) {
    if (!props.token) return;
    setNote('Looking...');
    try {
      const res = await fetch('/api/driver-trail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: props.token, minutes: m, mine: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLine([]);
        setMiles(0);
        setNote(data && data.error ? String(data.error) : 'Could not read your history.');
        return;
      }
      if (!data.ready) {
        setLine([]);
        setMiles(0);
        setNote('The history store is not switched on yet.');
        return;
      }
      const key = String(data.mine || '');
      const pts: any[] = data.trails && data.trails[key] ? data.trails[key] : [];
      const mi = data.miles && data.miles[key] ? Number(data.miles[key]) : 0;
      let road: any = pts;
      if (pts.length > 1) {
        try { road = await snapToRoads(pts, MAP_TOKEN); } catch (e) {}
      }
      if (!road || road.length < 2) road = pts;
      setLine(road);
      setMiles(mi);
      if (pts.length < 2) setNote('Nothing saved for that stretch of time yet. It fills up on its own while you drive.');
      else setNote('');
    } catch (e) {
      setNote('Could not read your history.');
    }
  }, [props.token]);

  useEffect(function () {
    if (!open) return;
    load(mins);
  }, [open, mins, load]);

  useEffect(function () {
    if (!open) return;
    if (!MAP_TOKEN) return;
    let dead = false;
    loadMapbox().then(function (mapboxgl: any) {
      if (dead || !boxRef.current || mapRef.current || !mapboxgl) return;
      mapboxgl.accessToken = MAP_TOKEN;
      const m = new mapboxgl.Map({
        container: boxRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-85.7585, 38.2542],
        zoom: 10,
      });
      mapRef.current = m;
      m.on('load', function () {
        try {
          m.addSource('mytrail', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
          m.addLayer({
            id: 'mytrailline',
            type: 'line',
            source: 'mytrail',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#7c3aed', 'line-width': 5, 'line-opacity': 0.85 },
          });
        } catch (e) {}
      });
    }).catch(function () {});
    return function () { dead = true; };
  }, [open]);

  useEffect(function () {
    const m = mapRef.current;
    if (!m) return;
    const paint = function () {
      try {
        const src = m.getSource('mytrail');
        if (!src) return;
        if (line.length < 2) {
          src.setData({ type: 'FeatureCollection', features: [] });
          return;
        }
        src.setData({
          type: 'FeatureCollection',
          features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: line } }],
        });
        let west = line[0][0];
        let east = line[0][0];
        let south = line[0][1];
        let north = line[0][1];
        line.forEach(function (p: any) {
          if (p[0] < west) west = p[0];
          if (p[0] > east) east = p[0];
          if (p[1] < south) south = p[1];
          if (p[1] > north) north = p[1];
        });
        m.fitBounds([[west, south], [east, north]], { padding: 40, duration: 600, maxZoom: 15 });
      } catch (e) {}
    };
    if (m.isStyleLoaded && m.isStyleLoaded()) paint();
    else m.once('idle', paint);
  }, [line]);

  const card: any = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    boxShadow: '0 6px 18px rgba(15,23,42,0.06)',
  };

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18, color: '#0f172a' }}>Where I have been</div>
          <div style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
            The road you covered. This is the same history the owner can see.
          </div>
        </div>
        <button
          type='button'
          onClick={function () { setOpen(!open); }}
          style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 800, color: '#0f172a', cursor: 'pointer' }}
        >
          {open ? 'Hide' : 'Open'}
        </button>
      </div>

      {open ? (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SPANS.map(function (s) {
              const on = mins === s.mins;
              return (
                <button
                  key={s.mins}
                  type='button'
                  onClick={function () { setMins(s.mins); }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: on ? '1px solid #7c3aed' : '1px solid #cbd5e1',
                    background: on ? '#7c3aed' : '#ffffff',
                    color: on ? '#ffffff' : '#0f172a',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 10, fontWeight: 800, color: '#7c3aed' }}>
            {miles > 0 ? 'You covered about ' + miles + ' miles.' : ''}
          </div>
          {note ? <div style={{ marginTop: 6, color: '#64748b' }}>{note}</div> : null}

          <div
            ref={boxRef}
            style={{ width: '100%', height: 300, borderRadius: 14, overflow: 'hidden', marginTop: 12, background: '#e2e8f0' }}
          />
        </div>
      ) : null}
    </div>
  );
}
