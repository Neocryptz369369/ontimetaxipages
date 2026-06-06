import Image from "next/image";
import Link from "next/link";

const featureCards = [
  {
    title: "Panic Archive",
    text: "Separated panic-recording archive areas for rider, driver, and owner events are part of the live build.",
    href: "/admin/panic-archive",
    button: "Open panic archive",
  },
  {
    title: "Marquee Manager",
    text: "The admin route now takes you to a working marquee page with Add, Edit, Preview, and Delete actions.",
    href: "/admin/marquee",
    button: "Open marquee manager",
  },
  {
    title: "Supervisor Free Rides",
    text: "The next live step now shows supervisor slots, driver ID search, and free-ride queue actions.",
    href: "/supervisors",
    button: "Open supervisors",
  },
  {
    title: "Admin Console",
    text: "Owner controls, compliance, and review lanes stay visible from the homepage path.",
    href: "/admin",
    button: "Open admin console",
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
      <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "22px 18px 90px" }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "78px",
                height: "78px",
                borderRadius: "18px",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.16)",
                boxShadow: "0 0 30px rgba(73,196,255,0.20), 0 0 22px rgba(255,74,187,0.18)",
                background: "#05070d",
                flexShrink: 0,
              }}
            >
              <Image
                src="/rider-on-time-logo.jpg"
                alt="Rider On Time logo"
                width={78}
                height={78}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                priority
              />
            </div>

            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 800,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#8fdcff",
                }}
              >
                Live homepage brand update
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, lineHeight: 1.1 }}>Rider On Time</div>
            </div>
          </div>

          <nav style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
            {[
              ["Ride", "/ride"],
              ["Drive", "/drive"],
              ["Get app", "/get-app"],
              ["Cities", "/cities"],
              ["Admin", "/admin"],
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
                  background: href === "/admin" ? "linear-gradient(135deg,#2d6cff 0%,#19b5ff 100%)" : "rgba(255,255,255,0.05)",
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
            background: "linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(236,72,153,0.18) 48%, rgba(0,0,0,0.62) 100%)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 25px 90px rgba(0,0,0,0.38)",
            overflow: "hidden",
            position: "relative",
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "auto -120px -120px auto",
              width: "320px",
              height: "320px",
              borderRadius: "999px",
              background: "radial-gradient(circle, rgba(124,58,237,0.35) 0%, rgba(124,58,237,0.02) 70%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "26px", alignItems: "center" }}>
            <div>
              <div
                style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.10)",
                  color: "#ffe3f4",
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                }}
              >
                Homepage step now visible
              </div>

              <h1
                style={{
                  margin: "0 0 14px",
                  fontSize: "clamp(38px, 7vw, 66px)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.03em",
                }}
              >
                Get there.<br />
                On Time.<br />
                Every time.
              </h1>

              <p
                style={{
                  margin: "0 0 22px",
                  fontSize: "18px",
                  lineHeight: 1.7,
                  color: "#f5e9ff",
                  maxWidth: "720px",
                }}
              >
                The supervisor free-ride step is now visible from the homepage with driver ID search, monthly ride status, and clear-after-received actions.
              </p>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Link
                  href="/supervisors"
                  style={{
                    textDecoration: "none",
                    background: "#ffffff",
                    color: "#09111f",
                    fontWeight: 800,
                    padding: "14px 18px",
                    borderRadius: "14px",
                  }}
                >
                  Open supervisor board
                </Link>
                <Link
                  href="/admin"
                  style={{
                    textDecoration: "none",
                    background: "rgba(255,255,255,0.08)",
                    color: "#ffffff",
                    fontWeight: 800,
                    padding: "14px 18px",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.16)",
                  }}
                >
                  Open admin console
                </Link>
              </div>
            </div>

            <div
              style={{
                borderRadius: "30px",
                padding: "18px",
                background: "rgba(0,0,0,0.34)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ display: "grid", gap: "12px" }}>
                {[
                  "First five accepted drivers become supervisors",
                  "One free ride every month",
                  "Search by driver ID",
                  "X clear after ride is received",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      borderRadius: "18px",
                      padding: "16px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      fontWeight: 700,
                      color: "#f5e9ff",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
            marginBottom: "22px",
          }}
        >
          {featureCards.map((card) => (
            <div
              key={card.title}
              style={{
                borderRadius: "24px",
                padding: "22px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.18)",
              }}
            >
              <div style={{ fontSize: "20px", fontWeight: 800, marginBottom: "10px" }}>{card.title}</div>
              <div style={{ color: "#d8e4ff", lineHeight: 1.7, fontSize: "15px", minHeight: "100px" }}>{card.text}</div>
              <Link
                href={card.href}
                style={{
                  display: "inline-block",
                  marginTop: "16px",
                  textDecoration: "none",
                  background: "#ffffff",
                  color: "#09111f",
                  fontWeight: 800,
                  padding: "12px 14px",
                  borderRadius: "12px",
                }}
              >
                {card.button}
              </Link>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
