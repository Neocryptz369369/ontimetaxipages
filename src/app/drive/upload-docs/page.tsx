'use client';

import Link from "next/link";
import { ChangeEvent, useMemo, useState } from "react";

type DocKey = "license" | "photo" | "insurance" | "background" | "driving_record";
type ReviewStatus = "Approved" | "Denied";

type PendingFile = {
  name: string;
  size: number;
  type: string;
};

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
const allowedExtensions = ["pdf", "jpg", "jpeg", "png", "webp"];
const maxFileSize = 10 * 1024 * 1024;

const docDefinitions: Array<{ id: DocKey; label: string; note: string; agencyRequired: boolean }> = [
  {
    id: "license",
    label: "Driver license",
    note: "Upload the driver license file first.",
    agencyRequired: false,
  },
  {
    id: "photo",
    label: "Your picture",
    note: "Add a clear photo of your face. Riders see this photo so they know who is picking them up.",
    agencyRequired: false,
  },
  {
    id: "insurance",
    label: "Insurance proof",
    note: "Upload the current insurance file first.",
    agencyRequired: false,
  },
  {
    id: "background",
    label: "Background check result",
    note: "Upload the result from the separate screening agency.",
    agencyRequired: true,
  },
  {
    id: "driving_record",
    label: "Driving record check",
    note: "Upload the report from the separate record-check agency or provider.",
    agencyRequired: true,
  },
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extensionFromName(fileName: string) {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() || "" : "";
}

function decide(file: PendingFile, agencyRequired: boolean, label: string) {
  const extension = extensionFromName(file.name);

  if (!allowedExtensions.includes(extension)) {
    return {
      decision: "Denied" as ReviewStatus,
      reason: `Denied automatically because .${extension || "unknown"} is not allowed for ${label}. Use PDF, JPG, JPEG, PNG, or WEBP.`,
    };
  }

  if (file.size > maxFileSize) {
    return {
      decision: "Denied" as ReviewStatus,
      reason: `Denied automatically because the ${label} file is larger than 10 MB.`,
    };
  }

  if (agencyRequired) {
    return {
      decision: "Approved" as ReviewStatus,
      reason: `Approved automatically because the required separate-agency result was uploaded in an allowed file type and size.`,
    };
  }

  return {
    decision: "Approved" as ReviewStatus,
    reason: `Approved automatically because the uploaded ${label.toLowerCase()} file passed the allowed file type and size rules.`,
  };
}

function badgeStyle(done: boolean) {
  return done
    ? {
        background: "rgba(34,197,94,0.16)",
        color: "#cbffe0",
        border: "1px solid rgba(34,197,94,0.28)",
      }
    : {
        background: "rgba(56,189,248,0.16)",
        color: "#d9f6ff",
        border: "1px solid rgba(56,189,248,0.28)",
      };
}

export default function UploadDocsPage() {
  const [selectedFiles, setSelectedFiles] = useState<Partial<Record<DocKey, PendingFile>>>({});
  const [message, setMessage] = useState(
    "Upload all 5 files first. Background and driving record files must come from a separate agency. Then press Send so the admin panel receives them and the automated system decides approved or denied."
  );
  const [sent, setSent] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);

  const selectedCount = useMemo(
    () => Object.values(selectedFiles).filter(Boolean).length,
    [selectedFiles]
  );

  const allFilesReady = selectedCount === docDefinitions.length;

  async function savePhoto(file: File) {
    setPhotoBusy(true);
    setPhotoUrl("");
    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/driver-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo: dataUrl }),
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        setMessage(String(data.error || "The picture could not be saved. Please try again."));
        setPhotoBusy(false);
        return;
      }

      setPhotoUrl(String(data.url));
      setMessage("Your picture is saved.");
    } catch (err) {
      setMessage("The picture could not be saved. Please try again.");
    }
    setPhotoBusy(false);
  }

  function handleFileChange(id: DocKey, label: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (id === "photo") {
      setPhotoPreview(URL.createObjectURL(file));
      savePhoto(file);
    }

    setSelectedFiles((current) => ({
      ...current,
      [id]: {
        name: file.name,
        size: file.size,
        type: file.type || "unknown",
      },
    }));

    setSent(false);
    setMessage(`${label} selected. Keep going until all 5 files are ready.`);
  }

  function handleSend() {
    if (!allFilesReady) {
      setMessage("Upload all 5 files first. Then press Send.");
      return;
    }

    const sentAt = new Date().toLocaleString();

    const records: ReviewRecord[] = docDefinitions.map((doc) => {
      const file = selectedFiles[doc.id]!;
      const result = decide(file, doc.agencyRequired, doc.label);

      return {
        id: doc.id,
        label: doc.label,
        fileName: file.name,
        fileSize: file.size,
        fileSizeText: formatBytes(file.size),
        mimeType: file.type,
        decision: result.decision,
        reason: result.reason,
          photoUrl: doc.id === "photo" ? photoUrl : undefined,
        sentAt,
      };
    });

    window.localStorage.setItem(storageKey, JSON.stringify(records));
    setSent(true);
    setMessage("Files sent to the admin panel. The automated system finished the review, including the separate-agency-required checks.");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #12314b 0%, #0a1522 42%, #04060b 100%)",
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
              Driver upload lane
            </div>
            <h1 style={{ margin: 0, fontSize: "42px", lineHeight: 1.05 }}>
              Upload driver documents, then send to admin
            </h1>
            <p
              style={{
                margin: "12px 0 0",
                color: "#d9e5ff",
                fontSize: "17px",
                lineHeight: 1.7,
                maxWidth: "920px",
              }}
            >
              Drivers upload all required files first. The background check and driving record items must come from a separate agency. Then they press one Send button at the bottom. After that, the admin panel receives the files and the automated system decides approved or denied.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href="/drive"
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
              Back to driver flow
            </Link>
            <Link
              href="/admin/compliance-review"
              style={{
                textDecoration: "none",
                color: "#09111f",
                background: "#ffffff",
                padding: "12px 16px",
                borderRadius: "14px",
                fontWeight: 800,
              }}
            >
              Open admin review
            </Link>
          </div>
        </div>

        <section
          style={{
            borderRadius: "30px",
            padding: "26px",
            marginBottom: "22px",
            background: "linear-gradient(135deg, rgba(20,184,166,0.18) 0%, rgba(45,108,255,0.18) 52%, rgba(255,255,255,0.05) 100%)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div style={{ borderRadius: "22px", padding: "18px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#bfe8ff" }}>
                Files ready
              </div>
              <div style={{ fontSize: "34px", fontWeight: 800, marginTop: "10px" }}>{selectedCount} / {docDefinitions.length}</div>
            </div>
            <div style={{ borderRadius: "22px", padding: "18px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#bfe8ff" }}>
                Separate agency rule
              </div>
              <div style={{ fontSize: "20px", fontWeight: 800, marginTop: "14px", color: "#cbffe0" }}>
                Required for background and driving record
              </div>
            </div>
            <div style={{ borderRadius: "22px", padding: "18px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#bfe8ff" }}>
                Admin result
              </div>
              <div style={{ fontSize: "20px", fontWeight: 800, marginTop: "14px", color: sent ? "#cbffe0" : "#d9f6ff" }}>
                {sent ? "Sent and reviewed" : "Not sent yet"}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "18px",
              borderRadius: "20px",
              padding: "16px 18px",
              background: "rgba(0,0,0,0.22)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#e8f2ff",
              lineHeight: 1.7,
            }}
          >
            {message}
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "18px",
          }}
        >
          {docDefinitions.map((doc) => {
            const file = selectedFiles[doc.id];
            const isReady = Boolean(file);

            return (
              <div
                key={doc.id}
                style={{
                  borderRadius: "28px",
                  padding: "22px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 18px 40px rgba(0,0,0,0.24)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start", marginBottom: "14px" }}>
                  <div>
                    <div style={{ fontSize: "24px", fontWeight: 800, lineHeight: 1.12 }}>{doc.label}</div>
                    <div style={{ marginTop: "8px", color: "#cfe3ff", lineHeight: 1.6 }}>{doc.note}</div>
                    {doc.agencyRequired && (
                      <div style={{ marginTop: "10px", color: "#ffe4a8", fontWeight: 700, lineHeight: 1.6 }}>
                        Separate agency required for this document.
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      ...badgeStyle(isReady),
                      borderRadius: "999px",
                      padding: "8px 12px",
                      fontSize: "12px",
                      fontWeight: 800,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isReady ? "Uploaded" : "Waiting"}
                  </span>
                </div>

                <label
                  style={{
                    display: "block",
                    borderRadius: "18px",
                    padding: "14px",
                    background: "rgba(0,0,0,0.20)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    marginBottom: "14px",
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: "8px" }}>Choose file</div>
                  <input
                    type="file"
                    accept={doc.id === "photo" ? "image/*" : ".pdf,.jpg,.jpeg,.png,.webp"}
                    onChange={(event) => handleFileChange(doc.id, doc.label, event)}
                    style={{ width: "100%" }}
                  />
                  {doc.id === "photo" && photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Your picture"
                      style={{ marginTop: "12px", width: "88px", height: "88px", borderRadius: "999px", objectFit: "cover", border: "2px solid rgba(255,255,255,0.35)", display: "block" }}
                    />
                  ) : null}
                  {doc.id === "photo" && photoBusy ? (
                    <div style={{ marginTop: "10px", color: "#ffe4a8", fontWeight: 700 }}>Saving your picture...</div>
                  ) : null}
                  {doc.id === "photo" && !photoBusy && photoUrl ? (
                    <div style={{ marginTop: "10px", color: "#a8f5c8", fontWeight: 700 }}>Picture saved.</div>
                  ) : null}
                  <div style={{ marginTop: "10px", color: "#b8cee8", fontSize: "14px" }}>
                    {file ? `${file.name} • ${formatBytes(file.size)}` : "No file selected yet."}
                  </div>
                </label>

                <div
                  style={{
                    borderRadius: "18px",
                    padding: "14px",
                    background: "rgba(0,0,0,0.20)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#d9e5ff",
                    lineHeight: 1.7,
                  }}
                >
                  {file
                    ? "This file is ready. After all 5 files are uploaded, press Send at the bottom."
                    : "Upload this file first. The system will not review anything until the bottom Send button is pressed."}
                </div>
              </div>
            );
          })}
        </section>

        <section
          style={{
            marginTop: "22px",
            borderRadius: "30px",
            padding: "24px",
            background: "linear-gradient(135deg, rgba(34,197,94,0.18) 0%, rgba(14,165,233,0.16) 100%)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.16em", fontWeight: 800, color: "#dfffee", marginBottom: "10px" }}>
            Final step
          </div>
          <div style={{ fontSize: "30px", fontWeight: 800, lineHeight: 1.12, marginBottom: "10px" }}>
            Send the full file set to admin review
          </div>
          <div style={{ color: "#e6f6ff", lineHeight: 1.7, marginBottom: "16px" }}>
            This sends all uploaded files to the admin panel. The automated system then reviews them, including the checks that require a separate agency result.
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleSend}
              disabled={!allFilesReady}
              style={{
                border: "none",
                cursor: allFilesReady ? "pointer" : "not-allowed",
                opacity: allFilesReady ? 1 : 0.5,
                textDecoration: "none",
                color: "#09111f",
                background: "#ffffff",
                padding: "12px 16px",
                borderRadius: "14px",
                fontWeight: 800,
                fontSize: "15px",
              }}
            >
              Send to admin panel
            </button>
            {sent && (
              <Link
                href="/admin/compliance-review"
                style={{
                  textDecoration: "none",
                  color: "#ffffff",
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  padding: "12px 16px",
                  borderRadius: "14px",
                  fontWeight: 800,
                }}
              >
                Open admin review results
              </Link>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
