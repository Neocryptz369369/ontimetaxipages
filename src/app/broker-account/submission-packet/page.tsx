'use client';

import Link from "next/link";

const packetDrivers = [
  {
    id: "DRV-1001",
    name: "Marcus Hill",
    dob: "03/14/1988",
    licenseNumber: "H123-456-789-001",
    licenseFile: "marcus-hill-license.jpg",
    brokerStatus: "Ready for broker review",
    packetStatus: "Packet not prepared",
    brokerNotes: "Review started in broker workflow.",
    documentNotes: "Waiting for detailed document check step.",
  },
  {
    id: "DRV-1002",
    name: "April Woods",
    dob: "11/02/1991",
    licenseNumber: "W987-222-451-009",
    licenseFile: "april-woods-license.jpg",
    brokerStatus: "Ready for broker review",
    packetStatus: "Packet not prepared",
    brokerNotes: "Ready to move into packet review.",
    documentNotes: "No issue flagged yet.",
  },
  {
    id: "DRV-1003",
    name: "Tina Brooks",
    dob: "07/19/1986",
    licenseNumber: "B555-784-221-111",
    licenseFile: "tina-brooks-license.jpg",
    brokerStatus: "Ready for broker review",
    packetStatus: "Packet not prepared",
    brokerNotes: "Queue for next broker action.",
    documentNotes: "Document check still pending.",
  },
];

function pillStyle(text: string) {
  if (text.includes("ready")) {
    return {
      background: "rgba(34,197,94,0.16)",
      color: "#cbffe0",
      border: "1px solid rgba(34,197,94,0.28)",
    };
  }

  if (text.includes("sent")) {
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

export default function BrokerSubmissionPacketPage() {
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
              Broker submission packet lane
            </div>
            <h1 style={{ margin: 0, fontSize: "42px", lineHeight: 1.05 }}>Broker Submission Packet</h1>
            <p style={{ margin: "12px 0 0", color: "#d9e5ff", fontSize: "17px", lineHeight: 1.7, maxWidth: "920px" }}>
              This page gives the broker one clean place to see the information package that will eventually be sent for insurance work.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/broker-account/dashboard" style={{ textDecoration: "none", color: "#ffffff", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", padding: "12px 16px", borderRadius: "14px", fontWeight: 800 }}>Back to Broker Dashboard</Link>
            <Link href="/broker-account/review" style={{ textDecoration: "none", color: "#09111f", background: "#ffffff", padding: "12px 16px", borderRadius: "14px", fontWeight: 800 }}>Open Broker Driver Review</Link>
            <Link href="/broker-account/policy-queue" style={{ textDecoration: "none", color: "#09111f", background: "#cbffe0", padding: "12px 16px", borderRadius: "14px", fontWeight: 800 }}>Open Policy Queue</Link>
          </div>
        </div>

        <section
          style={{
            borderRadius: "28px",
            padding: "24px",
            background: "linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(14,165,233,0.16) 100%)",
            border: "1px solid rgba(255,255,255,0.12)",
            marginBottom: "22px",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#fff4d8", marginBottom: "10px" }}>
            Packet summary
          </div>
          <div style={{ fontSize: "34px", fontWeight: 800, marginBottom: "10px" }}>{packetDrivers.length} drivers in packet workflow</div>
          <div style={{ color: "#e6f6ff", lineHeight: 1.8 }}>
            This is the next clean broker page before any outside screening provider gets connected.
          </div>
        </section>

        <section style={{ display: "grid", gap: "16px" }}>
          {packetDrivers.map((driver) => (
            <div key={driver.id} style={{ borderRadius: "28px", padding: "22px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 18px 40px rgba(0,0,0,0.24)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "28px", fontWeight: 800 }}>{driver.name}</div>
                  <div style={{ marginTop: "6px", color: "#bfe8ff", fontWeight: 700 }}>{driver.id}</div>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ ...pillStyle(driver.brokerStatus), borderRadius: "999px", padding: "8px 12px", fontSize: "12px", fontWeight: 800 }}>{driver.brokerStatus}</span>
                  <span style={{ ...pillStyle(driver.packetStatus), borderRadius: "999px", padding: "8px 12px", fontSize: "12px", fontWeight: 800 }}>{driver.packetStatus}</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "14px" }}>
                <div style={{ borderRadius: "18px", padding: "14px", background: "rgba(0,0,0,0.20)", border: "1px solid rgba(255,255,255,0.08)" }}><div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#9fc8ea", marginBottom: "8px" }}>Full name</div><div style={{ fontWeight: 700 }}>{driver.name}</div></div>
                <div style={{ borderRadius: "18px", padding: "14px", background: "rgba(0,0,0,0.20)", border: "1px solid rgba(255,255,255,0.08)" }}><div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#9fc8ea", marginBottom: "8px" }}>Date of birth</div><div style={{ fontWeight: 700 }}>{driver.dob}</div></div>
                <div style={{ borderRadius: "18px", padding: "14px", background: "rgba(0,0,0,0.20)", border: "1px solid rgba(255,255,255,0.08)" }}><div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#9fc8ea", marginBottom: "8px" }}>License number</div><div style={{ fontWeight: 700 }}>{driver.licenseNumber}</div></div>
                <div style={{ borderRadius: "18px", padding: "14px", background: "rgba(0,0,0,0.20)", border: "1px solid rgba(255,255,255,0.08)" }}><div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#9fc8ea", marginBottom: "8px" }}>License file</div><div style={{ fontWeight: 700 }}>{driver.licenseFile}</div></div>
              </div>

              <div style={{ borderRadius: "20px", padding: "16px 18px", background: "rgba(0,0,0,0.22)", border: "1px solid rgba(255,255,255,0.08)", color: "#d9e5ff", lineHeight: 1.7 }}>
                <strong>Broker notes:</strong> {driver.brokerNotes}<br />
                <strong>Document notes:</strong> {driver.documentNotes}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
