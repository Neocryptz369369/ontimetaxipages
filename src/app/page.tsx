import Image from "next/image";
import Link from "next/link";
import VideoLanguagePicker from "../components/VideoLanguagePicker";

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
                  href="/driver-login?tab=signup"
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
          <a
            href="https://apps.apple.com/app/on-time-taxi-usa/id6805156362"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              color: "#ffffff",
              background: "#000000",
              border: "1px solid rgba(255,255,255,0.28)",
              padding: "10px 18px",
              borderRadius: "14px",
              fontWeight: 800,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 384 512" fill="#ffffff" aria-hidden="true">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
            </svg>
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
              <span style={{ fontSize: "11px", fontWeight: 500 }}>Download on the</span>
              <span style={{ fontSize: "17px", fontWeight: 800 }}>App Store</span>
            </span>
          </a>
              </div>
              <div style={{ marginTop: "22px", maxWidth: "560px", width: "100%" }}>
                <VideoLanguagePicker />
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
