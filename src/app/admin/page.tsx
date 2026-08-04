'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

const ADMIN_EMAIL = "neocryptz@yahoo.com";

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
