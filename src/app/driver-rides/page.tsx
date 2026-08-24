'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import RatingBox, { starRow } from '../../components/RatingBox';
import AccidentReport from '../../components/AccidentReport';
import Ticker from '../../components/Ticker';
import DriverAlerts from '../../components/DriverAlerts';
import TellAdmin from '../../components/TellAdmin';
import DriverRecord from '../../components/DriverRecord';
import MyTrail from '../../components/MyTrail';
import PanicButton from '../../components/PanicButton';
import TodayPay from '../../components/TodayPay';
import DriverEarnings from '../../components/DriverEarnings';
import SafetyAlerts from '../../components/SafetyAlerts';
import NewOrderAlarm from '../../components/NewOrderAlarm';

type Ride = {
  id: string;
  pickup: string | null;
  dropoff: string | null;
  stops: any;
  fare: number | null;
  tip: number | null;
  paid: boolean | null;
  status: string;
  created_at: string;
  accepted_at?: string | null;
  rider_name?: string | null;
  rider_photo?: string | null;
  rider_phone?: string | null;
  riderStars?: number;
  riderRatings?: number;
};

const shell: any = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg,#f8fafc 0%,#eef2ff 100%)',
  fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,sans-serif',
  padding: '32px 16px',
};
const wrap: any = { maxWidth: 640, margin: '0 auto' };
const card: any = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 16,
  padding: 20,
  marginBottom: 16,
  boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
};
const takeBtn: any = {
  display: 'block',
  width: '100%',
  marginTop: 14,
  padding: '14px 16px',
  borderRadius: 12,
  border: 'none',
  background: '#16a34a',
  color: '#fff',
  fontWeight: 800,
  fontSize: 16,
  cursor: 'pointer',
};
const rowLine: any = { color: '#0f172a', fontWeight: 700, lineHeight: 1.5 };
const small: any = { color: '#64748b', fontSize: 13, marginTop: 4 };
const detLabel: any = { display: 'block', color: '#475569', fontWeight: 800, fontSize: 13, marginBottom: 4 };
const detBox: any = {
  width: '100%',
  padding: '11px 12px',
  borderRadius: 10,
  border: '1px solid #cbd5e1',
  fontSize: 16,
  color: '#0f172a',
  background: '#fff',
  boxSizing: 'border-box',
};
const detBtn: any = {
  display: 'block',
  width: '100%',
  marginTop: 14,
  padding: '14px 16px',
  borderRadius: 12,
  border: 'none',
  background: '#2563eb',
  color: '#fff',
  fontWeight: 800,
  fontSize: 16,
  cursor: 'pointer',
};

function Avatar(props: { src?: string | null; size?: number; label?: string }) {
  const size = props.size ? props.size : 46;
  const src = props.src ? String(props.src) : '';
  if (src) {
    return (
      <img
        src={src}
        alt={props.label ? props.label : 'photo'}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid #cbd5e1', flexShrink: 0, background: '#e2e8f0' }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#e2e8f0',
        border: '2px solid #cbd5e1',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b',
        fontSize: 11,
        textAlign: 'center',
        lineHeight: 1.1,
      }}
    >
      No photo
    </div>
  );
}

function money(n: any) {
  const v = Number(n);
  if (!v && v !== 0) return '$0.00';
  return '$' + v.toFixed(2);
}

function waited(iso: string) {
  if (!iso) return '';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins === 1) return '1 minute ago';
  if (mins < 60) return mins + ' minutes ago';
  const h = Math.floor(mins / 60);
  if (h === 1) return '1 hour ago';
  return h + ' hours ago';
}

function stopCount(stops: any) {
  if (!stops) return 0;
  if (Array.isArray(stops)) return stops.length;
  try {
    const p = JSON.parse(String(stops));
    return Array.isArray(p) ? p.length : 0;
  } catch (e) {
    return 0;
  }
}

function myCarLine(d: any) {
  if (!d) return '';
  const bits: string[] = [];
  if (d.vehicle_color) bits.push(String(d.vehicle_color));
  if (d.vehicle_year) bits.push(String(d.vehicle_year));
  if (d.vehicle_make) bits.push(String(d.vehicle_make));
  if (d.vehicle_model) bits.push(String(d.vehicle_model));
  return bits.join(' ');
}

