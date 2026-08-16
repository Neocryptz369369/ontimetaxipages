'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Photo = { id: string; kind: string; view: string | null };

type Report = {
  id: string;
  created_at: string;
  ride_id: string | null;
  driver_name: string | null;
  driver_code: string | null;
  details: string | null;
  injuries: string | null;
  officer_name: string | null;
  officer_badge: string | null;
  report_number: string | null;
  other_driver: string | null;
  other_vehicle: string | null;
  other_plate: string | null;
  other_insurance: string | null;
  mph: number | null;
  limit_mph: number | null;
  lat: number | null;
  lng: number | null;
  address: string | null;
  status: string | null;
  photos: Photo[];
};

const cardBox: any = {
  borderRadius: '22px',
  padding: '20px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
  boxShadow: '0 18px 40px rgba(0,0,0,0.22)',
};

function when(iso: string) {
  if (!iso) return 'No date';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString() + ' at ' + d.toLocaleTimeString();
  } catch (e) {
    return 'No date';
  }
}

function groupName(kind: string) {
  if (kind === 'my_vehicle') return 'Our vehicle';
  if (kind === 'other_vehicle') return 'The other vehicle';
  if (kind === 'officer_card') return 'Officer card or police report';
  return 'Scene';
}

export default function BrokerAccidentsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [problem, setProblem] = useState('');

  async function load() {
    try {
      const r = await fetch('/api/accident', { cache: 'no-store' });
      const j = await r.json();
      if (!r.ok) {
        setProblem(j && j.error ? String(j.error) : 'Could not read the accident reports.');
        setLoaded(true);
        return;
      }
      setProblem('');
      setReports(j.reports ? j.reports : []);
    } catch (e) {
      setProblem('Could not read the accident reports.');
    }
    setLoaded(true);
  }

  useEffect(function () {
    load();
    const t = setInterval(function () { load(); }, 60000);
    return function () { clearInterval(t); };
  }, []);

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
            <h1 style={{ margin: 0, fontSize: '38px', lineHeight: 1.05 }}>Accident reports</h1>
            <p style={{ margin: '12px 0 0', color: '#d9e5ff', fontSize: '16px', lineHeight: 1.7, maxWidth: '860px' }}>
              Every accident a driver turns in shows up here by itself, with the pictures, the officer information,
              and how fast the driver was going at the time. Nobody has to send anything over. This page refreshes
              itself while it is open.
            </p>
          </div>
          <Link href='/broker-account' style={{ textDecoration: 'none', color: '#ffffff', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', padding: '12px 16px', borderRadius: '14px', fontWeight: 800 }}>
            Back to Broker Account
          </Link>
        </div>

        {problem ? <div style={{ ...cardBox, marginBottom: '22px', color: '#fca5a5' }}>{problem}</div> : null}

        {reports.length === 0 ? (
          <div style={cardBox}>{loaded ? 'No accidents have been turned in.' : 'Loading...'}</div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {reports.map(function (r) {
              const kinds = ['my_vehicle', 'other_vehicle', 'officer_card', 'scene'];
              return (
                <section key={r.id} style={cardBox}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '22px', fontWeight: 800 }}>
                      {r.driver_name ? r.driver_name : 'Driver'}
                      {r.driver_code ? ' - ID ' + r.driver_code : ''}
                    </div>
                    <div style={{ color: '#bcd0f8', fontWeight: 700 }}>{when(r.created_at)}</div>
                  </div>

                  <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    <div style={{ borderRadius: '14px', padding: '12px 14px', background: 'rgba(0,0,0,0.26)' }}>
                      <div style={{ color: '#9fb7e5', fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em' }}>SPEED AT THE TIME</div>
                      <div style={{ marginTop: '6px', fontSize: '24px', fontWeight: 900 }}>
                        {r.mph === null || r.mph === undefined ? 'not recorded' : r.mph + ' mph'}
                      </div>
                    </div>
                    <div style={{ borderRadius: '14px', padding: '12px 14px', background: 'rgba(0,0,0,0.26)' }}>
                      <div style={{ color: '#9fb7e5', fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em' }}>POSTED LIMIT THERE</div>
                      <div style={{ marginTop: '6px', fontSize: '24px', fontWeight: 900 }}>
                        {r.limit_mph === null || r.limit_mph === undefined ? 'none posted' : r.limit_mph + ' mph'}
                      </div>
                    </div>
                    <div style={{ borderRadius: '14px', padding: '12px 14px', background: 'rgba(0,0,0,0.26)' }}>
                      <div style={{ color: '#9fb7e5', fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em' }}>ANYONE HURT</div>
                      <div style={{ marginTop: '6px', fontSize: '16px', fontWeight: 700, lineHeight: 1.5 }}>{r.injuries ? r.injuries : 'not said'}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', lineHeight: 1.8, color: '#e6eeff' }}>
                    <div><strong>Where:</strong> {r.address ? r.address : (r.lat !== null && r.lng !== null ? String(r.lat) + ', ' + String(r.lng) : 'not given')}</div>
                    <div><strong>What happened:</strong> {r.details ? r.details : 'nothing written down'}</div>
                    <div><strong>Officer:</strong> {r.officer_name ? r.officer_name : 'none given'}{r.officer_badge ? ' (badge ' + r.officer_badge + ')' : ''}</div>
                    <div><strong>Police report number:</strong> {r.report_number ? r.report_number : 'none given'}</div>
                    <div><strong>Other driver:</strong> {r.other_driver ? r.other_driver : 'none given'}</div>
                    <div><strong>Other vehicle:</strong> {r.other_vehicle ? r.other_vehicle : 'none given'}{r.other_plate ? ' - plate ' + r.other_plate : ''}</div>
                    <div><strong>Their insurance:</strong> {r.other_insurance ? r.other_insurance : 'none given'}</div>
                    {r.lat !== null && r.lng !== null ? (
                      <div>
                        <a
                          href={'https://www.google.com/maps/search/?api=1&query=' + String(r.lat) + ',' + String(r.lng)}
                          target='_blank'
                          rel='noreferrer'
                          style={{ color: '#8fdcff', fontWeight: 800 }}
                        >
                          Open the spot on a map
                        </a>
                      </div>
                    ) : null}
                  </div>

                  {r.photos && r.photos.length > 0 ? (
                    <div style={{ marginTop: '16px' }}>
                      {kinds.map(function (k) {
                        const mine = r.photos.filter(function (p) { return String(p.kind) === k; });
                        if (mine.length === 0) return null;
                        return (
                          <div key={k} style={{ marginBottom: '14px' }}>
                            <div style={{ color: '#9fb7e5', fontSize: '13px', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '8px' }}>
                              {groupName(k).toUpperCase()}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                              {mine.map(function (p) {
                                if (!p.view) return <div key={p.id} style={{ color: '#fca5a5' }}>picture could not be opened</div>;
                                return (
                                  <a key={p.id} href={p.view} target='_blank' rel='noreferrer'>
                                    <img src={p.view} alt={groupName(k)} style={{ width: 170, height: 130, objectFit: 'cover', borderRadius: 12, border: '1px solid rgba(255,255,255,0.14)' }} />
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ marginTop: '14px', color: '#bcd0f8' }}>No pictures came with this one.</div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
