'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

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

type Driver = {
  id: string;
  name: string;
  code: string;
  status: string;
  phone: string;
  car: string;
  plate: string;
  lat: number;
  lng: number;
  mph: number | null;
  limit_mph: number | null;
  over_by: number | null;
  minutes_ago: number | null;
  live: boolean;
};

type Rider = {
  id: string;
  name: string;
  pickup: string;
  dropoff: string;
  fare: number | null;
  lat: number;
  lng: number;
  waiting_minutes: number | null;
};

const card: any = {
  padding: '24px',
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'linear-gradient(180deg, rgba(6,26,40,0.6), rgba(0,6,10,0.4))',
  color: '#ffffff',
};

const btn: any = {
  border: 'none',
  borderRadius: '10px',
  padding: '10px 14px',
  fontWeight: 800,
  fontSize: '14px',
  cursor: 'pointer',
  marginRight: '8px',
  marginTop: '8px',
  background: '#ffffff',
  color: '#04121c',
};

const VIEW_KEY = 'ot_admin_map_view';

let styleAdded = false;
function addFlashStyle() {
  if (styleAdded || typeof document === 'undefined') return;
  styleAdded = true;
  const st = document.createElement('style');
  st.textContent =
    '@keyframes otflash { 0% { transform: scale(1); } 50% { transform: scale(1.7); } 100% { transform: scale(1); } }' +
    ' .otflash { animation: otflash 0.6s infinite; }';
  document.head.appendChild(st);
}

let audioCtx: any = null;

function wakeAudio() {
  try {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === 'suspended') { audioCtx.resume(); }
  } catch (e) {}
}

function alarmBurst() {
  try {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === 'suspended') { try { audioCtx.resume(); } catch (e) {} }
    const t0 = audioCtx.currentTime;
    for (let i = 0; i < 4; i++) {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'square';
      o.frequency.value = i % 2 === 0 ? 1150 : 760;
      const at = t0 + i * 0.32;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.9, at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.26);
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start(at);
      o.stop(at + 0.29);
    }
  } catch (e) {}
}

function colourFor(d: Driver) {
  if (d.over_by !== null && d.over_by > 0) return '#ff3b3b';
  if (d.live) return '#22c55e';
  return '#6b7280';
}

function ago(mins: number | null) {
  if (mins === null) return 'no time on record';
  if (mins <= 0) return 'right now';
  if (mins === 1) return '1 minute ago';
  if (mins < 60) return mins + ' minutes ago';
  const h = Math.round(mins / 60);
  return h === 1 ? 'about 1 hour ago' : 'about ' + h + ' hours ago';
}

function waited(mins: number | null) {
  if (mins === null || mins <= 0) return 'just now';
  if (mins === 1) return '1 minute';
  if (mins < 60) return mins + ' minutes';
  const h = Math.round(mins / 60);
  return h === 1 ? 'about 1 hour' : 'about ' + h + ' hours';
}

function speedLine(d: Driver) {
  if (d.mph === null) return 'Speed not known yet';
  let s = d.mph + ' mph';
  if (d.limit_mph !== null && d.limit_mph > 0) s = s + ' where the limit is ' + d.limit_mph;
  if (d.over_by !== null && d.over_by > 0) s = s + ' - OVER by ' + d.over_by;
  return s;
}

