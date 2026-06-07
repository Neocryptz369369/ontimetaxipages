'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DriverRecord, loadBrokerDrivers } from "../broker-data";

function pillStyle(text: string) {
  if (text.includes("Added") || text.includes("checked")) {
    return {
      background: "rgba(34,197,94,0.16)",
      color: "#cbffe0",
      border: "1px solid rgba(34,197,94,0.28)",
    };
  }

  if (text.includes("reviewing") || text.includes("issue")) {
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

export default function BrokerPolicyQueuePage() {
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);

  useEffect(() => {
    setDrivers(loadBrokerDrivers());
  }, []);

  const addedDrivers = useMemo(
    () => drivers.filter((driver) => driver.brokerStatus === "Added to policy"),
    [drivers]
  );

  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at top, #10253a 0%, #09111d 42%, #04060b 100%)", color: "#ffffff", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "28px 18px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "24px" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8fdcff", marginBottom: "10px" }}>Broker policy queue lane</div>
            <h1 style={{ margin: 0, fontSize: "42px", lineHeight: 1.05 }}>Broker Policy Queue</h1>
            <p style={{ margin: "12px 0 0", color: "#d9e5ff", fontSize: "17px", lineHeight: 1.7, maxWidth: "920px" }}>This page shows the drivers already marked as added to policy. It gives the broker a clear separate queue without touching the homepage.</p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/broker-account/dashboard" style={{ textDecoration: "none", color: "#ffffff", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", padding: "12px 16px", borderRadius: "14px", fontWeight: 800 }}>Back to Broker Dashboard</Link>
            <Link href="/broker-account/review" style={{ textDecoration: "none", color: "#09111f", background: "#ffffff", padding: "12px 16px", borderRadius: "14px", fontWeight: 800 }}>Open Broker Driver Review</Link>
            <Link href="/broker-account/document-check" style={{ textDecoration: "none", color: "#09111f", background: "#d9f6ff", padding: "12px 16px", borderRadius: "14px", fontWeight: 800 }}>Open Document Check</Link>
          </div>
        </div>

        <section style={{ borderRadius: "28px", padding: "24px", background: "linear-gradient(135deg, rgba(34,197,94,0.18) 0%, rgba(14,165,233,0.16) 100%)", border: "1px solid rgba(255,255,255,0.12)", marginBottom: "22px" }}>
          <div style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#dfffee", marginBottom: "10px" }}>Queue summary</div>
          <div style={{ fontSize: "34px", fontWeight: 800, marginBottom: "10px" }}>{addedDrivers.length} drivers added to policy</div>
          <div style={{ color: "#e6f6ff", lineHeight: 1.8 }}>As the broker marks drivers added to policy on the review page, they appear here automatically.</div>
        </section>

        {addedDrivers.length === 0 ? (
          <section style={{ borderRadius: "28px", padding: "24px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#d9e5ff", lineHeight: 1.8 }}>
            No drivers are in the policy queue yet. Go to the broker review page and mark a driver as <strong>Added to policy</strong>.
          </section>
        ) : (
          <section style={{ display: "grid", gap: "16px" }}>
            {addedDrivers.map((driver) => (
              <div key={driver.id} style={{ borderRadius: "28px", padding: "22px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 18px 40px rgba(0,0,0,0.24)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center", marginBottom: "16px" }}>
                  <div><div style={{ fontSize: "28px", fontWeight: 800 }}>{driver.name}</div><div style={{ marginTop: "6px", color: "#bfe8ff", fontWeight: 700 }}>{driver.id}</div></div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ ...pillStyle(driver.brokerStatus), borderRadius: "999px", padding: "8px 12px", fontSize: "12px", fontWeight: 800 }}>{driver.brokerStatus}</span>
                    <span style={{ ...pillStyle(driver.documentStatus), borderRadius: "999px", padding: "8px 12px", fontSize: "12px", fontWeight: 800 }}>{driver.documentStatus}</span>
                    <span style={{ ...pillStyle(driver.screeningStatus), borderRadius: "999px", padding: "8px 12px", fontSize: "12px", fontWeight: 800 }}>{driver.screeningStatus}</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "14px" }}>
                  <div style={{ borderRadius: "18px", padding: "14px", background: "rgba(0,0,0,0.20)", border: "1px solid rgba(255,255,255,0.08)" }}><div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#9fc8ea", marginBottom: "8px" }}>Date of birth</div><div style={{ fontWeight: 700 }}>{driver.dob}</div></div>
                  <div style={{ borderRadius: "18px", padding: "14px", background: "rgba(0,0,0,0.20)", border: "1px solid rgba(255,255,255,0.08)" }}><div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#9fc8ea", marginBottom: "8px" }}>License number</div><div style={{ fontWeight: 700 }}>{driver.licenseNumber}</div></div>
                  <div style={{ borderRadius: "18px", padding: "14px", background: "rgba(0,0,0,0.20)", border: "1px solid rgba(255,255,255,0.08)" }}><div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#9fc8ea", marginBottom: "8px" }}>Last update</div><div style={{ fontWeight: 700 }}>{driver.updatedAt}</div></div>
                </div>

                <div style={{ borderRadius: "20px", padding: "16px 18px", background: "rgba(0,0,0,0.22)", border: "1px solid rgba(255,255,255,0.08)", color: "#d9e5ff", lineHeight: 1.7 }}>
                  <strong>Broker notes:</strong> {driver.notes || "No notes saved yet."}<br />
                  <strong>Document notes:</strong> {driver.documentNotes || "No document notes saved yet."}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
