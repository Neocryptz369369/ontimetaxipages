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

function speedLine(d: Driver) {
  if (d.mph === null) return 'Speed not known yet';
  let s = d.mph + ' mph';
  if (d.limit_mph !== null && d.limit_mph > 0) s = s + ' where the limit is ' + d.limit_mph;
  if (d.over_by !== null && d.over_by > 0) s = s + ' - OVER by ' + d.over_by;
  return s;
}

export default function DriverMap() {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const marksRef = useRef<any>({});
  const listRef = useRef<Driver[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [msg, setMsg] = useState('');
  const [tilted, setTilted] = useState(true);
  const [mapUp, setMapUp] = useState(false);

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
        setMsg('');
      } else if (j && j.error) {
        setMsg(String(j.error));
      }
    } catch (e) {
      setMsg('Could not read the driver map right now.');
    }
  }

  useEffect(function () {
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
        const m = new mapboxgl.Map({
          container: boxRef.current,
          style: 'mapbox://styles/mapbox/standard',
          center: [-85.755, 38.3981],
          zoom: 11,
          pitch: 60,
          bearing: -18,
          antialias: true,
        });
        mapRef.current = m;
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
      mk.__tag.textContent = d.name;
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
    });
    Object.keys(marksRef.current).forEach(function (id) {
      if (!keep[id]) {
        try { marksRef.current[id].remove(); } catch (e) {}
        delete marksRef.current[id];
      }
    });
  }, [drivers, mapUp]);

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
    const list = listRef.current;
    if (!list.length) return;
    if (list.length === 1) {
      try { m.easeTo({ center: [list[0].lng, list[0].lat], zoom: 15, pitch: tilted ? 60 : 0, duration: 700 }); } catch (e) {}
      return;
    }
    try {
      const b = new mapboxgl.LngLatBounds();
      list.forEach(function (d) { b.extend([d.lng, d.lat]); });
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

  const liveCount = drivers.filter(function (d) { return d.live; }).length;

  return (
    <div style={card}>
      <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 800 }}>All my drivers on the map</h2>
      <p style={{ color: '#b3ccd9', margin: '0 0 12px', fontSize: '14px' }}>
        Every driver with their driving screen open shows up here. Green means moving along fine, red means over the speed limit, grey means you have not heard from them in a while. Use the buttons to make the map bigger or smaller, and drag the map to spin the 3D view around.
      </p>

      <div style={{ marginBottom: '4px', fontWeight: 800 }}>
        {drivers.length === 0
          ? 'No driver has sent a location yet.'
          : liveCount + ' of ' + drivers.length + ' showing as live right now'}
      </div>

      <div>
        <button onClick={zoomIn} style={btn}>Zoom in +</button>
        <button onClick={zoomOut} style={btn}>Zoom out -</button>
        <button onClick={flip3d} style={btn}>{tilted ? 'Flat view' : '3D view'}</button>
        <button onClick={fitAll} style={btn}>Show every driver</button>
        <button onClick={function () { load(); }} style={btn}>Refresh now</button>
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
    </div>
  );
}
