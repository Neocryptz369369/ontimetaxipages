'use client'

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import RideChat from "../../components/RideChat";
import PanicButton from "../../components/PanicButton";
import { starRow } from "../../components/RatingBox";
import SpeedWatch from "../../components/SpeedWatch";
import DriverMessages from "../../components/DriverMessages";
import DriverMap from "../../components/DriverMap";

const ADMIN_EMAIL = "neocryptz@yahoo.com";

function driverCarLine(d: any) {
  if (!d) return "";
  const bits: string[] = [];
  if (d.vehicle_color) bits.push(String(d.vehicle_color));
  if (d.vehicle_year) bits.push(String(d.vehicle_year));
  if (d.vehicle_make) bits.push(String(d.vehicle_make));
  if (d.vehicle_model) bits.push(String(d.vehicle_model));
  return bits.join(" ");
}

const ADMIN_MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
let adminMapboxPromise: Promise<any> | null = null;
function loadAdminMapbox(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject("no window");
  if ((window as any).mapboxgl) return Promise.resolve((window as any).mapboxgl);
  if (adminMapboxPromise) return adminMapboxPromise;
  adminMapboxPromise = new Promise((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.css";
    document.head.appendChild(css);
    const s = document.createElement("script");
    s.src = "https://api.mapbox.com/mapbox-gl-js/v3.6.0/mapbox-gl.js";
    s.onload = () => resolve((window as any).mapboxgl);
    s.onerror = () => reject("failed to load mapbox");
    document.head.appendChild(s);
  });
  return adminMapboxPromise;
}
async function adminRouteAlong(points: number[][]): Promise<number[][] | null> {
  if (!points || points.length < 2) return null;
  const path = points.map((p: number[]) => p[0] + ',' + p[1]).join(';');
  const url = 'https://api.mapbox.com/directions/v5/mapbox/driving/' + path + '?alternatives=false&geometries=geojson&overview=full&steps=false&access_token=' + ADMIN_MAPBOX_TOKEN;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data || !data.routes || !data.routes[0] || !data.routes[0].geometry) return null;
    return data.routes[0].geometry.coordinates;
  } catch (e) {
    return null;
  }
}

