'use client';

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

const initialDrivers = [
  {
    id: 'DRV-IN-7721',
    name: 'Arthur Pendelton',
    city: 'Sellersburg, IN',
    checklist: '✅ License • ✅ Reg • ✅ Insurance',
    background: '7YR CLEAR',
    vault: '🔒 ARCHIVED INDEFINITELY',
  },
  {
    id: 'DRV-KY-1044',
    name: 'Monica Hale',
    city: 'Louisville, KY',
    checklist: '✅ License • ✅ Reg • ✅ Insurance',
    background: 'REVIEWED',
    vault: 'ACTIVE',
  },
  {
    id: 'DRV-OH-6620',
    name: 'Jared Collins',
    city: 'Cincinnati, OH',
    checklist: '✅ License • ✅ Reg • ✅ Insurance',
    background: 'PENDING',
    vault: 'ACTIVE',
  },
];

const initialAds = [
  {
    id: 'AD-001',
    title: 'Driver bonus this weekend',
    audience: 'Driver apps',
    duration: '30 sec loop',
    status: 'LIVE',
  },
  {
    id: 'AD-002',
    title: 'Rider referral offer',
    audience: 'Rider apps',
    duration: '30 sec loop',
    status: 'LIVE',
  },
];

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [isAdminBoxOpen, setIsAdminBoxOpen] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isError, setIsError] = useState(false);
  const [comment, setComment] = useState('');
  const [log, setLog] = useState<string[]>([
    'Admin console shell ready',
    'Waiting for admin gate login',
  ]);

  const [isSosActive, setIsSosActive] = useState(false);
  const [isHospitalActive, setIsHospitalActive] = useState(false);
  const [isBirthdayActive, setIsBirthdayActive] = useState(false);

  const [statesMatrix, setStatesMatrix] = useState({
    IN: true,
    KY: true,
    OH: false,
    IL: false,
  });

  const [ads, setAds] = useState(initialAds);
  const [showAdForm, setShowAdForm] = useState(false);
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdAudience, setNewAdAudience] = useState('All apps');

  useEffect(() => {
    setMounted(true);
  }, []);

  const driverCount = useMemo(() => initialDrivers.length, []);

  function addLog(entry: string) {
    setLog((prev) => [entry, ...prev].slice(0, 10));
  }

  function handleAdminGateLoginDirect(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setIsError(true);
      addLog('Admin login failed: missing username or password');
      return;
    }

    setIsError(false);
    setIsAuthenticated(true);
    setIsAdminBoxOpen(false);
    addLog(`Admin login approved for ${username}`);
  }

  function handleAndroidDirectDownload() {
    addLog('Android direct download flow triggered');
  }

  function toggleState(stateKey: 'IN' | 'KY' | 'OH' | 'IL') {
    setStatesMatrix((prev) => {
      const next = { ...prev, [stateKey]: !prev[stateKey] };
      addLog(`${stateKey} geofence changed to ${next[stateKey] ? 'ACTIVE' : 'OFF'}`);
      return next;
    });
  }

  function addAd() {
    if (!newAdTitle.trim()) {
      addLog('Ad creation blocked: missing ad title');
      return;
    }

    const nextId = `AD-${String(ads.length + 1).padStart(3, '0')}`;
    const nextAd = {
      id: nextId,
      title: newAdTitle.trim(),
      audience: newAdAudience,
      duration: '30 sec loop',
      status: 'DRAFT',
    };

    setAds((prev) => [nextAd, ...prev]);
    setNewAdTitle('');
    setNewAdAudience('All apps');
    setShowAdForm(false);
    addLog(`New admin-managed ad created: ${nextId}`);
  }

  if (!mounted) return null;

  return (
    <main
      style={{
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        background: '#f5f7fb',
        color: '#102a43',
      }}
    >
      <section style={{ maxWidth: '1180px', margin: '0 auto', padding: '32px 20px 72px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div>
            <p style={eyebrowStyle}>On-Time Taxi</p>
            <h1 style={{ margin: '10px 0 8px', fontSize: '42px', lineHeight: 1.1 }}>
              Executive Admin Override Panel
            </h1>
            <p style={{ margin: 0, fontSize: '18px', color: '#486581' }}>
              Admin shell for dispatch, system visibility, and app marquee controls.
            </p>
          </div>

          <Link href="/" style={topLinkStyle}>
            ← Back to homepage
          </Link>
        </div>

        {isAdminBoxOpen && !isAuthenticated ? (
          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Admin Gate</h2>
            <p style={{ color: '#486581', marginTop: 0 }}>
              This login is set up so your browser can offer to remember and save the password.
            </p>

            <form autoComplete="on" onSubmit={handleAdminGateLoginDirect} style={{ display: 'grid', gap: '14px', maxWidth: '420px' }}>
              <label>
                <div style={labelStyle}>Username</div>
                <input
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={inputStyle}
                />
              </label>

              <label>
                <div style={labelStyle}>Password</div>
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                />
              </label>

              <button type="submit" style={buttonBlue}>Open Admin Box</button>

              {isError ? <div style={{ color: '#b42318', fontWeight: 700 }}>Wrong or missing login details.</div> : null}
            </form>
          </section>
        ) : null}

        {isAuthenticated ? (
          <>
            <section style={{ ...cardStyle, marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 520px' }}>
                  <h2 style={{ marginTop: 0 }}>Executive Dispatch Section</h2>
                  <p style={{ color: '#486581' }}>
                    Use this top control area for override actions, dispatch notes, and launch controls.
                  </p>

                  <label>
                    <div style={labelStyle}>Dispatch comment</div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Type custom dispatch instructions here..."
                      style={{ ...inputStyle, minHeight: '110px' }}
                    />
                  </label>
                </div>

                <div style={{ flex: '1 1 280px' }}>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <button type="button" onClick={() => addLog('Override pass link opened')} style={buttonBlue}>
                      Override Pass Link
                    </button>
                    <button type="button" onClick={() => addLog('Free Ride override set to $0.00')} style={buttonGreen}>
                      Free Ride ($0.00) Button
                    </button>
                    <button type="button" onClick={handleAndroidDirectDownload} style={buttonDark}>
                      Handle Android Direct Download
                    </button>
                    <button type="button" onClick={() => addLog('ALL FLEET EMERGENCY SOS PANIC triggered')} style={buttonRed}>
                      🚨 ALL FLEET EMERGENCY SOS PANIC
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div style={cardStyle}>
                <h2 style={{ marginTop: 0 }}>Status Overrides Container</h2>
                <ToggleRow
                  label="MASTER SOS TOGGLE"
                  active={isSosActive}
                  activeText="🔴 ACTIVE"
                  idleText="⚪ STANDBY"
                  onClick={() => {
                    setIsSosActive((prev) => !prev);
                    addLog(`MASTER SOS TOGGLE changed to ${!isSosActive ? 'ACTIVE' : 'STANDBY'}`);
                  }}
                />
                <ToggleRow
                  label="HOSPITAL VISITATION MATRIX"
                  active={isHospitalActive}
                  activeText="🟢 STREAMING"
                  idleText="⚪ STANDBY"
                  onClick={() => {
                    setIsHospitalActive((prev) => !prev);
                    addLog(`Hospital visitation matrix changed to ${!isHospitalActive ? 'STREAMING' : 'STANDBY'}`);
                  }}
                />
                <ToggleRow
                  label="NOVEMBER 16TH TICKER"
                  active={isBirthdayActive}
                  activeText="🔵 ON-AIR"
                  idleText="⚪ STANDBY"
                  onClick={() => {
                    setIsBirthdayActive((prev) => !prev);
                    addLog(`Birthday ticker changed to ${!isBirthdayActive ? 'ON-AIR' : 'STANDBY'}`);
                  }}
                />
              </div>

              <div style={cardStyle}>
                <h2 style={{ marginTop: 0 }}>Regional Expansion Panel</h2>
                <p style={{ color: '#486581', marginTop: 0 }}>
                  Toggle the states you want treated as active for the system.
                </p>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <GeoRow label="🇺🇸 Region IN Geofence" active={statesMatrix.IN} onClick={() => toggleState('IN')} />
                  <GeoRow label="🇺🇸 Region KY Geofence" active={statesMatrix.KY} onClick={() => toggleState('KY')} />
                  <GeoRow label="🇺🇸 Region OH Geofence" active={statesMatrix.OH} onClick={() => toggleState('OH')} />
                  <GeoRow label="🇺🇸 Region IL Geofence" active={statesMatrix.IL} onClick={() => toggleState('IL')} />
                </div>
              </div>
            </section>

            <section style={{ ...cardStyle, marginBottom: '20px', border: '2px solid #1d4ed8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <p style={eyebrowStyle}>Apps Marquee Controls</p>
                  <h2 style={{ margin: '8px 0 10px' }}>Admin-managed ads and authority alerts</h2>
                  <p style={{ color: '#486581', margin: 0, maxWidth: '760px', lineHeight: 1.6 }}>
                    Ads should be created only in the admin panel. Authority-driven emergency alerts are separate from normal ads and should only last 1 minute before normal ads continue again.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdForm((prev) => !prev)}
                  style={{ ...buttonBlue, fontSize: '20px', padding: '12px 16px' }}
                >
                                    + New Ad
                </button>
              </div>

              {showAdForm ? (
                <div style={{ marginTop: '18px', display: 'grid', gap: '12px', maxWidth: '520px' }}>
                  <label>
                    <div style={labelStyle}>Ad title</div>
                    <input value={newAdTitle} onChange={(e) => setNewAdTitle(e.target.value)} style={inputStyle} />
                  </label>
                  <label>
                    <div style={labelStyle}>Audience</div>
                    <select value={newAdAudience} onChange={(e) => setNewAdAudience(e.target.value)} style={inputStyle}>
                      <option>All apps</option>
                      <option>Driver apps</option>
                      <option>Rider apps</option>
                      <option>Owner app</option>
                    </select>
                  </label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button type="button" onClick={addAd} style={buttonGreen}>Save Ad</button>
                    <button type="button" onClick={() => setShowAdForm(false)} style={buttonDark}>Cancel</button>
                  </div>
                </div>
              ) : null}

              <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: '20px', marginTop: '22px' }}>
                <div>
                  <h3 style={{ marginTop: 0 }}>Regular ad queue</h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {ads.map((ad) => (
                      <div key={ad.id} style={queueCardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'start' }}>
                          <div>
                            <div style={{ fontWeight: 800 }}>{ad.title}</div>
                            <div style={{ color: '#486581', fontSize: '14px', marginTop: '4px' }}>
                              {ad.id} • {ad.audience} • {ad.duration}
                            </div>
                          </div>
                          <div style={{ color: '#027a48', fontWeight: 800 }}>{ad.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ marginTop: 0 }}>Authority alert lane</h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={authorityCardStyle}>
                      <div style={{ fontWeight: 800 }}>Amber Alert</div>
                      <div style={{ color: '#cbd5e1', fontSize: '14px', marginTop: '4px' }}>Automatic • proper authorities • 1 minute</div>
                    </div>
                    <div style={authorityCardStyle}>
                      <div style={{ fontWeight: 800 }}>Emergency Alert System</div>
                      <div style={{ color: '#cbd5e1', fontSize: '14px', marginTop: '4px' }}>Automatic • proper authorities • 1 minute</div>
                    </div>
                    <div style={authorityCardStyle}>
                      <div style={{ fontWeight: 800 }}>Public Safety Alert</div>
                      <div style={{ color: '#cbd5e1', fontSize: '14px', marginTop: '4px' }}>Automatic • proper authorities • 1 minute</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', alignItems: 'start', marginBottom: '20px' }}>
              <div style={cardStyle}>
                <h2 style={{ marginTop: 0 }}>Driver Ledger Container</h2>
                <div style={{ background: '#fee4e2', color: '#b42318', padding: '12px 14px', borderRadius: '12px', fontWeight: 700, marginBottom: '12px' }}>
                  Radar Online Notification — Cross-Border Geometry Radar is tracking live boundary behavior.
                </div>
                <div style={{ background: '#7a271a', color: '#ffffff', padding: '12px 14px', borderRadius: '12px', marginBottom: '16px', fontWeight: 700 }}>
                  Marcus V. Lifetime Ban Alert — boundary breach risk flagged.
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f0f4f8' }}>
                        <th style={thStyle}>Driver Profile</th>
                        <th style={thStyle}>Mandatory Checklist</th>
                        <th style={thStyle}>7Yr Background Check</th>
                        <th style={thStyle}>Vault Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {initialDrivers.map((driver) => (
                        <tr key={driver.id}>
                          <td style={tdStyle}>
                            <div style={{ fontWeight: 700 }}>{driver.name}</div>
                            <div style={{ color: '#486581' }}>{driver.id} • {driver.city}</div>
                          </td>
                          <td style={tdStyle}>{driver.checklist}</td>
                          <td style={tdStyle}>{driver.background}</td>
                          <td style={tdStyle}>{driver.vault}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={cardStyle}>
                <h2 style={{ marginTop: 0 }}>API Networks Grid</h2>
                <StatusLine label="Twilio API" value="CONNECTED (V2.4)" />
                <StatusLine label="Google Maps API" value="ACTIVE (EDGE_NODE)" />
                <StatusLine label="Android Store Sync" value="VERIFIED" />
                <StatusLine label="Apple Store Sync" value="VERIFIED" />
                <StatusLine label="Tracked drivers" value={String(driverCount)} />

                <div style={{ marginTop: '22px' }}>
                  <h3 style={{ marginTop: 0 }}>Background log</h3>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {log.map((entry, index) => (
                      <div key={`${entry}-${index}`} style={{ background: '#f0f4f8', borderRadius: '10px', padding: '10px 12px', fontSize: '14px' }}>
                        {entry}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </section>
    </main>
  );
}

function ToggleRow({
  label,
  active,
  activeText,
  idleText,
  onClick,
}: {
  label: string;
  active: boolean;
  activeText: string;
  idleText: string;
  onClick: () => void;
}) {
  return (
    <div
      style={{
        border: '1px solid #d9e2ec',
        borderRadius: '14px',
        padding: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '10px',
      }}
    >
      <div>
        <div style={{ fontWeight: 700 }}>{label}</div>
        <div style={{ color: '#486581', fontSize: '14px' }}>{active ? activeText : idleText}</div>
      </div>
      <button type="button" onClick={onClick} style={active ? buttonRed : buttonBlue}>
        {active ? 'Turn Off' : 'Turn On'}
      </button>
    </div>
  );
}

function GeoRow({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: 'left',
        border: active ? '2px solid #0b66ff' : '1px solid #d9e2ec',
        borderRadius: '14px',
        padding: '14px',
        background: active ? '#e8f1ff' : '#ffffff',
        cursor: 'pointer',
        fontWeight: 700,
      }}
    >
      {label} — {active ? 'ACTIVE' : 'OFF'}
    </button>
  );
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '10px',
        padding: '10px 0',
        borderBottom: '1px solid #e4e7eb',
      }}
    >
      <span style={{ fontWeight: 700 }}>{label}</span>
      <span style={{ color: '#0b66ff', fontWeight: 700 }}>{value}</span>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #d9e2ec',
  borderRadius: '18px',
  padding: '24px',
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
};

const queueCardStyle: React.CSSProperties = {
  background: '#f8fbff',
  border: '1px solid #dbe7ff',
  borderRadius: '14px',
  padding: '14px',
};

const authorityCardStyle: React.CSSProperties = {
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '14px',
  padding: '14px',
  color: '#ffffff',
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#486581',
};

const topLinkStyle: React.CSSProperties = {
  background: '#0b66ff',
  color: '#ffffff',
  padding: '12px 16px',
  borderRadius: '10px',
  textDecoration: 'none',
  fontWeight: 700,
  whiteSpace: 'nowrap',
};

const labelStyle: React.CSSProperties = {
  fontWeight: 700,
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  borderRadius: '10px',
  border: '1px solid #bcccdc',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px',
  borderBottom: '1px solid #d9e2ec',
};

const tdStyle: React.CSSProperties = {
  padding: '12px',
  borderBottom: '1px solid #e4e7eb',
  verticalAlign: 'top',
};

const buttonBlue: React.CSSProperties = {
  background: '#0b66ff',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  padding: '12px 14px',
  fontWeight: 700,
  cursor: 'pointer',
};

const buttonGreen: React.CSSProperties = {
  background: '#027a48',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  padding: '12px 14px',
  fontWeight: 700,
  cursor: 'pointer',
};

const buttonDark: React.CSSProperties = {
  background: '#102a43',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  padding: '12px 14px',
  fontWeight: 700,
  cursor: 'pointer',
};

const buttonRed: React.CSSProperties = {
  background: '#b42318',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  padding: '12px 14px',
  fontWeight: 700,
  cursor: 'pointer',
};
