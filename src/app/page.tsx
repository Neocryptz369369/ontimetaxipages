import Link from "next/link";

const launchCards = [
  {
    title: "Broker Account",
    text: "Open the broker login and dashboard lane for liability-insurance driver records.",
    href: "/broker-account",
    tone: "linear-gradient(135deg,#22c55e 0%,#0ea5e9 100%)",
    cta: "Open Broker Account",
  },
  {
    title: "Driver Compliance",
    text: "Review the driver compliance workflow before approval.",
    href: "/drive",
    tone: "linear-gradient(135deg,#38bdf8 0%,#6366f1 100%)",
    cta: "Open Driver Compliance",
  },
  {
    title: "Admin Console",
    text: "Manage the admin tools, review lanes, and system controls.",
    href: "/admin",
    tone: "linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)",
    cta: "Open Admin",
  },
];

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #16213f 0%, #090c14 45%, #000000 100%)",
        color: "#ffffff",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1220px", margin: "0 auto", padding: "22px 18px 90px" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "18px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#8fdcff",
                marginBottom: "8px",
              }}
            >
              Live launch workflow
            </div>
            <div style={{ fontSize: "30px", fontWeight: 800, lineHeight: 1.1 }}>Rider On Time</div>
            <div style={{ fontSize: "14px", color: "#d9e5ff", marginTop: "6px" }}>
              Homepage now includes the broker workflow as a visible launch step.
            </div>
          </div>

          <nav
            style={{
              display: "flex",
              gap: "14px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {[
              ["Ride", "/ride"],
              ["Drive", "/drive"],
              ["Cities", "/cities"],
              ["Admin", "/admin"],
              ["Broker Account", "/broker-account"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                style={{
                  textDecoration: "none",
                  color: "#ffffff",
                  padding: "10px 14px",
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: href === "/broker-account" ? "linear-gradient(135deg,#22c55e 0%,#0ea5e9 100%)" : "rgba(255,255,255,0.05)",
                  fontWeight: 700,
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </header>

        <section
          style={{
            borderRadius: "34px",
            padding: "34px 26px",
            background: "linear-gradient(135deg, rgba(34,197,94,0.18) 0%, rgba(14,165,233,0.16) 48%, rgba(0,0,0,0.62) 100%)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 25px 90px rgba(0,0,0,0.38)",
            marginBottom: "22px",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "26px", alignItems: "center" }}>
            <div>
              <div
                style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.10)",
                  color: "#eafff2",
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  marginBottom: "14px",
                }}
              >
                New visible step
              </div>
              <h1 style={{ margin: "0 0 12px", fontSize: "44px", lineHeight: 1.04 }}>
                Broker Account is now part of the main launch flow
              </h1>
              <p style={{ margin: 0, color: "#d9e5ff", fontSize: "18px", lineHeight: 1.75, maxWidth: "720px" }}>
                This keeps the liability-insurance workflow moving even while the live Checkr setup is blocked. The broker can log in, open a dashboard, and review the driver information needed for insurance work.
              </p>
            </div>

            <div
              style={{
                borderRadius: "28px",
                padding: "22px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#dfffee", marginBottom: "12px" }}>
                Broker workflow now
              </div>
              <div style={{ display: "grid", gap: "12px" }}>
                {[
                  "Broker login page",
                  "Broker dashboard page",
                  "Driver details ready for broker review",
                  "Checkr pass/fail placeholder ready for later",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      borderRadius: "18px",
                      padding: "12px 14px",
                      background: "rgba(0,0,0,0.22)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#e6f6ff",
                      fontWeight: 700,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
          {launchCards.map((card) => (
            <div
              key={card.title}
              style={{
                borderRadius: "24px",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.05)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.24)",
              }}
            >
              <div style={{ height: "10px", background: card.tone }} />
              <div style={{ padding: "22px" }}>
                <div style={{ fontSize: "24px", fontWeight: 800, marginBottom: "10px" }}>{card.title}</div>
                <div style={{ color: "#d9e5ff", lineHeight: 1.7, minHeight: "88px" }}>{card.text}</div>
                <Link
                  href={card.href}
                  style={{
                    display: "inline-block",
                    marginTop: "16px",
                    textDecoration: "none",
                    color: "#09111f",
                    background: "#ffffff",
                    padding: "12px 16px",
                    borderRadius: "14px",
                    fontWeight: 800,
                  }}
                >
                  {card.cta}
                </Link>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