function digitsOnly(v: any) {
  return String(v === null || v === undefined ? '' : v).replace(/[^0-9]/g, '');
}

function prettyPhone(v: any) {
  const d = digitsOnly(v);
  const ten = d.length === 11 && d.charAt(0) === '1' ? d.slice(1) : d;
  if (ten.length === 10) return ten.slice(0, 3) + '-' + ten.slice(3, 6) + '-' + ten.slice(6);
  return ten;
}

export default function DriverRidesPage() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [hasDriver, setHasDriver] = useState(false);
  const [approved, setApproved] = useState(false);
  const [name, setName] = useState('');
  const [rides, setRides] = useState<Ride[]>([]);
  const [mine, setMine] = useState<Ride[]>([]);
  const [msg, setMsg] = useState('');
  const [busyId, setBusyId] = useState('');
  const [mustRate, setMustRate] = useState<any>(null);
  const [holding, setHolding] = useState<any>(null);
  const [rateBusy, setRateBusy] = useState(false);
  const [rateError, setRateError] = useState('');
  const busyRef = useRef(false);
  const [myToken, setMyToken] = useState('');
  const [driverPhoto, setDriverPhoto] = useState('');
  const [myEmail, setMyEmail] = useState('');
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoMsg, setPhotoMsg] = useState('');
  const [myCar, setMyCar] = useState('');
  const [myPlate, setMyPlate] = useState('');
  const [detBusy, setDetBusy] = useState(false);
  const [detMsg, setDetMsg] = useState('');
  const [fName, setFName] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fMake, setFMake] = useState('');
  const [fModel, setFModel] = useState('');
  const [fYear, setFYear] = useState('');
  const [fColor, setFColor] = useState('');
  const [fPlate, setFPlate] = useState('');
  const filledRef = useRef(false);

  const load = useCallback(async function load() {
    const got = await supabase.auth.getSession();
    const token = got.data.session ? got.data.session.access_token : '';
    if (!token) {
      setSignedIn(false);
      setReady(true);
      return;
    }
    setSignedIn(true);
    setMyToken(token);
    setMyEmail(got.data.session && got.data.session.user ? String(got.data.session.user.email || '') : '');
    try {
      const res = await fetch('/api/open-rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const j = await res.json();
      if (j && j.ok) {
        setHasDriver(!!j.driver);
        setApproved(!!j.approved);
        setName(j.driver && j.driver.full_name ? String(j.driver.full_name) : '');
        setRides(j.rides || []);
        setMine(j.mine || []);
        setMustRate(j.mustRate ? j.mustRate : null);
        setHolding(j.holding ? j.holding : null);
        setDriverPhoto(j.driverPhoto ? String(j.driverPhoto) : '');
        setMyCar(myCarLine(j.driver));
        setMyPlate(j.driver && j.driver.vehicle_plate ? String(j.driver.vehicle_plate) : '');
        if (!filledRef.current) {
          filledRef.current = true;
          const dd: any = j.driver ? j.driver : {};
          setFName(dd.full_name ? String(dd.full_name) : '');
          setFPhone(prettyPhone(dd.phone));
          setFMake(dd.vehicle_make ? String(dd.vehicle_make) : '');
          setFModel(dd.vehicle_model ? String(dd.vehicle_model) : '');
          setFYear(dd.vehicle_year ? String(dd.vehicle_year) : '');
          setFColor(dd.vehicle_color ? String(dd.vehicle_color) : '');
          setFPlate(dd.vehicle_plate ? String(dd.vehicle_plate) : '');
        }
      }
    } catch (e) {}
    setReady(true);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(function tick() {
      if (!busyRef.current) load();
    }, 5000);
    return () => clearInterval(t);
  }, [load]);

  async function uploadMyPhoto(file: File | null) {
    if (!file) return;
    setPhotoBusy(true);
    setPhotoMsg('');
    try {
      const dataUrl: string = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(String(reader.result));
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      const res = await fetch('/api/driver-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: dataUrl, email: myEmail }),
      });
      const j = await res.json();
      if (!res.ok) {
        setPhotoMsg(String(j.error || 'That picture could not be saved.'));
      } else {
        setDriverPhoto(j.url ? String(j.url) : '');
        setPhotoMsg('Your photo is saved. This is the photo riders will see.');
        load();
      }
    } catch (e) {
      setPhotoMsg('That picture could not be saved.');
    }
    setPhotoBusy(false);
  }

  async function saveMyDetails() {
    const phoneDigits = digitsOnly(fPhone);
    if (fPhone.trim() !== '' && phoneDigits.length !== 10 && phoneDigits.length !== 11) {
      setDetMsg('That phone number does not look right. Please put in a 10 digit number, like 930-216-4166.');
      return;
    }
    setDetBusy(true);
    setDetMsg('');
    try {
      const got = await supabase.auth.getSession();
      const tok = got.data.session ? got.data.session.access_token : '';
      const res = await fetch('/api/driver-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tok,
          fullName: fName,
          phone: prettyPhone(fPhone),
          make: fMake,
          model: fModel,
          year: fYear,
          color: fColor,
          plate: fPlate,
        }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) {
        setDetMsg(String(j.error || 'That could not be saved. Please try again.'));
      } else {
        const dd: any = j.driver ? j.driver : {};
        setFName(dd.full_name ? String(dd.full_name) : '');
        setFPhone(prettyPhone(dd.phone));
        setFMake(dd.vehicle_make ? String(dd.vehicle_make) : '');
        setFModel(dd.vehicle_model ? String(dd.vehicle_model) : '');
        setFYear(dd.vehicle_year ? String(dd.vehicle_year) : '');
        setFColor(dd.vehicle_color ? String(dd.vehicle_color) : '');
        setFPlate(dd.vehicle_plate ? String(dd.vehicle_plate) : '');
        setMyCar(myCarLine(dd));
        setMyPlate(dd.vehicle_plate ? String(dd.vehicle_plate) : '');
        setName(dd.full_name ? String(dd.full_name) : '');
        setDetMsg('Saved. Riders will see this now.');
        load();
      }
    } catch (e) {
      setDetMsg('That could not be saved. Please try again.');
    }
    setDetBusy(false);
  }

  async function sendMyRating(stars: number, review: string) {
    if (!mustRate) return;
    setRateBusy(true);
    setRateError('');
    try {
      const got = await supabase.auth.getSession();
      const token = got.data.session ? got.data.session.access_token : '';
      const res = await fetch('/api/rate-ride', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rideId: mustRate.id, role: 'driver', stars: stars, review: review }),
      });
      const j = await res.json();
      setRateBusy(false);
      if (!res.ok) {
        setRateError(String(j.error || 'Could not save your rating.'));
        return;
      }
      setMustRate(null);
      setMsg('Thank you. Your rating was saved.');
      load();
    } catch (e) {
      setRateBusy(false);
      setRateError('Could not save your rating.');
    }
  }

  async function take(id: string) {
    if (mustRate) {
      setMsg('Please rate your last run first. The stars are at the top of this page.');
      return;
    }

    if (busyRef.current) return;
    busyRef.current = true;
    setBusyId(id);
    setMsg('');
    const got = await supabase.auth.getSession();
    const token = got.data.session ? got.data.session.access_token : '';
    try {
      const res = await fetch('/api/claim-ride', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rideId: id }),
      });
      const j = await res.json();
      if (j && j.ok && j.got) {
        setMsg('You got it. That ride is yours now.');
        if (typeof window !== 'undefined') {
          window.location.href = '/driver-rides/drive?ride=' + id;
          return;
        }
      }
      else if (j && j.ok) setMsg('Another driver took that one first.');
      else setMsg(j && j.error ? String(j.error) : 'Could not take that ride.');
    } catch (e) {
      setMsg('Could not take that ride.');
    }
    busyRef.current = false;
    setBusyId('');
    load();
  }

  return (
    <main style={shell}>
      <div style={wrap}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h1 style={{ fontSize: 26, margin: 0, color: '#0f172a' }}>Open rides</h1>
          <Link href='/driver-login' style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>My driver page</Link>
        </div>

        <p style={{ color: '#475569', marginTop: 0, marginBottom: 18, lineHeight: 1.6 }}>
          The closest free driver to the rider gets first shot at a new ride. If they do not take it in 30 seconds it opens up to the next closest, and so on, until somebody takes it.
        </p>

        <Ticker />

        <NewOrderAlarm who="driver" ids={rides.map((r: any) => String(r.id))} />

        {ready && signedIn && hasDriver ? <DriverEarnings /> : null}
        {ready && signedIn && hasDriver ? <SafetyAlerts /> : null}

        {ready && signedIn && hasDriver ? <DriverAlerts token={myToken} /> : null}

        {ready && signedIn && hasDriver ? <TellAdmin token={myToken} /> : null}

        {ready && signedIn && hasDriver ? <DriverRecord token={myToken} /> : null}

        {ready && signedIn && hasDriver ? <MyTrail token={myToken} /> : null}

        {ready && signedIn && hasDriver ? (
          <div style={driverPhoto ? card : { ...card, background: '#fef2f2', border: '1px solid #fecaca' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar src={driverPhoto} size={64} label='Your photo' />
              <div>
                <div style={rowLine}>{name ? name : 'Your driver account'}</div>
                {driverPhoto ? (
                  <div style={small}>This is the photo every rider sees when you take their ride.</div>
                ) : (
                  <div style={{ ...small, color: '#b91c1c', fontWeight: 800 }}>
                    A photo of you is required. The rider has to be able to see who is picking them up.
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <input
                type='file'
                accept='image/*'
                disabled={photoBusy}
                onChange={(e) => uploadMyPhoto(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                style={{ fontSize: 14, color: '#475569' }}
              />
              {photoBusy ? <div style={small}>Saving your photo...</div> : null}
              {photoMsg ? <div style={{ ...small, fontWeight: 700, color: '#0f172a' }}>{photoMsg}</div> : null}
            </div>
            <div style={{ marginTop: 10, borderTop: '1px solid #e2e8f0', paddingTop: 10 }}>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 14, marginBottom: 4 }}>Your vehicle</div>
              {myCar ? (
                <div style={{ ...small, color: '#166534', fontWeight: 700 }}>Car: {myCar}</div>
              ) : (
                <div style={{ ...small, color: '#b91c1c', fontWeight: 800 }}>No car on file. Riders have to be able to see the car that is picking them up. Call 930-216-4166 to get it added.</div>
              )}
              {myPlate ? (
                <div style={{ ...small, color: '#166534', fontWeight: 700 }}>Licence plate: {myPlate}</div>
              ) : (
                <div style={{ ...small, color: '#b91c1c', fontWeight: 800 }}>No licence plate on file. Riders have to be able to see your plate.</div>
              )}
            </div>
          </div>
        ) : null}

        {ready && signedIn && hasDriver ? (
          <div style={card}>
            <div style={{ fontWeight: 900, color: '#0f172a', fontSize: 18 }}>My details</div>
            <div style={small}>Put your name, your phone number and your car in here. Press Save. You can come back and change any of it any time you need to.</div>
            <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
              <div>
                <span style={detLabel}>Your name</span>
                <input
                  type='text'
                  value={fName}
                  placeholder='Your full name'
                  onChange={(e) => setFName(e.target.value)}
                  style={detBox}
                />
              </div>
              <div>
                <span style={detLabel}>Your phone number</span>
                <input
                  type='tel'
                  inputMode='tel'
                  value={fPhone}
                  placeholder='Phone riders can reach you on'
                  onChange={(e) => setFPhone(prettyPhone(e.target.value))}
                  style={detBox}
                />
              </div>
              <div>
                <span style={detLabel}>Car make</span>
                <input
                  type='text'
                  value={fMake}
                  placeholder='Toyota'
                  onChange={(e) => setFMake(e.target.value)}
                  style={detBox}
                />
              </div>
              <div>
                <span style={detLabel}>Car model</span>
                <input
                  type='text'
                  value={fModel}
                  placeholder='Camry'
                  onChange={(e) => setFModel(e.target.value)}
                  style={detBox}
                />
              </div>
              <div>
                <span style={detLabel}>Car year</span>
                <input
                  type='text'
                  value={fYear}
                  placeholder='2018'
                  onChange={(e) => setFYear(e.target.value)}
                  style={detBox}
                />
              </div>
              <div>
                <span style={detLabel}>Car colour</span>
                <input
                  type='text'
                  value={fColor}
                  placeholder='Silver'
                  onChange={(e) => setFColor(e.target.value)}
                  style={detBox}
                />
              </div>
              <div>
                <span style={detLabel}>Licence plate</span>
                <input
                  type='text'
                  value={fPlate}
                  placeholder='ABC1234'
                  onChange={(e) => setFPlate(e.target.value)}
                  style={detBox}
                />
              </div>
            </div>
            <button type='button' disabled={detBusy} onClick={saveMyDetails} style={{ ...detBtn, opacity: detBusy ? 0.6 : 1 }}>
              {detBusy ? 'Saving...' : 'Save my details'}
            </button>
            {detMsg ? <div style={{ ...small, fontWeight: 800, color: '#0f172a' }}>{detMsg}</div> : null}
          </div>
        ) : null}

        {!ready ? <div style={card}>Loading...</div> : null}

        {ready && !signedIn ? (
          <div style={card}>
            <div style={rowLine}>You are not signed in.</div>
            <div style={small}>Sign in on your driver page first, then come back here.</div>
            <Link href='/driver-login' style={{ display: 'inline-block', marginTop: 12, color: '#2563eb', fontWeight: 800, textDecoration: 'none' }}>Go to driver sign in</Link>
          </div>
        ) : null}

        {ready && signedIn && !hasDriver ? (
          <div style={card}>
            <div style={rowLine}>This sign in does not have a driver account.</div>
            <div style={small}>Create your driver account first, then call 930-216-4166 to get approved.</div>
            <Link href='/driver-login' style={{ display: 'inline-block', marginTop: 12, color: '#2563eb', fontWeight: 800, textDecoration: 'none' }}>Go to driver sign in</Link>
          </div>
        ) : null}

        {ready && signedIn && hasDriver && !approved ? (
          <div style={{ ...card, background: '#fff7ed', border: '1px solid #fed7aa', color: '#7c2d12' }}>
            <div style={{ fontWeight: 800 }}>You cannot take rides yet.</div>
            <div style={{ marginTop: 6, lineHeight: 1.6 }}>Call the owner at 930-216-4166 and talk to him. Once he approves you in the admin panel, rides will show up on this page.</div>
            <a href='tel:9302164166' style={{ display: 'inline-block', marginTop: 12, padding: '10px 14px', borderRadius: 10, background: '#7c2d12', color: '#fff', fontWeight: 800, textDecoration: 'none' }}>Call 930-216-4166</a>
          </div>
        ) : null}

        {msg ? (
          <div style={{ ...card, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e3a8a', fontWeight: 700 }}>{msg}</div>
        ) : null}

        {ready && approved && mustRate ? (
          <RatingBox
            heading='Rate your last rider'
            who={'Your rider was ' + mustRate.riderName}
            where={mustRate.pickup + ' to ' + mustRate.dropoff}
            note='You have to rate that run before you can take another one.'
            busy={rateBusy}
            error={rateError}
            onSend={sendMyRating}
          />
        ) : null}

        {ready && approved && mine.length > 0 ? (
          <div style={{ ...card, background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
            <div style={{ fontWeight: 800, color: '#065f46', marginBottom: 8 }}>The ride you are on now</div>
            {mine.map((r) => (
              <div key={r.id} style={{ paddingTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <Avatar src={r.rider_photo} size={52} label={r.rider_name ? String(r.rider_name) : 'Rider'} />
                  <div>
                    <div style={rowLine}>{r.rider_name ? r.rider_name : 'Your rider'}</div>
                    <div style={small}>This is who you are picking up.</div>
                    {r.rider_phone ? (
                      <a href={'tel:' + String(r.rider_phone)} style={{ color: '#2563eb', fontWeight: 800, textDecoration: 'none', fontSize: 14 }}>
                        Call {String(r.rider_phone)}
                      </a>
                    ) : (
                      <div style={small}>No phone number on file for this rider.</div>
                    )}
                  </div>
                </div>
                <div style={rowLine}>Pick up: {r.pickup || 'Not given'}</div>
                <div style={rowLine}>Drop off: {r.dropoff || 'Not given'}</div>
                <div style={small}>{money(r.fare)} fare. Status: {r.status}.</div>
                <a
                  href={'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(String(r.pickup || ''))}
                  target='_blank'
                  rel='noreferrer'
                  style={{ display: 'inline-block', marginTop: 10, color: '#065f46', fontWeight: 800 }}
                >
                  Open directions to the pick up
                </a>
                <div style={{ marginTop: 10 }}>
                  <Link href={'/driver-rides/drive?ride=' + r.id} style={{ display: 'inline-block', padding: '12px 16px', borderRadius: 12, background: '#16a34a', color: '#fff', fontWeight: 800, textDecoration: 'none' }}>
                    Open the driving screen
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {ready && approved && rides.length === 0 ? (
          <div style={card}>
            <div style={rowLine}>No rides waiting right now{name ? ', ' + name : ''}.</div>
            {holding && holding.count > 0 ? (
              <div style={{ ...rowLine, color: '#b45309', fontWeight: 800 }}>
                {holding.count === 1 ? '1 ride is' : holding.count + ' rides are'} being offered to a driver closer to the rider first. If they do not take it, it opens up to you in about {holding.secs} seconds.
              </div>
            ) : null}
            <div style={small}>This page checks again every few seconds by itself. Leave it open.</div>
          </div>
        ) : null}

        {ready && approved && rides.map((r) => (
          <div key={r.id} style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <Avatar src={r.rider_photo} size={52} label={r.rider_name ? String(r.rider_name) : 'Rider'} />
              <div>
                <div style={rowLine}>{r.rider_name ? r.rider_name : 'Rider'}</div>
                <div style={small}>This is who you would be picking up.</div>
                {r.rider_phone ? (
                  <a href={'tel:' + String(r.rider_phone)} style={{ color: '#2563eb', fontWeight: 800, textDecoration: 'none', fontSize: 14 }}>
                    Call {String(r.rider_phone)}
                  </a>
                ) : (
                  <div style={small}>No phone number on file for this rider.</div>
                )}
              </div>
            </div>
            <div style={rowLine}>Pick up: {r.pickup || 'Not given'}</div>
            <div style={rowLine}>Drop off: {r.dropoff || 'Not given'}</div>
            {r.riderRatings && r.riderRatings > 0 ? (
              <div style={{ ...small, color: '#b45309', fontWeight: 800, fontSize: 15 }}>
                {starRow(r.riderStars || 0)} {r.riderStars} stars from {r.riderRatings} drivers
              </div>
            ) : (
              <div style={small}>This rider has no stars yet.</div>
            )}
            {stopCount(r.stops) > 0 ? <div style={small}>Extra stops on the way: {stopCount(r.stops)}</div> : null}
            <div style={{ marginTop: 10, fontSize: 20, fontWeight: 900, color: '#0f172a' }}>{money(r.fare)}</div>
            <div style={small}>Called in {waited(String(r.created_at))}</div>
            {r.paid ? (
              <div style={{ ...small, color: '#166534', fontWeight: 700 }}>Paid by card already.</div>
            ) : (
              <div style={{ ...small, color: '#b45309', fontWeight: 700 }}>Not paid by card. Collect this one as a cash run.</div>
            )}
            {!myCar || !myPlate ? (
              <div style={{ ...small, color: '#b91c1c', fontWeight: 800, marginTop: 12 }}>
                You cannot take rides yet. Put your car and your licence plate in My details above and press Save. A rider has to be able to see what car is picking them up.
              </div>
            ) : (
              <button style={{ ...takeBtn, opacity: busyId === r.id ? 0.6 : 1 }} onClick={() => take(r.id)} disabled={busyId === r.id || mustRate !== null}>
                {busyId === r.id ? 'Taking it...' : 'Take this ride'}
              </button>
            )}
          </div>
        ))}
        {ready && signedIn && hasDriver ? (
          <PanicButton role="driver" token={myToken} whoName={name || null} rideId={mine.length > 0 ? mine[0].id : null} />
        ) : null}
        {ready && signedIn && hasDriver ? (
          <AccidentReport token={myToken} />
        ) : null}

      </div>
    </main>
  );
}
