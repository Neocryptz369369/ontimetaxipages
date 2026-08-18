'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import RideChat from '../../components/RideChat'
import PanicButton from '../../components/PanicButton'
import RatingBox, { starRow } from '../../components/RatingBox'
import Ticker from '../../components/Ticker'

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

function digitsOnly(v: any) {
  return String(v === null || v === undefined ? '' : v).replace(/[^0-9]/g, '')
}

function prettyPhone(v: any) {
  const d = digitsOnly(v)
  const ten = d.length === 11 && d.charAt(0) === '1' ? d.slice(1) : d
  if (ten.length === 10) return ten.slice(0, 3) + '-' + ten.slice(3, 6) + '-' + ten.slice(6)
  return ten
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
  const [paidRideId, setPaidRideId] = useState<string>('')
  const [customTip, setCustomTip] = useState('')
  const [pendingRate, setPendingRate] = useState<any>(null)
  const [rateBusy, setRateBusy] = useState(false)
  const [rateError, setRateError] = useState('')
  const [driverStars, setDriverStars] = useState<any>(null)

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
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('otRebook')
      if (raw) {
        const again = JSON.parse(raw)
        sessionStorage.removeItem('otRebook')
        if (again.pickup) setPickup(String(again.pickup))
        if (again.dropoff) setDropoff(String(again.dropoff))
        if (again.pickupLat != null && again.pickupLng != null) setPickupCoord([Number(again.pickupLng), Number(again.pickupLat)])
        if (again.dropoffLat != null && again.dropoffLng != null) setDropoffCoord([Number(again.dropoffLng), Number(again.dropoffLat)])
      }
    } catch (e) {}
    loadPendingRate()
  }, [])

  async function loadPendingRate() {
    try {
      const got = await supabase.auth.getSession()
      const token = got.data.session ? got.data.session.access_token : ''
      if (!token) return
      const res = await fetch('/api/ride-history', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: token, role: 'rider' }) })
      const data = await res.json()
      if (res.ok) setPendingRate(data.pending ? data.pending : null)
    } catch (e) {}
  }

  async function sendMyRating(stars: number, review: string) {
    if (!pendingRate) return
    setRateBusy(true)
    setRateError('')
    try {
      const got = await supabase.auth.getSession()
      const token = got.data.session ? got.data.session.access_token : ''
      const res = await fetch('/api/rate-ride', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: token, rideId: pendingRate.id, role: 'rider', stars: stars, review: review }) })
      const data = await res.json()
      setRateBusy(false)
      if (!res.ok) { setRateError(String(data.error || 'Could not save your rating.')); return }
      setPendingRate(null)
    } catch (e) {
      setRateBusy(false)
      setRateError('Could not save your rating.')
    }
  }

  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')
  const [mapsReady, setMapsReady] = useState(false)
  const mapDivRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const pickMarkerRef = useRef<any>(null)
  const dropMarkerRef = useRef<any>(null)
  const stopMarkersRef = useRef<any[]>([])
  const [activeRide, setActiveRide] = useState<any>(null)
  const [riderToken, setRiderToken] = useState('')
  useEffect(() => {
    let alive = true
    supabase.auth.getSession().then((got: any) => {
      const t = got && got.data && got.data.session ? got.data.session.access_token : ''
      if (alive) setRiderToken(t || '')
    })
    return () => { alive = false }
  }, [])
  const [driverPos, setDriverPos] = useState<{ lat: number; lng: number } | null>(null)
  const [driverCard, setDriverCard] = useState<any>(null)
  const [nowTs, setNowTs] = useState<number>(Date.now())
  const [backedOut, setBackedOut] = useState<boolean>(false)
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search)
      if (q.get('canceled') === '1') {
        window.localStorage.setItem('ott_pay_backed_out', '1')
        setBackedOut(true)
      } else if (window.localStorage.getItem('ott_pay_backed_out') === '1') {
        setBackedOut(true)
      }
    } catch (e) {}
  }, [])
  useEffect(() => {
    const id = setInterval(() => { setNowTs(Date.now()) }, 1000)
    return () => { clearInterval(id) }
  }, [])
  const [geoError, setGeoError] = useState('')
  const [myProfile, setMyProfile] = useState<any>(null)
  const [myPhoto, setMyPhoto] = useState('')
  const [photoBusy, setPhotoBusy] = useState(false)
  const [photoMsg, setPhotoMsg] = useState('')
  const [rName, setRName] = useState('')
  const [rPhone, setRPhone] = useState('')
  const [rBusy, setRBusy] = useState(false)
  const [rMsg, setRMsg] = useState('')
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

  useEffect(() => {
    let alive = true
    async function loadMe() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !alive) return
      let got: any = await supabase.from('profiles').select('full_name, phone, photo_url').eq('id', user.id).maybeSingle()
      if (got.error) {
        got = await supabase.from('profiles').select('full_name, photo_url').eq('id', user.id).maybeSingle()
      }
      if (!alive) return
      const row: any = got && got.data ? got.data : null
      const meta: any = user.user_metadata || {}
      setMyProfile({ full_name: (row && row.full_name) ? String(row.full_name) : String(meta.full_name || meta.name || '') })
      setRName((row && row.full_name) ? String(row.full_name) : String(meta.full_name || meta.name || ''))
      setRPhone(prettyPhone((row && row.phone) ? String(row.phone) : String(meta.phone || '')))
      const raw = row && row.photo_url ? String(row.photo_url) : ''
      if (!raw) { setMyPhoto(''); return }
      if (raw.indexOf('http') === 0) { setMyPhoto(raw); return }
      const pub = supabase.storage.from('profile-photos').getPublicUrl(raw)
      setMyPhoto(pub && pub.data ? pub.data.publicUrl : '')
    }
    loadMe()
    return () => { alive = false }
  }, [])

  async function saveRiderDetails() {
    setRBusy(true)
    setRMsg('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setRMsg('Please sign in again.')
        setRBusy(false)
        return
      }
      const cleanName = String(rName || '').trim().slice(0, 120)
      const cleanPhone = prettyPhone(rPhone)
      const typedPhone = String(rPhone || '').trim()
      if (typedPhone !== '' && digitsOnly(typedPhone).length !== 10 && digitsOnly(typedPhone).length !== 11) {
        setRMsg('That phone number does not look right. Please put in a 10 digit number, like 930-216-4166.')
        setRBusy(false)
        return
      }
      if (!cleanName) {
        setRMsg('Please put in your name so your driver knows who they are picking up.')
        setRBusy(false)
        return
      }
      let upd: any = await supabase.from('profiles').update({ full_name: cleanName, phone: cleanPhone }).eq('id', user.id)
      if (upd.error) {
        upd = await supabase.from('profiles').update({ full_name: cleanName }).eq('id', user.id)
      }
      if (upd.error) {
        setRMsg('That could not be saved. Please try again.')
      } else {
        setMyProfile({ full_name: cleanName })
        setRName(cleanName)
        setRPhone(cleanPhone)
        setRMsg('Saved. Your driver will see this.')
      }
    } catch (e) {
      setRMsg('That could not be saved. Please try again.')
    }
    setRBusy(false)
  }

  async function saveMyPhoto(file: File | null) {
    if (!file) return
    setPhotoBusy(true)
    setPhotoMsg('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setPhotoMsg('Please sign in again.')
        setPhotoBusy(false)
        return
      }
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
      const path = user.id + '/avatar.' + ext
      const up = await supabase.storage.from('profile-photos').upload(path, file, { upsert: true, contentType: file.type })
      if (up.error) {
        setPhotoMsg('That picture could not be saved. Please try another one.')
        setPhotoBusy(false)
        return
      }
      const upd = await supabase.from('profiles').update({ photo_url: path }).eq('id', user.id)
      if (upd.error) {
        setPhotoMsg('That picture could not be saved. Please try again.')
        setPhotoBusy(false)
        return
      }
      const pub = supabase.storage.from('profile-photos').getPublicUrl(path)
      const url = pub && pub.data ? pub.data.publicUrl : ''
      setMyPhoto(url ? url + '?v=' + String(Date.now()) : '')
      setPhotoMsg('Your photo is saved. This is the photo your driver will see.')
    } catch (e) {
      setPhotoMsg('That picture could not be saved. Please try again.')
    }
    setPhotoBusy(false)
  }

  async function startCheckout() {
    if (myProfile && !myPhoto) {
      setPayError('Please add a photo of yourself first. Your driver has to know who they are picking up.')
      return
    }

    if (pendingRate) {
      setPayError('Please rate your last ride first. The stars are at the top of this page.')
      return
    }

    try { window.localStorage.removeItem('ott_pay_backed_out') } catch (e) {}
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
          const riderPhone = prettyPhone(rPhone) || meta.phone || meta.phone_number || ''
          const stopsPayload = stops.filter((st: Stop) => st.address.trim().length > 0).map((st: Stop) => ({ address: st.address, lat: st.lat, lng: st.lng }))
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
          let newRideId: any = null
          const firstTry = await supabase.from('rides').insert({ ...rideRow, tip, stops: stopsPayload }).select()
          rideInsertErr = firstTry.error
          if (rideInsertErr) {
            const retry = await supabase.from('rides').insert(rideRow).select()
            rideInsertErr = retry.error
            if (!rideInsertErr && retry.data && retry.data[0]) newRideId = retry.data[0].id
          } else if (firstTry.data && firstTry.data[0]) {
            newRideId = firstTry.data[0].id
          }
          try {
            if (newRideId && typeof window !== 'undefined') {
              window.localStorage.setItem('ott_ride_id', String(newRideId))
              window.localStorage.removeItem('ott_paid_ride')
            }
          } catch (e) {}
          if (rideInsertErr) {
            setPayError('Could not create your ride: ' + rideInsertErr.message)
            setPaying(false)
            return
          }
      }
      } catch (rideErr) {
        // non-blocking: continue to checkout even if ride logging fails
      }
      let __rid: any = null
      try { __rid = typeof window !== 'undefined' ? window.localStorage.getItem('ott_ride_id') : null } catch (e) {}
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fare, pickup, dropoff, miles, tip, total, rideId: __rid }),
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

  useEffect(() => {
    try {
      const v = window.localStorage.getItem('ott_paid_ride')
      if (v) setPaidRideId(v)
    } catch (e) {}
  }, [activeRide])

  const ridePaid = !!activeRide && (((activeRide as any).paid === true) || (paidRideId !== '' && String(activeRide.id) === paidRideId))
  const TRACK_DELAY_MS = 3 * 60 * 1000
  const trackDeadline = activeRide && (activeRide as any).created_at ? new Date((activeRide as any).created_at).getTime() + TRACK_DELAY_MS : 0
  const trackMsLeft = trackDeadline > 0 ? Math.max(0, trackDeadline - nowTs) : 0
  const trackUnlocked = !!activeRide && (ridePaid || backedOut || (trackDeadline > 0 && nowTs >= trackDeadline))
  const trackCountdown = Math.floor(trackMsLeft / 60000) + ':' + ('0' + Math.floor((trackMsLeft % 60000) / 1000)).slice(-2)

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


  useEffect(() => {
    const id = activeRide && activeRide.driver_id ? activeRide.driver_id : null
    if (!id) { setDriverCard(null); return }
    let active = true
    const makeCard = (row: any) => {
      let photo = ''
      if (row.photo_url) {
        if (String(row.photo_url).indexOf('http') === 0) {
          photo = String(row.photo_url)
        } else {
          const pub = supabase.storage.from('profile-photos').getPublicUrl(String(row.photo_url))
          photo = pub && pub.data ? pub.data.publicUrl : ''
        }
      }
      const carWords = [row.vehicle_year, row.vehicle_color, row.vehicle_make, row.vehicle_model]
        .filter((x: any) => !!x)
        .join(' ')
      return {
        full_name: row.full_name || 'Your driver',
        driver_code: row.driver_code || '',
        photo: photo,
        phone: row.phone || '',
        car: carWords,
        plate: row.vehicle_plate || '',
      }
    }
    const useRpc = () => {
      supabase.rpc('driver_card', { p_driver_id: id }).then((res: any) => {
        if (!active) return
        const row = res && res.data && res.data.length ? res.data[0] : null
        if (!row) { setDriverCard(null); return }
        setDriverCard(makeCard(row))
      })
    }
    fetch('/api/driver-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driverId: id }),
    })
      .then((r: any) => r.json())
      .then((d: any) => {
        if (!active) return
        if (d && d.driver) { setDriverCard(makeCard(d.driver)); return }
        useRpc()
      })
      .catch(() => { if (active) useRpc() })
    return () => { active = false }
  }, [activeRide])

  useEffect(() => {
    const id = activeRide && activeRide.driver_id ? activeRide.driver_id : null
    if (!id) { setDriverStars(null); return }
    let alive = true
    fetch('/api/ratings' + '?type=driver&id=' + id)
      .then((r: any) => r.json())
      .then((d: any) => { if (alive) setDriverStars(d) })
      .catch(() => {})
    return () => { alive = false }
  }, [activeRide])

  return (
    <div className="rp-wrap">
      <div className="rp-shell">
        <nav className="rp-nav">
          <Link href="/" className="rp-brand">On Time Taxi</Link>
          <Link href="/" className="rp-navlink">Home</Link>
          <Link href="/report-driver" className="rp-navlink">Report a driver</Link>
          <Link href="/ride-history" className="rp-navlink">History</Link>
          <button type="button" onClick={handleSignOut} className="rp-navlink" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button>
        </nav>

        <Ticker dark={true} />

        <div className="rp-map">
          <div ref={mapDivRef} className="rp-mapreal" />
          <div className="rp-maptag">On Time Taxi</div>
        </div>

        <div className="rp-card">
          {myProfile ? (
            <div
              style={{
                marginBottom: 14,
                padding: '12px 14px',
                borderRadius: 12,
                background: myPhoto ? 'rgba(255,255,255,0.06)' : 'rgba(216,27,27,0.14)',
                border: myPhoto ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(216,27,27,0.45)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {myPhoto ? (
                  <img src={myPhoto} alt="Your photo" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid #f5b301' }} />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#2a2a2e', border: '2px solid rgba(216,27,27,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#f3f4f6', textAlign: 'center', lineHeight: 1.1 }}>No photo</div>
                )}
                <div>
                  <div style={{ fontWeight: 700 }}>{myProfile.full_name ? myProfile.full_name : 'Your profile'}</div>
                  {myPhoto ? (
                    <div className="rp-muted">This is the photo your driver sees when they come to get you.</div>
                  ) : (
                    <div style={{ color: '#ffb4b4', fontWeight: 700, fontSize: 13, lineHeight: 1.45 }}>
                      A photo of you is required before you can book a ride. Your driver has to know who they are picking up.
                    </div>
                  )}
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <input
                  type="file"
                  accept="image/*"
                  disabled={photoBusy}
                  onChange={(e) => saveMyPhoto(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                  style={{ fontSize: 13, color: '#cbd5e1' }}
                />
                {photoBusy ? <div className="rp-muted" style={{ marginTop: 6 }}>Saving your photo...</div> : null}
                {photoMsg ? <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700 }}>{photoMsg}</div> : null}
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.14)' }}>
                <div style={{ fontWeight: 800, marginBottom: 2 }}>My details</div>
                <div className="rp-muted" style={{ marginBottom: 10 }}>Your name and phone number. Press Save. You can change this any time you need to.</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  <div>
                    <span style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#cbd5e1', marginBottom: 4 }}>Your name</span>
                    <input type="text" value={rName} placeholder="Your full name" onChange={(e) => setRName(e.target.value)} style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 16, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#cbd5e1', marginBottom: 4 }}>Your phone number</span>
                    <input type="tel" inputMode="tel" value={rPhone} placeholder="Phone your driver can reach you on" onChange={(e) => setRPhone(prettyPhone(e.target.value))} style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 16, boxSizing: 'border-box' }} />
                  </div>
                </div>
                <button type="button" disabled={rBusy} onClick={saveRiderDetails} className="rp-btn" style={{ marginTop: 12, opacity: rBusy ? 0.6 : 1 }}>
                  {rBusy ? 'Saving...' : 'Save my details'}
                </button>
                {rMsg ? <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700 }}>{rMsg}</div> : null}
              </div>
            </div>
          ) : null}
          {pendingRate ? (
            <RatingBox
              heading='Rate your last ride'
              who={pendingRate.driverName ? 'Your driver was ' + pendingRate.driverName : 'Your driver'}
              where={pendingRate.pickup + ' to ' + pendingRate.dropoff}
              note='You need to rate this ride before you can book another one.'
              busy={rateBusy}
              error={rateError}
              onSend={sendMyRating}
            />
          ) : null}
            {activeRide && (activeRide.status === 'requested' || activeRide.status === 'accepted' || activeRide.status === 'picked_up') && (
            <div style={{ marginBottom: '14px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(216,27,27,0.12)', border: '1px solid rgba(216,27,27,0.35)' }}>
              <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                    {activeRide.status === 'picked_up' ? 'You are on your way' : (activeRide.status === 'requested' ? 'Ride requested' : 'Your driver is on the way')}
              </div>
              {driverCard && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '8px 0 10px' }}>
                  {driverCard.photo ? (
                    <img src={driverCard.photo} alt="Your driver" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid #f5b301' }} />
                  ) : (
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#2a2a2e' }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 700 }}>{driverCard.full_name}</div>
                    {driverStars && driverStars.count > 0 ? (
                      <div style={{ fontSize: 13, color: '#f5b301', fontWeight: 800 }}>
                        {starRow(driverStars.average)} {driverStars.average} stars from {driverStars.count} riders
                      </div>
                    ) : null}
                    {driverStars && driverStars.reviews && driverStars.reviews.length > 0 ? (
                      <div style={{ marginTop: 4 }}>
                        {driverStars.reviews.slice(0, 2).map((rv: any, k: number) => (
                          <div key={k} style={{ fontSize: 12, color: '#ddd' }}>
                            <span style={{ color: '#f5b301' }}>{starRow(rv.stars)}</span> {rv.name} {rv.review}
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <div style={{ fontSize: '12px', color: '#bbb', fontFamily: 'ui-monospace, Menlo, monospace', letterSpacing: '1px' }}>
                      Driver ID {driverCard.driver_code}
                    </div>
                    {driverCard.car ? (
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginTop: 2 }}>Car: {driverCard.car}</div>
                    ) : null}
                    {driverCard.plate ? (
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#f5b301' }}>Licence plate: {driverCard.plate}</div>
                    ) : null}
                    {driverCard.phone ? (
                      <div style={{ fontSize: '13px', marginTop: 2 }}>
                        Call driver: <a href={'tel:' + driverCard.phone} style={{ color: '#ffb4b4' }}>{driverCard.phone}</a>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
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
                  <div className="rp-muted">${tripFare.toFixed(2)} ÃÂ· {tripMiles.toFixed(1)} mi</div>
                {!ridePaid && (
                  <div style={{ marginTop: 8, padding: 10, borderRadius: 10, background: 'rgba(245,179,1,0.12)', border: '1px solid rgba(245,179,1,0.35)', color: '#f5b301', fontSize: 13, lineHeight: 1.45 }}>
                    {trackUnlocked
                      ? "Live tracking is on. Your driver's location will show on the map above as soon as the driver is on the way."
                      : "Payment has not been completed. In " + trackCountdown + " this page will show you your driver's live location on the map."}
                  </div>
                )}
                {!ridePaid && (<button className="rp-btn rp-ghost" onClick={cancelRideRequest}>Cancel ride request</button>)}
            </div>
          )}

          {stage === STAGE.ONWAY && (
            <div>
              <div className="rp-row">
                <img
                  src={driverCard && driverCard.photo ? driverCard.photo : '/driver.jpg'}
                  alt={driverCard && driverCard.full_name ? driverCard.full_name : 'Your On Time Taxi driver'}
                  className="rp-avatar"
                  style={{ objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: 700 }}>{driverCard && driverCard.full_name ? driverCard.full_name : 'Your driver'} &middot; On Time Taxi</div>
                  <div className="rp-muted">Your On Time Taxi driver</div>
                  {driverCard && driverCard.driver_code ? <div className="rp-muted">Driver number {driverCard.driver_code}</div> : null}
                  {driverCard && driverCard.car ? <div className="rp-muted" style={{ color: '#fff', fontWeight: 700 }}>{driverCard.car}</div> : null}
                  {driverCard && driverCard.plate ? <div className="rp-muted" style={{ color: '#fff', fontWeight: 700 }}>Plate {driverCard.plate}</div> : null}
                <a href={'tel:' + (driverCard && driverCard.phone ? driverCard.phone : '+19302164166')} className="rp-muted" style={{ display: 'block', color: '#4aa3ff', textDecoration: 'underline', marginTop: 2 }}>Call driver: {driverCard && driverCard.phone ? driverCard.phone : '(930) 216-4166'}</a>
                </div>
              </div>
                <div className="rp-tripline">${tripFare.toFixed(2)} ÃÂ· {tripMiles.toFixed(1)} mi ÃÂ· {tripStatus}</div>
              {!ridePaid && (
                <div style={{ marginTop: 8, padding: 10, borderRadius: 10, background: 'rgba(245,179,1,0.12)', border: '1px solid rgba(245,179,1,0.35)', color: '#f5b301', fontSize: 13, lineHeight: 1.45 }}>
                  {trackUnlocked
                    ? "Live tracking is on. Payment was not completed, so you can pay your driver directly."
                    : "Payment has not been completed. In " + trackCountdown + " this page will show you your driver's live location on the map."}
                </div>
              )}
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
              {activeRide && activeRide.id && (
                <RideChat rideId={activeRide.id} role="rider" handsFree={true} />
              )}
              {activeRide && activeRide.id && (
                <PanicButton role="rider" rideId={activeRide.id} token={riderToken} whoName={activeRide.rider_name} whoPhone={activeRide.rider_phone} />
              )}
              {!ridePaid && (
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
              )}
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
        .rp-avatar { object-fit: cover; overflow: hidden; width: 44px; height: 44px; border-radius: 50%; background: #f5b301; color: #111; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; }
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
