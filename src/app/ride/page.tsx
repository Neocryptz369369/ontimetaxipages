'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

type Vehicle = {
  id: string
  name: string
  icon: string
  perMile: number
  base: number
  eta: number
  desc: string
}

const vehicles: Vehicle[] = [
  { id: 'standard', name: 'Standard', icon: '\uD83D\uDE97', perMile: 1.75, base: 3.0, eta: 3, desc: 'Everyday rides, up to 4 riders' },
  { id: 'suv', name: 'SUV', icon: '\uD83D\uDE99', perMile: 2.4, base: 4.5, eta: 5, desc: 'Extra room, up to 6 riders' },
  { id: 'van', name: 'Van', icon: '\uD83D\uDE90', perMile: 2.9, base: 6.0, eta: 7, desc: 'Groups and luggage, up to 8' },
  { id: 'luxury', name: 'Luxury', icon: '\uD83D\uDE98', perMile: 3.8, base: 8.0, eta: 6, desc: 'Premium cars, top-rated drivers' },
  { id: 'moped', name: 'Moped', icon: '\uD83D\uDEF5', perMile: 1.1, base: 2.0, eta: 2, desc: 'Fast solo trips, weather permitting' },
]

const STAGE = { PLAN: 'plan', SEARCHING: 'searching', ONWAY: 'onway' } as const
type Stage = (typeof STAGE)[keyof typeof STAGE]

function estimateMiles(pickup: string, dropoff: string): number {
  if (!pickup.trim() || !dropoff.trim()) return 0
  const s = (pickup + '|' + dropoff).toLowerCase()
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000
  return Math.round((2 + (h % 90) / 10) * 10) / 10
}
const css = `
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; overflow-x: hidden; }
  .rp-wrap { min-height: 100vh; background: linear-gradient(180deg, #05070f 0%, #0b1020 60%, #0f1830 100%); color: #f4f6fb; font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
  .rp-shell { max-width: 520px; margin: 0 auto; padding: 0 16px 48px; }
  .rp-nav { display: flex; align-items: center; justify-content: space-between; padding: 18px 0; }
  .rp-brand { font-weight: 800; font-size: 20px; color: #ffd21f; text-decoration: none; }
  .rp-navlink { color: #c9d2e6; text-decoration: none; font-size: 14px; font-weight: 600; }
  .rp-map { height: 210px; border-radius: 20px; background: linear-gradient(135deg, #24407a 0%, #1a2c55 45%, #12203f 100%); position: relative; overflow: hidden; margin-top: 6px; }
  .rp-pin { position: absolute; top: 44%; left: 50%; transform: translateX(-50%); font-size: 30px; }
  .rp-route { position: absolute; left: 24px; right: 24px; bottom: 22px; height: 3px; background: repeating-linear-gradient(90deg, #ffd21f 0 12px, transparent 12px 20px); border-radius: 3px; }
  .rp-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 20px; padding: 18px; margin-top: 16px; }
  .rp-label { font-size: 12px; font-weight: 700; letter-spacing: 0.06em; color: #8ea0c4; text-transform: uppercase; margin-bottom: 6px; }
  .rp-input { width: 100%; padding: 14px; border-radius: 13px; border: 1px solid rgba(255,255,255,0.14); background: #0c1326; color: #f4f6fb; font-size: 16px; outline: none; }
  .rp-input:focus { border-color: #ffd21f; }
  .rp-veh { display: flex; gap: 10px; overflow-x: auto; padding: 4px 2px 8px; margin-top: 4px; }
  .rp-vehcard { flex: 0 0 auto; width: 132px; background: #0c1326; border: 1.5px solid rgba(255,255,255,0.12); border-radius: 15px; padding: 12px; cursor: pointer; }
  .rp-vehcard.sel { border-color: #ffd21f; background: #1a1c10; }
  .rp-vehname { font-weight: 800; font-size: 15px; margin-top: 4px; }
  .rp-vehdesc { font-size: 11px; color: #9fabc6; line-height: 1.35; margin-top: 3px; }
  .rp-vehfare { font-weight: 800; color: #ffd21f; margin-top: 6px; font-size: 15px; }
  .rp-farebox { display: flex; align-items: center; justify-content: space-between; }
  .rp-farebig { font-size: 26px; font-weight: 800; }
  .rp-btn { width: 100%; padding: 16px; border-radius: 14px; background: #ffd21f; color: #0b1020; font-weight: 800; font-size: 17px; border: none; margin-top: 16px; cursor: pointer; }
  .rp-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .rp-ghost { width: 100%; padding: 14px; border-radius: 14px; background: transparent; color: #f4f6fb; font-weight: 700; font-size: 15px; border: 1px solid rgba(255,255,255,0.2); margin-top: 10px; cursor: pointer; }
  .rp-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid rgba(255,255,255,0.08); }
  .rp-avatar { width: 46px; height: 46px; border-radius: 999px; background: #24407a; display: flex; align-items: center; justify-content: center; font-size: 22px; flex: 0 0 auto; }
  .rp-spin { width: 42px; height: 42px; border-radius: 999px; border: 4px solid rgba(255,255,255,0.15); border-top-color: #ffd21f; animation: rpspin 0.9s linear infinite; margin: 8px auto; }
  @keyframes rpspin { to { transform: rotate(360deg); } }
  .rp-muted { color: #9fabc6; font-size: 13px; }
`;

