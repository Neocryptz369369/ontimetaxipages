'use client';

import { ChangeEvent, useMemo, useState } from "react";
import Link from "next/link";

type DocKey = 'license' | 'insurance' | 'background' | 'driving_record';

type DocState = {
  fileName: string;
  marked: boolean;
};

type DocItem = {
  id: DocKey;
  title: string;
  help: string;
};

const docItems: DocItem[] = [
  {
    id: 'license',
    title: 'Driver license',
    help: 'Choose the driver license file first. Front and back can be combined into one file if needed.',
  },
  {
    id: 'insurance',
    title: 'Proof of insurance',
    help: 'Choose the current insurance file before marking it uploaded.',
  },
  {
    id: 'background',
    title: 'Background check result',
    help: 'Choose the background check file first.',
  },
  {
    id: 'driving_record',
    title: 'Driving record check',
    help: 'Choose the driving record file before marking it uploaded.',
  },
];

const initialDocs: Record<DocKey, DocState> = {
  license: { fileName: '', marked: false },
  insurance: { fileName: '', marked: false },
  background: { fileName: '', marked: false },
  driving_record: { fileName: '', marked: false },
};

function statusStyles(label: string) {
  if (label === 'Uploaded') {
    return {
      background: 'rgba(34,197,94,0.18)',
      color: '#cbffe0',
      border: '1px solid rgba(34,197,94,0.30)',
    };
  }

  if (label === 'File selected') {
    return {
      background: 'rgba(56,189,248,0.18)',
      color: '#d9f6ff',
      border: '1px solid rgba(56,189,248,0.30)',
    };
  }

  return {
    background: 'rgba(148,163,184,0.18)',
    color: '#e2e8f0',
    border: '1px solid rgba(148,163,184,0.30)',
  };
}

