'use client';

import { useMemo, useState } from "react";
import Link from "next/link";

type SupervisorItem = {
  id: string;
  name: string;
  city: string;
  state: string;
  slot: string;
  monthlyRide: string;
  status: string;
  eta: string;
  hotspot: string;
};

type RequestItem = {
  id: string;
  driverId: string;
  name: string;
  city: string;
  pickup: string;
  dropoff: string;
  due: string;
  received: boolean;
};

const initialSupervisors: SupervisorItem[] = [
  {
    id: "DR100001",
    name: "Marcus Hill",
    city: "Louisville",
    state: "KY",
    slot: "1 of 5",
    monthlyRide: "Ready",
    status: "Supervisor Active",
    eta: "8 min",
    hotspot: "Menu hotspot on",
  },
  {
    id: "DR100014",
    name: "Tina Brooks",
    city: "New Albany",
    state: "IN",
    slot: "2 of 5",
    monthlyRide: "Used",
    status: "Supervisor Active",
    eta: "14 min",
    hotspot: "Menu hotspot on",
  },
  {
    id: "DR100022",
    name: "Jerome Banks",
    city: "Jeffersonville",
    state: "IN",
    slot: "3 of 5",
    monthlyRide: "Due soon",
    status: "Supervisor Active",
    eta: "11 min",
    hotspot: "Menu hotspot on",
  },
  {
    id: "DR100035",
    name: "April Woods",
    city: "Louisville",
    state: "KY",
    slot: "4 of 5",
    monthlyRide: "Ready",
    status: "Supervisor Active",
    eta: "6 min",
    hotspot: "Menu hotspot on",
  },
];

const initialRequests: RequestItem[] = [
  {
    id: "REQ-001",
    driverId: "DR100001",
    name: "Marcus Hill",
    city: "Louisville, KY",
    pickup: "Downtown Hotel",
    dropoff: "Airport",
    due: "Today",
    received: false,
  },
  {
    id: "REQ-002",
    driverId: "DR100022",
    name: "Jerome Banks",
    city: "Jeffersonville, IN",
    pickup: "Spring Street",
    dropoff: "Green Tree Mall",
    due: "Tomorrow",
    received: false,
  },
  {
    id: "REQ-003",
    driverId: "DR100014",
    name: "Tina Brooks",
    city: "New Albany, IN",
    pickup: "Main Street",
    dropoff: "Baptist Floyd",
    due: "Done",
    received: true,
  },
];

function pillStyle(value: string) {
  if (value === "Ready") return { background: "rgba(34,197,94,0.16)", color: "#cbffe0", border: "1px solid rgba(34,197,94,0.28)" };
  if (value === "Due soon") return { background: "rgba(245,158,11,0.16)", color: "#ffe3a6", border: "1px solid rgba(245,158,11,0.28)" };
  if (value === "Used") return { background: "rgba(148,163,184,0.18)", color: "#e2e8f0", border: "1px solid rgba(148,163,184,0.30)" };
  if (value === "Received") return { background: "rgba(34,197,94,0.16)", color: "#cbffe0", border: "1px solid rgba(34,197,94,0.28)" };
  return { background: "rgba(56,189,248,0.16)", color: "#d9f6ff", border: "1px solid rgba(56,189,248,0.28)" };
}

