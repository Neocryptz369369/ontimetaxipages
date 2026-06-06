import Link from "next/link";

export default function DriverOnboardingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        color: "#102a43",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1120px", margin: "0 auto", padding: "32px 20px 96px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "22px",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: "24px", color: "#1d4ed8" }}>On-Time Taxi</div>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", fontWeight: 700 }}>
            <Link href="/" style={{ textDecoration: "none", color: "#334155" }}>Home</Link>
            <Link href="/ride" style={{ textDecoration: "none", color: "#334155" }}>Ride</Link>
            <Link href="/get-app" style={{ textDecoration: "none", color: "#334155" }}>Get app</Link>
            <Link href="/admin" style={{ textDecoration: "none", color: "#1d4ed8" }}>Admin</Link>
          </div>
        </div>

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
          <div
            style={{
              display: "inline-block",
              padding: "8px 12px",
              borderRadius: "999px",
              background: "#dbeafe",
              color: "#1d4ed8",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            Driver Onboarding
          </div>

          <h1 style={{ fontSize: "50px", lineHeight: 1.05, margin: "0 0 16px" }}>
            Driver screening and compliance before approval.
          </h1>

          <p style={{ margin: 0, fontSize: "19px", lineHeight: 1.7, maxWidth: "860px", color: "#486581" }}>
            Drivers are not approved with only a license and insurance. The full onboarding path also
            includes a background check, a driving record check, and a guided list of the proper places
            to complete each required step.
          </p>

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "24px" }}>
            <Link
              href="/admin"
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
              Open Admin Console
            </Link>
            <Link
              href="/"
              style={{
                display: "inline-block",
                textDecoration: "none",
                background: "#eff6ff",
                color: "#1d4ed8",
                fontWeight: 700,
                padding: "14px 18px",
                borderRadius: "14px",
                border: "1px solid #bfdbfe",
              }}
            >
              Back to homepage
            </Link>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "16px",
            marginBottom: "22px",
          }}
        >
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>1. License</h2>
            <p style={bodyStyle}>Upload and verify a valid driver’s license before the account can move forward.</p>
          </div>
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>2. Insurance</h2>
            <p style={bodyStyle}>Upload current insurance and keep it active in the driver record.</p>
          </div>
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>3. Background Check</h2>
            <p style={bodyStyle}>Complete a full background check as part of the driver approval process.</p>
          </div>
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>4. Driving Record Check</h2>
            <p style={bodyStyle}>Complete a driving record review before the driver can be accepted.</p>
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
            border: "2px solid #1d4ed8",
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
            Proper Places To Complete Checks
          </div>

          <h2 style={{ margin: "0 0 12px", fontSize: "38px", lineHeight: 1.1 }}>
            Driver compliance must go through the full screening path.
          </h2>

          <p style={{ margin: 0, fontSize: "18px", lineHeight: 1.7, maxWidth: "860px", color: "#cbd5e1" }}>
            This page gives drivers a clear compliance checklist and a visible place to follow the proper process.
            Provider names and final approved locations can be updated here without changing the structure of the flow.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
              marginTop: "22px",
            }}
          >
            <div style={darkCardStyle}>
              <h3 style={{ marginTop: 0 }}>License verification</h3>
              <p style={darkBodyStyle}>Approved upload / verification location to be used for license review.</p>
            </div>
            <div style={darkCardStyle}>
              <h3 style={{ marginTop: 0 }}>Insurance verification</h3>
              <p style={darkBodyStyle}>Approved upload / verification location to be used for insurance review.</p>
            </div>
            <div style={darkCardStyle}>
              <h3 style={{ marginTop: 0 }}>Background check provider</h3>
              <p style={darkBodyStyle}>Approved provider / path for completing the required background check.</p>
            </div>
            <div style={darkCardStyle}>
              <h3 style={{ marginTop: 0 }}>Driving record provider</h3>
              <p style={darkBodyStyle}>Approved provider / path for completing the required driving record check.</p>
            </div>
          </div>
        </section>

        <section
          style={{
            background: "#ffffff",
            border: "1px solid #d9e2ec",
            borderRadius: "18px",
            padding: "22px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Approval rule</h2>
          <p style={{ marginBottom: 0, lineHeight: 1.7, color: "#486581" }}>
            Drivers should not be marked accepted until the license, insurance, background check, and driving record check are all completed and reviewed.
          </p>
        </section>
      </div>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d9e2ec",
  borderRadius: "18px",
  padding: "18px",
};

const darkCardStyle: React.CSSProperties = {
  background: "#111c34",
  border: "1px solid #334155",
  borderRadius: "18px",
  padding: "18px",
};

const bodyStyle: React.CSSProperties = {
  marginBottom: 0,
  color: "#486581",
  lineHeight: 1.7,
};

const darkBodyStyle: React.CSSProperties = {
  marginBottom: 0,
  color: "#cbd5e1",
  lineHeight: 1.7,
};
