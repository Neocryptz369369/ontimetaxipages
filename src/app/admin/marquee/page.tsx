'use client';

import { useMemo, useState } from "react";
import Link from "next/link";

type AdItem = {
  id: string;
  title: string;
  audience: string;
  status: string;
  priority: string;
  body: string;
};

const starterAds: AdItem[] = [
  {
    id: "AD-001",
    title: "Weekend airport ride push",
    audience: "Rider apps",
    status: "Live",
    priority: "Normal",
    body: "Book airport rides early for faster pickup and less waiting.",
  },
  {
    id: "AD-002",
    title: "Driver bonus update",
    audience: "Driver apps",
    status: "Draft",
    priority: "High",
    body: "Finish more rides this week to unlock the next bonus tier.",
  },
  {
    id: "AD-003",
    title: "Storm safety notice",
    audience: "All apps",
    status: "Live",
    priority: "Urgent",
    body: "Weather delays may change pickup times in some areas today.",
  },
];

const authorityAlerts = [
  { type: "Amber Alert", length: "1 minute", source: "Authority channel" },
  { type: "Emergency Alert System", length: "1 minute", source: "Authority channel" },
  { type: "Public Safety Alert", length: "1 minute", source: "Authority channel" },
];

function badgeStyle(value: string) {
  if (value === "Live") return { background: "rgba(34,197,94,0.16)", color: "#cbffe0", border: "1px solid rgba(34,197,94,0.28)" };
  if (value === "Urgent") return { background: "rgba(255,77,184,0.16)", color: "#ffd1f0", border: "1px solid rgba(255,77,184,0.28)" };
  if (value === "High") return { background: "rgba(245,158,11,0.16)", color: "#ffe3a6", border: "1px solid rgba(245,158,11,0.28)" };
  return { background: "rgba(56,189,248,0.16)", color: "#d9f6ff", border: "1px solid rgba(56,189,248,0.28)" };
}

function makeNextId(items: AdItem[]) {
  const max = items.reduce((highest, item) => {
    const num = Number(item.id.replace("AD-", ""));
    return Number.isFinite(num) && num > highest ? num : highest;
  }, 0);

  return `AD-${String(max + 1).padStart(3, "0")}`;
}

