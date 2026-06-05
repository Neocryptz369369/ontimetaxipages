import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        fontFamily: "Arial, sans-serif",
        minHeight: "100vh",
        color: "#102a43",
      }}
    >
      <section style={{ maxWidth: "960px", margin: "0 auto", padding: "40px 20px 72px" }}>
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

        <p style={{ fontSize: "20px", lineHeight: 1.6, maxWidth: "760px", marginBottom: "32px" }}>
          This is the new working homepage for the web launch. It gives you a real visible website
          change right now and connects to the new Ride page.
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "40px" }}>
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
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <div style={{ background: "#ffffff", border: "1px solid #d9e2ec", borderRadius: "14px", padding: "20px" }}>
            <h2 style={{ marginTop: 0 }}>Ride</h2>
            <p style={{ marginBottom: 0 }}>The new Ride page is now part of the site path.</p>
          </div>
          <div style={{ background: "#ffffff", border: "1px solid #d9e2ec", borderRadius: "14px", padding: "20px" }}>
            <h2 style={{ marginTop: 0 }}>Get app</h2>
            <p style={{ marginBottom: 0 }}>This will be the next website step after Ride.</p>
          </div>
          <div style={{ background: "#ffffff", border: "1px solid #d9e2ec", borderRadius: "14px", padding: "20px" }}>
            <h2 style={{ marginTop: 0 }}>Cities</h2>
            <p style={{ marginBottom: 0 }}>Cities, Admin, and the rest can be added after this first visible change.</p>
          </div>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #d9e2ec", borderRadius: "14px", padding: "24px" }}>
          <h2 style={{ marginTop: 0 }}>Launch status</h2>
          <p style={{ marginBottom: 0 }}>
            You now have a real homepage scaffold in this repo instead of placeholder files.
          </p>
        </div>
      </section>
    </main>
  );
}