export default function UploadDocsPage() {
  const [docs, setDocs] = useState<Record<DocKey, DocState>>(initialDocs);
  const [message, setMessage] = useState('Choose a file first, then press Mark uploaded.');

  const uploadedCount = useMemo(
    () => Object.values(docs).filter((item) => item.marked).length,
    [docs]
  );

  const allUploaded = uploadedCount === docItems.length;

  function onChooseFile(id: DocKey, event: ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];

    setDocs((current) => ({
      ...current,
      [id]: {
        fileName: picked ? picked.name : '',
        marked: false,
      },
    }));

    if (picked) {
      setMessage(`${picked.name} selected. Now press Mark uploaded.`);
    } else {
      setMessage('No file selected yet.');
    }
  }

  function markUploaded(id: DocKey) {
    const item = docs[id];

    if (!item.fileName) {
      setMessage('Choose a file first.');
      return;
    }

    setDocs((current) => ({
      ...current,
      [id]: {
        ...current[id],
        marked: true,
      },
    }));

    setMessage(`${item.fileName} marked uploaded.`);
  }

  function clearFile(id: DocKey) {
    setDocs((current) => ({
      ...current,
      [id]: {
        fileName: '',
        marked: false,
      },
    }));

    setMessage('File cleared. Choose a new file.');
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, #11304a 0%, #0a1322 42%, #04060b 100%)',
        color: '#ffffff',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '28px 18px 80px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            marginBottom: '24px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#8fdcff',
                marginBottom: '10px',
              }}
            >
              Driver document upload lane
            </div>
            <h1 style={{ margin: 0, fontSize: '42px', lineHeight: 1.05 }}>Upload driver documents</h1>
            <p style={{ margin: '12px 0 0', color: '#d9e5ff', fontSize: '17px', lineHeight: 1.7, maxWidth: '860px' }}>
              This page now follows the right order: choose a file first, then mark it uploaded.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href='/drive'
              style={{
                textDecoration: 'none',
                color: '#ffffff',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                padding: '12px 16px',
                borderRadius: '14px',
                fontWeight: 800,
              }}
            >
              Back to driver onboarding
            </Link>
            <Link
              href='/'
              style={{
                textDecoration: 'none',
                color: '#09111f',
                background: '#ffffff',
                padding: '12px 16px',
                borderRadius: '14px',
                fontWeight: 800,
              }}
            >
              Back to homepage
            </Link>
          </div>
        </div>

        <section
          style={{
            borderRadius: '30px',
            padding: '26px',
            marginBottom: '22px',
            background: 'linear-gradient(135deg, rgba(56,189,248,0.18) 0%, rgba(45,108,255,0.16) 55%, rgba(255,255,255,0.05) 100%)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 24px 70px rgba(0,0,0,0.35)',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '8px 12px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.10)',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '14px',
            }}
          >
            Fixed upload order
          </div>

          <h2 style={{ margin: '0 0 10px', fontSize: '34px', lineHeight: 1.08 }}>
            Pick the file first. Mark it second.
          </h2>

          <p style={{ margin: 0, color: '#d9e5ff', fontSize: '18px', lineHeight: 1.7, maxWidth: '860px' }}>
            Each document row now gives you a real file chooser first. The Mark uploaded button stays locked until a file is picked.
          </p>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '22px',
          }}
        >
          <div
            style={{
              borderRadius: '24px',
              padding: '20px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#8fdcff', marginBottom: '8px' }}>
              Progress
            </div>
            <div style={{ fontSize: '34px', fontWeight: 800 }}>{uploadedCount} / {docItems.length}</div>
            <div style={{ color: '#d9e5ff', marginTop: '8px', lineHeight: 1.6 }}>
              Documents marked uploaded
            </div>
          </div>

          <div
            style={{
              borderRadius: '24px',
              padding: '20px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#8fdcff', marginBottom: '8px' }}>
              Page rule
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800 }}>No mark button before file choice</div>
            <div style={{ color: '#d9e5ff', marginTop: '8px', lineHeight: 1.6 }}>
              If no file is chosen, the mark button stays disabled.
            </div>
          </div>

          <div
            style={{
              borderRadius: '24px',
              padding: '20px',
              background: allUploaded ? 'rgba(34,197,94,0.14)' : 'rgba(255,255,255,0.06)',
              border: allUploaded ? '1px solid rgba(34,197,94,0.28)' : '1px solid rgba(255,255,255,0.10)',
            }}
          >
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#8fdcff', marginBottom: '8px' }}>
              Current state
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800 }}>{allUploaded ? 'All documents ready' : 'Waiting for uploads'}</div>
            <div style={{ color: '#d9e5ff', marginTop: '8px', lineHeight: 1.6 }}>
              {allUploaded ? 'Every required document has been marked uploaded.' : 'Choose files and mark them one by one.'}
            </div>
          </div>
        </section>

        <section style={{ display: 'grid', gap: '16px', marginBottom: '22px' }}>
          {docItems.map((doc) => {
            const current = docs[doc.id];
            const statusLabel = current.marked ? 'Uploaded' : current.fileName ? 'File selected' : 'Waiting';
            const badge = statusStyles(statusLabel);

            return (
              <div
                key={doc.id}
                style={{
                  borderRadius: '28px',
                  padding: '22px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  boxShadow: '0 16px 50px rgba(0,0,0,0.20)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '16px',
                    flexWrap: 'wrap',
                    marginBottom: '14px',
                  }}
                >
                  <div>
                    <h3 style={{ margin: '0 0 8px', fontSize: '26px', lineHeight: 1.1 }}>{doc.title}</h3>
                    <p style={{ margin: 0, color: '#d9e5ff', lineHeight: 1.7, maxWidth: '820px' }}>{doc.help}</p>
                  </div>

                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 800,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      ...badge,
                    }}
                  >
                    {statusLabel}
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0,1fr)',
                    gap: '14px',
                  }}
                >
                  <label style={{ display: 'grid', gap: '8px', fontWeight: 700 }}>
                    <span>Choose file</span>
                    <input
                      type='file'
                      onChange={(event) => onChooseFile(doc.id, event)}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '14px',
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(0,0,0,0.24)',
                        color: '#ffffff',
                        fontSize: '15px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </label>

                  <div
                    style={{
                      borderRadius: '18px',
                      padding: '14px 16px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8fdcff', marginBottom: '6px' }}>
                      Selected file
                    </div>
                    <div style={{ color: current.fileName ? '#ffffff' : '#cbd5e1', lineHeight: 1.6 }}>
                      {current.fileName || 'No file chosen yet'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      type='button'
                      onClick={() => markUploaded(doc.id)}
                      disabled={!current.fileName || current.marked}
                      style={{
                        border: 'none',
                        borderRadius: '14px',
                        padding: '14px 18px',
                        fontWeight: 800,
                        cursor: !current.fileName || current.marked ? 'not-allowed' : 'pointer',
                        opacity: !current.fileName || current.marked ? 0.55 : 1,
                        background: 'linear-gradient(135deg,#22c55e 0%,#0ea5e9 100%)',
                        color: '#04111f',
                      }}
                    >
                      {current.marked ? 'Uploaded' : 'Mark uploaded'}
                    </button>

                    <button
                      type='button'
                      onClick={() => clearFile(doc.id)}
                      disabled={!current.fileName && !current.marked}
                      style={{
                        borderRadius: '14px',
                        padding: '14px 18px',
                        fontWeight: 800,
                        cursor: !current.fileName && !current.marked ? 'not-allowed' : 'pointer',
                        opacity: !current.fileName && !current.marked ? 0.55 : 1,
                        background: 'rgba(255,255,255,0.08)',
                        color: '#ffffff',
                        border: '1px solid rgba(255,255,255,0.12)',
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section
          style={{
            borderRadius: '24px',
            padding: '20px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#8fdcff', marginBottom: '10px' }}>
            Live page message
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1.6 }}>{message}</div>
        </section>
      </div>
    </main>
  );
}