function savedView(): any {
  try {
    const raw = window.localStorage.getItem(VIEW_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (v && typeof v.lng === 'number' && typeof v.lat === 'number') return v;
  } catch (e) {}
  return null;
}

export default function DriverMap() {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const marksRef = useRef<any>({});
  const riderMarksRef = useRef<any>({});
  const trailRef = useRef<any>({});
  const listRef = useRef<Driver[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [msg, setMsg] = useState('');
  const [tilted, setTilted] = useState(true);
  const [mapUp, setMapUp] = useState(false);
  const [q, setQ] = useState('');
  const [sound, setSound] = useState(true);
  const [showRiders, setShowRiders] = useState(true);
  const [showTrails, setShowTrails] = useState(true);

  async function myToken() {
    try {
      const s = await supabase.auth.getSession();
      return s && s.data && s.data.session ? String(s.data.session.access_token || '') : '';
    } catch (e) {
      return '';
    }
  }

  async function load() {
    const tk = await myToken();
    if (!tk) return;
    try {
      const r = await fetch('/api/driver-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tk }),
      });
      const j = await r.json();
      if (j && j.ok && Array.isArray(j.drivers)) {
        listRef.current = j.drivers;
        setDrivers(j.drivers);
        setRiders(Array.isArray(j.riders) ? j.riders : []);
        setMsg('');
      } else if (j && j.error) {
        setMsg(String(j.error));
      }
    } catch (e) {
      setMsg('Could not read the driver map right now.');
    }
  }

  useEffect(function () {
    addFlashStyle();
    load();
    const t = setInterval(load, 8000);
    return function () { clearInterval(t); };
  }, []);

  useEffect(function () {
    let dead = false;
    loadMapbox()
      .then(function (mapboxgl: any) {
        if (dead || !boxRef.current || mapRef.current || !mapboxgl) return;
        mapboxgl.accessToken = MAP_TOKEN;
        const v = savedView();
        const startPitch = v && typeof v.pitch === 'number' ? v.pitch : 60;
        const m = new mapboxgl.Map({
          container: boxRef.current,
          style: 'mapbox://styles/mapbox/standard',
          center: v ? [v.lng, v.lat] : [-85.755, 38.3981],
          zoom: v && typeof v.zoom === 'number' ? v.zoom : 11,
          pitch: startPitch,
          bearing: v && typeof v.bearing === 'number' ? v.bearing : -18,
          antialias: true,
        });
        mapRef.current = m;
        setTilted(startPitch > 10);
        try { m.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right'); } catch (e) {}
        try { m.addControl(new mapboxgl.FullscreenControl(), 'top-right'); } catch (e) {}
        m.on('style.load', function () {
          try {
            if (!m.getSource('otdem')) {
              m.addSource('otdem', {
                type: 'raster-dem',
                url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                tileSize: 512,
                maxzoom: 14,
              });
            }
            m.setTerrain({ source: 'otdem', exaggeration: 1.2 });
          } catch (e) {}
          try {
            if (!m.getSource('ottrails')) {
              m.addSource('ottrails', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
              m.addLayer({
                id: 'ottrails-line',
                type: 'line',
                source: 'ottrails',
                layout: { 'line-cap': 'round', 'line-join': 'round' },
                paint: { 'line-color': ['get', 'colour'], 'line-width': 5, 'line-opacity': 0.8 },
              });
            }
          } catch (e) {}
        });
        m.on('moveend', function () {
          try {
            const c = m.getCenter();
            window.localStorage.setItem(
              VIEW_KEY,
              JSON.stringify({ lng: c.lng, lat: c.lat, zoom: m.getZoom(), pitch: m.getPitch(), bearing: m.getBearing() })
            );
          } catch (e) {}
        });
        m.on('load', function () {
          setMapUp(true);
          try { m.resize(); } catch (e) {}
          setTimeout(function () { try { m.resize(); } catch (e) {} }, 400);
          setTimeout(function () { try { m.resize(); } catch (e) {} }, 1200);
        });
      })
      .catch(function () {
        setMsg('The map could not start. Please reload the page.');
      });
    return function () { dead = true; };
  }, []);

  useEffect(function () {
    const mapboxgl = (window as any).mapboxgl;
    const m = mapRef.current;
    if (!mapboxgl || !m) return;
    const keep: any = {};
    drivers.forEach(function (d) {
      keep[d.id] = true;
      const colour = colourFor(d);
      const speeding = d.over_by !== null && d.over_by > 0;
      let mk: any = marksRef.current[d.id];
      if (!mk) {
        const el = document.createElement('div');
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.gap = '6px';
        el.style.cursor = 'pointer';
        const dot = document.createElement('div');
        dot.style.width = '18px';
        dot.style.height = '18px';
        dot.style.borderRadius = '50%';
        dot.style.border = '3px solid #ffffff';
        dot.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.35)';
        const tag = document.createElement('div');
        tag.style.padding = '2px 7px';
        tag.style.borderRadius = '8px';
        tag.style.fontSize = '12px';
        tag.style.fontWeight = '800';
        tag.style.color = '#ffffff';
        tag.style.whiteSpace = 'nowrap';
        el.appendChild(dot);
        el.appendChild(tag);
        const pop = new mapboxgl.Popup({ offset: 18, closeButton: true });
        mk = new mapboxgl.Marker({ element: el }).setLngLat([d.lng, d.lat]).setPopup(pop).addTo(m);
        mk.__dot = dot;
        mk.__tag = tag;
        mk.__pop = pop;
        marksRef.current[d.id] = mk;
      }
      try { mk.setLngLat([d.lng, d.lat]); } catch (e) {}
      mk.__dot.style.background = colour;
      mk.__tag.style.background = colour;
      mk.__dot.className = speeding ? 'otflash' : '';
      let label = d.name;
      if (d.mph !== null) label = label + ' - ' + d.mph + ' mph';
      if (speeding) label = label + ' - OVER BY ' + d.over_by;
      mk.__tag.textContent = label;
      const holder = document.createElement('div');
      holder.style.color = '#04121c';
      holder.style.fontSize = '13px';
      holder.style.lineHeight = '1.35';
      const lines = [
        d.name,
        d.code ? 'ID ' + d.code : '',
        d.car ? d.car : 'No car on file',
        d.plate ? 'Plate ' + d.plate : 'No plate on file',
        speedLine(d),
        'Last heard from ' + ago(d.minutes_ago),
        d.phone ? 'Phone ' + d.phone : '',
      ];
      lines.forEach(function (line, n) {
        if (!line) return;
        const row = document.createElement('div');
        row.textContent = line;
        if (n === 0) {
          row.style.fontWeight = '800';
          row.style.fontSize = '15px';
        }
        holder.appendChild(row);
      });
      try { mk.__pop.setDOMContent(holder); } catch (e) {}
      const arr = trailRef.current[d.id] || [];
      const last = arr.length ? arr[arr.length - 1] : null;
      if (!last || Math.abs(last[0] - d.lng) > 0.00003 || Math.abs(last[1] - d.lat) > 0.00003) {
        arr.push([d.lng, d.lat]);
        if (arr.length > 90) arr.shift();
        trailRef.current[d.id] = arr;
      }
    });
    Object.keys(marksRef.current).forEach(function (id) {
      if (!keep[id]) {
        try { marksRef.current[id].remove(); } catch (e) {}
        delete marksRef.current[id];
        delete trailRef.current[id];
      }
    });
    try {
      const feats: any[] = [];
      if (showTrails) {
        drivers.forEach(function (d) {
          const pts = trailRef.current[d.id];
          if (pts && pts.length > 1) {
            feats.push({
              type: 'Feature',
              properties: { colour: colourFor(d) },
              geometry: { type: 'LineString', coordinates: pts },
            });
          }
        });
      }
      const src = m.getSource('ottrails');
      if (src) src.setData({ type: 'FeatureCollection', features: feats });
    } catch (e) {}
  }, [drivers, mapUp, showTrails]);

  useEffect(function () {
    const mapboxgl = (window as any).mapboxgl;
    const m = mapRef.current;
    if (!mapboxgl || !m) return;
    const keep: any = {};
    const list = showRiders ? riders : [];
    list.forEach(function (r) {
      keep[r.id] = true;
      let mk: any = riderMarksRef.current[r.id];
      if (!mk) {
        const el = document.createElement('div');
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.gap = '6px';
        el.style.cursor = 'pointer';
        const dot = document.createElement('div');
        dot.style.width = '16px';
        dot.style.height = '16px';
        dot.style.borderRadius = '4px';
        dot.style.transform = 'rotate(45deg)';
        dot.style.border = '3px solid #ffffff';
        dot.style.background = '#f59e0b';
        dot.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.35)';
        const tag = document.createElement('div');
        tag.style.padding = '2px 7px';
        tag.style.borderRadius = '8px';
        tag.style.fontSize = '12px';
        tag.style.fontWeight = '800';
        tag.style.color = '#04121c';
        tag.style.background = '#f59e0b';
        tag.style.whiteSpace = 'nowrap';
        el.appendChild(dot);
        el.appendChild(tag);
        const pop = new mapboxgl.Popup({ offset: 18, closeButton: true });
        mk = new mapboxgl.Marker({ element: el }).setLngLat([r.lng, r.lat]).setPopup(pop).addTo(m);
        mk.__tag = tag;
        mk.__pop = pop;
        riderMarksRef.current[r.id] = mk;
      }
      try { mk.setLngLat([r.lng, r.lat]); } catch (e) {}
      mk.__tag.textContent = 'Waiting - ' + r.name;
      const holder = document.createElement('div');
      holder.style.color = '#04121c';
      holder.style.fontSize = '13px';
      holder.style.lineHeight = '1.35';
      const lines = [
        'Waiting for a ride - ' + r.name,
        r.pickup ? 'Pick up ' + r.pickup : '',
        r.dropoff ? 'Going to ' + r.dropoff : '',
        r.fare !== null ? 'Fare $' + r.fare.toFixed(2) : '',
        'Waiting ' + waited(r.waiting_minutes),
      ];
      lines.forEach(function (line, n) {
        if (!line) return;
        const row = document.createElement('div');
        row.textContent = line;
        if (n === 0) {
          row.style.fontWeight = '800';
          row.style.fontSize = '15px';
        }
        holder.appendChild(row);
      });
      try { mk.__pop.setDOMContent(holder); } catch (e) {}
    });
    Object.keys(riderMarksRef.current).forEach(function (id) {
      if (!keep[id]) {
        try { riderMarksRef.current[id].remove(); } catch (e) {}
        delete riderMarksRef.current[id];
      }
    });
  }, [riders, mapUp, showRiders]);

  useEffect(function () {
    const over = drivers.filter(function (d) { return d.over_by !== null && d.over_by > 0; });
    if (!sound || over.length === 0) return;
    alarmBurst();
    const t = setInterval(alarmBurst, 2600);
    return function () { clearInterval(t); };
  }, [drivers, sound]);

  function zoomIn() { const m = mapRef.current; if (m) { try { m.zoomIn(); } catch (e) {} } }
  function zoomOut() { const m = mapRef.current; if (m) { try { m.zoomOut(); } catch (e) {} } }

  function flip3d() {
    const m = mapRef.current;
    const next = !tilted;
    setTilted(next);
    if (m) {
      try { m.easeTo({ pitch: next ? 60 : 0, bearing: next ? -18 : 0, duration: 700 }); } catch (e) {}
    }
  }

  function fitAll() {
    const m = mapRef.current;
    const mapboxgl = (window as any).mapboxgl;
    if (!m || !mapboxgl) return;
    const pts: any[] = [];
    listRef.current.forEach(function (d) { pts.push([d.lng, d.lat]); });
    if (showRiders) { riders.forEach(function (r) { pts.push([r.lng, r.lat]); }); }
    if (!pts.length) return;
    if (pts.length === 1) {
      try { m.easeTo({ center: pts[0], zoom: 15, pitch: tilted ? 60 : 0, duration: 700 }); } catch (e) {}
      return;
    }
    try {
      const b = new mapboxgl.LngLatBounds();
      pts.forEach(function (p) { b.extend(p); });
      m.fitBounds(b, { padding: 70, maxZoom: 15, pitch: tilted ? 60 : 0, duration: 800 });
    } catch (e) {}
  }

  function goTo(d: Driver) {
    const m = mapRef.current;
    if (!m) return;
    try { m.easeTo({ center: [d.lng, d.lat], zoom: 16, pitch: tilted ? 60 : 0, bearing: tilted ? -18 : 0, duration: 800 }); } catch (e) {}
    const mk = marksRef.current[d.id];
    if (mk) { try { mk.togglePopup(); } catch (e) {} }
  }

  function goToRider(r: Rider) {
    const m = mapRef.current;
    if (!m) return;
    try { m.easeTo({ center: [r.lng, r.lat], zoom: 16, pitch: tilted ? 60 : 0, bearing: tilted ? -18 : 0, duration: 800 }); } catch (e) {}
    const mk = riderMarksRef.current[r.id];
    if (mk) { try { mk.togglePopup(); } catch (e) {} }
  }

  function doSearch() {
    const t = q.trim().toLowerCase();
    if (!t) return;
    const hits = listRef.current.filter(function (d) {
      const code = String(d.code || '').toLowerCase();
      const name = String(d.name || '').toLowerCase();
      return name.indexOf(t) >= 0 || code.indexOf(t) >= 0;
    });
    if (hits.length > 0) {
      setMsg('');
      goTo(hits[0]);
    } else {
      setMsg('No driver on the map matches that name or ID right now.');
    }
  }

  function fullScreen() {
    const el: any = boxRef.current;
    if (!el) return;
    try {
      const doc: any = document;
      if (doc.fullscreenElement || doc.webkitFullscreenElement) {
        if (doc.exitFullscreen) doc.exitFullscreen();
        else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
      } else if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    } catch (e) {}
    setTimeout(function () { const m = mapRef.current; if (m) { try { m.resize(); } catch (e) {} } }, 500);
  }

  const liveCount = drivers.filter(function (d) { return d.live; }).length;
  const overList = drivers.filter(function (d) { return d.over_by !== null && d.over_by > 0; });

  return (
    <div style={card} onClick={function () { wakeAudio(); }}>
      <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 800 }}>All my drivers on the map</h2>
      <p style={{ color: '#b3ccd9', margin: '0 0 12px', fontSize: '14px' }}>
        Every driver with their driving screen open shows up here with the speed they are doing printed right on the pin. Green means moving along fine. Red and flashing means over the speed limit and you will hear a loud alarm. Grey means you have not heard from them in a while. Orange diamonds are customers waiting for a ride. The line behind a driver shows where they have just been.
      </p>

      {overList.length > 0 ? (
        <div
          style={{
            background: '#7f1d1d',
            border: '2px solid #ff3b3b',
            borderRadius: '12px',
            padding: '10px 12px',
            marginBottom: '10px',
            fontWeight: 800,
          }}
        >
          {overList.length === 1
            ? '1 driver is over the speed limit right now'
            : overList.length + ' drivers are over the speed limit right now'}
        </div>
      ) : null}

      <div style={{ marginBottom: '4px', fontWeight: 800 }}>
        {drivers.length === 0
          ? 'No driver has sent a location yet.'
          : liveCount + ' of ' + drivers.length + ' showing as live right now'}
        {riders.length > 0
          ? ' - ' + (riders.length === 1 ? '1 customer waiting' : riders.length + ' customers waiting')
          : ''}
      </div>

      <div style={{ marginTop: '8px' }}>
        <input
          value={q}
          onChange={function (e) { setQ(e.target.value); }}
          onKeyDown={function (e) { if (e.key === 'Enter') { doSearch(); } }}
          placeholder='Driver name or their 12 digit ID'
          style={{
            padding: '10px 12px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.25)',
            background: 'rgba(255,255,255,0.08)',
            color: '#ffffff',
            fontSize: '14px',
            width: '280px',
            maxWidth: '100%',
          }}
        />
        <button onClick={doSearch} style={btn}>Find this driver</button>
      </div>

      <div>
        <button onClick={zoomIn} style={btn}>Zoom in +</button>
        <button onClick={zoomOut} style={btn}>Zoom out -</button>
        <button onClick={flip3d} style={btn}>{tilted ? 'Flat view' : '3D view'}</button>
        <button onClick={fitAll} style={btn}>Show everyone</button>
        <button onClick={fullScreen} style={Object.assign({}, btn, { background: '#ffd166' })}>Full screen</button>
        <button onClick={function () { load(); }} style={btn}>Refresh now</button>
      </div>

      <div>
        <button onClick={function () { setShowRiders(!showRiders); }} style={btn}>
          {showRiders ? 'Hide waiting customers' : 'Show waiting customers'}
        </button>
        <button onClick={function () { setShowTrails(!showTrails); }} style={btn}>
          {showTrails ? 'Hide the trail lines' : 'Show the trail lines'}
        </button>
        <button
          onClick={function () { wakeAudio(); setSound(!sound); }}
          style={Object.assign({}, btn, { background: sound ? '#22c55e' : '#ffffff', color: sound ? '#04121c' : '#04121c' })}
        >
          {sound ? 'Speeding alarm is ON' : 'Speeding alarm is OFF'}
        </button>
      </div>

      <div
        ref={boxRef}
        style={{
          height: '460px',
          width: '100%',
          marginTop: '12px',
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.18)',
          background: '#04121c',
        }}
      />

      {msg ? <p style={{ color: '#ffd166', fontWeight: 700 }}>{msg}</p> : null}

      <div style={{ marginTop: '12px' }}>
        {drivers.map(function (d) {
          return (
            <div
              key={d.id}
              onClick={function () { goTo(d); }}
              style={{
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderLeft: '6px solid ' + colourFor(d),
                borderRadius: '12px',
                padding: '10px 12px',
                marginBottom: '8px',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '15px' }}>
                {d.name}
                {d.code ? ' - ID ' + d.code : ''}
              </div>
              <div style={{ color: '#b3ccd9', fontSize: '13px' }}>
                {d.car ? d.car : 'No car on file'}
                {d.plate ? ' - Plate ' + d.plate : ''}
              </div>
              <div style={{ color: '#b3ccd9', fontSize: '13px' }}>{speedLine(d)}</div>
              <div style={{ color: '#b3ccd9', fontSize: '13px' }}>Last heard from {ago(d.minutes_ago)}</div>
            </div>
          );
        })}
      </div>

      {showRiders && riders.length > 0 ? (
        <div style={{ marginTop: '6px' }}>
          <div style={{ fontWeight: 800, marginBottom: '6px' }}>Customers waiting for a ride</div>
          {riders.map(function (r) {
            return (
              <div
                key={r.id}
                onClick={function () { goToRider(r); }}
                style={{
                  cursor: 'pointer',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderLeft: '6px solid #f59e0b',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  marginBottom: '8px',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '15px' }}>{r.name}</div>
                <div style={{ color: '#b3ccd9', fontSize: '13px' }}>
                  {r.pickup ? 'Pick up ' + r.pickup : 'No pickup on file'}
                </div>
                {r.dropoff ? (
                  <div style={{ color: '#b3ccd9', fontSize: '13px' }}>Going to {r.dropoff}</div>
                ) : null}
                <div style={{ color: '#b3ccd9', fontSize: '13px' }}>Waiting {waited(r.waiting_minutes)}</div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
