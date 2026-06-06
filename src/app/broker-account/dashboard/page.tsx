'use client';

import Link from "next/link";
import { useMemo, useState } from "react";

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

export default function BrokerDashboardPage() {
  const [drivers, setDrivers] = useState<DriverRecord[]>(initialDrivers);
  const [message, setMessage] = useState("Broker dashboard ready.");

  const readyCount = useMemo(
    () => drivers.filter((driver) => driver.brokerStatus === "Ready for broker review").length,
    [drivers]
  );

  const reviewingCount = useMemo(
    () => drivers.filter((driver) => driver.brokerStatus === "Broker reviewing").length,
    [drivers]
  );

  const addedCount = useMemo(
    () => drivers.filter((driver) => driver.brokerStatus === "Added to policy").length,
    [drivers]
  );

  function updateStatus(id: string, nextStatus: BrokerStatus) {
    setDrivers((current) =>
      current.map((driver) =>
        driver.id === id ? { ...driver, brokerStatus: nextStatus } : driver
      )
    );
    setMessage(`${id} updated to ${nextStatus}.`);
  }

  function updateNotes(id: string, notes: string) {
    setDrivers((current) =>
      current.map((driver) =>
        driver.id === id ? { ...driver, notes } : driver
      )
    );
  }

  async function copyDriver(record: DriverRecord) {
    const text = `Driver ID: ${record.id}
Full name: ${record.name}
Date of birth: ${record.dob}
Driver license number: ${record.licenseNumber}
License file: ${record.licenseFile}
Broker status: ${record.brokerStatus}
Notes: ${record.notes || "none"}`;

    try {
      await navigator.clipboard.writeText(text);
      setMessage(`${record.name} copied.`);
    } catch {
      setMessage(`Could not copy ${record.name} right now.`);
    }
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
      <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "28px 18px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "24px" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8fdcff", marginBottom: "10px" }}>
              Broker dashboard lane
            </div>
            <h1 style={{ margin: 0, fontSize: "42px", lineHeight: 1.05 }}>Broker Dashboard</h1>
            <p style={{ margin: "12px 0 0", color: "#d9e5ff", fontSize: "17px", lineHeight: 1.7, maxWidth: "920px" }}>
              This dashboard now lets the broker review drivers, leave notes, and mark them as added to policy while the later Checkr pass/fail integration stays parked for a future step.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href="/broker-account"
              style={{ textDecoration: "none", color: "#ffffff", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", padding: "12px 16px", borderRadius: "14px", fontWeight: 800 }}
            >
              Back to Broker Account
            </Link>
            <Link
              href="/"
              style={{ textDecoration: "none", color: "#09111f", background: "#ffffff", padding: "12px 16px", borderRadius: "14px", fontWeight: 800 }}
            >
              Back to homepage
            </Link>
          </div>
        </div>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "22px" }}>
          <div style={{ borderRadius: "24px", padding: "20px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#bfe8ff" }}>Ready for broker</div>
            <div style={{ fontSize: "34px", fontWeight: 800, marginTop: "10px" }}>{readyCount}</div>
          </div>
          <div style={{ borderRadius: "24px", padding: "20px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#bfe8ff" }}>Broker reviewing</div>
            <div style={{ fontSize: "34px", fontWeight: 800, marginTop: "10px", color: "#ffe3a6" }}>{reviewingCount}</div>
          </div>
          <div style={{ borderRadius: "24px", padding: "20px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#bfe8ff" }}>Added to policy</div>
            <div style={{ fontSize: "34px", fontWeight: 800, marginTop: "10px", color: "#cbffe0" }}>{addedCount}</div>
          </div>
          <div style={{ borderRadius: "24px", padding: "20px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#bfe8ff" }}>Checkr later</div>
            <div style={{ fontSize: "20px", fontWeight: 800, marginTop: "14px", color: "#d9f6ff" }}>Pass / fail will land here later</div>
          </div>
        </section>

        <section
          style={{
            borderRadius: "28px",
            padding: "24px",
            background: "linear-gradient(135deg, rgba(125,211,252,0.12) 0%, rgba(168,85,247,0.12) 100%)",
            border: "1px solid rgba(255,255,255,0.12)",
            marginBottom: "22px",
            color: "#e6f6ff",
            lineHeight: 1.8,
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#dbeafe", marginBottom: "10px" }}>
            Current purpose
          </div>
          This is the useful broker step while Checkr is blocked. The broker can review driver information now, write notes, and mark when the driver has been added to policy.
        </section>

        <section style={{ display: "grid", gap: "16px", marginBottom: "22px" }}>
          {drivers.map((record) => (
            <div
              key={record.id}
              style={{
                borderRadius: "28px",
                padding: "22px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 18px 40px rgba(0,0,0,0.24)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "28px", fontWeight: 800 }}>{record.name}</div>
                  <div style={{ marginTop: "6px", color: "#bfe8ff", fontWeight: 700 }}>{record.id}</div>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ ...pillStyle(record.brokerStatus), borderRadius: "999px", padding: "8px 12px", fontSize: "12px", fontWeight: 800 }}>{record.brokerStatus}</span>
                  <span style={{ ...pillStyle(record.checkrStatus), borderRadius: "999px", padding: "8px 12px", fontSize: "12px", fontWeight: 800 }}>{record.checkrStatus}</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "14px" }}>
                <div style={{ borderRadius: "18px", padding: "14px", background: "rgba(0,0,0,0.20)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#9fc8ea", marginBottom: "8px" }}>Full name</div>
                  <div style={{ fontWeight: 700 }}>{record.name}</div>
                </div>
                <div style={{ borderRadius: "18px", padding: "14px", background: "rgba(0,0,0,0.20)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#9fc8ea", marginBottom: "8px" }}>Date of birth</div>
                  <div style={{ fontWeight: 700 }}>{record.dob}</div>
                </div>
                <div style={{ borderRadius: "18px", padding: "14px", background: "rgba(0,0,0,0.20)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#9fc8ea", marginBottom: "8px" }}>License number</div>
                  <div style={{ fontWeight: 700 }}>{record.licenseNumber}</div>
                </div>
                <div style={{ borderRadius: "18px", padding: "14px", background: "rgba(0,0,0,0.20)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#9fc8ea", marginBottom: "8px" }}>License file</div>
                  <div style={{ fontWeight: 700 }}>{record.licenseFile}</div>
                </div>
              </div>

              <div style={{ borderRadius: "20px", padding: "16px", background: "rgba(0,0,0,0.20)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "14px" }}>
                <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#9fc8ea", marginBottom: "8px" }}>Broker notes</div>
                <textarea
                  value={record.notes}
                  onChange={(e) => updateNotes(record.id, e.target.value)}
                  placeholder="Write broker notes here..."
                  style={{
                    width: "100%",
                    minHeight: "110px",
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

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => updateStatus(record.id, "Broker reviewing")}
                  style={{ border: "none", cursor: "pointer", color: "#09111f", background: "#ffe3a6", padding: "12px 16px", borderRadius: "14px", fontWeight: 800 }}
                >
                  Mark reviewing
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(record.id, "Added to policy")}
                  style={{ border: "none", cursor: "pointer", color: "#09111f", background: "#cbffe0", padding: "12px 16px", borderRadius: "14px", fontWeight: 800 }}
                >
                  Mark added to policy
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(record.id, "Ready for broker review")}
                  style={{ border: "1px solid rgba(255,255,255,0.14)", cursor: "pointer", color: "#ffffff", background: "rgba(255,255,255,0.08)", padding: "12px 16px", borderRadius: "14px", fontWeight: 800 }}
                >
                  Reset status
                </button>
                <button
                  type="button"
                  onClick={() => copyDriver(record)}
                  style={{ border: "1px solid rgba(255,255,255,0.14)", cursor: "pointer", color: "#ffffff", background: "rgba(255,255,255,0.08)", padding: "12px 16px", borderRadius: "14px", fontWeight: 800 }}
                >
                  Copy driver details
                </button>
              </div>
            </div>
          ))}
        </section>

        <section style={{ borderRadius: "20px", padding: "16px 18px", background: "rgba(0,0,0,0.22)", border: "1px solid rgba(255,255,255,0.08)", color: "#d9e5ff", lineHeight: 1.7 }}>
          {message}
        </section>
      </div>
    </main>
  );
}
