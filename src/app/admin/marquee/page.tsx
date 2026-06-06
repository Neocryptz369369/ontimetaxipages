'use client';

import { useState } from "react";
import Link from "next/link";

type AdItem = {
  id: string;
  title: string;
  audience: string;
  status: string;
  body: string;
};

const initialAds: AdItem[] = [
  {
    id: "AD-001",
    title: "Weekend airport ride push",
    audience: "Rider apps",
    status: "Live",
    body: "Book airport rides early for faster pickup and less waiting.",
  },
  {
    id: "AD-002",
    title: "Driver bonus update",
    audience: "Driver apps",
    status: "Draft",
    body: "Finish more rides this week to unlock the next bonus tier.",
  },
  {
    id: "AD-003",
    title: "Storm safety notice",
    audience: "All apps",
    status: "Live",
    body: "Weather delays may change pickup times in some areas today.",
  },
];

function nextAdId(items: AdItem[]) {
  const max = items.reduce((best, item) => {
    const num = Number(item.id.replace("AD-", ""));
    return Number.isFinite(num) && num > best ? num : best;
  }, 0);

  return `AD-${String(max + 1).padStart(3, "0")}`;
}

export default function AdminMarqueePage() {
  const [ads, setAds] = useState<AdItem[]>(initialAds);
  const [selectedId, setSelectedId] = useState<string>(initialAds[0].id);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("All apps");
  const [status, setStatus] = useState("Draft");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("Ready.");

  const selectedAd = ads.find((ad) => ad.id === selectedId) || null;

  function clearForm() {
    setEditingId(null);
    setTitle("");
    setAudience("All apps");
    setStatus("Draft");
    setBody("");
  }

  function handleAdd() {
    if (!title.trim() || !body.trim()) {
      setMessage("Enter a title and ad text first.");
      return;
    }

    const newId = nextAdId(ads);
    const newAd: AdItem = {
      id: newId,
      title: title.trim(),
      audience,
      status,
      body: body.trim(),
    };

    const nextAds = [newAd, ...ads];
    setAds(nextAds);
    setSelectedId(newId);
    setMessage(`Added ${newId}.`);
    clearForm();
  }

  function handleStartEdit(ad: AdItem) {
    setEditingId(ad.id);
    setTitle(ad.title);
    setAudience(ad.audience);
    setStatus(ad.status);
    setBody(ad.body);
    setMessage(`Editing ${ad.id}.`);
  }

  function handleSaveEdit() {
    if (!editingId) {
      setMessage("Pick an ad to edit first.");
      return;
    }

    if (!title.trim() || !body.trim()) {
      setMessage("Enter a title and ad text first.");
      return;
    }

    const nextAds = ads.map((ad) =>
      ad.id === editingId
        ? {
            ...ad,
            title: title.trim(),
            audience,
            status,
            body: body.trim(),
          }
        : ad
    );

    setAds(nextAds);
    setSelectedId(editingId);
    setMessage(`Saved ${editingId}.`);
    clearForm();
  }

  function handleDelete(id: string) {
    const nextAds = ads.filter((ad) => ad.id !== id);
    setAds(nextAds);

    if (nextAds.length > 0) {
      setSelectedId(nextAds[0].id);
    }

    if (editingId === id) {
      clearForm();
    }

    setMessage(`Deleted ${id}.`);
  }

  function handlePreview(id: string) {
    setSelectedId(id);
    setMessage(`Previewing ${id}.`);
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
              This version is simplified so the buttons actually respond when you click them.
            </p>
          </div>

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
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
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
            <h2 style={{ marginTop: 0, fontSize: "28px" }}>{editingId ? `Edit ${editingId}` : "Add new ad"}</h2>

            <div style={{ display: "grid", gap: "12px" }}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ad title"
                style={{ padding: "14px 16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.24)", color: "#ffffff", fontSize: "16px" }}
              />

              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                style={{ padding: "14px 16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.24)", color: "#ffffff", fontSize: "16px" }}
              >
                <option>All apps</option>
                <option>Rider apps</option>
                <option>Driver apps</option>
                <option>Owner app</option>
              </select>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ padding: "14px 16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.24)", color: "#ffffff", fontSize: "16px" }}
              >
                <option>Draft</option>
                <option>Live</option>
              </select>

              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Ad text"
                rows={5}
                style={{ padding: "14px 16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.24)", color: "#ffffff", fontSize: "16px", resize: "vertical" }}
              />

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={handleAdd}
                  style={{ border: "none", cursor: "pointer", padding: "12px 16px", borderRadius: "12px", background: "#ffffff", color: "#09111f", fontWeight: 800 }}
                >
                  Add
                </button>

                <button
                  type="button"
                  onClick={handleSaveEdit}
                  style={{ border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer", padding: "12px 16px", borderRadius: "12px", background: "rgba(255,255,255,0.08)", color: "#ffffff", fontWeight: 800 }}
                >
                  Save Edit
                </button>

                <button
                  type="button"
                  onClick={clearForm}
                  style={{ border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer", padding: "12px 16px", borderRadius: "12px", background: "rgba(255,255,255,0.08)", color: "#ffffff", fontWeight: 800 }}
                >
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
            {selectedAd ? (
              <div
                style={{
                  borderRadius: "20px",
                  padding: "18px",
                  background: "linear-gradient(135deg, rgba(34,197,94,0.14) 0%, rgba(14,165,233,0.14) 55%, rgba(255,255,255,0.05) 100%)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <div style={{ fontSize: "22px", fontWeight: 800 }}>{selectedAd.title}</div>
                <div style={{ color: "#d9f6ff", marginTop: "8px", fontWeight: 700 }}>{selectedAd.id} • {selectedAd.audience} • {selectedAd.status}</div>
                <p style={{ color: "#d9e5ff", margin: "14px 0 0", lineHeight: 1.8 }}>{selectedAd.body}</p>
              </div>
            ) : (
              <div style={{ color: "#d9e5ff" }}>No ad selected.</div>
            )}

            <div
              style={{
                marginTop: "16px",
                borderRadius: "16px",
                padding: "14px 16px",
                background: "rgba(255,255,255,0.08)",
                color: "#ffffff",
                fontWeight: 700,
              }}
            >
              {message}
            </div>
          </div>
        </section>

        <section
          style={{
            borderRadius: "24px",
            padding: "22px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
            marginBottom: "22px",
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
                <div style={{ fontSize: "20px", fontWeight: 800 }}>{ad.title}</div>
                <div style={{ color: "#bcd0f8", marginTop: "6px", marginBottom: "10px" }}>{ad.id} • {ad.audience} • {ad.status}</div>
                <p style={{ margin: "0 0 14px", color: "#d9e5ff", lineHeight: 1.7 }}>{ad.body}</p>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => handleStartEdit(ad)}
                    style={{ border: "none", cursor: "pointer", padding: "10px 12px", borderRadius: "12px", background: "#ffffff", color: "#09111f", fontWeight: 800 }}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePreview(ad.id)}
                    style={{ border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer", padding: "10px 12px", borderRadius: "12px", background: "rgba(255,255,255,0.08)", color: "#ffffff", fontWeight: 800 }}
                  >
                    Preview
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(ad.id)}
                    style={{ border: "1px solid rgba(255,77,184,0.28)", cursor: "pointer", padding: "10px 12px", borderRadius: "12px", background: "rgba(255,77,184,0.16)", color: "#ffd1f0", fontWeight: 800 }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
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
          <h2 style={{ marginTop: 0, fontSize: "28px" }}>Authority alert lane</h2>
          <div style={{ display: "grid", gap: "12px" }}>
            <div style={{ borderRadius: "18px", padding: "16px", background: "rgba(0,0,0,0.24)", border: "1px solid rgba(255,255,255,0.08)" }}>Amber Alert • 1 minute • Authority channel</div>
            <div style={{ borderRadius: "18px", padding: "16px", background: "rgba(0,0,0,0.24)", border: "1px solid rgba(255,255,255,0.08)" }}>Emergency Alert System • 1 minute • Authority channel</div>
            <div style={{ borderRadius: "18px", padding: "16px", background: "rgba(0,0,0,0.24)", border: "1px solid rgba(255,255,255,0.08)" }}>Public Safety Alert • 1 minute • Authority channel</div>
          </div>
        </section>
      </div>
    </main>
  );
}
