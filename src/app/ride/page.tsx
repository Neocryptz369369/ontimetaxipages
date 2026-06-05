import Link from "next/link";

export default function RidePage() {
  return (
    <main
      style={{
        fontFamily: "Arial, sans-serif",
        minHeight: "100vh",
        background: "#0f172a",
        color: "#ffffff",
      }}
    >
      <section style={{ maxWidth: "960px", margin: "0 auto", padding: "48px 20px 72px" }}>
        <Link href="/" style={{ color: "#93c5fd", textDecoration: "none", fontWeight: 700 }}>
          ← Back to homepage
        </Link>

        <h1 style={{ fontSize: "48px", lineHeight: 1.1, margin: "20px 0 16px" }}>
          Ride with On-Time Taxi
        </h1>

        <p style={{ fontSize: "20px", lineHeight: 1.6, maxWidth: "760px" }}>
          Book a safe, simple ride when you need to go anywhere in the city.
        </p>

        <div
          style={{
            marginTop: "32px",
            background: "#ffffff",
            color: "#102a43",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Need a ride now or later?</h2>
          <p>
            We offer local rides, airport trips, scheduled pickups, and simple booking from your phone.
          </p><ul>
            <li>Fast local rides</li>
            <li>Airport pickup and drop-off</li>
            <li>Simple booking</li>
            <li>Friendly drivers</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
