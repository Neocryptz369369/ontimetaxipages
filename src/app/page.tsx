import Image from "next/image";
import Link from "next/link";

const workflowLinks = [
  {
    title: "Broker Account",
    text: "Broker and insurance workflow now lives on its own page instead of taking over the homepage.",
    href: "/broker-account",
    cta: "Open Broker Account",
    tone: "linear-gradient(135deg,#22c55e 0%,#0ea5e9 100%)",
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
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
                src="/ontimetaxi-logo.png"
                alt="On Time Taxi logo"
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
                Serving Clark County Indiana
              </div>
              <div
                style={{
                  fontSize: "30px",
                  fontWeight: 800,
                  lineHeight: 1.1,
                }}
              >
                On Time Taxi
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#d9e5ff",
                  marginTop: "4px",
                }}
              >
                
              </div>
            </div>
          </div>

        </header>

        <section
          style={{
            borderRadius: "34px",
            padding: "34px 26px",
            background: "linear-gradient(135deg, rgba(255,77,187,0.18) 0%, rgba(38,78,255,0.16) 48%, rgba(0,0,0,0.62) 100%)",
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
              background: "radial-gradient(circle, rgba(45,108,255,0.35) 0%, rgba(45,108,255,0.02) 70%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "28px",
              alignItems: "center",
            }}
          >
            <div>
              <h1 style={{ margin: "0 0 12px", fontSize: "48px", lineHeight: 1.02 }}>
                Get there. On Time. Every time.
              </h1>
              <p style={{ margin: 0, color: "#d9e5ff", fontSize: "18px", lineHeight: 1.8, maxWidth: "720px" }}>
                
              </p>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "20px" }}>
                <Link
                  href="/ride"
                  style={{
                    textDecoration: "none",
                    color: "#09111f",
                    background: "#ffffff",
                    padding: "14px 18px",
                    borderRadius: "14px",
                    fontWeight: 800,
                  }}
                >
                  Book a ride
                </Link>
                <Link
                  href="/drive"
                  style={{
                    textDecoration: "none",
                    color: "#ffffff",
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    padding: "14px 18px",
                    borderRadius: "14px",
                    fontWeight: 800,
                  }}
                >
                  Drive with us
                </Link>
              </div>
            </div>

            <div
              style={{
                position: "relative",
                minHeight: "660px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "660px",
                  height: "620px",
                  borderRadius: "34px",
                  padding: "26px",
                  background: "linear-gradient(145deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 100%)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: "26px",
                    borderRadius: "28px",
                    background: "radial-gradient(circle at top, rgba(45,108,255,0.18) 0%, rgba(255,77,187,0.12) 38%, rgba(0,0,0,0.18) 100%)",
                    pointerEvents: "none",
                  }}
                />

                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "580px",
                    height: "540px",
                  }}
                >
                  <Image
                    src="/ontimetaxi-logo.png"
                    alt="On Time Taxi large logo"
                    fill
                    priority
                    style={{
                      objectFit: "contain",
                      padding: "12px 12px 32px 12px",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            borderRadius: "28px",
            padding: "24px",
            marginBottom: "22px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
            {workflowLinks.map((card) => (
              <div
                key={card.title}
                style={{
                  borderRadius: "24px",
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
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
          </div>
        </section>
      </div>
        <Link
          href="/admin"
          aria-label="Admin"
          style={{
            position: "fixed",
            right: "14px",
            bottom: "12px",
            textDecoration: "none",
            color: "rgba(255,255,255,0.22)",
            fontSize: "13px",
            fontWeight: 400,
            lineHeight: 1,
            padding: "4px",
            zIndex: 50,
          }}
        >
          @
        </Link>
    </main>
  );
}
