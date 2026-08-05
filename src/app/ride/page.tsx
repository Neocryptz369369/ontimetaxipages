'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

const BASE_FARE = 5.0
const PER_MILE = 2.0
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

const STAGE = { PLAN: 'plan', SEARCHING: 'searching', ONWAY: 'onway' } as const
type Stage = typeof STAGE[keyof typeof STAGE]

let mapboxPromise: Promise<any> | null = null
function loadMapbox(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject('no window')
  if ((window as any).mapboxgl) return Promise.resolve((window as any).mapboxgl)
  if (mapboxPromise) return mapboxPromise
  mapboxPromise = new Promise((resolve, reject) => {
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = 'https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.css'
    document.head.appendChild(css)
    const s = document.createElement('script')
    s.src = 'https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.js'
    s.async = true
    s.onload = () => resolve((window as any).mapboxgl)
    s.onerror = () => reject('mapbox failed to load')
    document.head.appendChild(s)
  })
  return mapboxPromise
}

async function geocode(q: string): Promise<any[]> {
  if (!q || !MAPBOX_TOKEN) return []
  const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(q) + '.json?autocomplete=true&limit=5&country=us&proximity=-85.7550,38.3981&access_token=' + MAPBOX_TOKEN
  try {
    const r = await fetch(url)
    const j = await r.json()
    return (j.features || [])
  } catch (e) { return [] }
}

function milesBetween(a: number[], b: number[]): number {
  const R = 3958.8
  const dLat = (b[1]-a[1]) * Math.PI/180
  const dLng = (b[0]-a[0]) * Math.PI/180
  const lat1 = a[1]*Math.PI/180, lat2 = b[1]*Math.PI/180
  const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2
  return 2*R*Math.asin(Math.sqrt(h))
}

