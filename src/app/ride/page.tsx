'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

const BASE_FARE = 5.0
const PER_MILE = 2.0
const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

const STAGE = { PLAN: 'plan', SEARCHING: 'searching', ONWAY: 'onway' } as const
type Stage = typeof STAGE[keyof typeof STAGE]

let mapsPromise: Promise<any> | null = null
function loadMaps(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject('no window')
  if ((window as any).google && (window as any).google.maps) return Promise.resolve((window as any).google)
  if (mapsPromise) return mapsPromise
  mapsPromise = new Promise((resolve, reject) => {
    if (!MAPS_KEY) { reject('missing key'); return }
    const s = document.createElement('script')
    s.src = 'https://maps.googleapis.com/maps/api/js?key=' + MAPS_KEY + '&libraries=places&loading=async'
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
  const [stage, setStage] = useState<Stage>(STAGE.PLAN)
  const [eta, setEta] = useState(0)
  const [mapsReady, setMapsReady] = useState(false)
  const [mapsError, setMapsError] = useState(false)
  const mapRef = useRef<HTMLDivElement | null>(null)
  const pickupRef = useRef<HTMLInputElement | null>(null)
  const dropoffRef = useRef<HTMLInputElement | null>(null)
  const mapObj = useRef<any>(null)
  const inited = useRef(false)

  useEffect(() => {
    let cancelled = false
    loadMaps().then(() => { if (!cancelled) setMapsReady(true) }).catch(() => { if (!cancelled) setMapsError(true) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!mapsReady || mapsError || inited.current) return
    const google = (window as any).google
    if (!google || !google.maps) return
    inited.current = true
    if (mapRef.current && !mapObj.current) {
      mapObj.current = new google.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.006 },
        zoom: 12,
        disableDefaultUI: true,
        gestureHandling: 'greedy',
        styles: [{ elementType: 'geometry', stylers: [{ color: '#12203f' }] }, { elementType: 'labels.text.fill', stylers: [{ color: '#8ea0c4' }] }, { elementType: 'labels.text.stroke', stylers: [{ color: '#0b1020' }] }, { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2c55' }] }, { featureType: 'poi', stylers: [{ visibility: 'off' }] }, { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c1326' }] }],
      })
    }
    const opts = { fields: ['formatted_address', 'geometry', 'name'] }
    if (pickupRef.current) {
      const ac = new google.maps.places.Autocomplete(pickupRef.current, opts)
      ac.addListener('place_changed', () => {
        const p = ac.getPlace()
        const val = p.formatted_address || p.name || ''
        if (val) setPickup(val)
        if (p.geometry && p.geometry.location && mapObj.current) { mapObj.current.setCenter(p.geometry.location); mapObj.current.setZoom(14) }
      })
    }
    if (dropoffRef.current) {
      const ac = new google.maps.places.Autocomplete(dropoffRef.current, opts)
      ac.addListener('place_changed', () => {
        const p = ac.getPlace()
        const val = p.formatted_address || p.name || ''
        if (val) setDropoff(val)
      })
    }
  }, [mapsReady, mapsError])

  const miles = estimateMiles(pickup, dropoff)
  const fare = miles > 0 ? BASE_FARE + miles * PER_MILE : 0
  const canRequest = pickup.trim().length > 0 && dropoff.trim().length > 0

  useEffect(() => {
    if (stage === STAGE.SEARCHING) {
      const t = setTimeout(() => { setStage(STAGE.ONWAY); setEta(4) }, 2600)
      return () => clearTimeout(t)
    }
  }, [stage])

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
  .rp-mapreal { height: 220px; border-radius: 20px; overflow: hidden; margin-top: 6px; background: #12203f; }
  .rp-maptag { position: absolute; left: 16px; bottom: 14px; font-size: 12px; color: #c9d2e6; background: rgba(5,7,15,0.5); padding: 5px 10px; border-radius: 999px; }
  .rp-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 20px; padding: 18px; margin-top: 16px; }
  .rp-label { font-size: 12px; font-weight: 700; letter-spacing: 0.06em; color: #8ea0c4; text-transform: uppercase; margin-bottom: 6px; }
  .rp-field { position: relative; }
  .rp-dot { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 10px; height: 10px; border-radius: 999px; }
  .rp-dot.pick { background: #35c65a; }
  .rp-dot.drop { background: #ffd21f; }
  .rp-input { width: 100%; padding: 14px 14px 14px 34px; border-radius: 13px; border: 1px solid rgba(255,255,255,0.14); background: #0c1326; color: #f4f6fb; font-size: 16px; outline: none; }
  .rp-input:focus { border-color: #ffd21f; }
  .rp-farebox { display: flex; align-items: center; justify-content: space-between; }
  .rp-farebig { font-size: 30px; font-weight: 800; letter-spacing: -0.02em; }
  .rp-rate { font-size: 12px; color: #8ea0c4; margin-top: 4px; }
  .rp-btn { width: 100%; padding: 16px; border-radius: 14px; background: #ffd21f; color: #0b1020; font-weight: 800; font-size: 17px; border: none; margin-top: 16px; cursor: pointer; }
  .rp-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .rp-ghost { width: 100%; padding: 14px; border-radius: 14px; background: transparent; color: #f4f6fb; font-weight: 700; font-size: 15px; border: 1px solid rgba(255,255,255,0.2); margin-top: 10px; cursor: pointer; }
  .rp-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid rgba(255,255,255,0.08); }
  .rp-avatar { width: 46px; height: 46px; border-radius: 999px; background: #24407a; display: flex; align-items: center; justify-content: center; flex: 0 0 auto; }
  .rp-spin { width: 42px; height: 42px; border-radius: 999px; border: 4px solid rgba(255,255,255,0.15); border-top-color: #ffd21f; animation: rpspin 0.9s linear infinite; margin: 8px auto; }
  @keyframes rpspin { to { transform: rotate(360deg); } }
  .rp-muted { color: #9fabc6; font-size: 13px; }
  .rp-tripline { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
` }} />
      <div className="rp-shell">
        <nav className="rp-nav">
          <Link href="/" className="rp-brand">On-Time Taxi</Link>
          <Link href="/get-app" className="rp-navlink">Get app</Link>
        </nav>

        {mapsReady && !mapsError ? (
          <div className="rp-mapreal" ref={mapRef} />
        ) : (
          <div className="rp-map"><div className="rp-maptag">Loading live map…</div></div>
        )}

        {stage === STAGE.PLAN && (
          <>
            <div className="rp-card">
              <div className="rp-label">Pickup</div>
              <div className="rp-field">
                <span className="rp-dot pick" />
                <input ref={pickupRef} className="rp-input" placeholder="Enter pickup location" value={pickup} onChange={(e) => setPickup(e.target.value)} />
              </div>
              <div className="rp-label" style={{ marginTop: 14 }}>Drop-off</div>
              <div className="rp-field">
                <span className="rp-dot drop" />
                <input ref={dropoffRef} className="rp-input" placeholder="Where to?" value={dropoff} onChange={(e) => setDropoff(e.target.value)} />
              </div>
            </div>

            <div className="rp-card">
              <div className="rp-farebox">
                <div>
                  <div className="rp-muted">{miles > 0 ? 'Estimated fare • ' + miles + ' mi' : 'Enter your trip for a fare'}</div>
                  <div className="rp-farebig">{fare > 0 ? '$' + fare.toFixed(2) : '$0.00'}</div>
                  <div className="rp-rate">$5.00 base + $2.00 per mile</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="rp-muted">Pickup in</div>
                  <div style={{ fontWeight: 700 }}>4 min</div>
                </div>
              </div>
              <button className="rp-btn" disabled={!canRequest} onClick={request}>{canRequest ? 'Request cab' : 'Enter pickup & drop-off'}</button>
            </div>
          </>
        )}

        {stage === STAGE.SEARCHING && (
          <div className="rp-card" style={{ textAlign: 'center' }}>
            <div className="rp-spin" />
            <div className="rp-muted">Matching you with a nearby driver</div>
            <button className="rp-ghost" onClick={cancel}>Cancel</button>
          </div>
        )}

        {stage === STAGE.ONWAY && (
          <div className="rp-card">
            <div className="rp-row" style={{ borderTop: 'none' }}>
              <div className="rp-avatar"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#cfe0ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13"/><path d="M3 13h18v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><circle cx="7.5" cy="15.5" r="1"/><circle cx="16.5" cy="15.5" r="1"/></svg></div>
              <div>
                <div style={{ fontWeight: 700 }}>Marcus • On-Time Taxi</div>
                <div className="rp-muted"><span style={{ color: '#ffd21f' }}>4.9 stars</span> • Yellow cab • Plate OT-2245</div>
              </div>
            </div>
            <div className="rp-row">
              <div className="rp-muted">{pickup} to {dropoff}</div>
            </div>
            <div className="rp-tripline">
              <div className="rp-muted">Arriving in {eta > 0 ? eta : 1} min</div>
              <div style={{ fontWeight: 800 }}>${fare.toFixed(2)}</div>
            </div>
            <button className="rp-ghost" onClick={cancel}>Cancel ride</button>
          </div>
        )}

        <div className="rp-muted" style={{ textAlign: 'center', marginTop: 18 }}>Live driver matching and payments connect next.</div>
      </div>
    </div>
  )
}
