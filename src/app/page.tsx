import Link from "next/link";

function cardStyle(): React.CSSProperties {
  return {
    background: "#ffffff",
    border: "1px solid #d9e2ec",
    borderRadius: "14px",
    padding: "20px",
  };
}

export default function HomePage() {
  return (
    <main
      style={{
        fontFamily: "Arial, sans-serif",
        minHeight: "100vh",
        color: "#102a43",
        background: "#f5f7fb",
      }}
    >
      <section style={{ maxWidth: "1040px", margin: "0 auto", padding: "40px 20px 72px" }}>
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#486581",
          }}
        >
          On-Time Taxi
        </p>

        <h1 style={{ fontSize: "48px", lineHeight: 1.1, margin: "16px 0" }}>
          Fast rides. Simple booking. Local service.
        </h1>

        <p style={{ fontSize: "20px", lineHeight: 1.6, maxWidth: "780px", marginBottom: "32px" }}>
          This is the live working homepage for the web launch. It now shows both the public ride flow
          and the owner/admin control direction so the admin work is visible here too.
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "36px" }}>
          <Link
            href="/ride"
            style={{
              background: "#0b66ff",
              color: "#ffffff",
              padding: "14px 20px",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Open Ride page
          </Link>

          <Link
            href="/admin"
            style={{
              background: "#102a43",
              color: "#ffffff",
              padding: "14px 20px",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Open Admin Console
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div style={cardStyle()}>
            <h2 style={{ marginTop: 0 }}>Ride</h2>
            <p style={{ marginBottom: 0 }}>
              The Ride page is active and connected into the live site path.
            </p>
          </div>

          <div style={cardStyle()}>
            <h2 style={{ marginTop: 0 }}>Get app</h2>
            <p style={{ marginBottom: 0 }}>
              The app flow continues next with rider and driver paths for Android and iPhone.
            </p>
          </div>

          <div style={cardStyle()}>
            <h2 style={{ marginTop: 0 }}>Cities</h2>
            <p style={{ marginBottom: 0 }}>
              Cities, state rules, and the rest of the launch items are being connected step by step.
            </p>
          </div>
        </div>

        <section
          style={{
            background: "#ffffff",
            border: "1px solid #d9e2ec",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "24px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "10px" }}>Admin Console Now Live</h2>
          <p style={{ fontSize: "18px", lineHeight: 1.6, color: "#486581", marginTop: 0 }}>
            The owner-side admin panel work is now visible from the homepage and linked directly into
            the live admin route.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
              marginTop: "18px",
            }}
          >
            <div style={cardStyle()}>
              <h3 style={{ marginTop: 0 }}>Executive Controls</h3>
              <p style={{ marginBottom: 0 }}>
                Override actions, dispatch controls, emergency actions, and visibility tools.
              </p>
            </div>
            <div style={cardStyle()}>
              <h3 style={{ marginTop: 0 }}>Driver Monitoring</h3>
              <p style={{ marginBottom: 0 }}>
                Ledger, hotspot visibility, state controls, and admin-facing driver tracking.
              </p>
            </div>
            <div style={cardStyle()}>
              <h3 style={{ marginTop: 0 }}>System Status</h3>
              <p style={{ marginBottom: 0 }}>
                API visibility, network status, and release-path operational controls.
              </p>
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <Link
              href="/admin"
              style={{
                display: "inline-block",
                background: "#0b66ff",
                color: "#ffffff",
                padding: "14px 18px",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Go to Admin Panel
            </Link>
          </div>
        </section>

        <div style={{ background: "#ffffff", border: "1px solid #d9e2ec", borderRadius: "14px", padding: "24px" }}>
          <h2 style={{ marginTop: 0 }}>Launch status</h2>
          <p style={{ marginBottom: 0 }}>
            The homepage now shows visible progress for both the public website and the admin-panel work.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "32px" }}>
          <Link
            href="/admin"
            style={{
              color: "#0b66ff",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "18px",
            }}
          >
            Admin @
          </Link>
        </div>
      </section>
    </main>
  );
}