export default function RidePage() {
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [pickupCoord, setPickupCoord] = useState<number[] | null>(null)
  const [dropoffCoord, setDropoffCoord] = useState<number[] | null>(null)
  const [pickupSug, setPickupSug] = useState<any[]>([])
  const [dropoffSug, setDropoffSug] = useState<any[]>([])
  const [stage, setStage] = useState<Stage>(STAGE.PLAN)
  const [miles, setMiles] = useState(0)
  const [baseFare, setBaseFare] = useState(BASE_FARE)
  const [perMile, setPerMile] = useState(PER_MILE)

  useEffect(() => {
    let alive = true
    supabase.from('app_settings').select('base_fee, per_mile').eq('id', 1).single().then(({ data }) => {
      if (alive && data) {
        if (data.base_fee != null) setBaseFare(Number(data.base_fee))
        if (data.per_mile != null) setPerMile(Number(data.per_mile))
      }
    })
    return () => { alive = false }
  }, [])
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')
  const [mapsReady, setMapsReady] = useState(false)
  const mapDivRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const pickMarkerRef = useRef<any>(null)
  const dropMarkerRef = useRef<any>(null)
  const [activeRide, setActiveRide] = useState<any>(null)
  const [driverPos, setDriverPos] = useState<{ lat: number; lng: number } | null>(null)
  const [geoError, setGeoError] = useState('')
  const riderMarkerRef = useRef<any>(null)
  const driverMarkerRef = useRef<any>(null)
  const watchIdRef = useRef<number | null>(null)


  useEffect(() => {
    let alive = true
    loadMapbox().then(() => { if (alive) setMapsReady(true) }).catch(() => {})
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (!mapsReady || !mapDivRef.current || mapRef.current) return
    const mapboxgl = (window as any).mapboxgl
    if (!mapboxgl) return
    mapboxgl.accessToken = MAPBOX_TOKEN
    mapRef.current = new mapboxgl.Map({
      container: mapDivRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-85.7550, 38.3981],
      zoom: 12,
    })
    const m = mapRef.current
    m.on('load', () => m.resize())
    m.on('idle', () => m.resize())
    ;[100, 400, 800, 1500].forEach(d => setTimeout(() => { try { m.resize() } catch (e) {} }, d))
    if (typeof ResizeObserver !== 'undefined' && mapDivRef.current) {
      const ro = new ResizeObserver(() => { try { m.resize() } catch (e) {} })
      ro.observe(mapDivRef.current)
    }
  }, [mapsReady])

  useEffect(() => {
    if (!pickup || pickupCoord) { setPickupSug([]); return }
    const t = setTimeout(async () => { setPickupSug(await geocode(pickup)) }, 250)
    return () => clearTimeout(t)
  }, [pickup, pickupCoord])

  useEffect(() => {
    if (!dropoff || dropoffCoord) { setDropoffSug([]); return }
    const t = setTimeout(async () => { setDropoffSug(await geocode(dropoff)) }, 250)
    return () => clearTimeout(t)
  }, [dropoff, dropoffCoord])

  useEffect(() => {
    const map = mapRef.current
    const mapboxgl = (window as any).mapboxgl
    if (!map || !mapboxgl) return
    if (pickupCoord) {
      if (pickMarkerRef.current) pickMarkerRef.current.remove()
      pickMarkerRef.current = new mapboxgl.Marker({ color: '#111' }).setLngLat(pickupCoord).addTo(map)
    }
    if (dropoffCoord) {
      if (dropMarkerRef.current) dropMarkerRef.current.remove()
      dropMarkerRef.current = new mapboxgl.Marker({ color: '#f5b301' }).setLngLat(dropoffCoord).addTo(map)
    }
    if (pickupCoord && dropoffCoord) {
      const b = new mapboxgl.LngLatBounds()
      b.extend(pickupCoord); b.extend(dropoffCoord)
      map.fitBounds(b, { padding: 70, maxZoom: 14 })
      setMiles(milesBetween(pickupCoord, dropoffCoord))
    } else if (pickupCoord) {
      map.flyTo({ center: pickupCoord, zoom: 13 })
    } else if (dropoffCoord) {
      map.flyTo({ center: dropoffCoord, zoom: 13 })
    }
  }, [pickupCoord, dropoffCoord, mapsReady])

  function choosePickup(feat: any) {
    setPickup(feat.place_name)
    setPickupCoord(feat.center)
    setPickupSug([])
  }
  function chooseDropoff(feat: any) {
    setDropoff(feat.place_name)
    setDropoffCoord(feat.center)
    setDropoffSug([])
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  async function startCheckout() {
    setPayError('')
    setPaying(true)
    try {
      // record the ride request so the driver can see it
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const rideFare = miles > 0 ? baseFare + perMile * miles : baseFare
          await supabase.from('rides').insert({
            rider_id: user.id,
            pickup,
            dropoff,
            fare: rideFare,
            status: 'requested',
          })
        }
      } catch (rideErr) {
        // non-blocking: continue to checkout even if ride logging fails
      }
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fare, pickup, dropoff, miles }),
      })
      const data = await res.json()
      if (data && data.url) {
        window.location.href = data.url
        return
      }
      setPayError((data && data.error) || 'Could not start checkout. Please try again.')
      setPaying(false)
    } catch (e) {
      setPayError('Network error. Please try again.')
      setPaying(false)
    }
  }

  const fare = miles > 0 ? baseFare + perMile * miles : baseFare

  // Live tracking: find the rider's active ride, stream their GPS, and receive the driver's GPS
  useEffect(() => {
    let alive = true
    let channel: any = null
    let pollId: any = null

    async function boot() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !alive) return
      const { data } = await supabase
        .from('rides')
        .select('*')
        .eq('rider_id', user.id)
        .in('status', ['accepted', 'picked_up'])
        .order('created_at', { ascending: false })
        .limit(1)
      if (!alive) return
      const ride = data && data[0] ? data[0] : null
      setActiveRide(ride)
      if (!ride) {
        channel = supabase
          .channel('ride-pending-' + user.id)
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rides', filter: 'rider_id=eq.' + user.id }, (payload: any) => {
            const r = payload.new
            if (r && (r.status === 'accepted' || r.status === 'picked_up')) {
              if (channel) { supabase.removeChannel(channel); channel = null }
              boot()
            }
          })
          .subscribe()
        return
      }
      setStage(STAGE.ONWAY)
      if (ride.driver_lat != null && ride.driver_lng != null) {
        setDriverPos({ lat: ride.driver_lat, lng: ride.driver_lng })
      }

      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const lat = pos.coords.latitude
            const lng = pos.coords.longitude
            setGeoError('')
            setActiveRide((prev: any) => prev ? { ...prev, rider_lat: lat, rider_lng: lng } : prev)
            supabase.from('rides').update({ rider_lat: lat, rider_lng: lng, updated_at: new Date().toISOString() }).eq('id', ride.id).then(() => {})
          },
          () => { setGeoError('Location access is off. Turn it on so your driver can find you.') },
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
        )
      }

      channel = supabase
        .channel('ride-track-' + ride.id)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rides', filter: 'id=eq.' + ride.id }, (payload: any) => {
          const r = payload.new
          setActiveRide(r)
          if (r.driver_lat != null && r.driver_lng != null) setDriverPos({ lat: r.driver_lat, lng: r.driver_lng })
        })
        .subscribe()
    }
    boot()
    pollId = setInterval(async () => {
      if (!alive) return
      const { data: u } = await supabase.auth.getUser()
      if (!u || !u.user) return
      const { data: rows } = await supabase.from('rides').select('*').eq('rider_id', u.user.id).in('status', ['accepted', 'picked_up']).order('created_at', { ascending: false }).limit(1)
      const r = rows && rows[0] ? rows[0] : null
      if (!alive || !r) return
      setActiveRide(r)
      if (r.driver_lat != null && r.driver_lng != null) setDriverPos({ lat: r.driver_lat, lng: r.driver_lng })
    }, 4000)

    return () => {
      alive = false
      if (watchIdRef.current != null && typeof navigator !== 'undefined' && navigator.geolocation) navigator.geolocation.clearWatch(watchIdRef.current)
      if (pollId) clearInterval(pollId)
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  // Draw rider + driver pins on the existing map while tracking
  useEffect(() => {
    const mapboxgl = (window as any).mapboxgl
    const m = mapRef.current
    if (!mapboxgl || !m || !activeRide) return
    if (activeRide.rider_lat != null && activeRide.rider_lng != null) {
      const c: [number, number] = [activeRide.rider_lng, activeRide.rider_lat]
      if (!riderMarkerRef.current) riderMarkerRef.current = new mapboxgl.Marker({ color: '#1a73e8' }).setLngLat(c).addTo(m)
      else riderMarkerRef.current.setLngLat(c)
    }
    if (driverPos) {
      const c: [number, number] = [driverPos.lng, driverPos.lat]
      if (!driverMarkerRef.current) driverMarkerRef.current = new mapboxgl.Marker({ color: '#d81b1b' }).setLngLat(c).addTo(m)
      else driverMarkerRef.current.setLngLat(c)
    }
    if (driverPos && activeRide.rider_lat != null) {
      try {
        const b = new mapboxgl.LngLatBounds()
        b.extend([activeRide.rider_lng, activeRide.rider_lat])
        b.extend([driverPos.lng, driverPos.lat])
        m.fitBounds(b, { padding: 80, maxZoom: 15, duration: 500 })
      } catch (e) {}
    } else if (activeRide.rider_lat != null) {
      try { m.easeTo({ center: [activeRide.rider_lng, activeRide.rider_lat], zoom: 14, duration: 500 }) } catch (e) {}
    }
  }, [activeRide, driverPos])

  return (
    <div className="rp-wrap">
      <div className="rp-shell">
        <nav className="rp-nav">
          <Link href="/" className="rp-brand">On Time Taxi</Link>
          <Link href="/" className="rp-navlink">Home</Link>
          <button type="button" onClick={handleSignOut} className="rp-navlink" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button>
        </nav>

        <div className="rp-map">
          <div ref={mapDivRef} className="rp-mapreal" />
          <div className="rp-maptag">On Time Taxi</div>
        </div>

        <div className="rp-card">
          {activeRide && (
            <div style={{ marginBottom: '14px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(216,27,27,0.12)', border: '1px solid rgba(216,27,27,0.35)' }}>
              <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                {activeRide.status === 'picked_up' ? 'You are on your way' : 'Your driver is on the way'}
              </div>
              <div style={{ fontSize: '13px', opacity: 0.85 }}>
                {driverPos ? 'Live location updating on the map above.' : 'Waiting for your driver location...'}
              </div>
              {geoError && (
                <div style={{ fontSize: '13px', color: '#ffb4b4', marginTop: '6px' }}>{geoError}</div>
              )}
            </div>
          )}
          {stage === STAGE.PLAN && (
            <>
              <div className="rp-label">Where to?</div>
              <div className="rp-field">
                <span className="rp-dot pick" />
                <input className="rp-input" placeholder="Pickup address" value={pickup} onChange={e => { setPickup(e.target.value); setPickupCoord(null) }} />
              <button
                type="button"
                className="rp-btn rp-ghost"
                style={{ marginTop: 8, fontSize: '13px', padding: '8px 12px' }}
                onClick={() => {
                  if (!navigator.geolocation) { alert('Location is not available on this device.'); return }
                  navigator.geolocation.getCurrentPosition(async (pos) => {
                    const lng = pos.coords.longitude
                    const lat = pos.coords.latitude
                    setPickupCoord([lng, lat])
                    try {
                      if (MAPBOX_TOKEN) {
                        const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + lng + ',' + lat + '.json?access_token=' + MAPBOX_TOKEN
                        const res = await fetch(url)
                        const json = await res.json()
                        const name = json && json.features && json.features[0] ? json.features[0].place_name : ''
                        setPickup(name || (lat.toFixed(5) + ', ' + lng.toFixed(5)))
                      } else {
                        setPickup(lat.toFixed(5) + ', ' + lng.toFixed(5))
                      }
                    } catch (err) {
                      setPickup(lat.toFixed(5) + ', ' + lng.toFixed(5))
                    }
                    setPickupSug([])
                  }, () => { alert('Could not get your location. Please allow location access.') })
                }}
              >Use my current location</button>
                {pickupSug.length > 0 && (
                  <div className="rp-suggest">
                    {pickupSug.map((s, i) => (
                      <div key={i} className="rp-sugitem" onClick={() => choosePickup(s)}>{s.place_name}</div>
                    ))}
                  </div>
                )}
              </div>
              <div className="rp-field">
                <span className="rp-dot drop" />
                <input className="rp-input" placeholder="Dropoff address" value={dropoff} onChange={e => { setDropoff(e.target.value); setDropoffCoord(null) }} />
                {dropoffSug.length > 0 && (
                  <div className="rp-suggest">
                    {dropoffSug.map((s, i) => (
                      <div key={i} className="rp-sugitem" onClick={() => chooseDropoff(s)}>{s.place_name}</div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rp-farebox">
                <div className="rp-farebig">${fare.toFixed(2)}</div>
                <div className="rp-rate">${baseFare.toFixed(2)} base + ${perMile.toFixed(2)} per mile{miles > 0 ? ' \u00b7 ' + miles.toFixed(1) + ' mi' : ''}</div>
              </div>
              <button className="rp-btn" disabled={!pickupCoord || !dropoffCoord || paying} onClick={startCheckout}>{paying ? 'Processing...' : 'Request On Time Taxi'}</button>
              {payError && <div className="rp-payerr">{payError}</div>}
            </>
          )}

          {stage === STAGE.SEARCHING && (
            <div className="rp-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div className="rp-row">
                <span className="rp-spin" />
                <span>Finding your driver...</span>
              </div>
              <div className="rp-muted">${fare.toFixed(2)} \u00b7 {miles.toFixed(1)} mi</div>
              <button className="rp-btn rp-ghost" onClick={() => setStage(STAGE.ONWAY)}>Simulate driver found</button>
              <button className="rp-btn rp-ghost" onClick={() => setStage(STAGE.PLAN)}>Cancel</button>
            </div>
          )}

          {stage === STAGE.ONWAY && (
            <div>
              <div className="rp-row">
                <div className="rp-avatar">D</div>
                <div>
                  <div style={{ fontWeight: 700 }}>Dennis &middot; On Time Taxi</div>
                  <div className="rp-muted">Your On Time Taxi driver</div>
                <a href="tel:+19302164166" className="rp-muted" style={{ display: 'block', color: '#4aa3ff', textDecoration: 'underline', marginTop: 2 }}>Call driver: (930) 216-4166</a>
                </div>
              </div>
              <div className="rp-tripline">${fare.toFixed(2)} \u00b7 {miles.toFixed(1)} mi \u00b7 On the way</div>
              {activeRide && !activeRide.rider_confirmed_pickup && activeRide.status !== 'picked_up' && (
                <button
                  className="rp-btn"
                  style={{ background: '#1a7f37', color: '#fff', width: '100%', marginBottom: 10 }}
                  onClick={async () => {
                    const bothNow = activeRide.driver_confirmed_pickup === true
                    const patch = bothNow
                      ? { rider_confirmed_pickup: true, status: 'picked_up' }
                      : { rider_confirmed_pickup: true }
                    const { data } = await supabase.from('rides').update(patch).eq('id', activeRide.id).select('*')
                    if (data && data[0]) setActiveRide(data[0])
                  }}
                >I&rsquo;m in the car &mdash; confirm pickup</button>
              )}
              {activeRide && activeRide.rider_confirmed_pickup && activeRide.status !== 'picked_up' && (
                <div className="rp-tripline" style={{ color: '#1a7f37' }}>Pickup confirmed &middot; waiting for your driver to confirm&hellip;</div>
              )}
              {activeRide && activeRide.status === 'picked_up' && (
                <div className="rp-tripline" style={{ color: '#1a7f37', fontWeight: 700 }}>You&rsquo;re picked up &middot; on your way</div>
              )}
              <button
                className="rp-btn rp-ghost"
                onClick={async () => {
                  try {
                    if (activeRide && activeRide.id) {
                      await supabase.from('rides').update({ status: 'canceled' }).eq('id', activeRide.id)
                    }
                  } catch (err) {}
                  if (watchIdRef.current != null && typeof navigator !== 'undefined' && navigator.geolocation) {
                    navigator.geolocation.clearWatch(watchIdRef.current)
                    watchIdRef.current = null
                  }
                  setActiveRide(null)
                  setStage(STAGE.PLAN)
                }}
              >Cancel ride</button>
            </div>
          )}
        </div>
      </div>
      <style jsx global>{`
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; overflow-x: hidden; }
        .rp-wrap { min-height: 100vh; background: #0e0e10; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .rp-shell { max-width: 460px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; }
        .rp-nav { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; }
        .rp-brand { font-weight: 800; font-size: 18px; color: #f5b301; text-decoration: none; letter-spacing: 0.3px; }
        .rp-navlink { color: #bbb; text-decoration: none; font-size: 14px; }
        .rp-map { position: relative; height: 300px; margin: 0 16px; border-radius: 16px; overflow: hidden; background: #1a1a1e; }
        .rp-mapreal { position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; }
        .rp-maptag { position: absolute; left: 12px; bottom: 12px; background: rgba(0,0,0,0.6); color: #f5b301; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 8px; z-index: 2; }
        .rp-card { background: #17171b; margin: 16px; margin-top: 14px; border-radius: 18px; padding: 18px; flex: 1; }
        .rp-label { font-weight: 700; font-size: 16px; margin-bottom: 14px; }
        .rp-field { position: relative; display: flex; align-items: center; background: #0e0e10; border: 1px solid #2a2a2e; border-radius: 12px; padding: 0 12px; margin-bottom: 10px; }
        .rp-dot { width: 10px; height: 10px; border-radius: 50%; margin-right: 10px; flex-shrink: 0; }
        .rp-dot.pick { background: #fff; }
        .rp-dot.drop { background: #f5b301; }
        .rp-input { flex: 1; background: transparent; border: none; outline: none; color: #fff; font-size: 15px; padding: 13px 0; }
        .rp-suggest { position: absolute; top: 100%; left: 0; right: 0; background: #1f1f24; border: 1px solid #2a2a2e; border-radius: 10px; margin-top: 4px; z-index: 5; overflow: hidden; }
        .rp-sugitem { padding: 11px 14px; font-size: 13px; color: #ddd; cursor: pointer; border-bottom: 1px solid #2a2a2e; }
        .rp-sugitem:hover { background: #2a2a30; }
        .rp-farebox { display: flex; align-items: baseline; justify-content: space-between; margin: 16px 0; }
        .rp-farebig { font-size: 30px; font-weight: 800; color: #f5b301; }
        .rp-rate { font-size: 12px; color: #888; text-align: right; }
        .rp-payerr { color: #ff6b6b; font-size: 13px; margin-top: 10px; text-align: center; }
        .rp-btn { width: 100%; background: #f5b301; color: #111; border: none; border-radius: 12px; padding: 15px; font-size: 16px; font-weight: 700; cursor: pointer; margin-top: 6px; }
        .rp-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .rp-ghost { background: transparent; color: #bbb; border: 1px solid #2a2a2e; margin-top: 10px; }
        .rp-row { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
        .rp-avatar { width: 44px; height: 44px; border-radius: 50%; background: #f5b301; color: #111; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; }
        .rp-spin { width: 20px; height: 20px; border: 3px solid #2a2a2e; border-top-color: #f5b301; border-radius: 50%; animation: rp-rot 0.8s linear infinite; }
        @keyframes rp-rot { to { transform: rotate(360deg); } }
        .rp-muted { color: #888; font-size: 13px; margin: 8px 0; }
        .rp-tripline { color: #ddd; font-size: 14px; margin: 12px 0; }
      `}</style>
    </div>
  )
}
