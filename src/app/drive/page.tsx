'use client';

import { useMemo, useState } from "react";
import Link from "next/link";

type CheckItem = {
  id: string;
  title: string;
  detail: string;
  provider: string;
};

const screeningSteps: CheckItem[] = [
  {
    id: 'license',
    title: 'Driver license check',
    detail: 'Upload a current driver license and confirm it matches the driver profile.',
    provider: 'State license record / DMV verification',
  },
  {
    id: 'insurance',
    title: 'Insurance check',
    detail: 'Add active vehicle insurance and verify policy dates before approval.',
    provider: 'Insurance carrier proof + policy review',
  },
  {
    id: 'background',
    title: 'Background check',
    detail: 'Complete the background screening step before the driver can go live.',
    provider: 'Approved background screening provider',
  },
  {
    id: 'driving_record',
    title: 'Driving record check',
    detail: 'Review driving history before final approval.',
    provider: 'Motor vehicle report / driving record source',
  },
];

export default function DrivePage() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({
    license: false,
    insurance: false,
    background: false,
    driving_record: false,
  });
  const [agreed, setAgreed] = useState(false);
  const [message, setMessage] = useState('Driver onboarding screen ready.');

  const doneCount = useMemo(
    () => Object.values(completed).filter(Boolean).length,
    [completed]
  );

  function toggleStep(id: string) {
    setCompleted((current) => {
      const next = { ...current, [id]: !current[id] };
      return next;
    });
  }

  function markAgreement() {
    const allDone = Object.values(completed).every(Boolean);

    if (!allDone) {
      setMessage('Finish all 4 compliance checks before agreeing.');
      return;
    }

    setAgreed(true);
    setMessage('Driver agreement saved.');
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
              Driver onboarding lane
            </div>
            <h1 style={{ margin: 0, fontSize: '42px', lineHeight: 1.05 }}>Driver screening and compliance</h1>
            <p style={{ margin: '12px 0 0', color: '#d9e5ff', fontSize: '17px', lineHeight: 1.7, maxWidth: '860px' }}>
              This step makes the driver signup path more complete by showing the 4 checks Dennis wanted before a driver is approved.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href='/'
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
              Back to homepage
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              alignItems: 'center',
            }}
          >
            <div>
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
                Live step now visible
              </div>
              <h2 style={{ margin: '0 0 10px', fontSize: '34px', lineHeight: 1.08 }}>Drivers must pass all 4 checks</h2>
              <p style={{ margin: 0, color: '#e8fff5', fontSize: '18px', lineHeight: 1.7 }}>
                License, insurance, background check, and driving record review are all part of the same approval path now.
              </p>
            </div>

            <div
              style={{
                borderRadius: '22px',
                padding: '18px',
                background: 'rgba(0,0,0,0.24)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              <div style={{ fontSize: '14px', color: '#d9e5ff', marginBottom: '10px', fontWeight: 700 }}>Current compliance status</div>
              <div style={{ fontSize: '40px', fontWeight: 800 }}>{doneCount}/4</div>
              <div style={{ marginTop: '12px', borderRadius: '12px', padding: '12px 14px', background: 'rgba(255,255,255,0.08)', color: '#ffffff', fontWeight: 700 }}>
                {message}
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            marginBottom: '22px',
          }}
        >
          {[
            ['Required checks', '4'],
            ['Driver path', 'Screening first'],
            ['Approval gate', 'All checks done'],
            ['Agreement', agreed ? 'Saved' : 'Pending'],
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
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: '16px',
            marginBottom: '22px',
          }}
        >
          <div
            style={{
              borderRadius: '24px',
              padding: '22px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: '28px' }}>Driver screening checklist</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {screeningSteps.map((item) => {
                const isDone = completed[item.id];
                return (
                  <div
                    key={item.id}
                    style={{
                      borderRadius: '18px',
                      padding: '18px',
                      background: 'rgba(0,0,0,0.24)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: 800 }}>{item.title}</div>
                        <div style={{ color: '#d9e5ff', marginTop: '6px' }}>{item.provider}</div>
                      </div>
                      <div
                        style={{
                          borderRadius: '999px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          fontWeight: 800,
                          background: isDone ? 'rgba(34,197,94,0.16)' : 'rgba(245,158,11,0.16)',
                          color: isDone ? '#cbffe0' : '#ffe3a6',
                          border: isDone ? '1px solid rgba(34,197,94,0.28)' : '1px solid rgba(245,158,11,0.28)',
                        }}
                      >
                        {isDone ? 'Done' : 'Pending'}
                      </div>
                    </div>
                    <p style={{ margin: '0 0 14px', color: '#f5fbff', lineHeight: 1.7 }}>{item.detail}</p>
                    <button
                      type='button'
                      onClick={() => toggleStep(item.id)}
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
                      {isDone ? 'Mark pending' : 'Mark done'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              borderRadius: '24px',
              padding: '22px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: '28px' }}>Driver approval notes</h2>
            <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
              {[
                'Show drivers where to complete each required check.',
                'Do not approve drivers until all 4 checks are complete.',
                'Keep this flow aligned with the homepage and admin style.',
                'This is still preview-only locally until it is live on the public site.',
              ].map((note) => (
                <div
                  key={note}
                  style={{
                    borderRadius: '16px',
                    padding: '14px 16px',
                    background: 'rgba(0,0,0,0.24)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#e8fff5',
                    lineHeight: 1.7,
                  }}
                >
                  {note}
                </div>
              ))}
            </div>

            <button
              type='button'
              onClick={markAgreement}
              style={{
                border: 'none',
                cursor: 'pointer',
                padding: '14px 18px',
                borderRadius: '14px',
                background: '#ffffff',
                color: '#09111f',
                fontWeight: 800,
                width: '100%',
              }}
            >
              Agree and continue
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
