import Link from "next/link";

const adminCards = [
  {
    title: "Marquee manager",
    text: "Create, edit, and delete app marquee ads from one admin page.",
    href: "/admin/marquee",
    tone: "linear-gradient(135deg,#ff4db8 0%,#2f6dff 100%)",
    cta: "Open marquee manager",
  },
  {
    title: "Panic archive",
    text: "Keep rider, driver, and owner panic recordings organized in separate review lanes.",
    href: "/admin/panic-archive",
    tone: "linear-gradient(135deg,#1d4ed8 0%,#22d3ee 100%)",
    cta: "Open panic archive",
  },
  {
    title: "Supervisor workflow",
    text: "Keep the supervisor free-ride section ready for the step after marquee.",
    href: "/supervisors",
    tone: "linear-gradient(135deg,#7c3aed 0%,#ec4899 100%)",
    cta: "Open supervisors",
  },
];

export default function AdminPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #14213d 0%, #09101d 44%, #03060b 100%)",
        color: "#ffffff",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "28px 18px 80px" }}>
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
              Admin control lane
            </div>
            <h1 style={{ margin: 0, fontSize: "42px", lineHeight: 1.05 }}>Rider On Time admin console</h1>
            <p style={{ margin: "12px 0 0", color: "#d9e5ff", fontSize: "17px", lineHeight: 1.7, maxWidth: "760px" }}>
              This admin page now points clearly to the marquee manager so ad control is part of the live build.
            </p>
          </div>

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
        </div>

        <section
          style={{
            borderRadius: "28px",
            padding: "26px",
            marginBottom: "22px",
            background: "linear-gradient(135deg, rgba(255,77,184,0.18) 0%, rgba(47,109,255,0.18) 52%, rgba(255,255,255,0.05) 100%)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
          }}
        >
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
            Current build step
          </div>
          <h2 style={{ margin: "0 0 10px", fontSize: "34px", lineHeight: 1.08 }}>Admin marquee manager is the live step now</h2>
          <p style={{ margin: 0, color: "#d9e5ff", fontSize: "18px", lineHeight: 1.7, maxWidth: "820px" }}>
            This step gives Dennis a clear admin page for normal app ads, authority-driven alerts, and edit/delete controls.
          </p>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
            marginBottom: "22px",
          }}
        >
          {adminCards.map((card) => (
            <div
              key={card.title}
              style={{
                borderRadius: "24px",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.05)",
                boxShadow: "0 18px 40px rgba(0,0,0,0.24)",
              }}
            >
              <div style={{ padding: "16px 18px", background: card.tone, fontWeight: 800, fontSize: "20px" }}>{card.title}</div>
              <div style={{ padding: "18px" }}>
                <p style={{ margin: "0 0 16px", color: "#d9e5ff", lineHeight: 1.7, minHeight: "84px" }}>{card.text}</p>
                <Link
                  href={card.href}
                  style={{
                    textDecoration: "none",
                    display: "inline-block",
                    background: "#ffffff",
                    color: "#09111f",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    fontWeight: 800,
                  }}
                >
                  {card.cta}
                </Link>
              </div>
            </div>
          ))}
        </section>

        <section
          style={{
            borderRadius: "24px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
            padding: "24px",
          }}
        >
          <h3 style={{ marginTop: 0, fontSize: "26px" }}>What this admin step now covers</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
            {[
              "+ New Ad button",
              "Edit and Delete actions",
              "normal ads separated from authority alerts",
              "homepage-visible marquee progress",
              "admin route for ad management",
              "live deploy-ready step",
            ].map((item) => (
              <div
                key={item}
                style={{
                  borderRadius: "18px",
                  padding: "16px",
                  background: "rgba(0,0,0,0.24)",
                  color: "#ffffff",
                  fontWeight: 700,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
