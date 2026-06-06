import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        color: "#102a43",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1120px", margin: "0 auto", padding: "28px 20px 96px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: "24px", color: "#1d4ed8" }}>On-Time Taxi</div>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", fontWeight: 700 }}>
            <Link href="/ride" style={{ textDecoration: "none", color: "#334155" }}>Ride</Link>
            <Link href="/get-app" style={{ textDecoration: "none", color: "#334155" }}>Get app</Link>
            <Link href="/cities" style={{ textDecoration: "none", color: "#334155" }}>Cities</Link>
            <Link href="/admin" style={{ textDecoration: "none", color: "#1d4ed8" }}>Admin</Link>
          </div>
        </div>

        <section
          style={{
            background: "#b42318",
            color: "#ffffff",
            borderRadius: "20px",
            padding: "18px 20px",
            marginBottom: "18px",
            boxShadow: "0 16px 36px rgba(180, 35, 24, 0.25)",
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.95 }}>
            Homepage Update
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, marginTop: "6px" }}>
            Admin console is now part of the homepage build.
          </div>
          <div style={{ fontSize: "16px", lineHeight: 1.6, marginTop: "8px", maxWidth: "900px" }}>
            This homepage now visibly includes the owner/admin path, not just the ride side of the site.
          </div>
        </section>

        <section
          style={{
            background: "#ffffff",
            border: "1px solid #d9e2ec",
            borderRadius: "24px",
            padding: "34px 28px",
            boxShadow: "0 20px 48px rgba(15, 23, 42, 0.08)",
            marginBottom: "22px",
          }}
        >
          <h1 style={{ fontSize: "52px", lineHeight: 1.05, margin: "0 0 16px" }}>
            Get there. On time. Every time.
          </h1>

          <p style={{ margin: 0, fontSize: "19px", lineHeight: 1.7, maxWidth: "840px", color: "#486581" }}>
            Real upfront pricing. Trusted local drivers. No surge surprises hidden in fine print.
            This homepage now shows both the public rider flow and the owner/admin control path.
          </p>

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "24px" }}>
            <Link
              href="/ride"
              style={{
                display: "inline-block",
                textDecoration: "none",
                background: "#1d4ed8",
                color: "#ffffff",
                fontWeight: 700,
                padding: "14px 18px",
                borderRadius: "14px",
              }}
            >
              Open Ride page
            </Link>
            <Link
              href="/admin"
              style={{
                display: "inline-block",
                textDecoration: "none",
                background: "#0f172a",
                color: "#ffffff",
                fontWeight: 800,
                padding: "14px 18px",
                borderRadius: "14px",
              }}
            >
              OPEN ADMIN CONSOLE
            </Link>
          </div>
        </section>

        <section
          style={{
            background: "#0f172a",
            color: "#ffffff",
            borderRadius: "24px",
            padding: "30px 28px",
            boxShadow: "0 20px 48px rgba(15, 23, 42, 0.18)",
            marginBottom: "22px",
            border: "3px solid #1d4ed8",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "8px 12px",
              borderRadius: "999px",
              background: "#1d4ed8",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Admin Console Now Live
          </div>

          <h2 style={{ margin: "0 0 12px", fontSize: "40px", lineHeight: 1.1 }}>
            Owner and admin controls are available from this homepage.
          </h2>

          <p style={{ margin: 0, fontSize: "18px", lineHeight: 1.7, maxWidth: "860px", color: "#cbd5e1" }}>
            The admin panel is no longer treated like a hidden back page. This homepage now clearly shows
            the admin path, the owner-control direction, and the system-control build moving forward.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginTop: "22px",
            }}
          >
            <div style={{ background: "#111c34", border: "1px solid #334155", borderRadius: "18px", padding: "18px" }}>
              <h3 style={{ marginTop: 0 }}>Executive Controls</h3>
              <p style={{ marginBottom: 0, color: "#cbd5e1" }}>
                Dispatch overrides, emergency controls, free-ride controls, and owner-side actions.
              </p>
            </div>
            <div style={{ background: "#111c34", border: "1px solid #334155", borderRadius: "18px", padding: "18px" }}>
              <h3 style={{ marginTop: 0 }}>Driver Monitoring</h3>
              <p style={{ marginBottom: 0, color: "#cbd5e1" }}>
                Driver visibility, hotspot tracking, ledger sections, and supervisor workflow controls.
              </p>
            </div>
            <div style={{ background: "#111c34", border: "1px solid #334155", borderRadius: "18px", padding: "18px" }}>
              <h3 style={{ marginTop: 0 }}>System Visibility</h3>
              <p style={{ marginBottom: 0, color: "#cbd5e1" }}>
                API status, state toggles, safety flows, training status, and release-path controls.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "24px" }}>
            <Link
              href="/admin"
              style={{
                display: "inline-block",
                textDecoration: "none",
                background: "#ffffff",
                color: "#0f172a",
                fontWeight: 800,
                padding: "14px 18px",
                borderRadius: "14px",
              }}
            >
              Go to Admin Panel
            </Link>
            <Link
              href="/admin"
              style={{
                display: "inline-block",
                textDecoration: "none",
                background: "#1d4ed8",
                color: "#ffffff",
                fontWeight: 800,
                padding: "14px 18px",
                borderRadius: "14px",
              }}
            >
              Owner Control Area
            </Link>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "22px",
          }}
        >
          <div style={{ background: "#ffffff", border: "1px solid #d9e2ec", borderRadius: "18px", padding: "18px" }}>
            <h3 style={{ marginTop: 0 }}>Ride</h3>
            <p style={{ marginBottom: 0 }}>The Ride page is active and part of the live website path.</p>
          </div>
          <div style={{ background: "#ffffff", border: "1px solid #d9e2ec", borderRadius: "18px", padding: "18px" }}>
            <h3 style={{ marginTop: 0 }}>Get app</h3>
            <p style={{ marginBottom: 0 }}>The app flow continues next with rider and driver paths for Android and iPhone.</p>
          </div>
          <div style={{ background: "#ffffff", border: "1px solid #d9e2ec", borderRadius: "18px", padding: "18px" }}>
            <h3 style={{ marginTop: 0 }}>Cities</h3>
            <p style={{ marginBottom: 0 }}>Cities, geofence rules, and state toggles are being connected step by step.</p>
          </div>
        </section>

        <section
          style={{
            background: "#ffffff",
            border: "1px solid #d9e2ec",
            borderRadius: "18px",
            padding: "22px",
            marginBottom: "18px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Launch status</h2>
          <p style={{ marginBottom: 0 }}>
            The homepage now visibly reflects both the public ride path and the admin-panel work in progress.
          </p>
        </section>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "18px" }}>
          <Link
            href="/admin"
            style={{
              display: "inline-block",
              textDecoration: "none",
              background: "#b42318",
              color: "#ffffff",
              fontWeight: 800,
              padding: "14px 18px",
              borderRadius: "999px",
              boxShadow: "0 14px 30px rgba(180, 35, 24, 0.28)",
            }}
          >
            Admin @
          </Link>
        </div>
      </div>
    </main>
  );
}
