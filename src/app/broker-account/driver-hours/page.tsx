'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Run = {
  id: string;
  driverCode: string;
  driverName: string;
  driverPhone: string;
  driverStatus: string;
  pickup: string;
  dropoff: string;
  fare: number;
  status: string;
  startedAt: string | null;
  endedAt: string | null;
  minutes: number;
};

type DriverRow = {
  driverId: string;
  driverCode: string;
  driverName: string;
  driverPhone: string;
  driverStatus: string;
  runs: number;
  minutes: number;
  firstAt: string | null;
  lastAt: string | null;
};

function dayOf(iso: string | null) {
  if (!iso) return 'No date';
  try {
    return new Date(iso).toLocaleDateString();
  } catch (err) {
    return 'No date';
  }
}

function clock(iso: string | null) {
  if (!iso) return '--';
  try {
    return new Date(iso).toLocaleTimeString();
  } catch (err) {
    return '--';
  }
}

function span(mins: number) {
  if (!mins || mins < 1) return 'under a minute';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return h + ' hr ' + m + ' min';
  return m + ' min';
}

const cardBox: any = {
  borderRadius: '22px',
  padding: '20px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
  boxShadow: '0 18px 40px rgba(0,0,0,0.22)',
};

export default function DriverHoursPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [problem, setProblem] = useState('');

  async function load() {
    try {
      const r = await fetch('/api/insurance-log');
      const j = await r.json();
      if (!r.ok) {
        setProblem(j && j.error ? j.error : 'Could not read the run record.');
        setLoaded(true);
        return;
      }
      setProblem('');
      setRuns(j.runs ? j.runs : []);
      setDrivers(j.drivers ? j.drivers : []);
    } catch (err) {
      setProblem('Could not read the run record.');
    }
    setLoaded(true);
  }

  useEffect(() => {
    load();
    const t = setInterval(() => { load(); }, 60000);
    return () => { clearInterval(t); };
  }, []);

  const days: string[] = [];
  for (const r of runs) {
    const d = dayOf(r.startedAt);
    if (days.indexOf(d) < 0) days.push(d);
  }

  let totalMinutes = 0;
  for (const r of runs) {
    totalMinutes = totalMinutes + r.minutes;
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, #16314a 0%, #0a1222 42%, #04060b 100%)',
        color: '#ffffff',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '28px 18px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#8fdcff', marginBottom: '10px' }}>
              Insurance record
            </div>
            <h1 style={{ margin: 0, fontSize: '38px', lineHeight: 1.05 }}>Driver hours and runs</h1>
            <p style={{ margin: '12px 0 0', color: '#d9e5ff', fontSize: '16px', lineHeight: 1.7, maxWidth: '860px' }}>
              This fills itself in. Every time a driver takes a run it is written down here with the driver name,
              the driver ID number, the date, the time the run started and the time it ended. Nobody has to press
              anything. This page updates by itself while it is open.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href='/broker-account' style={{ textDecoration: 'none', color: '#ffffff', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', padding: '12px 16px', borderRadius: '14px', fontWeight: 800 }}>
              Back to Broker Account
            </Link>
          </div>
        </div>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '22px' }}>
          <div style={cardBox}>
            <div style={{ color: '#9fb7e5', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800 }}>Runs on record</div>
            <div style={{ marginTop: '10px', fontSize: '32px', fontWeight: 800 }}>{runs.length}</div>
          </div>
          <div style={cardBox}>
            <div style={{ color: '#9fb7e5', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800 }}>Drivers on record</div>
            <div style={{ marginTop: '10px', fontSize: '32px', fontWeight: 800 }}>{drivers.length}</div>
          </div>
          <div style={cardBox}>
            <div style={{ color: '#9fb7e5', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800 }}>Time behind the wheel</div>
            <div style={{ marginTop: '10px', fontSize: '32px', fontWeight: 800 }}>{totalMinutes > 0 ? span(totalMinutes) : 'none yet'}</div>
          </div>
          <div style={cardBox}>
            <div style={{ color: '#9fb7e5', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800 }}>Days covered</div>
            <div style={{ marginTop: '10px', fontSize: '32px', fontWeight: 800 }}>{days.length}</div>
          </div>
        </section>

        {problem ? (
          <div style={{ ...cardBox, marginBottom: '22px', color: '#fca5a5' }}>{problem}</div>
        ) : null}

        <section style={{ ...cardBox, marginBottom: '22px' }}>
          <h2 style={{ marginTop: 0, fontSize: '24px' }}>Each driver</h2>
          {drivers.length === 0 ? (
            <div style={{ color: '#bcd0f8' }}>{loaded ? 'No driver has taken a run yet.' : 'Loading...'}</div>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {drivers.map((d: DriverRow) => (
                <div key={d.driverId} style={{ borderRadius: '16px', padding: '14px 16px', background: 'rgba(0,0,0,0.24)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontWeight: 800, fontSize: '18px' }}>{d.driverName}</div>
                  <div style={{ color: '#bcd0f8', fontSize: '14px', marginTop: '6px' }}>
                    Driver ID: {d.driverCode ? d.driverCode : 'not set'} — Phone: {d.driverPhone ? d.driverPhone : 'not set'} — Standing: {d.driverStatus ? d.driverStatus : 'unknown'}
                  </div>
                  <div style={{ color: '#d9e5ff', fontSize: '14px', marginTop: '6px' }}>
                    {d.runs} runs — {span(d.minutes)} behind the wheel — first run {dayOf(d.firstAt)} — last run {dayOf(d.lastAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={cardBox}>
          <h2 style={{ marginTop: 0, fontSize: '24px' }}>Every run, newest first</h2>
          {runs.length === 0 ? (
            <div style={{ color: '#bcd0f8' }}>{loaded ? 'Nothing on record yet.' : 'Loading...'}</div>
          ) : (
            days.map((day: string) => (
              <div key={day} style={{ marginBottom: '18px' }}>
                <div style={{ fontWeight: 800, color: '#8fdcff', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '13px', margin: '10px 0' }}>{day}</div>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {runs.filter((r: Run) => dayOf(r.startedAt) === day).map((r: Run) => (
                    <div key={r.id} style={{ borderRadius: '16px', padding: '14px 16px', background: 'rgba(0,0,0,0.24)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontWeight: 800 }}>
                        {r.driverName} {r.driverCode ? '(ID ' + r.driverCode + ')' : ''}
                      </div>
                      <div style={{ color: '#d9e5ff', fontSize: '14px', marginTop: '6px' }}>
                        On at {clock(r.startedAt)} — Off at {r.endedAt ? clock(r.endedAt) : 'still on this run'} — {r.endedAt ? span(r.minutes) : 'running now'}
                      </div>
                      <div style={{ color: '#bcd0f8', fontSize: '14px', marginTop: '6px' }}>
                        {r.pickup ? r.pickup : 'Pickup not saved'} to {r.dropoff ? r.dropoff : 'Dropoff not saved'}
                      </div>
                      <div style={{ color: '#9fb7e5', fontSize: '13px', marginTop: '6px' }}>
                        Fare {r.fare ? '$' + Number(r.fare).toFixed(2) : 'not set'} — Ride status: {r.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
