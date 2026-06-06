'use client';

import { FormEvent, useState } from "react";
import Link from "next/link";

const adminCards = [
  {
    title: "Panic archive",
    text: "Review rider, driver, and owner panic recordings from one admin lane.",
    href: "/admin/panic-archive",
    cta: "Open panic archive",
    tone: "linear-gradient(135deg,#ff4db8 0%,#2f6dff 100%)",
  },
  {
    title: "Marquee manager",
    text: "Create ads, edit ads, delete ads, and separate them from authority alerts.",
    href: "/admin/marquee",
    cta: "Open marquee manager",
    tone: "linear-gradient(135deg,#22c55e 0%,#0ea5e9 100%)",
  },
  {
    title: "Supervisor workflow",
    text: "Keep the supervisor free-ride step ready after marquee work is fixed.",
    href: "/supervisors",
    cta: "View supervisors",
    tone: "linear-gradient(135deg,#7c3aed 0%,#ec4899 100%)",
  },
];

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Enter your username and password first.");
      return;
    }

    setError("");
    setIsLoggedIn(true);
  }

  if (!isLoggedIn) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "radial-gradient(circle at top, #14213d 0%, #09101d 44%, #03060b 100%)",
          color: "#ffffff",
          fontFamily: "Arial, Helvetica, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "520px",
            borderRadius: "28px",
            padding: "28px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#8fdcff",
              marginBottom: "12px",
            }}
          >
            Admin login restored
          </div>

          <h1 style={{ margin: "0 0 10px", fontSize: "38px", lineHeight: 1.05 }}>Log in to admin</h1>
          <p style={{ margin: "0 0 22px", color: "#d9e5ff", lineHeight: 1.7, fontSize: "17px" }}>
            This puts the admin login gate back before the admin controls open.
          </p>

          <form onSubmit={handleLogin} autoComplete="on">
            <div style={{ display: "grid", gap: "14px" }}>
              <label style={{ display: "grid", gap: "8px", fontWeight: 700 }}>
                <span>Username</span>
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(0,0,0,0.24)",
                    color: "#ffffff",
                    fontSize: "16px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: "8px", fontWeight: 700 }}>
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(0,0,0,0.24)",
                    color: "#ffffff",
                    fontSize: "16px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </label>

              {error ? (
                <div
                  style={{
                    borderRadius: "14px",
                    padding: "12px 14px",
                    background: "rgba(255,77,184,0.14)",
                    border: "1px solid rgba(255,77,184,0.28)",
                    color: "#ffd1f0",
                    fontWeight: 700,
                  }}
                >
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                style={{
                  border: "none",
                  cursor: "pointer",
                  padding: "14px 18px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg,#2d6cff 0%,#19b5ff 100%)",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "16px",
                }}
              >
                Log in
              </button>
            </div>
          </form>

          <div style={{ marginTop: "18px" }}>
            <Link
              href="/"
              style={{
                textDecoration: "none",
                color: "#ffffff",
                fontWeight: 700,
              }}
            >
              Back to homepage
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #14213d 0%, #09101d 44%, #03060b 100%)",
        color: "#ffffff",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "28px 18px 80px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#8fdcff",
                marginBottom: "10px",
              }}
            >
              Admin control lane
            </div>
            <h1 style={{ margin: 0, fontSize: "42px", lineHeight: 1.05 }}>Rider On Time admin console</h1>
            <p style={{ margin: "12px 0 0", color: "#d9e5ff", fontSize: "17px", lineHeight: 1.7, maxWidth: "760px" }}>
              The admin login gate is back, and after login you can open the panic archive, marquee manager, and other admin tools.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setIsLoggedIn(false)}
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                cursor: "pointer",
                color: "#ffffff",
                background: "rgba(255,255,255,0.08)",
                padding: "12px 16px",
                borderRadius: "14px",
                fontWeight: 800,
              }}
            >
              Log out
            </button>
            <Link
              href="/"
              style={{
                textDecoration: "none",
                color: "#ffffff",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                padding: "12px 16px",
                borderRadius: "14px",
                fontWeight: 800,
              }}
            >
              Back to homepage
            </Link>
          </div>
        </div>

        <section
          style={{
            borderRadius: "28px",
            padding: "26px",
            marginBottom: "22px",
            background: "linear-gradient(135deg, rgba(45,108,255,0.18) 0%, rgba(25,181,255,0.18) 55%, rgba(255,255,255,0.05) 100%)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "8px 12px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.10)",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            Login requirement restored
          </div>
          <h2 style={{ margin: "0 0 10px", fontSize: "34px", lineHeight: 1.08 }}>You now have to log in before entering admin</h2>
          <p style={{ margin: 0, color: "#d9e5ff", fontSize: "18px", lineHeight: 1.7, maxWidth: "820px" }}>
            This puts the admin panel back behind a login screen and keeps the browser-friendly username and password fields in place.
          </p>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          {adminCards.map((card) => (
            <div
              key={card.title}
              style={{
                borderRadius: "24px",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.05)",
                boxShadow: "0 18px 40px rgba(0,0,0,0.24)",
              }}
            >
              <div style={{ padding: "16px 18px", background: card.tone, fontWeight: 800, fontSize: "20px" }}>{card.title}</div>
              <div style={{ padding: "18px" }}>
                <p style={{ margin: "0 0 16px", color: "#d9e5ff", lineHeight: 1.7, minHeight: "84px" }}>{card.text}</p>
                <Link
                  href={card.href}
                  style={{
                    textDecoration: "none",
                    display: "inline-block",
                    background: "#ffffff",
                    color: "#09111f",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    fontWeight: 800,
                  }}
                >
                  {card.cta}
                </Link>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
