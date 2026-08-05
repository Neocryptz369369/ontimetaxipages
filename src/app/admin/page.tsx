'use client'

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

const ADMIN_EMAIL = "neocryptz@yahoo.com";

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

const sections = [
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
  const [riderPos, setRiderPos] = useState<{ lat: number; lng: number } | null>(null);
  const [driveGeoError, setDriveGeoError] = useState("");
  const [adminMapsReady, setAdminMapsReady] = useState(false);
  const adminMapDivRef = useRef<HTMLDivElement | null>(null);
  const adminMapRef = useRef<any>(null);
  const adminRiderMarkerRef = useRef<any>(null);
  const adminDriverMarkerRef = useRef<any>(null);
  const adminWatchIdRef = useRef<number | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user && (data.user.email || "").toLowerCase() === ADMIN_EMAIL) {
        setIsLoggedIn(true);
      }
    });
  }, []);

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
    async function loadRides() {
      const { data } = await supabase
        .from("rides")
        .select("id, pickup, dropoff, fare, status, created_at, rider_id, profiles(full_name, phone, photo_url)")
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

  // While driving an active ride: stream driver GPS out, receive rider GPS in
  useEffect(() => {
    if (!activeDrive) return;
    let channel: any = null;
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      adminWatchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setDriveGeoError("");
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
    return () => {
      if (adminWatchIdRef.current != null && typeof navigator !== "undefined" && navigator.geolocation) navigator.geolocation.clearWatch(adminWatchIdRef.current);
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
    const { error: acceptError } = await supabase
      .from("rides")
      .update({ status: "accepted" })
      .eq("id", id);
    if (acceptError) {
      setRideMsg("Could not accept the ride. Please try again.");
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
              {activeDrive.profiles?.full_name ? activeDrive.profiles.full_name + " • " : ""}
              {activeDrive.pickup ? "Pickup: " + activeDrive.pickup : ""}
            {activeDrive.dropoff ? <br /> : null}
            {activeDrive.dropoff ? "Destination: " + activeDrive.dropoff : ""}
            </p>
            <div
              ref={adminMapDivRef}
              style={{ width: "100%", height: "320px", borderRadius: "12px", overflow: "hidden", background: "#111" }}
            />
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
          </div>
        )}

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
                      Fare: ${Number(r.fare || 0).toFixed(2)}
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
