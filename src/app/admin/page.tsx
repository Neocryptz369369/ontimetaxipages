'use client'

import { useState } from "react";
import Link from "next/link";

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
  "repeating-conic-gradient(#111111 0% 25%, #1c1c1c 0% 50%) 50% / 24px 24px";

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (username.trim() === "" || password.trim() === "") {
      setError("Enter your username and password first.");
      return;
    }
    setError("");
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
                height: "8px",
                borderRadius: "6px",
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
              Username
            </label>
            <input
              type="text"
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
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 64px" }}>
        <div
          style={{
            height: "12px",
            borderRadius: "8px",
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
                  height: "6px",
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
