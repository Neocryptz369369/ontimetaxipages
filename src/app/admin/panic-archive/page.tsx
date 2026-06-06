import Link from "next/link";

const archiveGroups = [
  {
    title: "Driver audio",
    color: "#38bdf8",
    records: [
      { id: "DR-1044", file: "driver-audio-1044.wav", time: "2 min ago", state: "New" },
      { id: "DR-7721", file: "driver-audio-7721.wav", time: "18 min ago", state: "Reviewed" },
    ],
  },
  {
    title: "Driver video",
    color: "#22c55e",
    records: [
      { id: "DR-1044", file: "driver-video-1044.mp4", time: "2 min ago", state: "New" },
      { id: "DR-6620", file: "driver-video-6620.mp4", time: "33 min ago", state: "Hold" },
    ],
  },
  {
    title: "Rider audio",
    color: "#f472b6",
    records: [
      { id: "CU-2001", file: "rider-audio-2001.wav", time: "7 min ago", state: "New" },
      { id: "CU-2014", file: "rider-audio-2014.wav", time: "49 min ago", state: "Reviewed" },
    ],
  },
  {
    title: "Rider video",
    color: "#f59e0b",
    records: [
      { id: "CU-2001", file: "rider-video-2001.mp4", time: "7 min ago", state: "New" },
      { id: "CU-2058", file: "rider-video-2058.mp4", time: "1 hr ago", state: "Hold" },
    ],
  },
  {
    title: "Owner app audio",
    color: "#a78bfa",
    records: [
      { id: "OWN-0001", file: "owner-audio-0001.wav", time: "12 min ago", state: "New" },
      { id: "OWN-0004", file: "owner-audio-0004.wav", time: "Yesterday", state: "Reviewed" },
    ],
  },
  {
    title: "Owner app video",
    color: "#fb7185",
    records: [
      { id: "OWN-0001", file: "owner-video-0001.mp4", time: "12 min ago", state: "New" },
      { id: "OWN-0004", file: "owner-video-0004.mp4", time: "Yesterday", state: "Reviewed" },
    ],
  },
];

const holdArea = [
  { type: "Driver video", id: "DR-6620", left: "4 days left" },
  { type: "Rider video", id: "CU-2058", left: "2 days left" },
  { type: "Owner app audio", id: "OWN-0004", left: "1 day left" },
];

function stateStyle(state: string) {
  if (state === "New") return { background: "rgba(255,77,184,0.16)", color: "#ffd1f0", border: "1px solid rgba(255,77,184,0.28)" };
  if (state === "Hold") return { background: "rgba(245,158,11,0.16)", color: "#ffe3a6", border: "1px solid rgba(245,158,11,0.28)" };
  return { background: "rgba(34,197,94,0.16)", color: "#cbffe0", border: "1px solid rgba(34,197,94,0.28)" };
}

