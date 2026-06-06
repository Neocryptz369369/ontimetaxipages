'use client';

import { useState } from "react";
import Link from "next/link";

type DocItem = {
  id: string;
  title: string;
  note: string;
};

const requiredDocs: DocItem[] = [
  {
    id: 'license_upload',
    title: 'Upload driver license',
    note: 'Front and back of the current driver license.',
  },
  {
    id: 'insurance_upload',
    title: 'Upload insurance proof',
    note: 'Current policy card or coverage page.',
  },
  {
    id: 'background_upload',
    title: 'Upload background-check result',
    note: 'Background check confirmation or report file.',
  },
  {
    id: 'driving_record_upload',
    title: 'Upload driving-record check',
    note: 'Driving history or motor vehicle report file.',
  },
];

export default function UploadDocsPage() {
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({
    license_upload: false,
    insurance_upload: false,
    background_upload: false,
    driving_record_upload: false,
  });
  const [message, setMessage] = useState('Upload page ready.');

  const allUploaded = Object.values(uploaded).every(Boolean);

  function toggleUpload(id: string) {
    setUploaded((current) => {
      const next = { ...current, [id]: !current[id] };
      return next;
    });
    setMessage('Upload status updated.');
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
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '28px 18px 80px' }}>
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
            <p style={{ margin: '12px 0 0', color: '#d9e5ff', fontSize: '17px', lineHeight: 1.7, maxWidth: '820px' }}>
              This is the next step after agreement. Drivers should upload the required documents here before admin review.
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
              Back to drive page
            </Link>
            <Link
              href='/admin'
              style={{
                textDecoration: 'none',
                color: '#09111f',
                background: '#ffffff',
                padding: '12px 16px',
                borderRadius: '14px',
                fontWeight: 800,
              }}
            >
              Open admin
            </Link>
          </div>
        </div>

        <section
          style={{
            borderRadius: '30px',
            padding: '26px',
            marginBottom: '22px',
            background: 'linear-gradient(135deg, rgba(34,197,94,0.18) 0%, rgba(14,165,233,0.18) 55%, rgba(255,255,255,0.05) 100%)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 24px 70px rgba(0,0,0,0.35)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>
            Next required step
          </div>
          <h2 style={{ margin: '0 0 10px', fontSize: '34px', lineHeight: 1.08 }}>Upload all 4 driver documents</h2>
          <p style={{ margin: 0, color: '#e8fff5', fontSize: '18px', lineHeight: 1.7 }}>
            License, insurance, background check, and driving record all need to be uploaded here before final review.
          </p>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '14px',
            marginBottom: '22px',
          }}
        >
          {[
            ['Required uploads', '4'],
            ['Uploaded now', String(Object.values(uploaded).filter(Boolean).length)],
            ['Ready for admin review', allUploaded ? 'Yes' : 'Not yet'],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                borderRadius: '22px',
                padding: '20px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.10)',
                boxShadow: '0 18px 40px rgba(0,0,0,0.22)',
              }}
            >
              <div style={{ color: '#b7e8ff', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800 }}>{label}</div>
              <div style={{ marginTop: '10px', fontSize: '34px', fontWeight: 800 }}>{value}</div>
            </div>
          ))}
        </section>

        <section
          style={{
            borderRadius: '24px',
            padding: '22px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            marginBottom: '22px',
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: '28px' }}>Document upload checklist</h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {requiredDocs.map((doc) => {
              const done = uploaded[doc.id];
              return (
                <div
                  key={doc.id}
                  style={{
                    borderRadius: '18px',
                    padding: '18px',
                    background: 'rgba(0,0,0,0.24)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: 800 }}>{doc.title}</div>
                      <div style={{ color: '#d9e5ff', marginTop: '6px' }}>{doc.note}</div>
                    </div>
                    <div
                      style={{
                        borderRadius: '999px',
                        padding: '6px 10px',
                        fontSize: '12px',
                        fontWeight: 800,
                        background: done ? 'rgba(34,197,94,0.16)' : 'rgba(245,158,11,0.16)',
                        color: done ? '#cbffe0' : '#ffe3a6',
                        border: done ? '1px solid rgba(34,197,94,0.28)' : '1px solid rgba(245,158,11,0.28)',
                      }}
                    >
                      {done ? 'Uploaded' : 'Waiting'}
                    </div>
                  </div>

                  <button
                    type='button'
                    onClick={() => toggleUpload(doc.id)}
                    style={{
                      border: 'none',
                      cursor: 'pointer',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      background: '#ffffff',
                      color: '#09111f',
                      fontWeight: 800,
                    }}
                  >
                    {done ? 'Mark not uploaded' : 'Mark uploaded'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section
          style={{
            borderRadius: '24px',
            padding: '22px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: '28px' }}>Upload status</h2>
          <div
            style={{
              borderRadius: '14px',
              padding: '14px 16px',
              background: allUploaded ? 'rgba(34,197,94,0.16)' : 'rgba(255,255,255,0.08)',
              color: '#ffffff',
              fontWeight: 700,
              marginBottom: '14px',
            }}
          >
            {message}
          </div>

          {allUploaded ? (
            <div
              style={{
                borderRadius: '14px',
                padding: '14px 16px',
                background: 'rgba(34,197,94,0.16)',
                border: '1px solid rgba(34,197,94,0.28)',
                color: '#cbffe0',
                fontWeight: 800,
              }}
            >
              All required documents are uploaded. This driver is ready for admin review.
            </div>
          ) : (
            <div
              style={{
                borderRadius: '14px',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#d9e5ff',
                fontWeight: 700,
              }}
            >
              Upload all 4 required document items before admin review.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
