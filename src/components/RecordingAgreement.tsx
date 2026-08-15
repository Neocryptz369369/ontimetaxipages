'use client';

export const RECORDING_AGREEMENT_TEXT =
  'I agree that On Time Taxi may record sound and video from my phone when an emergency or panic button is pressed during a ride, by me or by the other person in the car. The recording is saved as evidence in the On Time Taxi panic archive and it may be given to the police, to the insurance company and to the owner of On Time Taxi. My phone will also ask me for permission at the moment it starts recording.';

export default function RecordingAgreement(props: { checked: boolean; onChange: (value: boolean) => void; dark?: boolean }) {
  const dark = props.dark === true;

  const box: React.CSSProperties = {
    borderRadius: 14,
    padding: '14px 16px',
    marginBottom: 16,
    background: dark ? 'rgba(0,0,0,0.24)' : '#f8fafc',
    border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #cbd5e1',
    color: dark ? '#e8fff5' : '#334155',
  };

  return (
    <div style={box}>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8, color: dark ? '#ffffff' : '#0f172a' }}>
        Recording agreement
      </div>
      <p style={{ margin: '0 0 12px', fontSize: 14, lineHeight: 1.7 }}>{RECORDING_AGREEMENT_TEXT}</p>
      <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
        <input
          type='checkbox'
          checked={props.checked}
          onChange={(e) => props.onChange(e.target.checked)}
          style={{ width: 18, height: 18, marginTop: 2, flexShrink: 0 }}
        />
        <span>I have read this and I agree to be recorded this way.</span>
      </label>
    </div>
  );
}
