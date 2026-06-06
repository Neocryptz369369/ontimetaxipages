'use client';

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type BrokerCredentials = {
  username: string;
  password: string;
};

const storageKey = "riderOnTimeBrokerCredentials";
const defaultCredentials: BrokerCredentials = {
  username: "broker",
  password: "broker123",
};

const brokerFields = [
  "Driver full name",
  "Date of birth",
  "Driver's license number",
  "Clear photo or scan of the driver's license",
];

export default function BrokerAccountPage() {
  const [credentials, setCredentials] = useState<BrokerCredentials>(defaultCredentials);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState("Broker Account page ready.");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        setNewUsername(defaultCredentials.username);
        setNewPassword(defaultCredentials.password);
        return;
      }

      const parsed = JSON.parse(raw) as BrokerCredentials;
      if (parsed?.username && parsed?.password) {
        setCredentials(parsed);
        setNewUsername(parsed.username);
        setNewPassword(parsed.password);
        return;
      }
    } catch {
      // ignore and use default
    }

    setNewUsername(defaultCredentials.username);
    setNewPassword(defaultCredentials.password);
  }, []);

  const maskedPassword = useMemo(() => "•".repeat(Math.max(credentials.password.length, 8)), [credentials.password]);

  function saveCredentials(next: BrokerCredentials) {
    setCredentials(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loginUsername.trim() !== credentials.username || loginPassword !== credentials.password) {
      setMessage("Username or password is wrong.");
      return;
    }

    setIsLoggedIn(true);
    setMessage("Broker logged in.");
  }

  function handleChangeCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newUsername.trim() || !newPassword.trim()) {
      setMessage("Enter both a username and password first.");
      return;
    }

    const next = {
      username: newUsername.trim(),
      password: newPassword,
    };

    saveCredentials(next);
    setMessage("Broker username and password updated.");
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setLoginUsername("");
    setLoginPassword("");
    setMessage("Logged out.");
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
            maxWidth: "560px",
            borderRadius: "30px",
            padding: "30px",
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
            Broker access lane
          </div>

          <h1 style={{ margin: 0, fontSize: "40px", lineHeight: 1.05 }}>
            Broker Account
          </h1>

          <p style={{ margin: "14px 0 22px", color: "#d9e5ff", lineHeight: 1.7, fontSize: "17px" }}>
            This is the main Broker Account page. It gives the broker a username and password login before they can review driver insurance information.
          </p>

          <div
            style={{
              borderRadius: "20px",
              padding: "16px 18px",
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.24)",
              color: "#eafff2",
              lineHeight: 1.7,
              marginBottom: "18px",
            }}
          >
            For this first version, you can change the broker username and password later on this page. A real outside integration can be added after this screen is in place.
          </div>

          <form onSubmit={handleLogin} autoComplete="on">
            <div style={{ display: "grid", gap: "14px" }}>
              <label style={{ display: "grid", gap: "8px", fontWeight: 700 }}>
                <span>Username</span>
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
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
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
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

              <button
                type="submit"
                style={{
                  border: "none",
                  borderRadius: "16px",
                  padding: "14px 18px",
                  fontWeight: 800,
                  fontSize: "16px",
                  background: "linear-gradient(135deg,#ffffff 0%,#bfe8ff 100%)",
                  color: "#09111f",
                  cursor: "pointer",
                }}
              >
                Log in to Broker Account
              </button>
            </div>
          </form>

          <div
            style={{
              marginTop: "18px",
              borderRadius: "18px",
              padding: "14px 16px",
              background: "rgba(0,0,0,0.22)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#d9e5ff",
              lineHeight: 1.7,
            }}
          >
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
      <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "28px 18px 80px" }}>
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
              Broker access lane
            </div>
            <h1 style={{ margin: 0, fontSize: "42px", lineHeight: 1.05 }}>
              Broker Account
            </h1>
            <p style={{ margin: "12px 0 0", color: "#d9e5ff", fontSize: "17px", lineHeight: 1.7, maxWidth: "880px" }}>
              This page gives the insurance broker a dedicated account page with a username and password, plus a place for Dennis to change those credentials at any time.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
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
            <button
              type="button"
              onClick={handleLogout}
              style={{
                border: "none",
                color: "#09111f",
                background: "#ffffff",
                padding: "12px 16px",
                borderRadius: "14px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Log out
            </button>
          </div>
        </div>

        <section
          style={{
            borderRadius: "30px",
            padding: "26px",
            marginBottom: "22px",
            background: "linear-gradient(135deg, rgba(34,197,94,0.18) 0%, rgba(14,165,233,0.18) 55%, rgba(255,255,255,0.05) 100%)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ display: "inline-block", padding: "8px 12px", borderRadius: "999px", background: "rgba(255,255,255,0.10)", fontSize: "12px", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" }}>
            Broker login settings
          </div>
          <h2 style={{ margin: "0 0 10px", fontSize: "34px", lineHeight: 1.08 }}>
            Change the broker username and password any time
          </h2>
          <p style={{ margin: 0, color: "#d9e5ff", fontSize: "18px", lineHeight: 1.7, maxWidth: "860px" }}>
            This first version keeps the Broker Account page simple. It gives you a working page and lets you change the broker login details whenever you need to.
          </p>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "18px",
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              borderRadius: "28px",
              padding: "22px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.24)",
            }}
          >
            <div style={{ fontSize: "24px", fontWeight: 800, marginBottom: "14px" }}>
              Current broker login
            </div>
            <div style={{ color: "#d9e5ff", lineHeight: 1.8 }}>
              <div><strong>Username:</strong> {credentials.username}</div>
              <div><strong>Password:</strong> {maskedPassword}</div>
            </div>
            <div style={{ marginTop: "14px", color: "#bfe8ff", lineHeight: 1.7 }}>
              This is the saved page-first login for the Broker Account screen.
            </div>
          </div>

          <form
            onSubmit={handleChangeCredentials}
            style={{
              borderRadius: "28px",
              padding: "22px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.24)",
              display: "grid",
              gap: "14px",
            }}
          >
            <div style={{ fontSize: "24px", fontWeight: 800 }}>
              Change login details
            </div>

            <label style={{ display: "grid", gap: "8px", fontWeight: 700 }}>
              <span>New username</span>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
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
              <span>New password</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

            <button
              type="submit"
              style={{
                border: "none",
                borderRadius: "16px",
                padding: "14px 18px",
                fontWeight: 800,
                fontSize: "16px",
                background: "linear-gradient(135deg,#ffffff 0%,#bfe8ff 100%)",
                color: "#09111f",
                cursor: "pointer",
              }}
            >
              Save broker username and password
            </button>
          </form>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "18px",
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              borderRadius: "28px",
              padding: "22px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ fontSize: "24px", fontWeight: 800, marginBottom: "12px" }}>
              Broker will need
            </div><ul style={{ margin: 0, paddingLeft: "20px", color: "#d9e5ff", lineHeight: 1.8 }}>
              {brokerFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </div>

          <div
            style={{
              borderRadius: "28px",
              padding: "22px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ fontSize: "24px", fontWeight: 800, marginBottom: "12px" }}>
              Next phase later
            </div>
            <div style={{ color: "#d9e5ff", lineHeight: 1.8 }}>
              After this page is live, the next phase can connect a real background-check service like Checkr so the dashboard can show pass or fail results.
            </div>
          </div>
        </section>

        <section
          style={{
            borderRadius: "20px",
            padding: "16px 18px",
            background: "rgba(0,0,0,0.22)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#d9e5ff",
            lineHeight: 1.7,
          }}
        >
          {message}
        </section>
      </div>
    </main>
  );
}
