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
  const [drivers] = useState<DriverRecord[]>(initialDrivers);

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
              This dashboard keeps the broker workflow moving now and links into the new detailed broker review page on its own route.
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
              href="/broker-account/review"
              style={{ textDecoration: "none", color: "#09111f", background: "#ffffff", padding: "12px 16px", borderRadius: "14px", fontWeight: 800 }}
            >
              Open Broker Driver Review
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
        </section>

        <section style={{ display: "grid", gap: "16px" }}>
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

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
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
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
