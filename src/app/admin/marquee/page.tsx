import Link from "next/link";

const ads = [
  {
    id: "AD-001",
    title: "Weekend airport ride push",
    audience: "Rider apps",
    status: "Live",
    priority: "Normal",
    body: "Book airport rides early for faster pickup and less waiting.",
  },
  {
    id: "AD-002",
    title: "Driver bonus update",
    audience: "Driver apps",
    status: "Draft",
    priority: "High",
    body: "Finish more rides this week to unlock the next bonus tier.",
  },
  {
    id: "AD-003",
    title: "Storm safety notice",
    audience: "All apps",
    status: "Live",
    priority: "Urgent",
    body: "Weather delays may change pickup times in some areas today.",
  },
];

const authorityAlerts = [
  { type: "Amber Alert", length: "1 minute", source: "Authority channel" },
  { type: "Emergency Alert System", length: "1 minute", source: "Authority channel" },
  { type: "Public Safety Alert", length: "1 minute", source: "Authority channel" },
];

function badgeStyle(value: string) {
  if (value === "Live") return { background: "rgba(34,197,94,0.16)", color: "#cbffe0", border: "1px solid rgba(34,197,94,0.28)" };
  if (value === "Urgent") return { background: "rgba(255,77,184,0.16)", color: "#ffd1f0", border: "1px solid rgba(255,77,184,0.28)" };
  if (value === "High") return { background: "rgba(245,158,11,0.16)", color: "#ffe3a6", border: "1px solid rgba(245,158,11,0.28)" };
  return { background: "rgba(56,189,248,0.16)", color: "#d9f6ff", border: "1px solid rgba(56,189,248,0.28)" };
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
              Admin marquee lane
            </div>
            <h1 style={{ margin: 0, fontSize: "42px", lineHeight: 1.05 }}>Ad marquee manager</h1>
            <p style={{ margin: "12px 0 0", color: "#d9e5ff", fontSize: "17px", lineHeight: 1.7, maxWidth: "820px" }}>
              This is the page where ads can be created, reviewed, edited, and deleted from the admin side.
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
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "14px",
                background: "#ffffff",
                color: "#09111f",
                fontWeight: 800,
              }}
            >
                            + New ad
            </div>
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
            ["Live ads", "2"],
            ["Draft ads", "1"],
            ["Authority alerts", "3"],
            ["Admin actions", "Create • Edit • Delete"],
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
              <div style={{ marginTop: "10px", fontSize: label === "Admin actions" ? "20px" : "34px", fontWeight: 800 }}>{value}</div>
            </div>
          ))}
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
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
            <h2 style={{ marginTop: 0, fontSize: "28px" }}>Current ad list</h2>
            <div style={{ display: "grid", gap: "12px" }}>
              {ads.map((ad) => (
                <div
                  key={ad.id}
                  style={{
                    borderRadius: "18px",
                    padding: "18px",
                    background: "rgba(0,0,0,0.24)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "10px" }}>
                    <div>
                      <div style={{ fontSize: "20px", fontWeight: 800 }}>{ad.title}</div>
                      <div style={{ color: "#bcd0f8", marginTop: "6px" }}>{ad.id} • {ad.audience}</div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <div style={{ ...badgeStyle(ad.status), borderRadius: "999px", padding: "6px 10px", fontSize: "12px", fontWeight: 800 }}>{ad.status}</div>
                      <div style={{ ...badgeStyle(ad.priority), borderRadius: "999px", padding: "6px 10px", fontSize: "12px", fontWeight: 800 }}>{ad.priority}</div>
                    </div>
                  </div>

                  <p style={{ margin: "0 0 14px", color: "#d9e5ff", lineHeight: 1.7 }}>{ad.body}</p>

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {[
                      ["Edit", "#ffffff", "#09111f"],
                      ["Delete", "rgba(255,77,184,0.16)", "#ffd1f0"],
                      ["Preview", "rgba(255,255,255,0.08)", "#ffffff"],
                    ].map(([label, bg, color]) => (
                      <div
                        key={label}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "12px",
                          background: bg,
                          color,
                          fontWeight: 800,
                          border: "1px solid rgba(255,255,255,0.10)",
                        }}
                      >
                        {label}
                      </div>
                    ))}
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
            <h2 style={{ marginTop: 0, fontSize: "28px" }}>Authority alert lane</h2>
            <p style={{ color: "#d9e5ff", lineHeight: 1.7 }}>
              These are separate from normal ads and should come through proper channels only.
            </p>
            <div style={{ display: "grid", gap: "12px", marginTop: "14px" }}>
              {authorityAlerts.map((alert) => (
                <div
                  key={alert.type}
                  style={{
                    borderRadius: "18px",
                    padding: "16px",
                    background: "rgba(0,0,0,0.24)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: "18px" }}>{alert.type}</div>
                  <div style={{ color: "#bcd0f8", marginTop: "8px", lineHeight: 1.7 }}>{alert.length} • {alert.source}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
