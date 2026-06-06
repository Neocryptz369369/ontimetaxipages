'use client';

import Link from "next/link";
import { useState } from "react";

type BrokerStatus = "Ready for broker review" | "Broker reviewing" | "Added to policy";

type DriverRecord = {
  id: string;
  name: string;
  dob: string;
  licenseNumber: string;
  licenseFile: string;
  brokerStatus: BrokerStatus;
  checkrStatus: string;
  notes: string;
};

const initialDrivers: DriverRecord[] = [
  {
    id: "DRV-1001",
    name: "Marcus Hill",
    dob: "03/14/1988",
    licenseNumber: "H123-456-789-001",
    licenseFile: "marcus-hill-license.jpg",
    brokerStatus: "Ready for broker review",
    checkrStatus: "Waiting on Checkr later",
    notes: "",
  },
  {
    id: "DRV-1002",
    name: "April Woods",
    dob: "11/02/1991",
    licenseNumber: "W987-222-451-009",
    licenseFile: "april-woods-license.jpg",
    brokerStatus: "Ready for broker review",
    checkrStatus: "Waiting on Checkr later",
    notes: "",
  },
  {
    id: "DRV-1003",
    name: "Tina Brooks",
    dob: "07/19/1986",
    licenseNumber: "B555-784-221-111",
    licenseFile: "tina-brooks-license.jpg",
    brokerStatus: "Ready for broker review",
    checkrStatus: "Waiting on Checkr later",
    notes: "",
  },
];

function pillStyle(text: string) {
  if (text.includes("Added")) {
    return {
      background: "rgba(34,197,94,0.16)",
      color: "#cbffe0",
      border: "1px solid rgba(34,197,94,0.28)",
    };
  }

  if (text.includes("reviewing")) {
    return {
      background: "rgba(245,158,11,0.16)",
      color: "#ffe3a6",
      border: "1px solid rgba(245,158,11,0.28)",
    };
  }

  return {
    background: "rgba(56,189,248,0.16)",
    color: "#d9f6ff",
    border: "1px solid rgba(56,189,248,0.28)",
  };
}