function adminDrawRouteLine(m: any, coords: number[][]) {
  if (!m || !coords || coords.length < 2) return;
  const data: any = { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } };
  const paint = () => {
    try {
      const existing = m.getSource('route-source');
      if (existing) { existing.setData(data); return; }
      m.addSource('route-source', { type: 'geojson', data });
      m.addLayer({ id: 'route-layer', type: 'line', source: 'route-source', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#0080ff', 'line-width': 6, 'line-opacity': 0.9 } });
    } catch (e) {}
  };
  try {
    if (m.isStyleLoaded && m.isStyleLoaded()) paint();
    else m.once('idle', paint);
  } catch (e) {}
}


const sections = [
  {
    title: "Drivers and reports",
    text: "Approve new drivers, suspend or reinstate them, and read rider reports.",
    href: "/admin/drivers",
    cta: "Open drivers",
  },
  {
    title: "Signed agreements",
    text: "Every agreement a driver or a rider signed, their signature, the day and time, and the exact words they agreed to.",
    href: "/admin/signatures",
    cta: "Open agreements",
  },
  {
    title: "Panic archive",
    text: "View and manage emergency alerts and history from users.",
    href: "/admin/panic-archive",
    cta: "View archives",
  },
  {
    title: "Compliance review",
    text: "Review submitted documentation and verification requests.",
    href: "/admin/compliance-review",
    cta: "Open reviews",
  },
  {
    title: "Driver onboarding",
    text: "Process new driver applications and document verification.",
    href: "/admin/driver-onboarding",
    cta: "Manage applicants",
  },
  {
    title: "Supervisor logs",
    text: "Access detailed logs and activity reports from supervisors.",
    href: "/admin/supervisors",
    cta: "View logs",
  },
  {
    title: "Broker accounts",
    text: "Manage partner broker accounts and system access.",
    href: "/admin/broker-account",
    cta: "Configure accounts",
  },
];

const CHECKER =
  "repeating-conic-gradient(#ce1620 0% 25%, #000000 0% 50%) 50% / 28px 28px";

const FRAME_CHECKER =
  "repeating-conic-gradient(#ce1620 0% 25%, #000000 0% 50%) 50% / 34px 34px";
function Frame() {
  const bar = {
    position: "fixed" as const,
    background: FRAME_CHECKER,
    zIndex: 50,
    pointerEvents: "none" as const,
  };
  const t = 34;
  return (
    <>
      <div style={{ ...bar, top: 0, left: 0, right: 0, height: t }} />
      <div style={{ ...bar, bottom: 0, left: 0, right: 0, height: t }} />
      <div style={{ ...bar, top: 0, bottom: 0, left: 0, width: t }} />
      <div style={{ ...bar, top: 0, bottom: 0, right: 0, width: t }} />
    </>
  );
}


function digitsOnly(v: any) {
  return String(v === null || v === undefined ? '' : v).replace(/[^0-9]/g, '');
}

function prettyPhone(v: any) {
  const d = digitsOnly(v);
  const ten = d.length === 11 && d.charAt(0) === '1' ? d.slice(1) : d;
  if (ten.length === 10) return ten.slice(0, 3) + '-' + ten.slice(3, 6) + '-' + ten.slice(6);
  return ten;
}

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [baseFee, setBaseFee] = useState("5.00");
  const [perMile, setPerMile] = useState("2.00");
  const [savingPrice, setSavingPrice] = useState(false);
  const [priceMsg, setPriceMsg] = useState("");
  const [incoming, setIncoming] = useState<any[]>([]);
  const [rideMsg, setRideMsg] = useState("");
  const [activeDrive, setActiveDrive] = useState<any>(null);
  const [activeDriveCar, setActiveDriveCar] = useState<any>(null);
  const [riderPos, setRiderPos] = useState<{ lat: number; lng: number } | null>(null);
  const [driveGeoError, setDriveGeoError] = useState("");
  const [adminMapsReady, setAdminMapsReady] = useState(false);
  const [driverInputs, setDriverInputs] = useState<any>({});
  const [openReports, setOpenReports] = useState(0);
  const [approvedDrivers, setApprovedDrivers] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [lowRatings, setLowRatings] = useState<any[]>([]);
  const [speedEvents, setSpeedEvents] = useState<any[]>([]);
  const [driverSpeeds, setDriverSpeeds] = useState<any[]>([]);
  const [speedUnseen, setSpeedUnseen] = useState(0);
  const [adminToken, setAdminToken] = useState("");
  const [accidents, setAccidents] = useState<any[]>([]);
  const [accidentOpen, setAccidentOpen] = useState(0);
  const [tickerText, setTickerText] = useState("");
  const [tickerOn, setTickerOn] = useState(false);
  const [tickerSpeed, setTickerSpeed] = useState(5)
  const [speedPullOn, setSpeedPullOn] = useState(true)
  const [speedPullOver, setSpeedPullOver] = useState(15)
  const [speedWarnOver, setSpeedWarnOver] = useState(10)
  const [savingSpeedRules, setSavingSpeedRules] = useState(false)
  const [speedRulesMsg, setSpeedRulesMsg] = useState("");
  const [tickerBusy, setTickerBusy] = useState(false);
  const [tickerMsg, setTickerMsg] = useState("");
  const [alertText, setAlertText] = useState("");
  const [alertTo, setAlertTo] = useState("");
  const [alertBusy, setAlertBusy] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [sentAlerts, setSentAlerts] = useState<any[]>([]);
  const [alertDrivers, setAlertDrivers] = useState<any[]>([]);
  const alarmRef = useRef<any>(null);
  const seenCountRef = useRef(-1);
  const accidentSeenRef = useRef(-1);
  const adminMapDivRef = useRef<HTMLDivElement | null>(null);
  const adminMapRef = useRef<any>(null);
  const adminRiderMarkerRef = useRef<any>(null);
  const adminDriverMarkerRef = useRef<any>(null);
  const adminWatchIdRef = useRef<number | null>(null);
  function ownerAlarm() {
    try {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AC) {
        if (!alarmRef.current) alarmRef.current = new AC();
        const c = alarmRef.current;
        if (c.state === "suspended") c.resume();
        let n = 0;
        const fire = () => {
          n = n + 1;
          try {
            const o = c.createOscillator();
            const g = c.createGain();
            o.type = "square";
            o.frequency.value = n % 2 === 0 ? 1250 : 820;
            g.gain.value = 1;
            o.connect(g);
            g.connect(c.destination);
            o.start();
            o.stop(c.currentTime + 0.28);
          } catch (e) {}
          if (n < 14) setTimeout(fire, 320);
        };
        fire();
      }
    } catch (e) {}
    try {
      const w: any = window;
      if (w.speechSynthesis && w.SpeechSynthesisUtterance) {
        const u = new w.SpeechSynthesisUtterance("Speeding driver. Look at the admin panel.");
        u.lang = "en-US";
        u.volume = 1;
        w.speechSynthesis.speak(u);
      }
    } catch (e) {}
    try { if ((navigator as any).vibrate) (navigator as any).vibrate([400, 200, 400, 200, 400]); } catch (e) {}
  }

  async function markSpeedSeen() {
    try {
      const got = await supabase.auth.getSession();
      const token = got.data.session ? got.data.session.access_token : "";
      if (!token) return;
      await fetch("/api/speed-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token, action: "seen" }),
      });
      setSpeedUnseen(0);
      seenCountRef.current = 0;
    } catch (e) {}
  }

  function accidentAlarm() {
    try {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AC) {
        if (!alarmRef.current) alarmRef.current = new AC();
        const c = alarmRef.current;
        if (c.state === "suspended") c.resume();
        let n = 0;
        const fire = () => {
          n = n + 1;
          try {
            const o = c.createOscillator();
            const g = c.createGain();
            o.type = "square";
            o.frequency.value = n % 2 === 0 ? 1400 : 700;
            g.gain.value = 1;
            o.connect(g);
            g.connect(c.destination);
            o.start();
            o.stop(c.currentTime + 0.3);
          } catch (e) {}
          if (n < 18) setTimeout(fire, 340);
        };
        fire();
      }
    } catch (e) {}
    try {
      const w: any = window;
      if (w.speechSynthesis && w.SpeechSynthesisUtterance) {
        const u = new w.SpeechSynthesisUtterance("A driver has reported an accident. Look at the admin panel.");
        u.lang = "en-US";
        u.volume = 1;
        w.speechSynthesis.speak(u);
      }
    } catch (e) {}
    try { if ((navigator as any).vibrate) (navigator as any).vibrate([500, 200, 500, 200, 500]); } catch (e) {}
  }

  async function closeAccident(id: string) {
    try {
      const got = await supabase.auth.getSession();
      const token = got.data.session ? got.data.session.access_token : "";
      if (!token) return;
      await fetch("/api/accident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token, action: "close", id: id }),
      });
      setAccidents((old: any[]) => old.map((r: any) => (String(r.id) === String(id) ? { ...r, status: "closed" } : r)));
      setAccidentOpen((n: number) => (n > 0 ? n - 1 : 0));
    } catch (e) {}
  }

  useEffect(() => {
    if (!isLoggedIn) return;
    supabase.auth.getSession().then((got: any) => {
      const t = got && got.data && got.data.session ? got.data.session.access_token : "";
      setAdminToken(t || "");
    });
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    let live = true;
    const pullSpeed = async () => {
      try {
        const got = await supabase.auth.getSession();
        const token = got.data.session ? got.data.session.access_token : "";
        if (!token) return;
        const res = await fetch("/api/speed-alerts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: token, action: "list" }),
        });
        const j = await res.json();
        if (!live || !res.ok) return;
        const un = j.unseen ? Number(j.unseen) : 0;
        setSpeedEvents(j.events ? j.events : []);
        setDriverSpeeds(j.drivers ? j.drivers : []);
        setSpeedUnseen(un);
        if (seenCountRef.current >= 0 && un > seenCountRef.current) ownerAlarm();
        seenCountRef.current = un;
      } catch (e) {}
    };
    pullSpeed();
    const t = setInterval(pullSpeed, 10000);
    return () => { live = false; clearInterval(t); };
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    let on = true;
    const pullAccidents = async () => {
      try {
        const got = await supabase.auth.getSession();
        const token = got.data.session ? got.data.session.access_token : "";
        if (!token) return;
        const res = await fetch("/api/accident", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: token, action: "list" }),
        });
        const j = await res.json();
        if (!on || !res.ok) return;
        const openNow = j.open ? Number(j.open) : 0;
        setAccidents(j.reports ? j.reports : []);
        setAccidentOpen(openNow);
        if (accidentSeenRef.current >= 0 && openNow > accidentSeenRef.current) accidentAlarm();
        accidentSeenRef.current = openNow;
      } catch (e) {}
    };
    pullAccidents();
    const t2 = setInterval(pullAccidents, 15000);
    return () => { on = false; clearInterval(t2); };
  }, [isLoggedIn]);

  async function loadTicker() {
    try {
      const r = await fetch("/api/ticker", { cache: "no-store" });
      const j = await r.json();
      if (j) {
        setTickerOn(j.on === true);
        setTickerText(j.text ? String(j.text) : "");
        const sp = Number(j.speed);
        setTickerSpeed(isFinite(sp) && sp > 0 ? sp : 5);
      }
    } catch (e) {}
  }

  async function saveTicker() {
    setTickerBusy(true);
    setTickerMsg("");
    try {
      const got = await supabase.auth.getSession();
      const token = got.data.session ? got.data.session.access_token : "";
      if (!token) {
        setTickerMsg("Please sign in again.");
        setTickerBusy(false);
        return;
      }
      const r = await fetch("/api/ticker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token, on: tickerOn, text: tickerText, speed: tickerSpeed }),
      });
      const j = await r.json();
      if (!r.ok || !j || !j.ok) {
        setTickerMsg(j && j.error ? String(j.error) : "Could not save the ticker.");
      } else {
        setTickerMsg(tickerOn ? "Saved. The ticker is now showing on the rider and driver screens." : "Saved. The ticker is turned off.");
      }
    } catch (e) {
      setTickerMsg("Could not save the ticker.");
    }
    setTickerBusy(false);
  }

  async function loadSentAlerts() {
    try {
      const got = await supabase.auth.getSession();
      const token = got.data.session ? got.data.session.access_token : "";
      if (!token) return;
      const r = await fetch("/api/driver-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token, action: "list" }),
      });
      const j = await r.json();
      if (!r.ok || !j || !j.ok) return;
      setSentAlerts(j.alerts ? j.alerts : []);
      setAlertDrivers(j.drivers ? j.drivers : []);
    } catch (e) {}
  }

  async function sendDriverAlert() {
    const text = alertText.trim();
    if (!text) {
      setAlertMsg("Type the message first.");
      return;
    }
    setAlertBusy(true);
    setAlertMsg("");
    try {
      const got = await supabase.auth.getSession();
      const token = got.data.session ? got.data.session.access_token : "";
      if (!token) {
        setAlertMsg("Please sign in again.");
        setAlertBusy(false);
        return;
      }
      const r = await fetch("/api/driver-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token, action: "send", body: text, driverId: alertTo ? alertTo : null }),
      });
      const j = await r.json();
      if (!r.ok || !j || !j.ok) {
        setAlertMsg(j && j.error ? String(j.error) : "The alert could not be sent.");
      } else {
        setAlertMsg("Sent. It will pop up on their screen and read itself out to them.");
        setAlertText("");
        loadSentAlerts();
      }
    } catch (e) {
      setAlertMsg("The alert could not be sent.");
    }
    setAlertBusy(false);
  }

  async function stopDriverAlert(id: string) {
    try {
      const got = await supabase.auth.getSession();
      const token = got.data.session ? got.data.session.access_token : "";
      if (!token) return;
      await fetch("/api/driver-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token, action: "off", id: id }),
      });
      setSentAlerts((old: any[]) => old.map((a: any) => (String(a.id) === String(id) ? { ...a, active: false } : a)));
    } catch (e) {}
  }

  useEffect(() => {
    if (!isLoggedIn) return;
    loadTicker();
    loadSentAlerts();
    const t3 = setInterval(() => { loadSentAlerts(); }, 30000);
    return () => { clearInterval(t3); };
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    let active = true;
    const pullRatings = async () => {
      try {
        const got = await supabase.auth.getSession();
        const token = got.data.session ? got.data.session.access_token : "";
        if (!token) return;
        const res = await fetch("/api/ratings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: token }),
        });
        const j = await res.json();
        if (active && res.ok) {
          setRatings(j.ratings ? j.ratings : []);
          setLowRatings(j.low ? j.low : []);
        }
      } catch (e) {}
    };
    pullRatings();
    const timer = setInterval(pullRatings, 30000);
    return () => { active = false; clearInterval(timer); };
  }, [isLoggedIn]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user && (data.user.email || "").toLowerCase() === ADMIN_EMAIL) {
        setIsLoggedIn(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    let active = true;
    const pull = async () => {
      const res = await supabase.from("driver_reports").select("id").neq("status", "resolved");
      if (active && !res.error) setOpenReports((res.data || []).length);
    };
    pull();
    const t = setInterval(pull, 20000);
    return () => { active = false; clearInterval(t); };
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    let active = true;
    supabase.from("drivers").select("id, full_name, email, phone, driver_code, status").eq("status", "approved").then((res: any) => {
      if (active && !res.error) setApprovedDrivers(res.data || []);
    });
    return () => { active = false; };
  }, [isLoggedIn]);

  const routeKey = activeDrive
    ? [activeDrive.id, activeDrive.status, Math.round(Number(activeDrive.driver_lat) * 3000), Math.round(Number(activeDrive.driver_lng) * 3000), activeDrive.pickup_lat, activeDrive.pickup_lng, activeDrive.dropoff_lat, activeDrive.dropoff_lng].join(',')
    : '';

  useEffect(() => {
    if (!adminMapsReady || !adminMapRef.current || !activeDrive) return;
    const drive = activeDrive;
    const m = adminMapRef.current;
    const started = drive.status === 'picked_up';
    const pts: number[][] = [];
    if (drive.driver_lat != null && drive.driver_lng != null) pts.push([Number(drive.driver_lng), Number(drive.driver_lat)]);
    if (!started && drive.pickup_lat != null && drive.pickup_lng != null) pts.push([Number(drive.pickup_lng), Number(drive.pickup_lat)]);
    if (drive.dropoff_lat != null && drive.dropoff_lng != null) pts.push([Number(drive.dropoff_lng), Number(drive.dropoff_lat)]);
    if (pts.length < 2) return;
    let cancelled = false;
    adminRouteAlong(pts).then((coords) => {
      if (cancelled || !coords) return;
      adminDrawRouteLine(m, coords);
    });
    return () => { cancelled = true; };
  }, [adminMapsReady, routeKey]);

  useEffect(() => {
    if (!isLoggedIn) return;
    supabase
      .from("app_settings")
      .select("base_fee, per_mile")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data) {
          setBaseFee(Number(data.base_fee).toFixed(2));
          setPerMile(Number(data.per_mile).toFixed(2));
        }
      });
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    async function loadSpeedRules() {
      const got: any = await supabase
        .from("app_settings")
        .select("speed_pulloff_on, speed_pulloff_over, speed_warn_over")
        .eq("id", 1)
        .maybeSingle()
      const row: any = got && got.data ? got.data : null
      if (!row) return
      if (row.speed_pulloff_on === false) setSpeedPullOn(false)
      if (row.speed_pulloff_on === true) setSpeedPullOn(true)
      const pv = Number(row.speed_pulloff_over)
      if (isFinite(pv) && pv > 0) setSpeedPullOver(Math.round(pv))
      const wv = Number(row.speed_warn_over)
      if (isFinite(wv) && wv > 0) setSpeedWarnOver(Math.round(wv))
    }
    loadSpeedRules()

    async function loadRides() {
      const { data } = await supabase
        .from("rides")
        .select("*, profiles(full_name, phone, photo_url)")
        .eq("status", "requested")
        .order("created_at", { ascending: true });
      setIncoming(data || []);
    }
    loadRides();
    const channel = supabase
      .channel("rides-incoming")
      .on("postgres_changes", { event: "*", schema: "public", table: "rides" }, () => {
        loadRides();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLoggedIn]);

  // Load Mapbox once the driver is logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    let alive = true;
    loadAdminMapbox()
      .then(() => { if (alive) setAdminMapsReady(true); })
      .catch(() => {});
    return () => { alive = false; };
  }, [isLoggedIn]);

  // On login, resume any ride already accepted/picked_up so the map reappears after refresh
  useEffect(() => {
    if (!isLoggedIn) return;
    let alive = true;
    supabase
      .from("rides")
      .select("*")
      .in("status", ["accepted", "picked_up"])
      .order("updated_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (!alive) return;
        const ride = data && data[0] ? data[0] : null;
        if (ride) {
          setActiveDrive(ride);
          if (ride.rider_lat != null && ride.rider_lng != null) {
            setRiderPos({ lat: ride.rider_lat, lng: ride.rider_lng });
          }
        }
      });
    return () => { alive = false; };
  }, [isLoggedIn]);

  // Look up the car, plate and phone for whoever is on this ride
  useEffect(() => {
    const dId = activeDrive && activeDrive.driver_id ? String(activeDrive.driver_id) : "";
    if (!dId) {
      setActiveDriveCar(null);
      return;
    }
    let alive = true;
    fetch("/api/driver-card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driverId: dId }),
    })
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        setActiveDriveCar(j && j.driver ? j.driver : null);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [activeDrive ? activeDrive.driver_id : null]);

  // While driving an active ride: stream driver GPS out, receive rider GPS in
  useEffect(() => {
    if (!activeDrive) return;
    let channel: any = null;
    let pollId: any = null;
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      adminWatchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setDriveGeoError("");
          setActiveDrive((prev: any) => prev ? { ...prev, driver_lat: lat, driver_lng: lng } : prev);
          supabase
            .from("rides")
            .update({ driver_lat: lat, driver_lng: lng, updated_at: new Date().toISOString() })
            .eq("id", activeDrive.id)
            .then(() => {});
        },
        () => { setDriveGeoError("Location access is off. Turn it on so the rider can see you."); },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
      );
    }
    channel = supabase
      .channel("drive-track-" + activeDrive.id)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rides", filter: "id=eq." + activeDrive.id }, (payload: any) => {
        const r = payload.new;
        setActiveDrive(r);
        if (r.rider_lat != null && r.rider_lng != null) setRiderPos({ lat: r.rider_lat, lng: r.rider_lng });
      })
      .subscribe();
    pollId = setInterval(async () => {
      const { data: rows } = await supabase.from("rides").select("*").eq("id", activeDrive.id).limit(1);
      const r = rows && rows[0] ? rows[0] : null;
      if (!r) return;
      setActiveDrive(r);
      if (r.rider_lat != null && r.rider_lng != null) setRiderPos({ lat: r.rider_lat, lng: r.rider_lng });
    }, 4000);
    return () => {
      if (adminWatchIdRef.current != null && typeof navigator !== "undefined" && navigator.geolocation) navigator.geolocation.clearWatch(adminWatchIdRef.current);
      if (pollId) clearInterval(pollId);
      if (channel) supabase.removeChannel(channel);
    };
  }, [activeDrive ? activeDrive.id : null]);

  // Build the map once its container is on screen
  useEffect(() => {
    if (!activeDrive || !adminMapsReady || !adminMapDivRef.current || adminMapRef.current) return;
    const mapboxgl = (window as any).mapboxgl;
    if (!mapboxgl) return;
    mapboxgl.accessToken = ADMIN_MAPBOX_TOKEN;
    adminMapRef.current = new mapboxgl.Map({
      container: adminMapDivRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-85.755, 38.3981],
      zoom: 12,
    });
    const m = adminMapRef.current;
    m.on("load", () => m.resize());
    setTimeout(() => { try { m.resize(); } catch (e) {} }, 300);
    setTimeout(() => { try { m.resize(); } catch (e) {} }, 1000);
  }, [activeDrive, adminMapsReady]);

  // Draw / move the rider + driver pins
  useEffect(() => {
    const mapboxgl = (window as any).mapboxgl;
    const m = adminMapRef.current;
    if (!mapboxgl || !m || !activeDrive) return;
    if (activeDrive.driver_lat != null && activeDrive.driver_lng != null) {
      const c: [number, number] = [activeDrive.driver_lng, activeDrive.driver_lat];
      if (!adminDriverMarkerRef.current) adminDriverMarkerRef.current = new mapboxgl.Marker({ color: "#d81b1b" }).setLngLat(c).addTo(m);
      else adminDriverMarkerRef.current.setLngLat(c);
    }
    if (riderPos) {
      const c: [number, number] = [riderPos.lng, riderPos.lat];
      if (!adminRiderMarkerRef.current) adminRiderMarkerRef.current = new mapboxgl.Marker({ color: "#1a73e8" }).setLngLat(c).addTo(m);
      else adminRiderMarkerRef.current.setLngLat(c);
    }
    if (riderPos && activeDrive.driver_lat != null) {
      try {
        const b = new mapboxgl.LngLatBounds();
        b.extend([activeDrive.driver_lng, activeDrive.driver_lat]);
        b.extend([riderPos.lng, riderPos.lat]);
        m.fitBounds(b, { padding: 80, maxZoom: 15, duration: 500 });
      } catch (e) {}
    } else if (riderPos) {
      try { m.easeTo({ center: [riderPos.lng, riderPos.lat], zoom: 14, duration: 500 }); } catch (e) {}
    }
  }, [activeDrive, riderPos]);


  async function acceptRide(id: string) {
    setRideMsg("");
    const d = driverInputs[id] || { name: "", phone: "", vehicle: "", plate: "" };
    if (!d.name.trim() || !d.phone.trim()) {
      setRideMsg("Enter at least the driver name and phone before accepting.");
      return;
    }
    const { error: acceptError } = await supabase
      .from("rides")
      .update({ status: "accepted", driver_id: d.driverId || null, accepted_at: new Date().toISOString(), driver_name: d.name.trim(), driver_phone: d.phone.trim(), vehicle: d.vehicle.trim(), plate: d.plate.trim() })
      .eq("id", id);
    if (acceptError) {
      setRideMsg("Could not accept the ride: " + acceptError.message);
      return;
    }
    setIncoming((prev) => prev.filter((r) => r.id !== id));
    setRideMsg("Ride accepted.");
    const { data: acceptedRide } = await supabase.from("rides").select("*").eq("id", id).single();
    if (acceptedRide) {
      setActiveDrive(acceptedRide);
      if (acceptedRide.rider_lat != null && acceptedRide.rider_lng != null) {
        setRiderPos({ lat: acceptedRide.rider_lat, lng: acceptedRide.rider_lng });
      }
    }
  }

  async function saveSpeedRules() {
    setSavingSpeedRules(true)
    setSpeedRulesMsg("")
    const { error: sErr } = await supabase
      .from("app_settings")
      .update({
        speed_pulloff_on: speedPullOn,
        speed_pulloff_over: speedPullOver,
        speed_warn_over: speedWarnOver,
      })
      .eq("id", 1)
    setSavingSpeedRules(false)
    if (sErr) {
      setSpeedRulesMsg("Could not save. The speed settings need to be added in Supabase first.")
    } else {
      setSpeedRulesMsg("Saved. Every driver phone picks this up within a few seconds.")
    }
  }

  async function savePrices() {
    const b = Number(baseFee);
    const m = Number(perMile);
    if (Number.isNaN(b) || Number.isNaN(m) || b < 0 || m < 0) {
      setPriceMsg("Enter valid non-negative numbers.");
      return;
    }
    setSavingPrice(true);
    setPriceMsg("");
    const { error: upErr } = await supabase
      .from("app_settings")
      .update({ base_fee: b, per_mile: m })
      .eq("id", 1);
    setSavingPrice(false);
    if (upErr) {
      setPriceMsg("Error saving. Please try again.");
    } else {
      setBaseFee(b.toFixed(2));
      setPerMile(m.toFixed(2));
      setPriceMsg("Saved.");
    }
  }


  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (username.trim() === "" || password.trim() === "") {
      setError("Enter your email and password first.");
      return;
    }
    setError("");
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: username.trim(),
      password,
    });
    if (signInError || !data.user) {
      setError("Invalid email or password.");
      return;
    }
    if ((data.user.email || "").toLowerCase() !== ADMIN_EMAIL) {
      await supabase.auth.signOut();
      setError("This account is not authorized for admin access.");
      return;
    }
    setIsLoggedIn(true);
  }

  const shell: React.CSSProperties = {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #1a0000 0%, #0a0000 45%, #000000 100%)",
    color: "#ffffff",
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: "0",
  };

  if (!isLoggedIn) {
    return (
      <main style={shell}>
      <Frame />
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <form
            onSubmit={handleLogin}
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "linear-gradient(160deg, #170606 0%, #0b0303 100%)",
              border: "1px solid rgba(255,77,77,0.35)",
              borderRadius: "18px",
              padding: "36px 30px",
              boxShadow: "0 0 40px rgba(255,45,45,0.25)",
            }}
          >
            <div
              style={{
                height: "14px",
                background: CHECKER,
                marginBottom: "22px",
              }}
            />
            <div
              style={{
                fontSize: "12px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#ff6b6b",
                fontWeight: 800,
                marginBottom: "8px",
              }}
            >
              On Time Taxi
            </div>
            <h1 style={{ margin: "0 0 6px", fontSize: "26px", fontWeight: 900 }}>
              Admin sign in
            </h1>
            <p style={{ margin: "0 0 22px", color: "#e7b6b6", fontSize: "14px" }}>
              Restricted area. Authorized staff only.
            </p>

            <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#ffd7d7" }}>
              Email
            </label>
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                marginBottom: "16px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.18)",
                background: "#000000",
                color: "#ffffff",
                fontSize: "15px",
              }}
            />

            <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#ffd7d7" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                marginBottom: "18px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.18)",
                background: "#000000",
                color: "#ffffff",
                fontSize: "15px",
              }}
            />

            {error ? (
              <div style={{ color: "#ff4d4d", fontSize: "13px", marginBottom: "14px" }}>
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontWeight: 800,
                fontSize: "15px",
                color: "#ffffff",
                background: "linear-gradient(135deg,#ff3b3b 0%,#b81111 100%)",
                boxShadow: "0 0 22px rgba(255,45,45,0.4)",
              }}
            >
              Enter dashboard
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main style={shell}>
      <Frame />
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "56px 40px 70px" }}>
        <div
          style={{
            height: "14px",
            background: CHECKER,
            marginBottom: "26px",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <img
              src="/driver.jpg"
              alt="Dennis, On Time Taxi driver"
              style={{ width: "58px", height: "58px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.25)", flexShrink: 0 }}
            />
            <div>
            <div
              style={{
                fontSize: "12px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#ff6b6b",
                fontWeight: 800,
                marginBottom: "6px",
              }}
            >
              On Time Taxi
            </div>
            <h1 style={{ margin: 0, fontSize: "34px", fontWeight: 900 }}>
              Admin Dashboard
            </h1>
            </div>
          </div>
          <button
            onClick={() => setIsLoggedIn(false)}
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              border: "1px solid rgba(255,77,77,0.5)",
              background: "transparent",
              color: "#ff8a8a",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
        <p style={{ color: "#e7b6b6", marginBottom: "34px" }}>
          Manage operations, driver compliance and system access.
        </p>

        <div style={{ marginBottom: "32px" }}>
          <DriverMap />
        </div>
        <div
          style={{
            marginTop: "32px",
            padding: "28px",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "linear-gradient(180deg, rgba(40,6,6,0.6), rgba(10,0,0,0.4))",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff8a8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 17h14M6 17l1-5a3 3 0 0 1 3-2h4a3 3 0 0 1 3 2l1 5" />
              <circle cx="7.5" cy="17.5" r="1.5" />
              <circle cx="16.5" cy="17.5" r="1.5" />
            </svg>
            <h2 style={{ margin: 0, fontSize: "18px", color: "#fff" }}>Incoming rides</h2>
          </div>
          <p style={{ color: "#c98f8f", fontSize: "13px", marginTop: 0, marginBottom: "16px" }}>
            New ride requests appear here in real time. Accept one to pick it up.
          </p>
          {rideMsg ? (
            <p style={{ color: "#ffd7d7", fontSize: "13px", marginBottom: "12px" }}>{rideMsg}</p>
          ) : null}
          {incoming.length === 0 ? (
            <p style={{ color: "#c98f8f", fontSize: "14px" }}>No ride requests right now.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {incoming.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(0,0,0,0.3)",
                  }}
                >
                  {r.profiles && r.profiles.photo_url ? (
                    <img
                      src={r.profiles.photo_url}
                      alt=""
                      style={{ width: "52px", height: "52px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#fff", fontSize: "15px", fontWeight: 600 }}>
                      {r.profiles ? r.profiles.full_name : "Rider"}
                    </div>
                    <div style={{ color: "#c98f8f", fontSize: "13px" }}>
                      {r.profiles ? r.profiles.phone : ""}
                    </div>
                    <div style={{ color: "#e9c7c7", fontSize: "13px", marginTop: "6px" }}>
                      <strong>From:</strong> {r.pickup}
                    </div>
                    <div style={{ color: "#e9c7c7", fontSize: "13px" }}>
                      <strong>To:</strong> {r.dropoff}
                    </div>
                    <div style={{ color: "#fff", fontSize: "13px", marginTop: "6px" }}>
                      Fare: ${Number(r.fare || 0).toFixed(2)}{Number(r.tip || 0) > 0 ? " + $" + Number(r.tip).toFixed(2) + " tip" : ""}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                      <select
                        value={(driverInputs[r.id] && driverInputs[r.id].driverId) || ""}
                        onChange={(e) => {
                          const picked = approvedDrivers.filter((x: any) => x.id === e.target.value)[0];
                          setDriverInputs((prev: any) => ({ ...prev, [r.id]: { ...(prev[r.id] || {}), driverId: e.target.value, name: picked ? (picked.full_name || "") : ((prev[r.id] || {}).name || ""), phone: picked ? (picked.phone || "") : ((prev[r.id] || {}).phone || "") } }));
                        }}
                        style={{ flex: "1 1 100%", minWidth: 0, padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.4)", color: "#fff" }}
                      >
                        <option value="">Pick an approved driver, or just type a name below</option>
                        {approvedDrivers.map((x: any) => (
                          <option key={x.id} value={x.id}>{(x.full_name || x.email || "Driver") + " - " + x.driver_code}</option>
                        ))}
                      </select>
                      <input type="text" placeholder="Driver name" value={(driverInputs[r.id] && driverInputs[r.id].name) || ""} onChange={(e) => setDriverInputs((prev: any) => ({ ...prev, [r.id]: { ...(prev[r.id] || {}), name: e.target.value } }))} style={{ flex: "1 1 45%", minWidth: 0, padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.4)", color: "#fff", fontSize: "13px" }} />
                      <input type="tel" inputMode="tel" placeholder="Driver phone" value={(driverInputs[r.id] && driverInputs[r.id].phone) || ""} onChange={(e) => setDriverInputs((prev: any) => ({ ...prev, [r.id]: { ...(prev[r.id] || {}), phone: prettyPhone(e.target.value) } }))} style={{ flex: "1 1 45%", minWidth: 0, padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.4)", color: "#fff", fontSize: "13px" }} />
                      <input type="text" placeholder="Vehicle" value={(driverInputs[r.id] && driverInputs[r.id].vehicle) || ""} onChange={(e) => setDriverInputs((prev: any) => ({ ...prev, [r.id]: { ...(prev[r.id] || {}), vehicle: e.target.value } }))} style={{ flex: "1 1 45%", minWidth: 0, padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.4)", color: "#fff", fontSize: "13px" }} />
                      <input type="text" placeholder="Plate" value={(driverInputs[r.id] && driverInputs[r.id].plate) || ""} onChange={(e) => setDriverInputs((prev: any) => ({ ...prev, [r.id]: { ...(prev[r.id] || {}), plate: e.target.value } }))} style={{ flex: "1 1 45%", minWidth: 0, padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.4)", color: "#fff", fontSize: "13px" }} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => acceptRide(r.id)}
                    style={{
                      flexShrink: 0,
                      padding: "10px 18px",
                      borderRadius: "10px",
                      border: "none",
                      cursor: "pointer",
                      background: "#e11d1d",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    Accept / Pick up
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: "32px",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "linear-gradient(180deg, rgba(40,6,6,0.6), rgba(10,0,0,0.4))",
          }}
        >
          <div style={{ fontSize: "13px", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 800, color: "#ff9c9c", marginBottom: "8px" }}>
            Emergency
          </div>
          <p style={{ color: "#d9b3b3", fontSize: "14px", margin: "0 0 6px" }}>
            This is your own panic button. It sends your location to the company, and it records video
            and sound on this phone for up to 45 seconds. The recording is filed in the panic archive.
          </p>
          <PanicButton role="admin" whoName="On Time Taxi owner" whoPhone="9302164166" />
        </div>
        <div
          style={{
            marginTop: "32px",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "linear-gradient(180deg, rgba(40,6,6,0.6), rgba(10,0,0,0.4))",
          }}
        >
          <h2 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: 800 }}>Star ratings</h2>
          <p style={{ color: "#d9b3b3", fontSize: "14px", margin: "0 0 14px" }}>
            Riders rate drivers and drivers rate riders after every run. Anything 2 stars or under is flagged for you here.
          </p>
          {lowRatings.length > 0 ? (
            <div style={{ background: "#ff3b3b", color: "#ffffff", fontWeight: 900, padding: "10px 14px", borderRadius: "10px", marginBottom: "14px" }}>
              {lowRatings.length === 1 ? "1 low rating needs a look" : lowRatings.length + " low ratings need a look"}
            </div>
          ) : null}
          {ratings.length === 0 ? (
            <div style={{ color: "#d9b3b3" }}>No ratings yet.</div>
          ) : (
            ratings.slice(0, 25).map((rt: any) => (
              <div
                key={rt.id}
                style={{
                  padding: "12px 14px",
                  borderRadius: "12px",
                  marginBottom: "10px",
                  background: rt.flagged ? "rgba(255,59,59,0.16)" : "rgba(255,255,255,0.05)",
                  border: rt.flagged ? "1px solid rgba(255,59,59,0.5)" : "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <div style={{ fontWeight: 800, color: "#ffd7d7" }}>
                  {rt.rater_name} rated {rt.ratee_name}
                </div>
                <div style={{ color: "#f5b301", fontSize: "18px", fontWeight: 900 }}>{starRow(rt.stars)}</div>
                {rt.review ? <div style={{ color: "#f3e5e5", fontSize: "14px", marginTop: "4px" }}>{rt.review}</div> : null}
                <div style={{ color: "#c79a9a", fontSize: "12px", marginTop: "4px" }}>
                  {rt.rater_type === "rider" ? "Rider rated the driver" : "Driver rated the rider"}
                </div>
              </div>
            ))
          )}
        </div>
          <div
            style={{
              marginTop: "32px",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "linear-gradient(180deg, rgba(40,6,6,0.6), rgba(10,0,0,0.4))",
            }}
          >
            <h2 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: 800 }}>Speed and speeding</h2>
            <p style={{ color: "#d9b3b3", fontSize: "14px", margin: "0 0 14px" }}>
              Every driver speed shows here while they are working, next to the posted limit on the road they are on. Anything over the limit is written down. At 15 over the driver is taken off that run with no pay for it, and the run goes back out for another driver.
            </p>

            <div
              style={{
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: "14px",
                padding: "14px",
                marginBottom: "16px",
                background: "rgba(0,0,0,0.28)",
              }}
            >
              <div style={{ fontWeight: 900, fontSize: "16px", marginBottom: "4px" }}>The speeding rules</div>
              <p style={{ color: "#d9b3b3", fontSize: "13px", margin: "0 0 12px" }}>
                You decide what happens out there. Change it here and every driver phone picks it up on its own.
              </p>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", cursor: "pointer" }}>
                <input
                  type={"checkbox"}
                  checked={speedPullOn}
                  onChange={(e) => setSpeedPullOn(e.target.checked)}
                  style={{ width: "20px", height: "20px" }}
                />
                <span style={{ fontWeight: 800, fontSize: "15px" }}>
                  Take a driver off the run when they go too far over the limit
                </span>
              </label>
              {!speedPullOn ? (
                <div style={{ background: "#7a5a00", color: "#fff", fontWeight: 800, padding: "9px 12px", borderRadius: "10px", marginBottom: "12px", fontSize: "13px" }}>
                  This is switched off. Speeding is still written down and you still get the alerts, but nobody gets pulled off a run.
                </div>
              ) : null}

              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontWeight: 800, fontSize: "14px", marginBottom: "6px" }}>
                  Warn the driver at {speedWarnOver} mph over the limit
                </div>
                <input
                  type={"range"}
                  min={3}
                  max={25}
                  step={1}
                  value={speedWarnOver}
                  onChange={(e) => setSpeedWarnOver(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
                <div style={{ color: "#9c8080", fontSize: "12px" }}>
                  A big red warning pops up on their screen and is read out loud to them, telling them they can be deactivated for speeding.
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontWeight: 800, fontSize: "14px", marginBottom: "6px" }}>
                  Take them off the run at {speedPullOver} mph over the limit
                </div>
                <input
                  type={"range"}
                  min={5}
                  max={40}
                  step={1}
                  value={speedPullOver}
                  onChange={(e) => setSpeedPullOver(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
                <div style={{ color: "#9c8080", fontSize: "12px" }}>
                  No pay for that run, another driver is sent to take it over, and the rider is told. If nobody can reach them the fare refunds itself.
                </div>
              </div>

              <button
                type={"button"}
                onClick={saveSpeedRules}
                disabled={savingSpeedRules}
                style={{
                  border: "none",
                  borderRadius: "10px",
                  padding: "11px 16px",
                  fontWeight: 800,
                  fontSize: "14px",
                  cursor: "pointer",
                  background: "#128a3d",
                  color: "#fff",
                }}
              >
                {savingSpeedRules ? "Saving..." : "Save the speeding rules"}
              </button>
              {speedRulesMsg ? (
                <span style={{ marginLeft: "10px", fontWeight: 700, fontSize: "13px", color: "#ffd166" }}>{speedRulesMsg}</span>
              ) : null}
            </div>
            {speedUnseen > 0 ? (
              <div style={{ background: "#ff3b3b", color: "#ffffff", fontWeight: 900, padding: "10px 14px", borderRadius: "10px", marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
                <span>{speedUnseen} new speeding alert{speedUnseen === 1 ? "" : "s"}</span>
                <button type="button" onClick={markSpeedSeen} style={{ background: "#ffffff", color: "#7f1d1d", border: "none", borderRadius: "8px", padding: "8px 12px", fontWeight: 900, cursor: "pointer" }}>
                  Mark all read
                </button>
              </div>
            ) : null}
            {driverSpeeds.length > 0 ? (
              <div style={{ marginBottom: "14px" }}>
                {driverSpeeds.map((d: any) => (
                  <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", padding: "10px 12px", borderRadius: "10px", marginBottom: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}>
                    <div>
                      <div style={{ fontWeight: 800, color: "#ffd7d7" }}>{d.full_name}</div>
                      <div style={{ color: "#c79a9a", fontSize: "12px" }}>
                        ID {d.driver_code}
                        {Number(d.speeding_strikes || 0) > 0 ? (Number(d.speeding_strikes) === 1 ? " - 1 speeding strike" : " - " + d.speeding_strikes + " speeding strikes") : ""}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 900, fontSize: "20px", color: d.last_limit_mph && Number(d.last_mph) > Number(d.last_limit_mph) + 3 ? "#ff3b3b" : "#ffffff" }}>
                        {d.last_mph === null || d.last_mph === undefined ? "--" : d.last_mph} mph
                      </div>
                      <div style={{ color: "#c79a9a", fontSize: "12px" }}>{d.last_limit_mph ? "limit " + d.last_limit_mph : "no limit found"}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            {speedEvents.length === 0 ? (
              <div style={{ color: "#d9b3b3" }}>No speeding yet.</div>
            ) : (
              speedEvents.slice(0, 20).map((ev: any) => (
                <div key={ev.id} style={{ padding: "12px 14px", borderRadius: "12px", marginBottom: "10px", background: ev.removed ? "rgba(255,59,59,0.20)" : "rgba(255,255,255,0.05)", border: ev.removed ? "1px solid rgba(255,59,59,0.6)" : "1px solid rgba(255,255,255,0.10)" }}>
                  <div style={{ fontWeight: 800, color: "#ffd7d7" }}>
                    {ev.driver_name} was doing {ev.mph} in a {ev.limit_mph}
                  </div>
                  <div style={{ color: "#f3e5e5", fontSize: "14px", marginTop: "4px" }}>
                    {ev.over_by} mph over the limit
                    {ev.removed ? " - taken off that run, no pay for it" : ""}
                  </div>
                  <div style={{ color: "#c79a9a", fontSize: "12px", marginTop: "4px" }}>
                    {ev.created_at ? new Date(ev.created_at).toLocaleString() : ""}
                  </div>
                </div>
              ))
            )}
          </div>

          <div
            style={{
              marginTop: "32px",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "linear-gradient(180deg, rgba(40,6,6,0.6), rgba(10,0,0,0.4))",
            }}
          >
            <h2 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: 800 }}>Accident reports</h2>
            <p style={{ color: "#d9b3b3", fontSize: "14px", margin: "0 0 14px" }}>
              When a driver taps Report an accident it lands here and on the broker page at the same time, with the pictures, the officer information and how fast they were going.
            </p>
            {accidentOpen > 0 ? (
              <div style={{ background: "#ff3b3b", color: "#ffffff", fontWeight: 900, padding: "10px 14px", borderRadius: "10px", marginBottom: "14px" }}>
                {accidentOpen} accident{accidentOpen === 1 ? "" : "s"} still open
              </div>
            ) : null}
            {accidents.length === 0 ? (
              <div style={{ color: "#d9b3b3" }}>No accidents reported.</div>
            ) : (
              accidents.slice(0, 20).map((ac: any) => (
                <div key={ac.id} style={{ padding: "14px 16px", borderRadius: "12px", marginBottom: "12px", background: String(ac.status) === "open" ? "rgba(255,59,59,0.18)" : "rgba(255,255,255,0.05)", border: String(ac.status) === "open" ? "1px solid rgba(255,59,59,0.6)" : "1px solid rgba(255,255,255,0.10)" }}>
                  <div style={{ fontWeight: 900, color: "#ffd7d7", fontSize: "16px" }}>
                    {ac.driver_name ? ac.driver_name : "Driver"}
                    {ac.mph === null || ac.mph === undefined ? "" : " - going " + ac.mph + " mph"}
                    {ac.limit_mph ? " in a " + ac.limit_mph : ""}
                  </div>
                  <div style={{ color: "#c79a9a", fontSize: "12px", marginTop: "4px" }}>
                    {ac.created_at ? new Date(ac.created_at).toLocaleString() : ""}
                  </div>
                  <div style={{ color: "#f3e5e5", fontSize: "14px", marginTop: "8px", lineHeight: 1.7 }}>
                    <div>Hurt: {ac.injuries ? ac.injuries : "not said"}</div>
                    <div>What happened: {ac.details ? ac.details : "nothing written down"}</div>
                    <div>Where: {ac.address ? ac.address : "not given"}</div>
                    <div>Officer: {ac.officer_name ? ac.officer_name : "none"}{ac.officer_badge ? " (badge " + ac.officer_badge + ")" : ""}{ac.report_number ? " report " + ac.report_number : ""}</div>
                    <div>Other vehicle: {ac.other_vehicle ? ac.other_vehicle : "none given"}{ac.other_plate ? " - plate " + ac.other_plate : ""}</div>
                    <div>Other driver: {ac.other_driver ? ac.other_driver : "none given"}{ac.other_insurance ? " - " + ac.other_insurance : ""}</div>
                    {ac.driver_phone ? <div>Driver phone: {ac.driver_phone}</div> : null}
                  </div>
                  {ac.photos && ac.photos.length > 0 ? (
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
                      {ac.photos.map((ph: any) => (ph.view ? (
                        <a key={ph.id} href={ph.view} target="_blank" rel="noreferrer">
                          <img src={ph.view} alt="Accident" style={{ width: 130, height: 100, objectFit: "cover", borderRadius: 10, border: "1px solid rgba(255,255,255,0.16)" }} />
                        </a>
                      ) : null))}
                    </div>
                  ) : (
                    <div style={{ color: "#c79a9a", fontSize: "12px", marginTop: "8px" }}>No pictures came with this one.</div>
                  )}
                  {ac.lat !== null && ac.lat !== undefined && ac.lng !== null ? (
                    <a href={"https://www.google.com/maps/search/?api=1&query=" + String(ac.lat) + "," + String(ac.lng)} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: "10px", color: "#ffd7d7", fontWeight: 800 }}>
                      Open the spot on a map
                    </a>
                  ) : null}
                  {String(ac.status) === "open" ? (
                    <button type="button" onClick={() => closeAccident(String(ac.id))} style={{ display: "block", marginTop: "12px", background: "#ffffff", color: "#7f1d1d", border: "none", borderRadius: "8px", padding: "10px 14px", fontWeight: 900, cursor: "pointer" }}>
                      Mark this one handled
                    </button>
                  ) : (
                    <div style={{ marginTop: "10px", color: "#a7f3d0", fontWeight: 800, fontSize: "13px" }}>Handled</div>
                  )}
                </div>
              ))
            )}
          </div>

          <div
            style={{
              marginTop: "32px",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "linear-gradient(180deg, rgba(6,26,40,0.6), rgba(0,6,10,0.4))",
            }}
          >
            <h2 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: 800 }}>Ticker on the rider and driver screens</h2>
            <p style={{ color: "#b3ccd9", fontSize: "14px", margin: "0 0 14px" }}>
              Type whatever you want scrolling across the rider page and the driver pages. Drag the slider to make it move faster or slower. You can turn it off any time.
            </p>

            <textarea
              value={tickerText}
              onChange={(e) => setTickerText(e.target.value)}
              rows={3}
              placeholder="For example: Airport runs are busy tonight, book early."
              style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.16)", background: "rgba(0,0,0,0.3)", color: "#ffffff", fontSize: "16px", resize: "vertical" }}
            />

            <div style={{ marginTop: "14px", fontWeight: 800, color: "#d9f0ff" }}>
              Ticker speed: {tickerSpeed} out of 10 ({tickerSpeed <= 3 ? "slow" : tickerSpeed <= 6 ? "medium" : "fast"})
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={tickerSpeed}
              onChange={(e) => setTickerSpeed(Number(e.target.value))}
              style={{ width: "100%", marginTop: "8px" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", color: "#8fb6c9", fontSize: "12px", fontWeight: 800 }}>
              <span>Slow</span>
              <span>Fast</span>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "14px", fontWeight: 800, cursor: "pointer" }}>
              <input type="checkbox" checked={tickerOn} onChange={(e) => setTickerOn(e.target.checked)} style={{ width: 20, height: 20 }} />
              <span>Show the ticker on the rider and driver screens</span>
            </label>

            {tickerText && tickerText.trim() !== "" ? (
              <div style={{ marginTop: "16px" }}>
                <div style={{ color: "#8fb6c9", fontSize: "12px", fontWeight: 800, letterSpacing: "0.1em", marginBottom: "6px" }}>PREVIEW</div>
                <div style={{ overflow: "hidden", whiteSpace: "nowrap", borderRadius: "12px", padding: "10px 0", background: "#0f172a", border: "1px solid rgba(255,255,255,0.14)" }}>
                  <style>{'@keyframes otTickerPreview { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }'}</style>
                  <div style={{ display: "flex", width: "max-content", animation: "otTickerPreview " + Math.max(6, Math.round(100 / tickerSpeed)) + "s linear infinite" }}>
                    <span style={{ paddingRight: 80, color: "#ffffff", fontWeight: 800, fontSize: 15 }}>{tickerText}</span>
                    <span style={{ paddingRight: 80, color: "#ffffff", fontWeight: 800, fontSize: 15 }}>{tickerText}</span>
                  </div>
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={saveTicker}
              disabled={tickerBusy}
              style={{ marginTop: "16px", border: "none", borderRadius: "12px", padding: "14px 18px", fontWeight: 900, fontSize: "16px", background: "#ffffff", color: "#09111f", cursor: "pointer", opacity: tickerBusy ? 0.6 : 1 }}
            >
              {tickerBusy ? "Saving..." : "Save the ticker"}
            </button>

            {tickerMsg ? (
              <div style={{ marginTop: "12px", borderRadius: "12px", padding: "12px 14px", background: "rgba(255,255,255,0.08)", color: "#ffffff", fontWeight: 700 }}>{tickerMsg}</div>
            ) : null}
          </div>

          <div style={{ marginTop: "32px" }}>
            <DriverMessages />
          </div>

          <div
            style={{
              marginTop: "32px",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "linear-gradient(180deg, rgba(6,26,40,0.6), rgba(0,6,10,0.4))",
            }}
          >
            <h2 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: 800 }}>Send an alert to your drivers</h2>
            <p style={{ color: "#b3ccd9", fontSize: "14px", margin: "0 0 14px" }}>
              This is separate from the ticker. It pops up on the driver screen, reads itself out loud to them right away, and they close it with the X or by saying "close notification". It also sits in their notifications list.
            </p>

            <textarea
              value={alertText}
              onChange={(e) => setAlertText(e.target.value)}
              rows={3}
              placeholder="For example: Watch out for flooding on Eastern Boulevard tonight."
              style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.16)", background: "rgba(0,0,0,0.3)", color: "#ffffff", fontSize: "16px", resize: "vertical" }}
            />

            <select
              value={alertTo}
              onChange={(e) => setAlertTo(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", marginTop: "12px", padding: "12px 14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.16)", background: "rgba(0,0,0,0.3)", color: "#ffffff", fontSize: "16px" }}
            >
              <option value="">Every driver</option>
              {alertDrivers.map((d: any) => (
                <option key={d.id} value={d.id}>{d.full_name} - ID {d.driver_code}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={sendDriverAlert}
              disabled={alertBusy}
              style={{ marginTop: "14px", border: "none", borderRadius: "12px", padding: "14px 18px", fontWeight: 900, fontSize: "16px", background: "#ffffff", color: "#09111f", cursor: "pointer", opacity: alertBusy ? 0.6 : 1 }}
            >
              {alertBusy ? "Sending..." : "Send it now"}
            </button>

            {alertMsg ? (
              <div style={{ marginTop: "12px", borderRadius: "12px", padding: "12px 14px", background: "rgba(255,255,255,0.08)", color: "#ffffff", fontWeight: 700 }}>{alertMsg}</div>
            ) : null}

            <h3 style={{ margin: "20px 0 10px", fontSize: "16px", fontWeight: 800, color: "#d9f0ff" }}>Alerts you have sent</h3>
            {sentAlerts.length === 0 ? (
              <div style={{ color: "#b3ccd9" }}>None yet.</div>
            ) : (
              sentAlerts.slice(0, 15).map((a: any) => (
                <div key={a.id} style={{ padding: "12px 14px", borderRadius: "12px", marginBottom: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}>
                  <div style={{ color: "#ffffff", fontWeight: 700, lineHeight: 1.6 }}>{a.body}</div>
                  <div style={{ color: "#8fb6c9", fontSize: "12px", marginTop: "6px" }}>
                    {a.created_at ? new Date(a.created_at).toLocaleString() : ""}
                    {String(a.audience) === "all" ? " - every driver" : " - one driver"}
                    {" - read by " + (a.readCount ? a.readCount : 0)}
                  </div>
                  {a.active ? (
                    <button
                      type="button"
                      onClick={() => stopDriverAlert(String(a.id))}
                      style={{ marginTop: "10px", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "#ffffff", borderRadius: "10px", padding: "8px 12px", fontWeight: 800, cursor: "pointer" }}
                    >
                      Stop showing this one
                    </button>
                  ) : (
                    <div style={{ marginTop: "8px", color: "#a7f3d0", fontWeight: 800, fontSize: "13px" }}>Turned off</div>
                  )}
                </div>
              ))
            )}
          </div>


        <div
          style={{
            marginTop: "32px",
            padding: "28px",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "linear-gradient(180deg, rgba(40,6,6,0.6), rgba(10,0,0,0.4))",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff8a8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>Ride pricing</h2>
          </div>
          <p style={{ color: "#d9b3b3", fontSize: "14px", margin: "0 0 20px" }}>
            Flat rate for every ride. Changes apply immediately to new quotes and charges.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            <label style={{ display: "block" }}>
              <span style={{ display: "block", fontSize: "13px", color: "#e7b6b6", marginBottom: "6px" }}>Base fee (get-in)</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "18px", fontWeight: 800 }}>$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={baseFee}
                  onChange={(e) => setBaseFee(e.target.value)}
                  style={{ width: "120px", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", background: "#000", color: "#fff", fontSize: "16px" }}
                />
              </div>
            </label>
            <label style={{ display: "block" }}>
              <span style={{ display: "block", fontSize: "13px", color: "#e7b6b6", marginBottom: "6px" }}>Per mile</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "18px", fontWeight: 800 }}>$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={perMile}
                  onChange={(e) => setPerMile(e.target.value)}
                  style={{ width: "120px", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", background: "#000", color: "#fff", fontSize: "16px" }}
                />
              </div>
            </label>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "22px" }}>
            <button
              onClick={savePrices}
              disabled={savingPrice}
              style={{
                padding: "12px 24px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg,#ff3b3b 0%,#b81111 100%)",
                color: "#fff",
                fontWeight: 800,
                fontSize: "15px",
                cursor: savingPrice ? "default" : "pointer",
                opacity: savingPrice ? 0.6 : 1,
              }}
            >
              {savingPrice ? "Saving..." : "Save pricing"}
            </button>
            {priceMsg ? (
              <span style={{ fontSize: "14px", color: priceMsg.startsWith("Saved") ? "#7CFC9B" : "#ff8a8a" }}>{priceMsg}</span>
            ) : null}
          </div>
          <p style={{ color: "#c98f8f", fontSize: "13px", marginTop: "16px", marginBottom: 0 }}>
            Preview: a 5-mile ride costs ${(Number(baseFee || 0) + Number(perMile || 0) * 5).toFixed(2)}.
          </p>
        </div>

        {activeDrive && (
          <div
            style={{
              marginTop: "32px",
              padding: "28px",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "linear-gradient(180deg, rgba(40,8,8,0.6), rgba(20,4,4,0.6))",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", color: "#fff" }}>Current ride — live location</h2>
            </div>
            <p style={{ color: "#c98f8f", fontSize: "13px", marginTop: 0, marginBottom: "16px" }}>
              <span style={{ color: "#fff", fontWeight: 700 }}>Rider: </span>
              {(activeDrive.rider_name || activeDrive.profiles?.full_name || "Name unavailable")}
              <br />
              {(activeDrive.rider_phone || activeDrive.profiles?.phone) ? (
                <a href={"tel:" + (activeDrive.rider_phone || activeDrive.profiles?.phone)} style={{ color: "#7fd1ff", textDecoration: "underline", fontWeight: 600 }}>{"Call rider: " + (activeDrive.rider_phone || activeDrive.profiles?.phone)}</a>
              ) : (
                <span style={{ color: "#c98f8f" }}>Phone unavailable</span>
              )}
              <br />
              {activeDrive.pickup ? "Pickup: " + activeDrive.pickup : ""}
            {activeDrive.dropoff ? <br /> : null}
            {activeDrive.dropoff ? "Destination: " + activeDrive.dropoff : ""}
                <br />
                {activeDrive.fare != null ? <span style={{ color: "#fff", fontWeight: 700 }}>Rider paid: ${Number(activeDrive.fare).toFixed(2)}{Number(activeDrive.tip || 0) > 0 ? " + $" + Number(activeDrive.tip).toFixed(2) + " tip" : ""}</span> : ""}
            </p>
            <div
              style={{
                marginBottom: "16px",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              {activeDriveCar && activeDriveCar.photo_url ? (
                <img
                  src={activeDriveCar.photo_url}
                  alt="Driver"
                  style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.35)" }}
                />
              ) : null}
              <div style={{ fontSize: "13px", color: "#c98f8f", lineHeight: 1.7 }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: "15px" }}>
                  Driver: {activeDriveCar && activeDriveCar.full_name ? activeDriveCar.full_name : (activeDrive.driver_name ? activeDrive.driver_name : "Not picked up by a driver yet")}
                  {activeDriveCar && activeDriveCar.driver_code ? " (ID " + activeDriveCar.driver_code + ")" : ""}
                </div>
                {driverCarLine(activeDriveCar) ? (
                  <div style={{ color: "#8affa1", fontWeight: 700 }}>Car: {driverCarLine(activeDriveCar)}</div>
                ) : (
                  <div style={{ color: "#ff9a9a", fontWeight: 700 }}>No car on file for this driver.</div>
                )}
                {activeDriveCar && activeDriveCar.vehicle_plate ? (
                  <div style={{ color: "#8affa1", fontWeight: 700 }}>Licence plate: {activeDriveCar.vehicle_plate}</div>
                ) : (
                  <div style={{ color: "#ff9a9a", fontWeight: 700 }}>No licence plate on file for this driver.</div>
                )}
                {(activeDriveCar && activeDriveCar.phone) || activeDrive.driver_phone ? (
                  <a
                    href={"tel:" + (activeDriveCar && activeDriveCar.phone ? activeDriveCar.phone : activeDrive.driver_phone)}
                    style={{ color: "#7fd1ff", textDecoration: "underline", fontWeight: 600 }}
                  >
                    {"Call driver: " + (activeDriveCar && activeDriveCar.phone ? activeDriveCar.phone : activeDrive.driver_phone)}
                  </a>
                ) : null}
              </div>
            </div>
            <div
              ref={adminMapDivRef}
              style={{ width: "100%", height: "320px", borderRadius: "12px", overflow: "hidden", background: "#111" }}
            />
            <SpeedWatch role="owner" rideId={activeDrive ? activeDrive.id : null} token={adminToken} dark={true} />
            <p style={{ color: "#c98f8f", fontSize: "13px", marginTop: "12px", marginBottom: 0 }}>
              {riderPos ? "Rider location is live (blue). Your location is red." : "Waiting for the rider's location..."}
            </p>
            {driveGeoError && (
              <p style={{ color: "#ffb4b4", fontSize: "13px", marginTop: "6px", marginBottom: 0 }}>{driveGeoError}</p>
            )}
          {activeDrive && !activeDrive.driver_confirmed_pickup && activeDrive.status !== "picked_up" && activeDrive.status !== "completed" && (
            <button
              onClick={async () => {
                const bothNow = activeDrive.rider_confirmed_pickup === true;
                const patch = bothNow
                  ? { driver_confirmed_pickup: true, status: "picked_up" }
                  : { driver_confirmed_pickup: true };
                const { data } = await supabase.from("rides").update(patch).eq("id", activeDrive.id).select("*");
                if (data && data[0]) setActiveDrive(data[0]);
              }}
              style={{ width: "100%", marginTop: "16px", padding: "14px", borderRadius: "12px", border: "none", background: "#1a7f37", color: "#fff", fontWeight: 700, fontSize: "15px", cursor: "pointer" }}
            >
              Confirm pickup
            </button>
          )}
          {activeDrive && activeDrive.driver_confirmed_pickup && activeDrive.status !== "picked_up" && activeDrive.status !== "completed" && (
            <p style={{ color: "#7fd18f", fontSize: "13px", marginTop: "12px", marginBottom: 0 }}>Pickup confirmed. Waiting for the rider to confirm...</p>
          )}
          {activeDrive && activeDrive.status === "picked_up" && (
            <p style={{ color: "#7fd18f", fontSize: "14px", fontWeight: 700, marginTop: "12px", marginBottom: 0 }}>Trip in progress</p>
          )}
          {activeDrive && activeDrive.status === "picked_up" && (
            <button
              onClick={async () => {
                const { data } = await supabase
                  .from("rides")
                  .update({ status: "completed" })
                  .eq("id", activeDrive.id)
                  .select("*");
                if (data && data[0]) setActiveDrive(data[0]);
              }}
              style={{ width: "100%", marginTop: "16px", padding: "14px", borderRadius: "12px", border: "none", background: "#8a1220", color: "#fff", fontWeight: 700, fontSize: "15px", cursor: "pointer" }}
            >
              Rider dropped off &mdash; complete ride
            </button>
          )}
          {activeDrive && activeDrive.id && (
            <RideChat rideId={activeDrive.id} role="driver" handsFree={true} />
          )}
          {activeDrive && activeDrive.status === "completed" && (
            <p style={{ color: "#7fd18f", fontSize: "14px", fontWeight: 700, marginTop: "12px", marginBottom: 0 }}>Ride completed</p>
          )}
          {activeDrive && (
            <button
              onClick={async () => {
                await supabase
                  .from("rides")
                  .update({ status: "canceled" })
                  .eq("id", activeDrive.id);
                setActiveDrive(null);
                setRiderPos(null);
              }}
              style={{ width: "100%", marginTop: "12px", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.25)", background: "transparent", color: "#e6a5a5", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}
            >
              Clear this ride (testing)
            </button>
          )}
          </div>
        )}


        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "22px",
          }}
        >
          {sections.map((s) => (
            <div
              key={s.href}
              style={{
                background: "linear-gradient(160deg, #170606 0%, #0b0303 100%)",
                border: "1px solid rgba(255,77,77,0.28)",
                borderRadius: "16px",
                padding: "22px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "14px",
                  background: CHECKER,
                }}
              />
              <h2 style={{ margin: "10px 0 10px", fontSize: "20px", fontWeight: 800 }}>
                {s.title}
              </h2>
              {s.href === "/admin/drivers" && openReports > 0 && (
                <div style={{ background: "#ff3b3b", color: "#ffffff", fontWeight: 900, display: "inline-block", padding: "4px 10px", borderRadius: "999px", fontSize: "13px", marginBottom: "8px" }}>
                  {openReports} new driver report{openReports === 1 ? "" : "s"}
                </div>
              )}
              <p style={{ color: "#d9b3b3", fontSize: "14px", minHeight: "44px", marginBottom: "16px" }}>
                {s.text}
              </p>
              <Link
                href={s.href}
                style={{
                  display: "inline-block",
                  textDecoration: "none",
                  color: "#ffffff",
                  background: "linear-gradient(135deg,#ff3b3b 0%,#b81111 100%)",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  fontWeight: 800,
                  fontSize: "14px",
                }}
              >
                {s.cta}
              </Link>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "44px",
            paddingTop: "22px",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            color: "#c98f8f",
            fontSize: "13px",
          }}
        >
          On Time Taxi — Clark County, Indiana. Internal admin console.
        </div>
      </div>
    </main>
  );
}
