'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

type Vehicle = { id: string; name: string; icon: string; perMile: number; base: number; eta: number; desc: string }

const vehicles: Vehicle[] = [
  { id: 'standard', name: 'Standard', icon: '🚗', perMile: 1.75, base: 3.0, eta: 3, desc: 'Everyday rides, up to 4 riders' },
  { id: 'suv', name: 'SUV', icon: '🚙', perMile: 2.4, base: 4.5, eta: 5, desc: 'Extra room, up to 6 riders' },
  { id: 'van', name: 'Van', icon: '🚐', perMile: 2.9, base: 6.0, eta: 7, desc: 'Groups and luggage, up to 8' },
  { id: 'luxury', name: 'Luxury', icon: '🚘', perMile: 3.8, base: 8.0, eta: 6, desc: 'Premium cars, top-rated drivers' },
  { id: 'moped', name: 'Moped', icon: '🛵', perMile: 1.1, base: 2.0, eta: 2, desc: 'Fast solo trips, weather permitting' },
]

const STAGE = { PLAN: 'plan', SEARCHING: 'searching', ONWAY: 'onway' } as const
type Stage = typeof STAGE[keyof typeof STAGE]

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

let mapsPromise: Promise<any> | null = null
function loadMaps(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject('no window')
  if ((window as any).google && (window as any).google.maps) return Promise.resolve((window as any).google)
  if (mapsPromise) return mapsPromise
  mapsPromise = new Promise((resolve, reject) => {
    if (!MAPS_KEY) { reject('missing key'); return }
    const s = document.createElement('script')
    s.src = 'https://maps.googleapis.com/maps/api/js?key=' + MAPS_KEY + '&libraries=places'
    s.async = true
    s.defer = true
    s.onload = () => resolve((window as any).google)
    s.onerror = () => reject('script error')
    document.head.appendChild(s)
  })
  return mapsPromise
}

function estimateMiles(pickup: string, dropoff: string): number {
  if (!pickup.trim() || !dropoff.trim()) return 0
  const s = (pickup + dropoff).toLowerCase()
  let h = 0
  for (let i = 0; i < s.length; i++) { h = (h + s.charCodeAt(i) * (i + 1)) % 100000 }
  return Math.round((2 + (h % 90) / 10) * 10) / 10
}