export default function SupervisorsPage() {
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState<RequestItem[]>(initialRequests);
  const [message, setMessage] = useState("Supervisor workflow ready.");

  const filteredSupervisors = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return initialSupervisors;
    return initialSupervisors.filter((item) =>
      [item.id, item.name, item.city, item.state].some((field) => field.toLowerCase().includes(q))
    );
  }, [search]);

  const filteredRequests = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((item) =>
      [item.driverId, item.name, item.city, item.pickup, item.dropoff].some((field) => field.toLowerCase().includes(q))
    );
  }, [search, requests]);

  function markReceived(id: string) {
    setRequests((current) =>
      current.map((item) => (item.id === id ? { ...item, received: true, due: "Done" } : item))
    );
    setMessage(`${id} marked received.`);
  }

  function clearRequest(id: string) {
    setRequests((current) => current.filter((item) => item.id !== id));
    setMessage(`${id} cleared.`);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #1d1238 0%, #0c1020 42%, #04060b 100%)",
        color: "#ffffff",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "28px 18px 80px" }}>
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
                color: "#c7a8ff",
                marginBottom: "10px",
              }}
            >
              Supervisor free-ride lane
            </div>
            <h1 style={{ margin: 0, fontSize: "42px", lineHeight: 1.05 }}>Supervisor free-ride board</h1>
            <p style={{ margin: "12px 0 0", color: "#ddd6fe", fontSize: "17px", lineHeight: 1.7, maxWidth: "860px" }}>
              This step shows the first-five supervisor concept, monthly free-ride requests, driver ID search, and clear-after-received actions in one visible page.
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
            <Link
              href="/admin"
              style={{
                textDecoration: "none",
                color: "#09111f",
                background: "#ffffff",
                padding: "12px 16px",
                borderRadius: "14px",
                fontWeight: 800,
              }}
            >
              Open admin
            </Link>
          </div>
        </div>

        <section
          style={{
            borderRadius: "30px",
            padding: "26px",
            marginBottom: "22px",
            background: "linear-gradient(135deg, rgba(124,58,237,0.22) 0%, rgba(236,72,153,0.18) 55%, rgba(255,255,255,0.05) 100%)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
              alignItems: "center",
            }}
          >
            <div>
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
                Live step now visible
              </div>
              <h2 style={{ margin: "0 0 10px", fontSize: "34px", lineHeight: 1.08 }}>First five accepted drivers become supervisors</h2>
              <p style={{ margin: 0, color: "#f5e9ff", fontSize: "18px", lineHeight: 1.7 }}>
                Supervisors get one free ride every month, contact Dennis at <strong>+1 930 216 4166</strong>, and use their driver ID when they request a ride.
              </p>
            </div>

            <div
              style={{
                borderRadius: "22px",
                padding: "18px",
                background: "rgba(0,0,0,0.24)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <div style={{ fontSize: "14px", color: "#ddd6fe", marginBottom: "10px", fontWeight: 700 }}>Search by driver ID</div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search DR100001"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#ffffff",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />
              <div
                style={{
                  marginTop: "12px",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.08)",
                  color: "#ffffff",
                  fontWeight: 700,
                }}
              >
                {message}
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
            marginBottom: "22px",
          }}
        >
          {[
            ["Supervisor slots filled", String(filteredSupervisors.length)],
            ["Open requests", String(filteredRequests.filter((item) => !item.received).length)],
            ["Received rides", String(filteredRequests.filter((item) => item.received).length)],
            ["Owner phone", "+1 930 216 4166"],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                borderRadius: "22px",
                padding: "20px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
              }}
            >
              <div style={{ color: "#c4b5fd", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800 }}>{label}</div>
              <div style={{ marginTop: "10px", fontSize: label === "Owner phone" ? "22px" : "34px", fontWeight: 800 }}>{value}</div>
            </div>
          ))}
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "16px",
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              borderRadius: "24px",
              padding: "22px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: "28px" }}>Supervisor slots</h2>
            <div style={{ display: "grid", gap: "12px" }}>
              {filteredSupervisors.map((item) => (
                <div
                  key={item.id}
                  style={{
                    borderRadius: "18px",
                    padding: "18px",
                    background: "rgba(0,0,0,0.24)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "10px" }}>
                    <div>
                      <div style={{ fontSize: "20px", fontWeight: 800 }}>{item.name}</div>
                      <div style={{ color: "#ddd6fe", marginTop: "6px" }}>{item.id} • {item.city}, {item.state}</div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <div style={{ ...pillStyle(item.monthlyRide), borderRadius: "999px", padding: "6px 10px", fontSize: "12px", fontWeight: 800 }}>{item.monthlyRide}</div>
                      <div style={{ ...pillStyle(item.status), borderRadius: "999px", padding: "6px 10px", fontSize: "12px", fontWeight: 800 }}>{item.status}</div>
                    </div>
                  </div>
                  <div style={{ color: "#e9ddff", lineHeight: 1.7 }}>
                    Slot: {item.slot} • ETA: {item.eta} • Hotspot: {item.hotspot}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              borderRadius: "24px",
              padding: "22px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: "28px" }}>Owner view notes</h2>
            <div style={{ display: "grid", gap: "12px" }}>
              {[
                "Menu area should show the driver hotspot.",
                "Main screen should show the driver map and ETA.",
                "Driver IDs start with DR and should stay permanent.",
                "Owner-requested rides should stay free by default.",
              ].map((note) => (
                <div
                  key={note}
                  style={{
                    borderRadius: "16px",
                    padding: "14px 16px",
                    background: "rgba(0,0,0,0.24)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#f5e9ff",
                    lineHeight: 1.7,
                  }}
                >
                  {note}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          style={{
            borderRadius: "24px",
            padding: "22px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: "28px" }}>Free-ride request queue</h2>
          <div style={{ display: "grid", gap: "12px" }}>
            {filteredRequests.map((item) => (
              <div
                key={item.id}
                style={{
                  borderRadius: "18px",
                  padding: "18px",
                  background: "rgba(0,0,0,0.24)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "10px" }}>
                  <div>
                    <div style={{ fontSize: "20px", fontWeight: 800 }}>{item.name}</div>
                    <div style={{ color: "#ddd6fe", marginTop: "6px" }}>{item.driverId} • {item.city}</div>
                  </div>
                  <div style={{ ...pillStyle(item.received ? "Received" : "Due soon"), borderRadius: "999px", padding: "6px 10px", fontSize: "12px", fontWeight: 800 }}>
                    {item.received ? "Received" : item.due}
                  </div>
                </div>

                <div style={{ color: "#f5e9ff", lineHeight: 1.7, marginBottom: "14px" }}>
                  Pickup: {item.pickup}<br />
                  Drop-off: {item.dropoff}
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {!item.received ? (
                    <button
                      type="button"
                      onClick={() => markReceived(item.id)}
                      style={{
                        border: "none",
                        cursor: "pointer",
                        padding: "10px 12px",
                        borderRadius: "12px",
                        background: "#ffffff",
                        color: "#09111f",
                        fontWeight: 800,
                      }}
                    >
                      Mark received
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => clearRequest(item.id)}
                    style={{
                      border: "1px solid rgba(255,255,255,0.12)",
                      cursor: "pointer",
                      padding: "10px 12px",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.08)",
                      color: "#ffffff",
                      fontWeight: 800,
                    }}
                  >
                    X Clear
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