export default function RidePage() {
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [vehicleId, setVehicleId] = useState('standard')
  const [stage, setStage] = useState<Stage>(STAGE.PLAN)
  const [eta, setEta] = useState(0)

  const miles = estimateMiles(pickup, dropoff)
  const vehicle = vehicles.find((v) => v.id === vehicleId) || vehicles[0]
  const fare = miles > 0 ? vehicle.base + miles * vehicle.perMile : 0
  const canRequest = pickup.trim().length > 1 && dropoff.trim().length > 1

  function fareFor(v: Vehicle): number {
    return miles > 0 ? v.base + miles * v.perMile : 0
  }

  function requestRide() {
    if (!canRequest) return
    setStage(STAGE.SEARCHING)
  }

  function reset() {
    setStage(STAGE.PLAN)
    setEta(0)
  }

  useEffect(() => {
    if (stage === STAGE.SEARCHING) {
      const t = setTimeout(() => {
        setEta(vehicle.eta)
        setStage(STAGE.ONWAY)
      }, 2600)
      return () => clearTimeout(t)
    }
  }, [stage, vehicle.eta])

  useEffect(() => {
    if (stage === STAGE.ONWAY) {
      const t = setInterval(() => setEta((e) => (e > 1 ? e - 1 : 1)), 4000)
      return () => clearInterval(t)
    }
  }, [stage])

  return (
    <div className="rp-wrap">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="rp-shell">
        <nav className="rp-nav">
          <Link href="/" className="rp-brand">On-Time Taxi</Link>
          <Link href="/get-app" className="rp-navlink">Get app</Link>
        </nav>

        <div className="rp-map">
          <div className="rp-pin">{stage === STAGE.ONWAY ? '\uD83D\uDE97' : '\uD83D\uDCCD'}</div>
          <div className="rp-route" />
        </div>

        {stage === STAGE.PLAN && (
          <>
            <div className="rp-card">
              <div className="rp-label">Pickup</div>
              <input className="rp-input" placeholder="Enter pickup location" value={pickup} onChange={(e) => setPickup(e.target.value)} />
              <div className="rp-label" style={{ marginTop: 14 }}>Drop-off</div>
              <input className="rp-input" placeholder="Where to?" value={dropoff} onChange={(e) => setDropoff(e.target.value)} />
            </div>

            <div style={{ marginTop: 18 }}>
              <div className="rp-label">Choose a ride</div>
              <div className="rp-veh">
                {vehicles.map((v) => (
                  <div key={v.id} className={'rp-vehcard' + (v.id === vehicleId ? ' sel' : '')} onClick={() => setVehicleId(v.id)}>
                    <div style={{ fontSize: 26 }}>{v.icon}</div>
                    <div className="rp-vehname">{v.name}</div>
                    <div className="rp-vehdesc">{v.desc}</div>
                    <div className="rp-vehfare">{fareFor(v) > 0 ? '$' + fareFor(v).toFixed(2) : '\u2014'}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rp-card">
              <div className="rp-farebox">
                <div>
                  <div className="rp-muted">{vehicle.name + ' \u2022 ' + (miles > 0 ? miles + ' mi' : 'enter your trip')}</div>
                  <div className="rp-farebig">{'$' + fare.toFixed(2)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="rp-muted">Pickup in</div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{vehicle.eta + ' min'}</div>
                </div>
              </div>
              <button className="rp-btn" onClick={requestRide} disabled={!canRequest}>
                {canRequest ? 'Request ' + vehicle.name : 'Enter pickup & drop-off'}
              </button>
            </div>
          </>
        )}

        {stage === STAGE.SEARCHING && (
          <div className="rp-card" style={{ textAlign: 'center' }}>
            <div className="rp-spin" />
            <div style={{ fontWeight: 800, fontSize: 18, marginTop: 8 }}>Finding your driver\u2026</div>
            <div className="rp-muted" style={{ marginTop: 6 }}>
              {'Matching you with a nearby ' + vehicle.name.toLowerCase() + ' driver'}
            </div>
            <button className="rp-ghost" onClick={reset}>Cancel</button>
          </div>
        )}

        {stage === STAGE.ONWAY && (
          <div className="rp-card">
            <div style={{ fontWeight: 800, fontSize: 18 }}>Your driver is on the way</div>
            <div className="rp-row" style={{ borderTop: 'none' }}>
              <div className="rp-avatar">\uD83E\uDDD1\u200D\u2708\uFE0F</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800 }}>{'Marcus \u2022 ' + vehicle.name}</div>
                <div className="rp-muted">\u2B50 4.9 \u2022 Yellow \u2022 Plate OT-2245</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: 22, color: '#ffd21f' }}>{eta}</div>
                <div className="rp-muted">min away</div>
              </div>
            </div>
            <div className="rp-row">
              <div style={{ flex: 1 }}>
                <div className="rp-muted">Trip</div>
                <div style={{ fontWeight: 700 }}>{pickup + ' \u2192 ' + dropoff}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="rp-muted">Fare</div>
                <div style={{ fontWeight: 800 }}>{'$' + fare.toFixed(2)}</div>
              </div>
            </div>
            <button className="rp-ghost" onClick={reset}>Cancel ride</button>
          </div>
        )}

        <p className="rp-muted" style={{ marginTop: 22, textAlign: 'center' }}>
          Demo ride flow \u2022 live driver matching and payments connect next.
        </p>
      </div>
    </div>
  )
}