export default function RidePage() {
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [vehicleId, setVehicleId] = useState('standard')
  const [stage, setStage] = useState<Stage>(STAGE.PLAN)
  const [eta, setEta] = useState(0)
  const [mapsReady, setMapsReady] = useState(false)
  const [mapsError, setMapsError] = useState(false)
  const mapRef = useRef<HTMLDivElement | null>(null)
  const pickupRef = useRef<HTMLInputElement | null>(null)
  const dropoffRef = useRef<HTMLInputElement | null>(null)
  const mapObj = useRef<any>(null)

  useEffect(() => {
    let cancelled = false
    loadMaps().then((google) => {
      if (cancelled) return
      setMapsReady(true)
      if (mapRef.current && !mapObj.current) {
        mapObj.current = new google.maps.Map(mapRef.current, {
          center: { lat: 40.7128, lng: -74.006 },
          zoom: 12,
          disableDefaultUI: true,
          gestureHandling: 'greedy',
          styles: [{ elementType: 'geometry', stylers: [{ color: '#12203f' }] }, { elementType: 'labels.text.fill', stylers: [{ color: '#8ea0c4' }] }, { elementType: 'labels.text.stroke', stylers: [{ color: '#0b1020' }] }, { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2c55' }] }, { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c1326' }] }],
        })
      }
      if (pickupRef.current) {
        const ac = new google.maps.places.Autocomplete(pickupRef.current, { fields: ['formatted_address', 'geometry', 'name'] })
        ac.addListener('place_changed', () => {
          const p = ac.getPlace()
          const val = p.formatted_address || p.name || ''
          if (val) setPickup(val)
          if (p.geometry && p.geometry.location && mapObj.current) { mapObj.current.setCenter(p.geometry.location); mapObj.current.setZoom(14) }
        })
      }
      if (dropoffRef.current) {
        const ac = new google.maps.places.Autocomplete(dropoffRef.current, { fields: ['formatted_address', 'geometry', 'name'] })
        ac.addListener('place_changed', () => {
          const p = ac.getPlace()
          const val = p.formatted_address || p.name || ''
          if (val) setDropoff(val)
        })
      }
    }).catch(() => { if (!cancelled) setMapsError(true) })
    return () => { cancelled = true }
  }, [])

  const vehicle = vehicles.find((v) => v.id === vehicleId) || vehicles[0]
  const miles = estimateMiles(pickup, dropoff)
  const fare = miles > 0 ? vehicle.base + miles * vehicle.perMile : 0
  const canRequest = pickup.trim().length > 0 && dropoff.trim().length > 0

  useEffect(() => {
    if (stage === STAGE.SEARCHING) {
      const t = setTimeout(() => { setStage(STAGE.ONWAY); setEta(vehicle.eta) }, 2600)
      return () => clearTimeout(t)
    }
  }, [stage, vehicle.eta])

  useEffect(() => {
    if (stage === STAGE.ONWAY && eta > 0) {
      const t = setTimeout(() => setEta((e) => e - 1), 4000)
      return () => clearTimeout(t)
    }
  }, [stage, eta])

  function request() { if (canRequest) setStage(STAGE.SEARCHING) }
  function cancel() { setStage(STAGE.PLAN); setEta(0) }

  return (
    <div className="rp-wrap">
      <style dangerouslySetInnerHTML={{ __html: `
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; overflow-x: hidden; }
  .rp-wrap { min-height: 100vh; background: linear-gradient(180deg, #05070f 0%, #0b1020 60%, #0f1830 100%); color: #f4f6fb; font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
  .rp-shell { max-width: 520px; margin: 0 auto; padding: 0 16px 48px; }
  .rp-nav { display: flex; align-items: center; justify-content: space-between; padding: 18px 0; }
  .rp-brand { font-weight: 800; font-size: 20px; color: #ffd21f; text-decoration: none; }
  .rp-navlink { color: #c9d2e6; text-decoration: none; font-size: 14px; font-weight: 600; }
  .rp-map { height: 210px; border-radius: 20px; background: linear-gradient(135deg, #24407a 0%, #1a2c55 45%, #12203f 100%); position: relative; overflow: hidden; margin-top: 6px; }
  .rp-mapreal { height: 210px; border-radius: 20px; overflow: hidden; margin-top: 6px; background: #12203f; }
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
` }} />
      <div className="rp-shell">
        <nav className="rp-nav">
          <Link href="/" className="rp-brand">On-Time Taxi</Link>
          <Link href="/get-app" className="rp-navlink">Get app</Link>
        </nav>

        {mapsReady && !mapsError ? (
          <div className="rp-mapreal" ref={mapRef} />
        ) : (
          <div className="rp-map"><div className="rp-pin">📍</div><div className="rp-route" /></div>
        )}

        {stage === STAGE.PLAN && (
          <>
            <div className="rp-card">
              <div className="rp-label">Pickup</div>
              <input ref={pickupRef} className="rp-input" placeholder="Enter pickup location" value={pickup} onChange={(e) => setPickup(e.target.value)} />
              <div className="rp-label" style={{ marginTop: 14 }}>Drop-off</div>
              <input ref={dropoffRef} className="rp-input" placeholder="Where to?" value={dropoff} onChange={(e) => setDropoff(e.target.value)} />
            </div>

            <div className="rp-label" style={{ marginTop: 20 }}>Choose a ride</div>
            <div className="rp-veh">
              {vehicles.map((v) => {
                const m = estimateMiles(pickup, dropoff)
                const f = m > 0 ? v.base + m * v.perMile : 0
                return (
                  <div key={v.id} className={'rp-vehcard' + (v.id === vehicleId ? ' sel' : '')} onClick={() => setVehicleId(v.id)}>
                    <div style={{ fontSize: 24 }}>{v.icon}</div>
                    <div className="rp-vehname">{v.name}</div>
                    <div className="rp-vehdesc">{v.desc}</div>
                    <div className="rp-vehfare">{f > 0 ? '$' + f.toFixed(2) : '—'}</div>
                  </div>
                )
              })}
            </div>

            <div className="rp-card">
              <div className="rp-farebox">
                <div>
                  <div className="rp-muted">{vehicle.name}{miles > 0 ? ' • ' + miles + ' mi' : ' • enter your trip'}</div>
                  <div className="rp-farebig">{fare > 0 ? '$' + fare.toFixed(2) : '$0.00'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="rp-muted">Pickup in</div>
                  <div style={{ fontWeight: 700 }}>{vehicle.eta} min</div>
                </div>
              </div>
              <button className="rp-btn" disabled={!canRequest} onClick={request}>{canRequest ? 'Request ' + vehicle.name : 'Enter pickup & drop-off'}</button>
            </div>
          </>
        )}

        {stage === STAGE.SEARCHING && (
          <div className="rp-card" style={{ textAlign: 'center' }}>
            <div className="rp-spin" />
            <div className="rp-muted">Matching you with a nearby {vehicle.name} driver</div>
            <button className="rp-ghost" onClick={cancel}>Cancel</button>
          </div>
        )}

        {stage === STAGE.ONWAY && (
          <div className="rp-card">
            <div className="rp-row" style={{ borderTop: 'none' }}>
              <div className="rp-avatar">🧑</div>
              <div>
                <div style={{ fontWeight: 700 }}>Marcus • {vehicle.name}</div>
                <div className="rp-muted"><span style={{ color: '#ffd21f' }}>⭐ 4.9</span> • Yellow • Plate OT-2245</div>
              </div>
            </div>
            <div className="rp-row">
              <div className="rp-muted">{pickup} → {dropoff}</div>
            </div>
            <div className="rp-farebox">
              <div className="rp-muted">Arriving in {eta > 0 ? eta : 1} min</div>
              <div style={{ fontWeight: 800 }}>${fare.toFixed(2)}</div>
            </div>
            <button className="rp-ghost" onClick={cancel}>Cancel ride</button>
          </div>
        )}

        <div className="rp-muted" style={{ textAlign: 'center', marginTop: 18 }}>Demo ride flow • live driver matching and payments connect next.</div>
      </div>
    </div>
  )
}