export default function AdminMarqueePage() {
  const [ads, setAds] = useState<AdItem[]>(starterAds);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(starterAds[0].id);
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("All apps");
  const [status, setStatus] = useState("Draft");
  const [priority, setPriority] = useState("Normal");
  const [body, setBody] = useState("");

  const liveAds = useMemo(() => ads.filter((ad) => ad.status === "Live"), [ads]);
  const draftAds = useMemo(() => ads.filter((ad) => ad.status === "Draft"), [ads]);
  const previewAd = ads.find((ad) => ad.id === previewId) || null;

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setAudience("All apps");
    setStatus("Draft");
    setPriority("Normal");
    setBody("");
    setShowForm(false);
  }

  function openNewAd() {
    setEditingId(null);
    setTitle("");
    setAudience("All apps");
    setStatus("Draft");
    setPriority("Normal");
    setBody("");
    setShowForm(true);
  }

  function openEdit(ad: AdItem) {
    setEditingId(ad.id);
    setTitle(ad.title);
    setAudience(ad.audience);
    setStatus(ad.status);
    setPriority(ad.priority);
    setBody(ad.body);
    setShowForm(true);
  }

  function saveAd() {
    if (!title.trim() || !body.trim()) return;

    if (editingId) {
      setAds((current) =>
        current.map((ad) =>
          ad.id === editingId
            ? { ...ad, title: title.trim(), audience, status, priority, body: body.trim() }
            : ad
        )
      );
      setPreviewId(editingId);
      resetForm();
      return;
    }

    const newId = makeNextId(ads);
    const newAd: AdItem = {
      id: newId,
      title: title.trim(),
      audience,
      status,
      priority,
      body: body.trim(),
    };

    setAds((current) => [newAd, ...current]);
    setPreviewId(newId);
    resetForm();
  }

  function deleteAd(id: string) {
    const remaining = ads.filter((ad) => ad.id !== id);
    setAds(remaining);

    if (previewId === id) {
      setPreviewId(remaining.length ? remaining[0].id : null);
    }

    if (editingId === id) {
      resetForm();
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #14213d 0%, #09101d 44%, #03060b 100%)",
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
              Admin marquee lane
            </div>
            <h1 style={{ margin: 0, fontSize: "42px", lineHeight: 1.05 }}>Ad marquee manager</h1>
            <p style={{ margin: "12px 0 0", color: "#d9e5ff", fontSize: "17px", lineHeight: 1.7, maxWidth: "820px" }}>
              Add, edit, delete, and preview now work directly in this admin page.
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
            <button
              type="button"
              onClick={openNewAd}
              style={{
                border: "none",
                cursor: "pointer",
                padding: "12px 16px",
                borderRadius: "14px",
                background: "#ffffff",
                color: "#09111f",
                fontWeight: 800,
              }}
            >
                            + New ad
            </button>
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
            ["Live ads", String(liveAds.length)],
            ["Draft ads", String(draftAds.length)],
            ["Total ads", String(ads.length)],
            ["Authority alerts", String(authorityAlerts.length)],
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
            display: "grid",
            gridTemplateColumns: "1.05fr 0.95fr",
            gap: "16px",
            marginBottom: "22px",
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
            <h2 style={{ marginTop: 0, fontSize: "28px" }}>{editingId ? `Edit ${editingId}` : "Create or edit ad"}</h2>
            <div style={{ display: "grid", gap: "12px" }}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ad title"
                style={{ padding: "14px 16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.24)", color: "#ffffff", fontSize: "16px" }}
              />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: "12px" }}>
                <select value={audience} onChange={(e) => setAudience(e.target.value)} style={{ padding: "14px 16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.24)", color: "#ffffff", fontSize: "16px" }}>
                  <option>All apps</option>
                  <option>Rider apps</option>
                  <option>Driver apps</option>
                  <option>Owner app</option>
                </select>

                <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: "14px 16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.24)", color: "#ffffff", fontSize: "16px" }}>
                  <option>Draft</option>
                  <option>Live</option>
                </select>

                <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ padding: "14px 16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.24)", color: "#ffffff", fontSize: "16px" }}>
                  <option>Normal</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>

              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Ad text"
                rows={5}
                style={{ padding: "14px 16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.24)", color: "#ffffff", fontSize: "16px", resize: "vertical" }}
              />

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button type="button" onClick={saveAd} style={{ border: "none", cursor: "pointer", padding: "12px 16px", borderRadius: "12px", background: "#ffffff", color: "#09111f", fontWeight: 800 }}>
                  {editingId ? "Save changes" : "Add ad"}
                </button>
                <button type="button" onClick={resetForm} style={{ border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer", padding: "12px 16px", borderRadius: "12px", background: "rgba(255,255,255,0.08)", color: "#ffffff", fontWeight: 800 }}>
                  Clear
                </button>
              </div>
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
            <h2 style={{ marginTop: 0, fontSize: "28px" }}>Preview</h2>
            {previewAd ? (
              <div
                style={{
                  borderRadius: "22px",
                  padding: "18px",
                  background: "linear-gradient(135deg, rgba(34,197,94,0.14) 0%, rgba(14,165,233,0.14) 55%, rgba(255,255,255,0.05) 100%)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
                  <div style={{ fontWeight: 800, fontSize: "22px" }}>{previewAd.title}</div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <div style={{ ...badgeStyle(previewAd.status), borderRadius: "999px", padding: "6px 10px", fontSize: "12px", fontWeight: 800 }}>{previewAd.status}</div>
                    <div style={{ ...badgeStyle(previewAd.priority), borderRadius: "999px", padding: "6px 10px", fontSize: "12px", fontWeight: 800 }}>{previewAd.priority}</div>
                  </div>
                </div>
                <div style={{ color: "#d9f6ff", fontWeight: 700, marginBottom: "10px" }}>{previewAd.audience}</div>
                <p style={{ margin: 0, color: "#d9e5ff", lineHeight: 1.8 }}>{previewAd.body}</p>
              </div>
            ) : (
              <div style={{ color: "#d9e5ff", lineHeight: 1.7 }}>Click Preview on an ad card to show it here.</div>
            )}

            <div style={{ marginTop: "18px" }}>
              <h3 style={{ marginTop: 0, fontSize: "22px" }}>Authority alert lane</h3>
              <div style={{ display: "grid", gap: "12px" }}>
                {authorityAlerts.map((alert) => (
                  <div
                    key={alert.type}
                    style={{
                      borderRadius: "18px",
                      padding: "16px",
                      background: "rgba(0,0,0,0.24)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: "18px" }}>{alert.type}</div>
                    <div style={{ color: "#bcd0f8", marginTop: "8px", lineHeight: 1.7 }}>{alert.length} • {alert.source}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            borderRadius: "24px",
            padding: "22px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: "28px" }}>Current ad list</h2>
          <div style={{ display: "grid", gap: "12px" }}>
            {ads.map((ad) => (
              <div
                key={ad.id}
                style={{
                  borderRadius: "18px",
                  padding: "18px",
                  background: "rgba(0,0,0,0.24)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "10px" }}>
                  <div>
                    <div style={{ fontSize: "20px", fontWeight: 800 }}>{ad.title}</div>
                    <div style={{ color: "#bcd0f8", marginTop: "6px" }}>{ad.id} • {ad.audience}</div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <div style={{ ...badgeStyle(ad.status), borderRadius: "999px", padding: "6px 10px", fontSize: "12px", fontWeight: 800 }}>{ad.status}</div>
                    <div style={{ ...badgeStyle(ad.priority), borderRadius: "999px", padding: "6px 10px", fontSize: "12px", fontWeight: 800 }}>{ad.priority}</div>
                  </div>
                </div>

                <p style={{ margin: "0 0 14px", color: "#d9e5ff", lineHeight: 1.7 }}>{ad.body}</p>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button type="button" onClick={() => openEdit(ad)} style={{ border: "none", cursor: "pointer", padding: "10px 12px", borderRadius: "12px", background: "#ffffff", color: "#09111f", fontWeight: 800 }}>
                    Edit
                  </button>
                  <button type="button" onClick={() => setPreviewId(ad.id)} style={{ border: "1px solid rgba(255,255,255,0.10)", cursor: "pointer", padding: "10px 12px", borderRadius: "12px", background: "rgba(255,255,255,0.08)", color: "#ffffff", fontWeight: 800 }}>
                    Preview
                  </button>
                  <button type="button" onClick={() => deleteAd(ad.id)} style={{ border: "1px solid rgba(255,77,184,0.28)", cursor: "pointer", padding: "10px 12px", borderRadius: "12px", background: "rgba(255,77,184,0.16)", color: "#ffd1f0", fontWeight: 800 }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