export default function PanicArchivePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #14213d 0%, #09101d 44%, #03060b 100%)",
        color: "#ffffff",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "28px 18px 80px" }}>
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
              Emergency recordings lane
            </div>
            <h1 style={{ margin: 0, fontSize: "42px", lineHeight: 1.05 }}>Panic archive and review board</h1>
            <p style={{ margin: "12px 0 0", color: "#d9e5ff", fontSize: "17px", lineHeight: 1.7, maxWidth: "860px" }}>
              This step separates rider, driver, and owner panic recordings into 6 archive areas and gives Dennis a review path for search, download, delete, and restore handling.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href="/admin"
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
              Back to admin
            </Link>
            <Link
              href="/"
              style={{
                textDecoration: "none",
                color: "#09111f",
                background: "#ffffff",
                padding: "12px 16px",
                borderRadius: "14px",
                fontWeight: 800,
              }}
            >
              Back to homepage
            </Link>
          </div>
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
            marginBottom: "22px",
          }}
        >
          {[
            ["Archive areas", "6"],
            ["Records awaiting review", "5"],
            ["Deleted hold queue", "3"],
            ["ID search enabled", "Yes"],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                borderRadius: "22px",
                padding: "20px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
              }}
            >
              <div style={{ color: "#9fb7e5", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800 }}>{label}</div>
              <div style={{ marginTop: "10px", fontSize: "34px", fontWeight: 800 }}>{value}</div>
            </div>
          ))}
        </section>

        <section
          style={{
            borderRadius: "24px",
            padding: "22px",
            marginBottom: "22px",
            background: "linear-gradient(135deg, rgba(255,77,184,0.18) 0%, rgba(47,109,255,0.18) 55%, rgba(255,255,255,0.04) 100%)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: "14px", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800, color: "#d9e5ff" }}>Search by ID</div>
              <p style={{ margin: "8px 0 0", color: "#d9e5ff", lineHeight: 1.7 }}>
                Search should match driver IDs, customer IDs, or owner recording IDs when Dennis needs to find a panic event fast.
              </p>
            </div>
            <div
              style={{
                minWidth: "280px",
                borderRadius: "16px",
                background: "rgba(0,0,0,0.26)",
                border: "1px solid rgba(255,255,255,0.12)",
                padding: "14px 16px",
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              Search IDs: DR-1044 / CU-2001 / OWN-0001
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))",
            gap: "16px",
            marginBottom: "22px",
          }}
        >
          {archiveGroups.map((group) => (
            <div
              key={group.title}
              style={{
                borderRadius: "24px",
                overflow: "hidden",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow: "0 18px 40px rgba(0,0,0,0.24)",
              }}
            >
              <div style={{ padding: "16px 18px", background: group.color, color: "#08111f", fontWeight: 800, fontSize: "22px" }}>{group.title}</div>
              <div style={{ padding: "18px" }}>
                {group.records.map((record) => (
                  <div
                    key={record.file}
                    style={{
                      borderRadius: "18px",
                      padding: "16px",
                      background: "rgba(0,0,0,0.22)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      marginBottom: "12px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "10px" }}>
                      <div style={{ fontWeight: 800, fontSize: "18px" }}>{record.file}</div>
                      <div style={{ ...stateStyle(record.state), borderRadius: "999px", padding: "6px 10px", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {record.state}
                      </div>
                    </div>
                    <div style={{ color: "#bcd0f8", fontSize: "14px", marginBottom: "12px" }}>ID: {record.id} • Received: {record.time}</div>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {[
                        ["Review", "#ffffff", "#09111f"],
                        ["Download", "rgba(255,255,255,0.08)", "#ffffff"],
                        ["Delete", "rgba(255,77,184,0.16)", "#ffd1f0"],
                      ].map(([label, bg, color]) => (
                        <div
                          key={label}
                          style={{
                            padding: "10px 12px",
                            borderRadius: "12px",
                            background: bg,
                            color,
                            fontWeight: 800,
                            border: "1px solid rgba(255,255,255,0.10)",
                          }}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: "16px",
          }}
        >
          <div
            style={{
              borderRadius: "24px",
              padding: "22px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: "28px" }}>Deleted hold area</h2>
            <p style={{ color: "#d9e5ff", lineHeight: 1.7 }}>
              Delete should not permanently remove a recording right away. The hold area keeps a recovery window before final expiry.
            </p>
            <div style={{ display: "grid", gap: "12px" }}>
              {holdArea.map((item) => (
                <div
                  key={item.type + item.id}
                  style={{
                    borderRadius: "18px",
                    padding: "16px",
                    background: "rgba(0,0,0,0.24)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800 }}>{item.type}</div>
                    <div style={{ color: "#bcd0f8", marginTop: "6px" }}>ID: {item.id}</div>
                  </div>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ color: "#ffe3a6", fontWeight: 800 }}>{item.left}</div>
                    <div style={{ padding: "10px 12px", borderRadius: "12px", background: "#ffffff", color: "#09111f", fontWeight: 800 }}>Restore</div>
                    <div style={{ padding: "10px 12px", borderRadius: "12px", background: "rgba(255,255,255,0.08)", color: "#ffffff", fontWeight: 800 }}>Extend hold</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              borderRadius: "24px",
              padding: "22px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: "28px" }}>Important notes</h2>
            <div style={{ display: "grid", gap: "12px" }}>
              {[
                "Keep rider, driver, and owner recordings separate.",
                "Show IDs with each recording entry.",
                "Let Dennis review before permanent deletion.",
                "Email destination still needs exact confirmation before wiring alerts.",
                "This is a live admin build step, but localhost is still preview-only.",
              ].map((note) => (
                <div
                  key={note}
                  style={{
                    borderRadius: "16px",
                    padding: "14px 16px",
                    background: "rgba(0,0,0,0.24)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#d9e5ff",
                    lineHeight: 1.7,
                  }}
                >
                  {note}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
