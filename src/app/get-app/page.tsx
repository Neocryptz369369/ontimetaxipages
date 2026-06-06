import Link from 'next/link'
import type { CSSProperties } from 'react'

type AppCard = {
  title: string
  description: string
  href: string
}

type DeviceGroup = {
  device: string
  blurb: string
  cards: AppCard[]
}

const groups: DeviceGroup[] = [
  {
    device: 'Android',
    blurb: 'Choose the Android path for rider or driver install help.',
    cards: [
      {
        title: 'Android Rider',
        description: 'Open the Android rider app page.',
        href: '/get-app/android/rider',
      },
      {
        title: 'Android Driver',
        description: 'Open the Android driver app page.',
        href: '/get-app/android/driver',
      },
    ],
  },
  {
    device: 'iPhone',
    blurb: 'Choose the iPhone path for rider or driver install help.',
    cards: [
      {
        title: 'iPhone Rider',
        description: 'Open the iPhone rider app page.',
        href: '/get-app/iphone/rider',
      },
      {
        title: 'iPhone Driver',
        description: 'Open the iPhone driver app page.',
        href: '/get-app/iphone/driver',
      },
    ],
  },
]

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)',
  color: '#0f172a',
  fontFamily: 'Arial, Helvetica, sans-serif',
}

const shellStyle: CSSProperties = {
  maxWidth: '1180px',
  margin: '0 auto',
  padding: '32px 20px 72px',
}

const navStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '36px',
  flexWrap: 'wrap',
}

const navLinksStyle: CSSProperties = {
  display: 'flex',
  gap: '14px',
  flexWrap: 'wrap',
  fontSize: '14px',
  fontWeight: 600,
}

const heroStyle: CSSProperties = {
  background: '#ffffff',
  border: '1px solid #dbe7ff',
  borderRadius: '28px',
  padding: '32px',
  boxShadow: '0 22px 60px rgba(15, 23, 42, 0.08)',
  marginBottom: '28px',
}

const eyebrowStyle: CSSProperties = {
  display: 'inline-block',
  padding: '8px 12px',
  borderRadius: '999px',
  background: '#dbeafe',
  color: '#1d4ed8',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: '18px',
}

const titleStyle: CSSProperties = {
  fontSize: 'clamp(34px, 6vw, 56px)',
  lineHeight: 1.05,
  margin: '0 0 14px',
}

const leadStyle: CSSProperties = {
  margin: 0,
  fontSize: '18px',
  lineHeight: 1.7,
  color: '#334155',
  maxWidth: '760px',
}

const infoBoxStyle: CSSProperties = {
  marginTop: '22px',
  padding: '18px 20px',
  borderRadius: '18px',
  background: '#eff6ff',
  border: '1px solid #bfdbfe',
  color: '#1e3a8a',
  lineHeight: 1.6,
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '24px',
}

const deviceCardStyle: CSSProperties = {
  background: '#ffffff',
  border: '1px solid #dbe7ff',
  borderRadius: '24px',
  padding: '26px',
  boxShadow: '0 20px 48px rgba(15, 23, 42, 0.07)',
}

const deviceTitleStyle: CSSProperties = {
  fontSize: '28px',
  margin: '0 0 8px',
}

const deviceTextStyle: CSSProperties = {
  margin: '0 0 22px',
  color: '#475569',
  lineHeight: 1.65,
}

const innerGridStyle: CSSProperties = {
  display: 'grid',
  gap: '14px',
}

const appCardStyle: CSSProperties = {
  display: 'block',
  textDecoration: 'none',
  background: '#f8fbff',
  border: '1px solid #dbe7ff',
  borderRadius: '18px',
  padding: '18px',
  color: '#0f172a',
}

const footerNoteStyle: CSSProperties = {
  marginTop: '28px',
  color: '#475569',
  lineHeight: 1.7,
  fontSize: '15px',
}

export default function GetAppPage() {
  return (
    <main style={pageStyle}>
      <div style={shellStyle}>
        <div style={navStyle}>
          <Link href="/" style={{ textDecoration: 'none', color: '#1d4ed8', fontWeight: 800, fontSize: '20px' }}>
            On-Time Taxi
          </Link>
          <div style={navLinksStyle}>
            <Link href="/" style={{ textDecoration: 'none', color: '#334155' }}>Ride</Link>
            <Link href="/ride" style={{ textDecoration: 'none', color: '#334155' }}>Book</Link>
            <Link href="/get-app" style={{ textDecoration: 'none', color: '#1d4ed8' }}>Get app</Link>
          </div>
        </div>

        <section style={heroStyle}>
          <div style={eyebrowStyle}>Get app</div>
          <h1 style={titleStyle}>Choose the right app path.</h1>
          <p style={leadStyle}>
            Start here, then pick the right install path for your phone and role.
            This keeps the app flow simple before the full rider and driver pages are built out more.
          </p>

          <div style={infoBoxStyle}>
            <strong>Owner app note:</strong> Dennis&apos;s own app is still treated as an admin-console-only download path.
            It is not shown here as a public chooser tile.
          </div>
        </section>

        <section style={gridStyle}>
          {groups.map((group) => (
            <article key={group.device} style={deviceCardStyle}>
              <h2 style={deviceTitleStyle}>{group.device}</h2>
              <p style={deviceTextStyle}>{group.blurb}</p>

              <div style={innerGridStyle}>
                {group.cards.map((card) => (
                  <Link key={card.href} href={card.href} style={appCardStyle}>
                    <div style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>{card.title}</div>
                    <div style={{ color: '#475569', lineHeight: 1.6 }}>{card.description}</div>
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </section>

        <div style={footerNoteStyle}>
          Website-first install flow for now. No App Store or Google Play handoff yet.
        </div>
      </div>
    </main>
  )
}
