import Link from "next/link";

const checklist = [
  {
    number: "01",
    title: "Driver's license",
    body: "Upload a valid driver's license before review can begin.",
  },
  {
    number: "02",
    title: "Insurance",
    body: "Provide current insurance information that matches the vehicle being used.",
  },
  {
    number: "03",
    title: "Background check",
    body: "Complete a full background screening before approval.",
  },
  {
    number: "04",
    title: "Driving record check",
    body: "Complete the driving-history review for your state before activation.",
  },
];

const processFlow = [
  "Upload license and insurance first.",
  "Complete the background check with the approved provider.",
  "Complete the driving record review for the driver's state.",
  "Wait for full compliance review before expecting approval.",
];

const shell: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg,#f8fafc 0%,#eef2ff 100%)",
  fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif",
  color: "#0f172a",
};

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 20,
  border: "1px solid #e5e7eb",
  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
  padding: 24,
};

export default function DriverOnboardingPage() {
  return (
    <main style={shell}>
      <section style={{ background: "#0f172a", color: "#fff", padding: "48px 16px 40px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#facc15", margin: 0 }}>
            Driver approval path
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: "12px 0 0", lineHeight: 1.15 }}>
            Driver onboarding and compliance review
          </h1>
          <p style={{ marginTop: 16, fontSize: 16, lineHeight: 1.6, color: "#cbd5e1", maxWidth: 640 }}>
            This is a checklist-style review screen that makes the full driver approval path visible
            before a driver is accepted.
          </p>

          <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link
              href="/"
              style={{
                display: "inline-flex", alignItems: "center", borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.08)",
                padding: "12px 20px", fontSize: 14, fontWeight: 700, color: "#fff", textDecoration: "none",
              }}
            >
              Back to homepage
            </Link>
            <Link
              href="/driver-login"
              style={{
                display: "inline-flex", alignItems: "center", borderRadius: 999,
                background: "#facc15", padding: "12px 20px", fontSize: 14, fontWeight: 800,
                color: "#111827", textDecoration: "none",
              }}
            >
              Start driver application
            </Link>
          </div>

          <div style={{
            marginTop: 32, borderRadius: 20, border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.06)", padding: 20, maxWidth: 640,
          }}>
            <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#facc15", margin: 0 }}>
              Plain rule
            </p>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "10px 0 0" }}>
              Not approved with only 2 items
            </h2>
            <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, color: "#cbd5e1" }}>
              A driver is not approved with only a license and insurance. Background screening and
              driving record review are also required before activation.
            </p>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 960, margin: "0 auto", padding: "32px 16px" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid #e2e8f0", paddingBottom: 14, marginBottom: 20, gap: 12, flexWrap: "wrap",
        }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#64748b", margin: 0 }}>
              Checklist board
            </p>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: "6px 0 0" }}>Required compliance items</h2>
          </div>
          <div style={{
            borderRadius: 999, background: "#0f172a", color: "#facc15",
            fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", padding: "8px 16px",
          }}>
            4 required checks
          </div>
        </div>

        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {checklist.map((item) => (
            <div key={item.number} style={card}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{
                  flexShrink: 0, width: 44, height: 44, borderRadius: 12, background: "#0f172a",
                  color: "#facc15", display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: 14,
                }}>
                  {item.number}
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>{item.title}</h3>
                  <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6, color: "#475569" }}>{item.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 960, margin: "0 auto", padding: "0 16px 48px" }}>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          <div style={{ ...card, background: "#eef2ff" }}>
            <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#64748b", margin: 0 }}>
              Review status
            </p>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: "10px 0 0" }}>Approval happens after full review</h2>
            <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, color: "#475569" }}>
              Driver activation comes after the complete compliance review, not before it.
            </p>
          </div>

          <div style={card}>
            <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#64748b", margin: 0 }}>
              Process flow
            </p>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              {processFlow.map((step, index) => (
                <div key={step} style={{
                  display: "flex", gap: 12, borderRadius: 14, border: "1px solid #e2e8f0",
                  background: "#f8fafc", padding: 12,
                }}>
                  <div style={{
                    flexShrink: 0, width: 28, height: 28, borderRadius: "50%", background: "#facc15",
                    color: "#111827", display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 13,
                  }}>
                    {index + 1}
                  </div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#334155" }}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
