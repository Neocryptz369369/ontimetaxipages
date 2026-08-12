'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type DocKey = "license" | "insurance" | "background" | "driving_record";
type ReviewStatus = "Approved" | "Denied";

type ReviewRecord = {
  id: DocKey;
  label: string;
  fileName: string;
  fileSize: number;
  fileSizeText: string;
  mimeType: string;
  decision: ReviewStatus;
  reason: string;
  sentAt: string;
  photoUrl?: string;
};

const storageKey = "riderOnTimeComplianceUploads";

function decisionStyle(decision: ReviewStatus) {
  return decision === "Approved"
    ? {
        background: "rgba(34,197,94,0.16)",
        color: "#cbffe0",
        border: "1px solid rgba(34,197,94,0.28)",
      }
    : {
        background: "rgba(255,77,184,0.16)",
        color: "#ffd1f0",
        border: "1px solid rgba(255,77,184,0.28)",
      };
}

export default function ComplianceReviewPage() {
  const [records, setRecords] = useState<ReviewRecord[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setRecords(parsed as ReviewRecord[]);
      }
    } catch {
      setRecords([]);
    }
  }, []);

  const approvedCount = useMemo(
    () => records.filter((record) => record.decision === "Approved").length,
    [records]
  );

  const deniedCount = useMemo(
    () => records.filter((record) => record.decision === "Denied").length,
    [records]
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #1a2238 0%, #0b1120 44%, #04060b 100%)",
        color: "#ffffff",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "28px 18px 80px" }}>
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
              Admin console lane
            </div>
            <h1 style={{ margin: 0, fontSize: "42px", lineHeight: 1.05 }}>
              Driver compliance review results
            </h1>
            <p
              style={{
                margin: "12px 0 0",
                color: "#d9e5ff",
                fontSize: "17px",
                lineHeight: 1.7,
                maxWidth: "900px",
              }}
            >
              This page receives the sent driver files and shows the automated approval or denial result for each one. Background check and driving record items are treated as separate-agency-required files.
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
              href="/drive/upload-docs"
              style={{
                textDecoration: "none",
                color: "#09111f",
                background: "#ffffff",
                padding: "12px 16px",
                borderRadius: "14px",
                fontWeight: 800,
              }}
            >
              Back to upload page
            </Link>
          </div>
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "22px",
          }}
        >
          <div style={{ borderRadius: "24px", padding: "20px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#bfe8ff" }}>Records received</div>
            <div style={{ fontSize: "34px", fontWeight: 800, marginTop: "10px" }}>{records.length}</div>
          </div>
          <div style={{ borderRadius: "24px", padding: "20px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#bfe8ff" }}>Approved</div>
            <div style={{ fontSize: "34px", fontWeight: 800, marginTop: "10px", color: "#cbffe0" }}>{approvedCount}</div>
          </div>
          <div style={{ borderRadius: "24px", padding: "20px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#bfe8ff" }}>Denied</div>
            <div style={{ fontSize: "34px", fontWeight: 800, marginTop: "10px", color: "#ffd1f0" }}>{deniedCount}</div>
          </div>
        </section>

        <section
          style={{
            borderRadius: "28px",
            padding: "24px",
            background: "linear-gradient(135deg, rgba(125,211,252,0.12) 0%, rgba(168,85,247,0.12) 100%)",
            border: "1px solid rgba(255,255,255,0.12)",
            marginBottom: "22px",
            color: "#e6f6ff",
            lineHeight: 1.8,
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#dbeafe", marginBottom: "10px" }}>
            Review rule now
          </div>
          The automated system handles the decision step after Send. For the background check and driving record, the upload is treated as a separate-agency-required file before the automated decision is shown here.
        </section>

        {records.length === 0 ? (
          <section
            style={{
              borderRadius: "28px",
              padding: "24px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#d9e5ff",
              lineHeight: 1.8,
            }}
          >
            Nothing has been sent here yet. Go to the upload page, upload all 4 files, and press <strong>Send to admin panel</strong>.
          </section>
        ) : (
          <section style={{ display: "grid", gap: "16px" }}>
            {records.map((record) => (
              <div
                key={record.id}
                style={{
                  borderRadius: "26px",
                  padding: "22px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 18px 40px rgba(0,0,0,0.24)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ fontSize: "26px", fontWeight: 800 }}>{record.label}</div>
                  <span
                    style={{
                      ...decisionStyle(record.decision),
                      borderRadius: "999px",
                      padding: "8px 12px",
                      fontSize: "12px",
                      fontWeight: 800,
                    }}
                  >
                    {record.decision}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                  <div style={{ borderRadius: "18px", padding: "14px", background: "rgba(0,0,0,0.20)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#9fc8ea", marginBottom: "8px" }}>File</div>
                    <div style={{ fontWeight: 700 }}>{record.fileName}</div>
                    <div style={{ color: "#cfe3ff", marginTop: "6px" }}>{record.fileSizeText} • {record.mimeType || "unknown"}</div>
                    {record.photoUrl ? (
                      <img
                        src={record.photoUrl}
                        alt="Driver picture"
                        style={{ marginTop: "12px", width: "110px", height: "110px", borderRadius: "999px", objectFit: "cover", border: "2px solid rgba(255,255,255,0.35)", display: "block" }}
                      />
                    ) : null}
                  </div>
                  <div style={{ borderRadius: "18px", padding: "14px", background: "rgba(0,0,0,0.20)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#9fc8ea", marginBottom: "8px" }}>Sent to admin</div>
                    <div style={{ fontWeight: 700 }}>{record.sentAt}</div>
                  </div>
                </div>

                <div style={{ marginTop: "14px", borderRadius: "18px", padding: "14px", background: "rgba(0,0,0,0.20)", border: "1px solid rgba(255,255,255,0.08)", color: "#e6f6ff", lineHeight: 1.7 }}>
                  {record.reason}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
