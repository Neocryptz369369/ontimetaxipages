import Link from "next/link";

const ads = [
  {
    id: "AD-001",
    title: "Weekend airport rides",
    audience: "Rider apps",
    status: "Live",
    priority: "Normal",
    updated: "5 min ago",
    body: "Book early for faster airport pickup and cleaner ride scheduling.",
  },
  {
    id: "AD-002",
    title: "Driver bonus update",
    audience: "Driver apps",
    status: "Draft",
    priority: "High",
    updated: "18 min ago",
    body: "Finish more rides this week to unlock the current bonus tier.",
  },
  {
    id: "AD-003",
    title: "Storm safety notice",
    audience: "All apps",
    status: "Live",
    priority: "Urgent",
    updated: "42 min ago",
    body: "Weather delays may affect pickup timing in some areas today.",
  },
];

const authorityAlerts = [
  { name: "Amber Alert", length: "1 minute", source: "Proper authorities" },
  { name: "Emergency Alert System", length: "1 minute", source: "Proper authorities" },
  { name: "Public Safety Alert", length: "1 minute", source: "Proper authorities" },
];

function badgeStyle(value: string) {
  if (value === "Urgent") return { background: "rgba(255,77,184,0.16)", color: "#ffd1f0", border: "1px solid rgba(255,77,184,0.28)" };
  if (value === "High") return { background: "rgba(245,158,11,0.16)", color: "#ffe3a6", border: "1px solid rgba(245,158,11,0.28)" };
  if (value === "Live") return { background: "rgba(34,197,94,0.16)", color: "#cbffe0", border: "1px solid rgba(34,197,94,0.28)" };
  return { background: "rgba(56,189,248,0.16)", color: "#d5f4ff", border: "1px solid rgba(56,189,248,0.28)" };
}

export default function AdminMarqueePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #14213d 0%, #09101d 44%, #03060b 100%)",
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
                color: "#8fdcff",
                marginBottom: "10px",
              }}
            >
              App ad control lane
            </div>
            <h1 style={{ margin: 0, fontSize: "42px", lineHeight: 1.05 }}>Marquee manager and alerts board</h1>
            <p style={{ margin: "12px 0 0", color: "#d9e5ff", fontSize: "17px", lineHeight: 1.7, maxWidth: "860px" }}>
              This step gives Dennis one admin place to create ads, edit ads, delete ads, and keep authority alerts separate from normal marquee items.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href="/admin"
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
              Back to admin
            </Link>
            <Link
              href="/"
              style={{
                textDecoration: "none",
                color: "#09111f",
                background: "#ffffff",
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
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
            marginBottom: "22px",
          }}
        >
          {[
            ["Active ads", "2"],
            ["Draft ads", "1"],
            ["Authority alerts", "3"],
            ["Admin add control", "+ New Ad"],
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
              <div style={{ color: "#9fb7e5", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800 }}>{label}</div>
              <div style={{ marginTop: "10px", fontSize: "34px", fontWeight: 800 }}>{value}</div>
            </div>
          ))}
        </section>

        <section
          style={{
            borderRadius: "24px",
            padding: "22px",
            marginBottom: "22px",
            background: "linear-gradient(135deg, rgba(255,77,184,0.18) 0%, rgba(47,109,255,0.18) 55%, rgba(255,255,255,0.04) 100%)",
            border: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800, color: "#d9e5ff" }}>Admin action</div>
            <h2 style={{ margin: "8px 0 10px", fontSize: "34px", lineHeight: 1.08 }}>Create the next marquee ad from here</h2>
            <p style={{ margin: 0, color: "#d9e5ff", lineHeight: 1.7, maxWidth: "760px" }}>
              Normal ads should be created from the admin side only. Emergency authority alerts stay in their own separate lane.
            </p>
          </div>
          <div
            style={{
              padding: "16px 20px",
              borderRadius: "18px",
              background: "#ffffff",
              color: "#09111f",
              fontWeight: 800,
              fontSize: "20px",
              boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
            }}
          >
            + New Ad
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
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
            <h2 style={{ marginTop: 0, fontSize: "28px" }}>Current ad items</h2>
            <div style={{ display: "grid", gap: "12px" }}>
              {ads.map((ad) => (
                <div
                  key={ad.id}
                  style={{
                    borderRadius: "18px",
                    padding: "16px",
                    background: "rgba(0,0,0,0.22)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "10px" }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "20px" }}>{ad.title}</div>
                      <div style={{ color: "#bcd0f8", marginTop: "6px", fontSize: "14px" }}>{ad.id} • {ad.audience} • Updated {ad.updated}</div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <div style={{ ...badgeStyle(ad.status), borderRadius: "999px", padding: "6px 10px", fontSize: "12px", fontWeight: 800 }}>{ad.status}</div>
                      <div style={{ ...badgeStyle(ad.priority), borderRadius: "999px", padding: "6px 10px", fontSize: "12px", fontWeight: 800 }}>{ad.priority}</div>
                    </div>
                  </div>
                  <p style={{ margin: "0 0 14px", color: "#d9e5ff", lineHeight: 1.7 }}>{ad.body}</p>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <div style={{ padding: "10px 12px", borderRadius: "12px", background: "#ffffff", color: "#09111f", fontWeight: 800 }}>Edit</div>
                    <div style={{ padding: "10px 12px", borderRadius: "12px", background: "rgba(255,255,255,0.08)", color: "#ffffff", fontWeight: 800 }}>Preview</div>
                    <div style={{ padding: "10px 12px", borderRadius: "12px", background: "rgba(255,77,184,0.16)", color: "#ffd1f0", fontWeight: 800 }}>Delete</div>
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
            <h2 style={{ marginTop: 0, fontSize: "28px" }}>Authority alerts</h2>
            <p style={{ color: "#d9e5ff", lineHeight: 1.7 }}>
              These should stay separate from Dennis's normal ads and come only through the proper channels.
            </p>
            <div style={{ display: "grid", gap: "12px", marginTop: "14px" }}>
              {authorityAlerts.map((alert) => (
                <div
                  key={alert.name}
                  style={{
                    borderRadius: "18px",
                    padding: "16px",
                    background: "rgba(0,0,0,0.24)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: "18px" }}>{alert.name}</div>
                  <div style={{ color: "#bcd0f8", marginTop: "6px", lineHeight: 1.7 }}>{alert.source} • shows for {alert.length}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
