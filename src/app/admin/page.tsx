'use client';

import { FormEvent, useState } from "react";
import Link from "next/link";

const adminCards = [
  {
    title: "Panic archive",
    text: "View and manage emergency alerts and history from users.",
    href: "/admin/panic-archive",
    tone: "rgba(239, 68, 68, 0.1)",
    cta: "View archives"
  },
  {
    title: "Compliance review",
    text: "Review submitted documentation and verification requests.",
    href: "/admin/compliance-review",
    tone: "rgba(59, 130, 246, 0.1)",
    cta: "Open reviews"
  },
  {
    title: "Driver onboarding",
    text: "Process new driver applications and document verification.",
    href: "/admin/driver-onboarding",
    tone: "rgba(16, 185, 129, 0.1)",
    cta: "Manage applicants"
  },
  {
    title: "Supervisor logs",
    text: "Access detailed logs and activity reports from supervisors.",
    href: "/admin/supervisors",
    tone: "rgba(245, 158, 11, 0.1)",
    cta: "View logs"
  },
  {
    title: "Broker accounts",
    text: "Manage partner broker accounts and system access.",
    href: "/admin/broker-account",
    tone: "rgba(139, 92, 246, 0.1)",
    cta: "Configure accounts"
  }
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
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "white",
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: "8px", fontWeight: 700 }}>
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "white",
                  }}
                />
              </label>

              {error && <div style={{ color: "#ff4d4d", fontSize: "14px" }}>{error}</div>}

              <button
                type="submit"
                style={{
                  marginTop: "10px",
                  padding: "16px",
                  borderRadius: "12px",
                  background: "#ffffff",
                  color: "#000000",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-black text-white font-sans">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold mb-2">On Time Taxi</h1>
        <h2 className="text-xl opacity-60">Admin Dashboard</h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {adminCards.map((card, index) => (
          <Link 
            key={index} 
            href={card.href} 
            className="block p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all hover:scale-[1.02]" 
            style={{ background: card.tone }}
          >
            <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
            <p className="text-white/70 text-sm mb-4">{card.text}</p>
            <div className="text-xs font-bold uppercase tracking-widest opacity-50">{card.cta}</div>
          </Link>
        ))}
      </div>

      <hr className="border-white/10 mb-12" />

      <section className="bg-white/5 rounded-3xl p-8 mb-12">
        <h3 className="text-2xl font-bold mb-6">Add to Home Screen</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold mb-2 text-blue-400">iOS (Safari)</h4>
            <p className="text-white/70 text-sm">Tap the Share button at the bottom, then select <span className="text-white font-medium">'Add to Home Screen'</span>.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-green-400">Android (Chrome)</h4>
            <p className="text-white/70 text-sm">Tap the three-dot menu at the top right, then select <span className="text-white font-medium">'Install app'</span> or <span className="text-white font-medium">'Add to Home screen'</span>.</p>
          </div>
        </div>
      </section>

      <section className="text-center py-8 border-t border-white/5">
        <p className="text-white/40 text-sm">
          Current Branding: <span className="text-white/60 font-medium">On Time Taxi</span>
        </p>
      </section>
    </div>
  );
}
