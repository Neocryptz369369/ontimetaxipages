'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

const BASE_FARE = 5.0
const PER_MILE = 2.0
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

const STAGE = { PLAN: 'plan', SEARCHING: 'searching', ONWAY: 'onway' } as const
type Stage = typeof STAGE[keyof typeof STAGE]
type Stop = { address: string; lat: number | null; lng: number | null }

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

async function geocode(q: string, userLoc?: number[] | null): Promise<any[]> {
  if (!q || !MAPBOX_TOKEN) return []
  const home: number[] = [-85.7550, 38.3981]
  const origin: number[] = userLoc && userLoc.length === 2 ? userLoc : home
  const url = 'https://api.mapbox.com/search/searchbox/v1/forward?q=' + encodeURIComponent(q) + '&limit=10&language=en&country=US&proximity=' + origin[0] + ',' + origin[1] + '&access_token=' + MAPBOX_TOKEN
  try {
    const r = await fetch(url)
    const j = await r.json()
    const raw: any[] = (j.features || []).filter((f: any) => f && f.geometry && f.geometry.coordinates && f.geometry.coordinates.length === 2)
    const feats: any[] = raw.map((f: any) => {
      const p: any = f.properties || {}
      const addr: string = (p.full_address || p.place_formatted || '').replace(', United States', '')
      const nm: string = p.name || ''
      let label: string = addr || nm
      if (nm && addr && addr.indexOf(nm) !== 0) label = nm + ' - ' + addr
      return { place_name: label, center: f.geometry.coordinates }
    })
    feats.sort((a: any, b: any) => milesBetween(origin, a.center) - milesBetween(origin, b.center))
    return feats.slice(0, 6)
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

async function routeAlong(points: number[][]): Promise<{ coords: number[][]; miles: number } | null> {
  if (!points || points.length < 2) return null
  const pts = points.length > 25 ? points.slice(0, 25) : points
  const path = pts.map((p: number[]) => p[0] + ',' + p[1]).join(';')
  const url = 'https://api.mapbox.com/directions/v5/mapbox/driving/' + path + '?alternatives=false&geometries=geojson&overview=full&steps=false&access_token=' + MAPBOX_TOKEN
  try {
    const r = await fetch(url)
    const j = await r.json()
    if (!j || !j.routes || !j.routes[0] || !j.routes[0].geometry) return null
    return { coords: j.routes[0].geometry.coordinates, miles: Number(j.routes[0].distance) / 1609.344 }
  } catch (e) {
    return null
  }
}

function drawRouteLine(m: any, coords: number[][]) {
  if (!m || !coords || coords.length < 2) return
  const data: any = { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } }
  const paint = () => {
    try {
      const existing = m.getSource('route-source')
      if (existing) { existing.setData(data); return }
      m.addSource('route-source', { type: 'geojson', data })
      m.addLayer({ id: 'route-layer', type: 'line', source: 'route-source', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#0080ff', 'line-width': 6, 'line-opacity': 0.9 } })
    } catch (e) {}
  }
  try {
    if (m.isStyleLoaded && m.isStyleLoaded()) paint()
    else m.once('idle', paint)
  } catch (e) {}
}

function clearRouteLine(m: any) {
  try {
    if (!m) return
    if (m.getLayer && m.getLayer('route-layer')) m.removeLayer('route-layer')
    if (m.getSource && m.getSource('route-source')) m.removeSource('route-source')
  } catch (e) {}
}

export default function RidePage() {
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [pickupCoord, setPickupCoord] = useState<number[] | null>(null)
  const [dropoffCoord, setDropoffCoord] = useState<number[] | null>(null)
  const [pickupSug, setPickupSug] = useState<any[]>([])
  const [dropoffSug, setDropoffSug] = useState<any[]>([])
  const [stage, setStage] = useState<Stage>(STAGE.PLAN)
  const [stops, setStops] = useState<Stop[]>([])
  const [stopSug, setStopSug] = useState<any[]>([])
  const [activeStop, setActiveStop] = useState<number>(-1)
  const stopKey: string = stops.map((s: Stop) => (s.lat == null || s.lng == null ? 'x' : String(s.lng) + ',' + String(s.lat))).join('|')
  const [miles, setMiles] = useState(0)
  const [baseFare, setBaseFare] = useState(BASE_FARE)
  const [perMile, setPerMile] = useState(PER_MILE)
  const [tipPct, setTipPct] = useState<number>(0)
  const [customTip, setCustomTip] = useState('')

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
  const stopMarkersRef = useRef<any[]>([])
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
    if (!mapsReady || !mapRef.current || !activeRide) return
    const m = mapRef.current
    const started = activeRide.status === 'picked_up'
    const pts: number[][] = []
    const dLng = driverPos ? driverPos.lng : activeRide.driver_lng
    const dLat = driverPos ? driverPos.lat : activeRide.driver_lat
    if (dLat != null && dLng != null) pts.push([Number(dLng), Number(dLat)])
    if (!started && activeRide.pickup_lat != null && activeRide.pickup_lng != null) pts.push([Number(activeRide.pickup_lng), Number(activeRide.pickup_lat)])
    if (activeRide.dropoff_lat != null && activeRide.dropoff_lng != null) pts.push([Number(activeRide.dropoff_lng), Number(activeRide.dropoff_lat)])
    if (pts.length < 2) return
    let cancelled = false
    routeAlong(pts).then((r) => {
      if (cancelled || !r) return
      drawRouteLine(m, r.coords)
    })
    return () => { cancelled = true }
  }, [activeRide, driverPos, mapsReady])

  useEffect(() => {
    if (!pickup || pickupCoord) { setPickupSug([]); return }
    const t = setTimeout(async () => { setPickupSug(await geocode(pickup, pickupCoord)) }, 250)
    return () => clearTimeout(t)
  }, [pickup, pickupCoord])

  useEffect(() => {
    if (!dropoff || dropoffCoord) { setDropoffSug([]); return }
    const t = setTimeout(async () => { setDropoffSug(await geocode(dropoff, pickupCoord)) }, 250)
    return () => clearTimeout(t)
  }, [dropoff, dropoffCoord, pickupCoord])

  useEffect(() => {
    const map = mapRef.current
    const mapboxgl = (window as any).mapboxgl
    if (!map || !mapboxgl) return
    if (pickupCoord) {
      if (pickMarkerRef.current) pickMarkerRef.current.remove()
      pickMarkerRef.current = new mapboxgl.Marker({ color: '#111', draggable: true }).setLngLat(pickupCoord).addTo(map)
      pickMarkerRef.current.on('dragend', async () => {
        const ll = pickMarkerRef.current.getLngLat()
        const lng = ll.lng
        const lat = ll.lat
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
      })
    }
    if (dropoffCoord) {
      if (dropMarkerRef.current) dropMarkerRef.current.remove()
      dropMarkerRef.current = new mapboxgl.Marker({ color: '#f5b301', draggable: true }).setLngLat(dropoffCoord).addTo(map)
      dropMarkerRef.current.on('dragend', async () => {
        const ll = dropMarkerRef.current.getLngLat()
        const lng = ll.lng
        const lat = ll.lat
        setDropoffCoord([lng, lat])
        try {
          if (MAPBOX_TOKEN) {
            const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + lng + ',' + lat + '.json?access_token=' + MAPBOX_TOKEN
            const res = await fetch(url)
            const json = await res.json()
            const name = json && json.features && json.features[0] ? json.features[0].place_name : ''
            setDropoff(name || (lat.toFixed(5) + ', ' + lng.toFixed(5)))
          } else {
            setDropoff(lat.toFixed(5) + ', ' + lng.toFixed(5))
          }
        } catch (err) {
          setDropoff(lat.toFixed(5) + ', ' + lng.toFixed(5))
        }
        setDropoffSug([])
      })
    }
    const stopMarks: any[] = stopMarkersRef.current || []
    for (const mk of stopMarks) { try { mk.remove() } catch (e2) {} }
    stopMarkersRef.current = []
    stops.forEach((s: Stop, si: number) => {
      if (s.lat == null || s.lng == null) return
      const el = document.createElement('div')
      el.className = 'rp-stopmark'
      el.textContent = String(si + 1)
      const mk = new mapboxgl.Marker({ element: el, draggable: true }).setLngLat([s.lng, s.lat]).addTo(map)
      mk.on('dragend', async () => {
        const ll = mk.getLngLat()
        let nm = ''
        try {
          if (MAPBOX_TOKEN) {
            const res = await fetch('https://api.mapbox.com/geocoding/v5/mapbox.places/' + ll.lng + ',' + ll.lat + '.json?access_token=' + MAPBOX_TOKEN)
            const json = await res.json()
            nm = json && json.features && json.features[0] ? json.features[0].place_name : ''
          }
        } catch (err) { nm = '' }
        updateStop(si, { address: nm || (ll.lat.toFixed(5) + ', ' + ll.lng.toFixed(5)), lng: ll.lng, lat: ll.lat })
      })
      stopMarkersRef.current.push(mk)
    })
    if (pickupCoord && dropoffCoord) {
      const b = new mapboxgl.LngLatBounds()
      b.extend(pickupCoord)
      for (const s of stops) { if (s.lat != null && s.lng != null) b.extend([s.lng, s.lat]) }
      b.extend(dropoffCoord)
      map.fitBounds(b, { padding: 70, maxZoom: 14 })
    } else if (pickupCoord) {
      map.flyTo({ center: pickupCoord, zoom: 13 })
    } else if (dropoffCoord) {
      map.flyTo({ center: dropoffCoord, zoom: 13 })
    }
  }, [pickupCoord, dropoffCoord, stopKey, mapsReady])

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

  function updateStop(idx: number, patch: any) {
    setStops((prev: Stop[]) => prev.map((s: Stop, i: number) => (i === idx ? { ...s, ...patch } : s)))
  }

  function chooseStop(idx: number, feat: any) {
    updateStop(idx, { address: feat.place_name, lng: feat.center[0], lat: feat.center[1] })
    setStopSug([])
    setActiveStop(-1)
  }

  async function dropPinForStop(idx: number) {
    const map = mapRef.current
    if (!map) { alert('Map is still loading, please try again.'); return }
    const ctr = map.getCenter()
    const lng = ctr.lng
    const lat = ctr.lat
    let name = ''
    try {
      if (MAPBOX_TOKEN) {
        const res = await fetch('https://api.mapbox.com/geocoding/v5/mapbox.places/' + lng + ',' + lat + '.json?access_token=' + MAPBOX_TOKEN)
        const json = await res.json()
        name = json && json.features && json.features[0] ? json.features[0].place_name : ''
      }
    } catch (err) { name = '' }
    updateStop(idx, { address: name || (lat.toFixed(5) + ', ' + lng.toFixed(5)), lng: lng, lat: lat })
    setStopSug([])
    setActiveStop(-1)
  }

  useEffect(() => {
    if (activeStop < 0 || activeStop >= stops.length) { setStopSug([]); return }
    const s = stops[activeStop]
    if (!s || !s.address || s.lat != null) { setStopSug([]); return }
    const t = setTimeout(async () => { setStopSug(await geocode(s.address, pickupCoord)) }, 250)
    return () => clearTimeout(t)
  }, [activeStop, stops, pickupCoord])

  useEffect(() => {
    if (activeRide) return
    const pts: number[][] = []
    if (pickupCoord) pts.push(pickupCoord)
    for (const s of stops) { if (s.lat != null && s.lng != null) pts.push([s.lng as number, s.lat as number]) }
    if (dropoffCoord) pts.push(dropoffCoord)
    if (!pickupCoord || !dropoffCoord || pts.length < 2) {
      setMiles(0)
      if (mapRef.current) clearRouteLine(mapRef.current)
      return
    }
    let straight = 0
    for (let i = 1; i < pts.length; i++) straight += milesBetween(pts[i - 1], pts[i])
    setMiles(straight)
    let cancelled = false
    routeAlong(pts).then((r) => {
      if (cancelled || !r) return
      setMiles(r.miles)
      if (mapRef.current) drawRouteLine(mapRef.current, r.coords)
    })
    return () => { cancelled = true }
  }, [pickupCoord, dropoffCoord, stopKey, mapsReady, activeRide])


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
          const meta = (user.user_metadata || {})
          const riderName = meta.full_name || meta.name || user.email || ''
          const riderPhone = meta.phone || meta.phone_number || ''
          const rideRow: any = {
            rider_id: user.id,
            rider_name: riderName,
            rider_phone: riderPhone,
            pickup,
            dropoff,
            fare: rideFare,
            status: 'requested',
            pickup_lat: pickupCoord ? pickupCoord[1] : null,
            pickup_lng: pickupCoord ? pickupCoord[0] : null,
            dropoff_lat: dropoffCoord ? dropoffCoord[1] : null,
            dropoff_lng: dropoffCoord ? dropoffCoord[0] : null,
          }
          let rideInsertErr: any = null
          const firstTry = await supabase.from('rides').insert({ ...rideRow, tip })
          rideInsertErr = firstTry.error
          if (rideInsertErr) {
            const retry = await supabase.from('rides').insert(rideRow)
            rideInsertErr = retry.error
          }
          if (rideInsertErr) {
            setPayError('Could not create your ride: ' + rideInsertErr.message)
            setPaying(false)
            return
          }
      }
      } catch (rideErr) {
        // non-blocking: continue to checkout even if ride logging fails
      }
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fare, pickup, dropoff, miles, tip, total }),
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

  async function cancelRideRequest() {
    const ride = activeRide
    setStage(STAGE.PLAN)
    setActiveRide(null)
    if (ride && ride.id) {
      try { await supabase.from('rides').update({ status: 'canceled' }).eq('id', ride.id) } catch (e) {}
    }
  }

  const fare = miles > 0 ? baseFare + perMile * miles : baseFare
  const tip = tipPct < 0 ? Math.max(0, Number(customTip) || 0) : Math.round(fare * tipPct) / 100
  const total = fare + tip
  const tripFare = activeRide && activeRide.fare != null ? Number(activeRide.fare) : total
  const tripMiles = activeRide && activeRide.fare != null ? Math.max(0, (Number(activeRide.fare) - baseFare) / (perMile || 1)) : miles
  const tripStatus = activeRide && activeRide.status === 'picked_up' ? 'On the trip' : 'On the way'

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
        .in('status', ['requested', 'accepted', 'picked_up'])
        .gte('created_at', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
      if (!alive) return
      const ride = data && data[0] ? data[0] : null
      setActiveRide(ride)
      if (!ride) {
        channel = supabase
          .channel('ride-pending-' + user.id)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'rides', filter: 'rider_id=eq.' + user.id }, (payload: any) => {
            const r = payload.new
            if (r && (r.status === 'requested' || r.status === 'accepted' || r.status === 'picked_up')) {
              if (channel) { supabase.removeChannel(channel); channel = null }
              boot()
            }
          })
          .subscribe()
        return
      }
      setStage(ride.status === 'requested' ? STAGE.SEARCHING : STAGE.ONWAY)
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
          if (r.status !== 'requested' && r.status !== 'accepted' && r.status !== 'picked_up') {
            setActiveRide(null)
            setStage(STAGE.PLAN)
            return
          }
          setActiveRide(r)
          if (r.status === 'requested') setStage(STAGE.SEARCHING)
          else if (r.status === 'accepted' || r.status === 'picked_up') setStage(STAGE.ONWAY)
          if (r.driver_lat != null && r.driver_lng != null) setDriverPos({ lat: r.driver_lat, lng: r.driver_lng })
        })
        .subscribe()
    }
    boot()
    pollId = setInterval(async () => {
      if (!alive) return
      const { data: u } = await supabase.auth.getUser()
      if (!u || !u.user) return
      const { data: rows } = await supabase.from('rides').select('*').eq('rider_id', u.user.id).in('status', ['requested', 'accepted', 'picked_up']).gte('created_at', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()).order('created_at', { ascending: false }).limit(1)
      const r = rows && rows[0] ? rows[0] : null
      if (!alive || !r) return
      if (r.status !== 'requested' && r.status !== 'accepted' && r.status !== 'picked_up') return
      setActiveRide(r)
      setStage(r.status === 'requested' ? STAGE.SEARCHING : STAGE.ONWAY)
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
            {activeRide && (activeRide.status === 'requested' || activeRide.status === 'accepted' || activeRide.status === 'picked_up') && (
            <div style={{ marginBottom: '14px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(216,27,27,0.12)', border: '1px solid rgba(216,27,27,0.35)' }}>
              <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                    {activeRide.status === 'picked_up' ? 'You are on your way' : (activeRide.status === 'requested' ? 'Ride requested' : 'Your driver is on the way')}
              </div>
              {activeRide.driver_name && (
                <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                  Driver: <strong>{activeRide.driver_name}</strong>
                  {activeRide.vehicle ? ' - ' + activeRide.vehicle : ''}
                  {activeRide.plate ? ' - ' + activeRide.plate : ''}
                </div>
              )}
              {activeRide.driver_phone && (
                <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                  Call driver: <a href={'tel:' + activeRide.driver_phone} style={{ color: '#ffb4b4' }}>{activeRide.driver_phone}</a>
                </div>
              )}
              <div style={{ fontSize: '13px', opacity: 0.85 }}>
                    {driverPos ? 'Live location updating on the map above.' : (activeRide.status === 'requested' ? 'Waiting for a driver to accept your ride.' : 'Waiting for your driver location...')}
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
              <button
                type="button"
                className="rp-btn rp-ghost"
                style={{ marginTop: 8, marginLeft: 8, fontSize: '13px', padding: '8px 12px' }}
                onClick={async () => {
                  const map = mapRef.current
                  if (!map) { alert('Map is still loading, please try again.'); return }
                  const c = map.getCenter()
                  const lng = c.lng
                  const lat = c.lat
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
                }}
              >Drop a pin on the map</button>
              <div className="rp-muted" style={{ marginTop: 6, fontSize: '12px' }}>Drop a pin, then drag it anywhere to set your exact pickup.</div>
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
              <button
                type="button"
                className="rp-btn rp-ghost"
                style={{ marginTop: 8, marginLeft: 8, fontSize: '13px', padding: '8px 12px' }}
                onClick={async () => {
                  const map = mapRef.current
                  if (!map) { alert('Map is still loading, please try again.'); return }
                  const c = map.getCenter()
                  const lng = c.lng
                  const lat = c.lat
                  setDropoffCoord([lng, lat])
                  try {
                    if (MAPBOX_TOKEN) {
                      const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + lng + ',' + lat + '.json?access_token=' + MAPBOX_TOKEN
                      const res = await fetch(url)
                      const json = await res.json()
                      const name = json && json.features && json.features[0] ? json.features[0].place_name : ''
                      setDropoff(name || (lat.toFixed(5) + ', ' + lng.toFixed(5)))
                    } else {
                      setDropoff(lat.toFixed(5) + ', ' + lng.toFixed(5))
                    }
                  } catch (err) {
                    setDropoff(lat.toFixed(5) + ', ' + lng.toFixed(5))
                  }
                  setDropoffSug([])
                }}
              >Drop a pin on the map</button>
              <div className="rp-muted" style={{ marginTop: 6, fontSize: '12px' }}>Drop a pin, then drag it anywhere to set your exact dropoff.</div>
                {dropoffSug.length > 0 && (
                  <div className="rp-suggest">
                    {dropoffSug.map((s, i) => (
                      <div key={i} className="rp-sugitem" onClick={() => chooseDropoff(s)}>{s.place_name}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Multi-stop Section */}
              <div className="rp-row" style={{ marginBottom: 10 }}>
                <button type="button" className="rp-btn-small" onClick={() => setStops([...stops, { address: '', lat: null, lng: null }])}>+ Add Stop</button>
                <span className="rp-muted" style={{ margin: 0, fontSize: '12px' }}>Add as many stops as you need</span>
              </div>

              {stops.map((stop, idx) => (
                <div key={idx} className="rp-field">
                  <span className="rp-dot stop" />
                  <input
                    className="rp-input"
                    placeholder={'Stop ' + (idx + 1) + ' address or business'}
                    value={stop.address}
                    onFocus={() => setActiveStop(idx)}
                    onChange={(ev) => { setActiveStop(idx); updateStop(idx, { address: ev.target.value, lat: null, lng: null }) }}
                  />
                  <button
                    type="button"
                    className="rp-btn rp-ghost"
                    style={{ marginTop: 8, fontSize: '13px', padding: '8px 12px' }}
                    onClick={() => dropPinForStop(idx)}
                  >Drop a pin on the map</button>
                  <button
                    type="button"
                    className="rp-btn-small"
                    style={{ marginTop: 8, marginLeft: 8 }}
                    onClick={() => { setActiveStop(-1); setStopSug([]); setStops(stops.filter((_, i) => i !== idx)) }}
                  >Remove</button>
                  <div className="rp-muted" style={{ marginTop: 6, fontSize: '12px' }}>Stop {idx + 1} - search a business or address, or drop a pin anywhere.</div>
                  {activeStop === idx && stopSug.length > 0 && (
                    <div className="rp-suggest">
                      {stopSug.map((s, i) => (
                        <div key={i} className="rp-sugitem" onClick={() => chooseStop(idx, s)}>{s.place_name}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="rp-farebox">
                <div className="rp-farebig">${total.toFixed(2)}</div>
                <div className="rp-rate">${baseFare.toFixed(2)} base + ${perMile.toFixed(2)} per mile{miles > 0 ? ' \u00b7 ' + miles.toFixed(1) + ' mi' : ''}{tip > 0 ? ' \u00b7 fare $' + fare.toFixed(2) + ' + tip $' + tip.toFixed(2) : ''}</div>
              </div>
              <div className="rp-tipbox">
                <div className="rp-tiplabel">Add a tip for your driver (optional)</div>
                <div className="rp-tiprow">
                  {[0, 15, 20, 25].map((p: number) => (
                    <button type="button" key={p} className={'rp-tipbtn' + (tipPct === p ? ' rp-tipon' : '')} onClick={() => { setTipPct(p); setCustomTip('') }}>{p === 0 ? 'No tip' : p + '%'}</button>
                  ))}
                  <button type="button" className={'rp-tipbtn' + (tipPct < 0 ? ' rp-tipon' : '')} onClick={() => setTipPct(-1)}>Other</button>
                </div>
                {tipPct < 0 && (
                  <input className="rp-input rp-tipinput" type="number" min="0" step="1" placeholder="Tip amount ($)" value={customTip} onChange={(e) => setCustomTip(e.target.value)} />
                )}
              </div>
              <button className="rp-btn" disabled={!pickupCoord || !dropoffCoord || paying || stops.some((s: Stop) => s.address.trim().length > 0 && (s.lat == null || s.lng == null))} onClick={startCheckout}>{paying ? 'Processing...' : 'Request On Time Taxi'}</button>
              {payError && <div className="rp-payerr">{payError}</div>}
            </>
          )}

          {stage === STAGE.SEARCHING && (
            <div className="rp-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div className="rp-row">
                <span className="rp-spin" />
                <span>Finding your driver...</span>
              </div>
                  <div className="rp-muted">${tripFare.toFixed(2)} · {tripMiles.toFixed(1)} mi</div>
                <button className="rp-btn rp-ghost" onClick={cancelRideRequest}>Cancel ride request</button>
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
                <div className="rp-tripline">${tripFare.toFixed(2)} · {tripMiles.toFixed(1)} mi · {tripStatus}</div>
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
      .rp-tipbox { margin: 10px 0 14px; }
      .rp-tiplabel { font-size: 13px; color: #bbb; margin-bottom: 6px; }
      .rp-tiprow { display: flex; gap: 6px; flex-wrap: wrap; }
      .rp-tipbtn { flex: 1 1 auto; padding: 8px 10px; border-radius: 8px; border: 1px solid #333; background: #1a1a1a; color: #ddd; font-size: 13px; font-weight: 700; cursor: pointer; }
      .rp-tipon { background: #f5b301; color: #111; border-color: #f5b301; }
      .rp-tipinput { margin-top: 8px; }
        .rp-payerr { color: #ff6b6b; font-size: 13px; margin-top: 10px; text-align: center; }
        .rp-btn { width: 100%; background: #f5b301; color: #111; border: none; border-radius: 12px; padding: 15px; font-size: 16px; font-weight: 700; cursor: pointer; margin-top: 6px; }
        .rp-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .rp-ghost { background: transparent; color: #bbb; border: 1px solid #2a2a2e; margin-top: 10px; }
        .rp-row { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
        .rp-avatar { width: 44px; height: 44px; border-radius: 50%; background: #f5b301; color: #111; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; }
        .rp-spin { width: 20px; height: 20px; border: 3px solid #2a2a2e; border-top-color: #f5b301; border-radius: 50%; animation: rp-rot 0.8s linear infinite; }
        @keyframes rp-rot { to { transform: rotate(360deg); } }
        .rp-muted { color: #888; font-size: 13px; margin: 8px 0; }
        .rp-stopmark { width: 26px; height: 26px; border-radius: 50%; background: #9b8cff; color: #111; font-weight: 800; font-size: 13px; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; cursor: grab; }
        .rp-tripline { color: #ddd; font-size: 14px; margin: 12px 0; }
        .rp-field { flex-wrap: wrap; }
        .rp-field .rp-input { flex: 1 1 auto; min-width: 55%; }
        .rp-field .rp-btn { width: auto; flex: 0 0 auto; white-space: nowrap; }
        .rp-field .rp-muted { flex: 1 1 100%; margin: 4px 0 0 0; }
        .rp-btn-small { background: transparent; color: #f5b301; border: 1px solid #2a2a2e; border-radius: 10px; padding: 8px 14px; font-size: 13px; font-weight: 700; cursor: pointer; }
        .rp-btn-small:hover { background: #1f1f24; }
        .rp-dot.multi { background: #6ea8fe; }
        .rp-dot.stop { background: #9b8cff; }
      `}</style>
    </div>
  )
}
