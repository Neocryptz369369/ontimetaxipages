'use client';

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type BrokerCredentials = {
  username: string;
  password: string;
};

const storageKey = "riderOnTimeBrokerCredentials";

export default function BrokerAccountPage() {
  const [credentials, setCredentials] = useState<BrokerCredentials | null>(null);
  const [setupUsername, setSetupUsername] = useState("");
  const [setupPassword, setSetupPassword] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState("Broker Account page ready.");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;

      const parsed = JSON.parse(raw) as BrokerCredentials;
      if (parsed?.username && parsed?.password) {
        setCredentials(parsed);
        setEditUsername(parsed.username);
        setEditPassword(parsed.password);
      }
    } catch {
      // leave as first-time setup
    }
  }, []);

  function saveCredentials(next: BrokerCredentials) {
    setCredentials(next);
    setEditUsername(next.username);
    setEditPassword(next.password);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  }

  function handleFirstTimeSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!setupUsername.trim() || !setupPassword.trim()) {
      setMessage("Enter a username and password first.");
      return;
    }

    const next = {
      username: setupUsername.trim(),
      password: setupPassword,
    };

    saveCredentials(next);
    setSetupUsername("");
    setSetupPassword("");
    setLoginUsername(next.username);
    setLoginPassword("");
    setMessage("Broker username and password created. Now log in with them.");
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!credentials) {
      setMessage("Create the broker username and password first.");
      return;
    }

    if (loginUsername.trim() !== credentials.username || loginPassword !== credentials.password) {
      setMessage("Username or password is wrong.");
      return;
    }

    setIsLoggedIn(true);
    setMessage("Broker logged in.");
  }

  function handleChangeCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editUsername.trim() || !editPassword.trim()) {
      setMessage("Enter both a username and password first.");
      return;
    }

    const next = {
      username: editUsername.trim(),
      password: editPassword,
    };

    saveCredentials(next);
    setLoginUsername(next.username);
    setLoginPassword("");
    setMessage("Broker username and password updated.");
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setLoginPassword("");
    setMessage("Logged out.");
  }

  function handleResetSetup() {
    window.localStorage.removeItem(storageKey);
    setCredentials(null);
    setIsLoggedIn(false);
    setSetupUsername("");
    setSetupPassword("");
    setLoginUsername("");
    setLoginPassword("");
    setEditUsername("");
    setEditPassword("");
    setMessage("Broker login reset on this browser. Create a new username and password now.");
  }

  if (!credentials) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "radial-gradient(circle at top, #16314a 0%, #0a1222 42%, #04060b 100%)",
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
            maxWidth: "620px",
            borderRadius: "30px",
            padding: "30px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8fdcff", marginBottom: "12px" }}>
            Broker access lane
          </div>
          <h1 style={{ margin: 0, fontSize: "40px", lineHeight: 1.05 }}>Broker Account</h1>
          <p style={{ margin: "14px 0 22px", color: "#d9e5ff", lineHeight: 1.7, fontSize: "17px" }}>
            First time here, create the broker username and password now. After that, this page will use those same details for login.
          </p>

          <form onSubmit={handleFirstTimeSetup} autoComplete="on">
            <div style={{ display: "grid", gap: "14px" }}>
              <label style={{ display: "grid", gap: "8px", fontWeight: 700 }}>
                <span>Create username</span>
                <input
                  type="text"
                  autoComplete="username"
                  value={setupUsername}
                  onChange={(e) => setSetupUsername(e.target.value)}
                  style={{ width: "100%", padding: "14px 16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.24)", color: "#ffffff", fontSize: "16px", outline: "none", boxSizing: "border-box" }}
                />
              </label>

              <label style={{ display: "grid", gap: "8px", fontWeight: 700 }}>
                <span>Create password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={setupPassword}
                  onChange={(e) => setSetupPassword(e.target.value)}
                  style={{ width: "100%", padding: "14px 16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.24)", color: "#ffffff", fontSize: "16px", outline: "none", boxSizing: "border-box" }}
                />
              </label>

              <button
                type="submit"
                style={{ border: "none", borderRadius: "16px", padding: "14px 18px", fontWeight: 800, fontSize: "16px", background: "linear-gradient(135deg,#ffffff 0%,#bfe8ff 100%)", color: "#09111f", cursor: "pointer" }}
              >
                Create broker username and password
              </button>
            </div>
          </form>

          <div style={{ marginTop: "18px", borderRadius: "18px", padding: "14px 16px", background: "rgba(0,0,0,0.22)", border: "1px solid rgba(255,255,255,0.08)", color: "#d9e5ff", lineHeight: 1.7 }}>
            {message}
          </div>
        </div>
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "radial-gradient(circle at top, #16314a 0%, #0a1222 42%, #04060b 100%)",
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
            maxWidth: "620px",
            borderRadius: "30px",
            padding: "30px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8fdcff", marginBottom: "12px" }}>
            Broker access lane
          </div>
          <h1 style={{ margin: 0, fontSize: "40px", lineHeight: 1.05 }}>Broker Account</h1>
          <p style={{ margin: "14px 0 22px", color: "#d9e5ff", lineHeight: 1.7, fontSize: "17px" }}>
            Log in with the broker username and password you created on this page.
          </p>

          <form onSubmit={handleLogin} autoComplete="on">
            <div style={{ display: "grid", gap: "14px" }}>
              <label style={{ display: "grid", gap: "8px", fontWeight: 700 }}>
                <span>Username</span>
                <input
                  type="text"
                  autoComplete="username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  style={{ width: "100%", padding: "14px 16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.24)", color: "#ffffff", fontSize: "16px", outline: "none", boxSizing: "border-box" }}
                />
              </label>

              <label style={{ display: "grid", gap: "8px", fontWeight: 700 }}>
                <span>Password</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{ width: "100%", padding: "14px 16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.24)", color: "#ffffff", fontSize: "16px", outline: "none", boxSizing: "border-box" }}
                />
              </label>

              <button
                type="submit"
                style={{ border: "none", borderRadius: "16px", padding: "14px 18px", fontWeight: 800, fontSize: "16px", background: "linear-gradient(135deg,#ffffff 0%,#bfe8ff 100%)", color: "#09111f", cursor: "pointer" }}
              >
                Log in to Broker Account
              </button>

              <button
                type="button"
                onClick={handleResetSetup}
                style={{ border: "1px solid rgba(255,255,255,0.16)", borderRadius: "16px", padding: "14px 18px", fontWeight: 800, fontSize: "16px", background: "rgba(255,255,255,0.06)", color: "#ffffff", cursor: "pointer" }}
              >
                Reset and create new username/password
              </button>
            </div>
          </form>

          <div style={{ marginTop: "18px", borderRadius: "18px", padding: "14px 16px", background: "rgba(0,0,0,0.22)", border: "1px solid rgba(255,255,255,0.08)", color: "#d9e5ff", lineHeight: 1.7 }}>
            {message}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #16314a 0%, #0a1222 42%, #04060b 100%)",
        color: "#ffffff",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "28px 18px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "24px" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8fdcff", marginBottom: "10px" }}>
              Broker access lane
            </div>
            <h1 style={{ margin: 0, fontSize: "42px", lineHeight: 1.05 }}>Broker Account</h1>
            <p style={{ margin: "12px 0 0", color: "#d9e5ff", fontSize: "17px", lineHeight: 1.7, maxWidth: "860px" }}>
              You are logged in. You can change the broker username and password here any time.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href="/broker-account/dashboard"
              style={{ textDecoration: "none", color: "#09111f", background: "#ffffff", padding: "12px 16px", borderRadius: "14px", fontWeight: 800 }}
            >
              Open Broker Dashboard
            </Link>
            <Link
              href="/broker-account/driver-hours"
              style={{ textDecoration: "none", color: "#09111f", background: "#8fdcff", padding: "12px 16px", borderRadius: "14px", fontWeight: 800 }}
            >
              Driver hours and runs
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              style={{ border: "1px solid rgba(255,255,255,0.16)", color: "#ffffff", background: "rgba(255,255,255,0.06)", padding: "12px 16px", borderRadius: "14px", fontWeight: 800, cursor: "pointer" }}
            >
              Log out
            </button>
          </div>
        </div>

        <section style={{ borderRadius: "28px", padding: "26px", marginBottom: "22px", background: "linear-gradient(135deg, rgba(34,197,94,0.18) 0%, rgba(14,165,233,0.18) 55%, rgba(255,255,255,0.05) 100%)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 24px 70px rgba(0,0,0,0.35)" }}>
          <div style={{ display: "inline-block", padding: "8px 12px", borderRadius: "999px", background: "rgba(255,255,255,0.10)", fontSize: "12px", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" }}>
            Login settings
          </div>
          <h2 style={{ margin: "0 0 10px", fontSize: "34px", lineHeight: 1.08 }}>Change the broker username and password any time</h2>
          <p style={{ margin: 0, color: "#d9e5ff", fontSize: "18px", lineHeight: 1.7, maxWidth: "860px" }}>
            This fixes the first-time access problem and keeps the broker login editable whenever you need it.
          </p>
        </section>

        <form
          onSubmit={handleChangeCredentials}
          style={{ borderRadius: "28px", padding: "22px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 18px 40px rgba(0,0,0,0.24)", display: "grid", gap: "14px", marginBottom: "22px" }}
        >
          <div style={{ fontSize: "24px", fontWeight: 800 }}>Broker login details</div>

          <label style={{ display: "grid", gap: "8px", fontWeight: 700 }}>
            <span>Username</span>
            <input
              type="text"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              style={{ width: "100%", padding: "14px 16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.24)", color: "#ffffff", fontSize: "16px", outline: "none", boxSizing: "border-box" }}
            />
          </label>

          <label style={{ display: "grid", gap: "8px", fontWeight: 700 }}>
            <span>Password</span>
            <input
              type="password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              style={{ width: "100%", padding: "14px 16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.24)", color: "#ffffff", fontSize: "16px", outline: "none", boxSizing: "border-box" }}
            />
          </label>

          <button
            type="submit"
            style={{ border: "none", borderRadius: "16px", padding: "14px 18px", fontWeight: 800, fontSize: "16px", background: "linear-gradient(135deg,#ffffff 0%,#bfe8ff 100%)", color: "#09111f", cursor: "pointer" }}
          >
            Save broker username and password
          </button>
        </form>

        <section style={{ borderRadius: "20px", padding: "16px 18px", background: "rgba(0,0,0,0.22)", border: "1px solid rgba(255,255,255,0.08)", color: "#d9e5ff", lineHeight: 1.7 }}>
          {message}
        </section>
      </div>
    </main>
  );
}
