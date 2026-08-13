'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

const ADMIN_EMAIL = 'neocryptz@yahoo.com';

const KIND_TEXT: any = { drugs: 'Drug use', alcohol: 'Alcohol use', both: 'Drugs and alcohol', other: 'Other' };

const wrap: any = { minHeight: '100vh', background: '#0b0303', color: '#f6eaea', padding: '24px 16px 60px', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' };
const shell: any = { maxWidth: '1000px', margin: '0 auto' };
const card: any = { background: 'linear-gradient(160deg, #170606 0%, #0b0303 100%)', border: '1px solid rgba(255,77,77,0.28)', borderRadius: '16px', padding: '18px', marginBottom: '14px' };
const btn: any = { border: 'none', borderRadius: '10px', padding: '10px 14px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', marginRight: '8px', marginTop: '8px' };

function photoLink(raw: string) {
  if (!raw) return '';
  if (raw.indexOf('http') === 0) return raw;
  const pub = supabase.storage.from('profile-photos').getPublicUrl(raw);
  return pub && pub.data ? pub.data.publicUrl : '';
}

function money(n: any) {
  const v = Number(n || 0);
  return '$' + v.toFixed(2);
}

export default function AdminDriversPage() {
  const [checked, setChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    const d = await supabase.from('drivers').select('*').order('created_at', { ascending: false });
    if (d.error) { setMsg('Could not load drivers: ' + d.error.message); } else { setDrivers(d.data || []); }
    const r = await supabase.from('driver_reports').select('*').order('created_at', { ascending: false });
    if (!r.error) setReports(r.data || []);
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      const ok = !!(data.user && (data.user.email || '').toLowerCase() === ADMIN_EMAIL);
      setIsAdmin(ok);
      setChecked(true);
      if (ok) load();
    });
    return () => { active = false; };
  }, [load]);

  async function setStatus(id: string, status: string, reason: string) {
    setBusy(id);
    setMsg('');
    const patch: any = { status: status };
    if (status === 'approved') {
      patch.approved_at = new Date().toISOString();
      patch.suspended_at = null;
      patch.suspended_reason = null;
    }
    if (status === 'suspended') {
      patch.suspended_at = new Date().toISOString();
      patch.suspended_reason = reason || 'Suspended by the owner';
    }
    const res = await supabase.from('drivers').update(patch).eq('id', id).select('id, status').maybeSingle();
    if (res.error) {
      setMsg('That did not save: ' + res.error.message);
    } else if (!res.data || res.data.status !== status) {
      setMsg('The database refused that change. Run the driver fix SQL and try again.');
    } else {
      setMsg('Saved.');
    }
    setBusy('');
    load();
  }

  async function setCalled(id: string, value: boolean) {
    setBusy(id);
    const res = await supabase.from('drivers').update({ called_in: value }).eq('id', id);
    if (res.error) setMsg('That did not save: ' + res.error.message);
    setBusy('');
    load();
  }

  async function closeReport(reportId: string) {
    setBusy(reportId);
    const res = await supabase
      .from('driver_reports')
      .update({ status: 'resolved', resolved_at: new Date().toISOString() })
      .eq('id', reportId);
    if (res.error) setMsg('That did not save: ' + res.error.message);
    setBusy('');
    load();
  }

  if (!checked) {
    return <div style={wrap}><div style={shell}><p>Loading...</p></div></div>;
  }

  if (!isAdmin) {
    return (
      <div style={wrap}>
        <div style={shell}>
          <h1>Owner only</h1>
          <p style={{ color: '#d9b3b3' }}>Sign in with the owner account to open this page.</p>
          <Link href="/admin" style={{ color: '#ff7b7b' }}>Back to the admin panel</Link>
        </div>
      </div>
    );
  }

  const openReports = reports.filter((r) => r.status !== 'resolved');
  const oldReports = reports.filter((r) => r.status === 'resolved');
  const driverById: any = {};
  drivers.forEach((d) => { driverById[d.id] = d; });

  return (
    <div style={wrap}>
      <div style={shell}>
        <Link href="/admin" style={{ color: '#ff7b7b', textDecoration: 'none', fontSize: '14px' }}>Back to the admin panel</Link>
        <h1 style={{ fontSize: '28px', margin: '14px 0 4px' }}>Drivers and reports</h1>
        <p style={{ color: '#d9b3b3', margin: '0 0 18px' }}>Approve new drivers, and handle rider reports of drug or alcohol use.</p>

        {msg && <p style={{ color: '#ffd166', fontWeight: 700 }}>{msg}</p>}

        <h2 style={{ fontSize: '20px', marginTop: '18px' }}>
          Reports that need you ({openReports.length})
        </h2>
        {openReports.length === 0 && <p style={{ color: '#9c8080' }}>No new reports.</p>}
        {openReports.map((r) => {
          const d = driverById[r.driver_id];
          return (
            <div key={r.id} style={{ ...card, border: '2px solid #ff3b3b' }}>
              <div style={{ color: '#ff7b7b', fontWeight: 900, fontSize: '16px' }}>
                {KIND_TEXT[r.kind] || r.kind}
              </div>
              <div style={{ marginTop: '6px', fontSize: '15px' }}>
                Driver: {d ? (d.full_name || d.email || 'Unknown') : 'Removed driver'}
                {d ? ' - ID ' + d.driver_code : ''}
              </div>
              <div style={{ color: '#d9b3b3', fontSize: '14px', marginTop: '4px' }}>
                Reported by {r.reporter_name || 'a rider'}{r.reporter_phone ? ' - ' + r.reporter_phone : ''} on {new Date(r.created_at).toLocaleString()}
              </div>
              {r.details && <p style={{ marginTop: '10px', lineHeight: 1.5 }}>{r.details}</p>}
              <div style={{ marginTop: '6px', color: d && d.status === 'suspended' ? '#ff9d9d' : '#ffd166', fontWeight: 700 }}>
                {d && d.status === 'suspended' ? 'This driver is suspended right now.' : 'Heads up: this driver is NOT suspended.'}
              </div>
              <div>
                <button
                  type="button"
                  disabled={busy === r.id}
                  onClick={() => { if (d) setStatus(d.id, 'suspended', 'Reported for drug or alcohol use - under investigation'); closeReport(r.id); }}
                  style={{ ...btn, background: '#b81111', color: '#fff' }}
                >
                  Found guilty - keep suspended
                </button>
                <button
                  type="button"
                  disabled={busy === r.id}
                  onClick={() => { if (d) setStatus(d.id, 'approved', ''); closeReport(r.id); }}
                  style={{ ...btn, background: '#128a3d', color: '#fff' }}
                >
                  Cleared - put back to work
                </button>
                <button
                  type="button"
                  disabled={busy === r.id}
                  onClick={() => closeReport(r.id)}
                  style={{ ...btn, background: '#2a2a2e', color: '#f6eaea' }}
                >
                  Just mark it handled
                </button>
              </div>
            </div>
          );
        })}

        <h2 style={{ fontSize: '20px', marginTop: '28px' }}>Drivers ({drivers.length})</h2>
        {drivers.length === 0 && <p style={{ color: '#9c8080' }}>Nobody has signed up as a driver yet.</p>}
        {drivers.map((d) => {
          const src = photoLink(d.photo_url || '');
          const color = d.status === 'approved' ? '#4ade80' : d.status === 'suspended' ? '#ff7b7b' : d.status === 'rejected' ? '#9c8080' : '#ffd166';
          return (
            <div key={d.id} style={card}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                {src ? (
                  <img src={src} alt="" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ff3b3b' }} />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#2a1010', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9c8080', fontSize: '12px' }}>No photo</div>
                )}
                <div style={{ flex: '1 1 260px' }}>
                  <div style={{ fontWeight: 800, fontSize: '17px' }}>{d.full_name || 'No name yet'}</div>
                  <div style={{ color: '#d9b3b3', fontSize: '14px' }}>{d.email} {d.phone ? ' - ' + d.phone : ''}</div>
                  <div style={{ fontFamily: 'ui-monospace, Menlo, Consolas, monospace', letterSpacing: '2px', marginTop: '4px' }}>{d.driver_code}</div>
                </div>
                <div style={{ color: color, fontWeight: 800, textTransform: 'uppercase', fontSize: '13px' }}>{d.status}</div>
              </div>
              {d.suspended_reason && <p style={{ color: '#ff9d9d', fontSize: '14px', marginTop: '8px' }}>{d.suspended_reason}</p>}
              <label style={{ display: 'block', marginTop: '10px', color: '#d9b3b3', fontSize: '14px' }}>
                <input type="checkbox" checked={!!d.called_in} onChange={(e) => setCalled(d.id, e.target.checked)} style={{ marginRight: '8px' }} />
                They called me
              </label>
              <div>
                {d.status !== 'approved' && (
                  <button type="button" disabled={busy === d.id} onClick={() => setStatus(d.id, 'approved', '')} style={{ ...btn, background: '#128a3d', color: '#fff' }}>
                    {d.status === 'suspended' ? 'Reinstate this driver' : 'Approve to drive'}
                  </button>
                )}
                {d.status !== 'suspended' && (
                  <button type="button" disabled={busy === d.id} onClick={() => setStatus(d.id, 'suspended', 'Suspended by the owner')} style={{ ...btn, background: '#b81111', color: '#fff' }}>
                    Suspend
                  </button>
                )}
                {d.status !== 'rejected' && (
                  <button type="button" disabled={busy === d.id} onClick={() => setStatus(d.id, 'rejected', '')} style={{ ...btn, background: '#2a2a2e', color: '#f6eaea' }}>
                    Turn down
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {oldReports.length > 0 && (
          <div>
            <h2 style={{ fontSize: '20px', marginTop: '28px' }}>Reports already handled ({oldReports.length})</h2>
            {oldReports.map((r) => {
              const d = driverById[r.driver_id];
              return (
                <div key={r.id} style={{ ...card, opacity: 0.75 }}>
                  <div style={{ fontWeight: 700 }}>{KIND_TEXT[r.kind] || r.kind} - {d ? (d.full_name || d.email) : 'Removed driver'}</div>
                  <div style={{ color: '#9c8080', fontSize: '13px' }}>{new Date(r.created_at).toLocaleString()}</div>
                  {r.details && <p style={{ marginTop: '8px', fontSize: '14px' }}>{r.details}</p>}
                </div>
              );
            })}
          </div>
        )}

        <p style={{ color: '#9c8080', fontSize: '13px', marginTop: '30px' }}>
          Every ride keeps the {money(5)} get in fee for the company, and the company keeps 20 percent of what is left.
        </p>
      </div>
    </div>
  );
}