export default function BrokerReviewPage() {
  const [drivers, setDrivers] = useState<DriverRecord[]>(initialDrivers);
  const [selectedId, setSelectedId] = useState<string>(initialDrivers[0].id);
  const [message, setMessage] = useState("Broker review page ready.");

  const selectedDriver = drivers.find((driver) => driver.id === selectedId) || drivers[0];

  function updateStatus(nextStatus: BrokerStatus) {
    setDrivers((current) =>
      current.map((driver) =>
        driver.id === selectedDriver.id ? { ...driver, brokerStatus: nextStatus } : driver
      )
    );
    setMessage(`${selectedDriver.name} updated to ${nextStatus}.`);
  }

  function updateNotes(notes: string) {
    setDrivers((current) =>
      current.map((driver) =>
        driver.id === selectedDriver.id ? { ...driver, notes } : driver
      )
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #10253a 0%, #09111d 42%, #04060b 100%)",
        color: "#ffffff",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "28px 18px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "24px" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8fdcff", marginBottom: "10px" }}>
              Broker detailed review lane
            </div>
            <h1 style={{ margin: 0, fontSize: "42px", lineHeight: 1.05 }}>Broker Driver Review</h1>
            <p style={{ margin: "12px 0 0", color: "#d9e5ff", fontSize: "17px", lineHeight: 1.7, maxWidth: "920px" }}>
              This new page gives the broker a cleaner one-driver-at-a-time review workflow without touching the homepage.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href="/broker-account/dashboard"
              style={{ textDecoration: "none", color: "#ffffff", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", padding: "12px 16px", borderRadius: "14px", fontWeight: 800 }}
            >
              Back to Broker Dashboard
            </Link>
            <Link
              href="/broker-account"
              style={{ textDecoration: "none", color: "#09111f", background: "#ffffff", padding: "12px 16px", borderRadius: "14px", fontWeight: 800 }}
            >
              Broker Account
            </Link>
          </div>
        </div>

        <section style={{ display: "grid", gridTemplateColumns: "320px minmax(0, 1fr)", gap: "18px" }}>
          <aside
            style={{
              borderRadius: "28px",
              padding: "20px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              height: "fit-content",
            }}
          >
            <div style={{ fontSize: "20px", fontWeight: 800, marginBottom: "14px" }}>Driver list</div>
            <div style={{ display: "grid", gap: "12px" }}>
              {drivers.map((driver) => (
                <button
                  key={driver.id}
                  type="button"
                  onClick={() => setSelectedId(driver.id)}
                  style={{
                    textAlign: "left",
                    border: selectedId === driver.id ? "1px solid rgba(255,255,255,0.22)" : "1px solid rgba(255,255,255,0.10)",
                    cursor: "pointer",
                    borderRadius: "18px",
                    padding: "14px",
                    background: selectedId === driver.id ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.18)",
                    color: "#ffffff",
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{driver.name}</div>
                  <div style={{ marginTop: "6px", color: "#bfe8ff", fontSize: "14px" }}>{driver.id}</div>
                  <div style={{ marginTop: "8px" }}>
                    <span style={{ ...pillStyle(driver.brokerStatus), borderRadius: "999px", padding: "6px 10px", fontSize: "11px", fontWeight: 800 }}>
                      {driver.brokerStatus}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <div
            style={{
              borderRadius: "28px",
              padding: "22px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <div style={{ fontSize: "30px", fontWeight: 800 }}>{selectedDriver.name}</div>
                <div style={{ marginTop: "6px", color: "#bfe8ff", fontWeight: 700 }}>{selectedDriver.id}</div>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ ...pillStyle(selectedDriver.brokerStatus), borderRadius: "999px", padding: "8px 12px", fontSize: "12px", fontWeight: 800 }}>{selectedDriver.brokerStatus}</span>
                <span style={{ ...pillStyle(selectedDriver.checkrStatus), borderRadius: "999px", padding: "8px 12px", fontSize: "12px", fontWeight: 800 }}>{selectedDriver.checkrStatus}</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "16px" }}>
              <div style={{ borderRadius: "18px", padding: "14px", background: "rgba(0,0,0,0.20)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#9fc8ea", marginBottom: "8px" }}>Full name</div>
                <div style={{ fontWeight: 700 }}>{selectedDriver.name}</div>
              </div>
              <div style={{ borderRadius: "18px", padding: "14px", background: "rgba(0,0,0,0.20)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#9fc8ea", marginBottom: "8px" }}>Date of birth</div>
                <div style={{ fontWeight: 700 }}>{selectedDriver.dob}</div>
              </div>
              <div style={{ borderRadius: "18px", padding: "14px", background: "rgba(0,0,0,0.20)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#9fc8ea", marginBottom: "8px" }}>License number</div>
                <div style={{ fontWeight: 700 }}>{selectedDriver.licenseNumber}</div>
              </div>
              <div style={{ borderRadius: "18px", padding: "14px", background: "rgba(0,0,0,0.20)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#9fc8ea", marginBottom: "8px" }}>License file</div>
                <div style={{ fontWeight: 700 }}>{selectedDriver.licenseFile}</div>
              </div>
            </div>

            <div
              style={{
                borderRadius: "20px",
                padding: "18px",
                background: "rgba(0,0,0,0.20)",
                border: "1px solid rgba(255,255,255,0.08)",
                marginBottom: "16px",
              }}
            >
              <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#9fc8ea", marginBottom: "10px" }}>Broker notes</div>
              <textarea
                value={selectedDriver.notes}
                onChange={(e) => updateNotes(e.target.value)}
                placeholder="Write broker review notes here..."
                style={{
                  width: "100%",
                  minHeight: "140px",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#ffffff",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                  resize: "vertical",
                  fontFamily: "Arial, Helvetica, sans-serif",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
              <button
                type="button"
                onClick={() => updateStatus("Broker reviewing")}
                style={{ border: "none", cursor: "pointer", color: "#09111f", background: "#ffe3a6", padding: "12px 16px", borderRadius: "14px", fontWeight: 800 }}
              >
                Mark reviewing
              </button>
              <button
                type="button"
                onClick={() => updateStatus("Added to policy")}
                style={{ border: "none", cursor: "pointer", color: "#09111f", background: "#cbffe0", padding: "12px 16px", borderRadius: "14px", fontWeight: 800 }}
              >
                Mark added to policy
              </button>
              <button
                type="button"
                onClick={() => updateStatus("Ready for broker review")}
                style={{ border: "1px solid rgba(255,255,255,0.14)", cursor: "pointer", color: "#ffffff", background: "rgba(255,255,255,0.08)", padding: "12px 16px", borderRadius: "14px", fontWeight: 800 }}
              >
                Reset status
              </button>
            </div>

            <div
              style={{
                borderRadius: "20px",
                padding: "18px",
                background: "linear-gradient(135deg, rgba(125,211,252,0.12) 0%, rgba(168,85,247,0.12) 100%)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#e6f6ff",
                lineHeight: 1.8,
                marginBottom: "16px",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#dbeafe", marginBottom: "10px" }}>
                Checkr placeholder
              </div>
              This is where the later Checkr pass / fail result can land after the external setup is unblocked.
            </div>

            <div
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
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
