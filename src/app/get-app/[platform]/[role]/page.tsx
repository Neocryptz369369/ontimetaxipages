import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { CSSProperties } from 'react'

type Variant = {
  kind: 'rider' | 'driver'
  platform: 'iphone' | 'android'
  badge: string
  title: string
  lead: string
  installSteps: string[]
  features: { icon: string; label: string; desc: string }[]
  webAppHref: string
}

const variants: Record<string, Variant> = {
  'android-rider': {
    kind: 'rider',
    platform: 'android',
    badge: 'Android \u2022 Rider',
    title: 'Your ride, on time. Every time.',
    lead:
      'Request a ride in seconds, watch your driver arrive on a live map, and pay your way. Install On-Time Taxi on your Android phone and it opens full screen like a real app.',
    installSteps: [
      'Open this page in Chrome on your Android phone.',
      'Tap the three-dot menu in the top-right corner.',
      'Tap "Install app" (or "Add to Home screen").',
      'Tap "Install" to confirm \u2014 the On-Time Taxi icon lands on your home screen.',
      'Open it from your home screen and sign in to start riding.',
    ],
    features: [
      { icon: '\uD83D\uDCCD', label: 'Request a ride', desc: 'Set pickup and drop-off and get matched to a nearby driver fast.' },
      { icon: '\uD83D\uDDFA\uFE0F', label: 'Live tracking', desc: 'Follow your driver on a real-time map with an accurate arrival time.' },
      { icon: '\uD83D\uDCB3', label: 'Pay your way', desc: 'Card, Apple Pay, Google Pay, or cash \u2014 with tipping built in.' },
      { icon: '\uD83C\uDF10', label: 'Any language', desc: 'Live translated chat and spoken translation between you and your driver.' },
    ],
    webAppHref: '/ride',
  },
  'iphone-rider': {
    kind: 'rider',
    platform: 'iphone',
    badge: 'iPhone \u2022 Rider',
    title: 'Your ride, on time. Every time.',
    lead:
      'Request a ride in seconds, watch your driver arrive on a live map, and pay your way. Add On-Time Taxi to your iPhone and it opens full screen like a real app.',
    installSteps: [
      'Open this page in Safari on your iPhone (it must be Safari, not Chrome).',
      'Tap the Share button \u2014 the square with an up arrow at the bottom of the screen.',
      'Scroll down and tap "Add to Home Screen".',
      'Tap "Add" in the top-right corner.',
      'Open On-Time Taxi from your home screen and sign in to start riding.',
    ],
    features: [
      { icon: '\uD83D\uDCCD', label: 'Request a ride', desc: 'Set pickup and drop-off and get matched to a nearby driver fast.' },
      { icon: '\uD83D\uDDFA\uFE0F', label: 'Live tracking', desc: 'Follow your driver on a real-time map with an accurate arrival time.' },
      { icon: '\uD83D\uDCB3', label: 'Pay your way', desc: 'Card, Apple Pay, Google Pay, or cash \u2014 with tipping built in.' },
      { icon: '\uD83C\uDF10', label: 'Any language', desc: 'Live translated chat and spoken translation between you and your driver.' },
    ],
    webAppHref: '/ride',
  },
  'android-driver': {
    kind: 'driver',
    platform: 'android',
    badge: 'Android \u2022 Driver',
    title: 'Drive. Deliver. Get paid.',
    lead:
      'Accept rides, follow turn-by-turn navigation, and track your earnings in one place. Install the On-Time Taxi driver app on your Android phone to get started.',
    installSteps: [
      'Open this page in Chrome on your Android phone.',
      'Tap the three-dot menu in the top-right corner.',
      'Tap "Install app" (or "Add to Home screen").',
      'Tap "Install" to confirm.',
      'Open it from your home screen and sign in with your driver account.',
    ],
    features: [
      { icon: '\uD83D\uDCB0', label: 'Earnings dashboard', desc: 'See trips, tips, and payouts update in real time.' },
      { icon: '\uD83E\uDDED', label: 'Navigation', desc: 'Turn-by-turn maps with spoken voice guidance.' },
      { icon: '\uD83D\uDD14', label: 'Ride requests', desc: 'Accept or decline requests and manage your ride queue.' },
      { icon: '\u26A1', label: 'Go online anytime', desc: 'Flip your availability on and off whenever you want to drive.' },
    ],
    webAppHref: '/driver-onboarding',
  },
  'iphone-driver': {
    kind: 'driver',
    platform: 'iphone',
    badge: 'iPhone \u2022 Driver',
    title: 'Drive. Deliver. Get paid.',
    lead:
      'Accept rides, follow turn-by-turn navigation, and track your earnings in one place. Add the On-Time Taxi driver app to your iPhone to get started.',
    installSteps: [
      'Open this page in Safari on your iPhone (it must be Safari, not Chrome).',
      'Tap the Share button \u2014 the square with an up arrow at the bottom of the screen.',
      'Scroll down and tap "Add to Home Screen".',
      'Tap "Add" in the top-right corner.',
      'Open the app from your home screen and sign in with your driver account.',
    ],
    features: [
      { icon: '\uD83D\uDCB0', label: 'Earnings dashboard', desc: 'See trips, tips, and payouts update in real time.' },
      { icon: '\uD83E\uDDED', label: 'Navigation', desc: 'Turn-by-turn maps with spoken voice guidance.' },
      { icon: '\uD83D\uDD14', label: 'Ride requests', desc: 'Accept or decline requests and manage your ride queue.' },
      { icon: '\u26A1', label: 'Go online anytime', desc: 'Flip your availability on and off whenever you want to drive.' },
    ],
    webAppHref: '/driver-onboarding',
  },
}

const platformNames: Record<string, string> = { iphone: 'iPhone', android: 'Android' }

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  margin: 0,
  background: 'linear-gradient(180deg, #05070f 0%, #0b1020 55%, #0f1830 100%)',
  color: '#f4f6fb',
  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
}

const shellStyle: CSSProperties = {
  maxWidth: 1120,
  margin: '0 auto',
  padding: '0 24px 96px',
}

const navStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '26px 0',
}

const brandStyle: CSSProperties = { fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', color: '#ffd21f' }

const navLinksStyle: CSSProperties = { display: 'flex', gap: 22, fontSize: 15, fontWeight: 600 }
const navLinkStyle: CSSProperties = { color: '#c9d2e6', textDecoration: 'none' }

const heroStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: 48,
  alignItems: 'center',
  padding: '48px 0 24px',
}

const badgeStyle: CSSProperties = {
  display: 'inline-block',
  padding: '7px 16px',
  borderRadius: 999,
  background: 'rgba(255, 210, 31, 0.14)',
  color: '#ffd21f',
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
}

const titleStyle: CSSProperties = {
  fontSize: 'clamp(38px, 6vw, 62px)',
  lineHeight: 1.05,
  margin: '20px 0 18px',
  fontWeight: 800,
  letterSpacing: '-0.03em',
}

const leadStyle: CSSProperties = { fontSize: 18, lineHeight: 1.6, color: '#c2cbe0', maxWidth: 520 }

const ctaRowStyle: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 30 }

const primaryButtonStyle: CSSProperties = {
  display: 'inline-block',
  padding: '15px 28px',
  borderRadius: 14,
  background: '#ffd21f',
  color: '#0b1020',
  fontWeight: 800,
  fontSize: 16,
  textDecoration: 'none',
}

const secondaryButtonStyle: CSSProperties = {
  display: 'inline-block',
  padding: '15px 28px',
  borderRadius: 14,
  background: 'rgba(255,255,255,0.08)',
  color: '#f4f6fb',
  fontWeight: 700,
  fontSize: 16,
  textDecoration: 'none',
  border: '1px solid rgba(255,255,255,0.16)',
}

const phoneWrapStyle: CSSProperties = { display: 'flex', justifyContent: 'center' }

const phoneStyle: CSSProperties = {
  width: 270,
  height: 540,
  borderRadius: 40,
  background: 'linear-gradient(160deg, #1b2540, #0c1224)',
  border: '10px solid #05070f',
  boxShadow: '0 40px 90px rgba(0,0,0,0.55)',
  padding: 18,
  position: 'relative',
  overflow: 'hidden',
}

const phoneMapStyle: CSSProperties = {
  height: 300,
  borderRadius: 20,
  background: 'linear-gradient(135deg, #24407a 0%, #1a2c55 40%, #12203f 100%)',
  position: 'relative',
  overflow: 'hidden',
}

const phonePinStyle: CSSProperties = {
  position: 'absolute',
  top: 130,
  left: '50%',
  transform: 'translateX(-50%)',
  fontSize: 30,
}

const phoneCardStyle: CSSProperties = {
  marginTop: 16,
  background: '#0f1830',
  borderRadius: 18,
  padding: 16,
  border: '1px solid rgba(255,255,255,0.08)',
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 18,
  marginTop: 24,
}

const cardStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 18,
  padding: '22px 22px',
}

const sectionTitleStyle: CSSProperties = { fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 72 }

const installCardStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 22,
  padding: '28px 28px',
  marginTop: 22,
  maxWidth: 720,
}

const stepStyle: CSSProperties = {
  display: 'flex',
  gap: 16,
  alignItems: 'flex-start',
  padding: '14px 0',
  borderTop: '1px solid rgba(255,255,255,0.07)',
}

const stepNumStyle: CSSProperties = {
  flex: '0 0 auto',
  width: 30,
  height: 30,
  borderRadius: 999,
  background: '#ffd21f',
  color: '#0b1020',
  fontWeight: 800,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 15,
}

type PageProps = { params: { platform: string; role: string } }

export function generateStaticParams() {
  return [
    { platform: 'iphone', role: 'rider' },
    { platform: 'android', role: 'rider' },
    { platform: 'iphone', role: 'driver' },
    { platform: 'android', role: 'driver' },
  ]
}

export default function AppDetailPage({ params }: PageProps) {
  const key = params.platform + '-' + params.role
  const variant = variants[key]

  if (!variant) {
    notFound()
  }

  const v = variant
  const phoneName = platformNames[v.platform]

  return (
    <main style={pageStyle}>
      <div style={shellStyle}>
        <nav style={navStyle}>
          <Link href="/" style={{ ...brandStyle, textDecoration: 'none' }}>
            On-Time Taxi
          </Link>
          <div style={navLinksStyle}>
            <Link href="/" style={navLinkStyle}>Home</Link>
            <Link href="/get-app" style={navLinkStyle}>Get app</Link>
            <Link href={v.webAppHref} style={navLinkStyle}>Open web app</Link>
          </div>
        </nav>

        <section style={heroStyle}>
          <div>
            <span style={badgeStyle}>{v.badge}</span>
            <h1 style={titleStyle}>{v.title}</h1>
            <p style={leadStyle}>{v.lead}</p>
            <div style={ctaRowStyle}>
              <a href="#install" style={primaryButtonStyle}>
                How to install on {phoneName}
              </a>
              <Link href={v.webAppHref} style={secondaryButtonStyle}>
                Open the web app
              </Link>
            </div>
          </div>

          <div style={phoneWrapStyle}>
            <div style={phoneStyle}>
              <div style={phoneMapStyle}>
                <div style={phonePinStyle}>{v.kind === 'rider' ? '\uD83D\uDCCD' : '\uD83E\uDDED'}</div>
              </div>
              <div style={phoneCardStyle}>
                <div style={{ fontSize: 13, color: '#8ea0c4', fontWeight: 700 }}>
                  {v.kind === 'rider' ? 'DRIVER ARRIVING' : 'NEW RIDE REQUEST'}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, marginTop: 6 }}>
                  {v.kind === 'rider' ? '3 min away' : '$14.50 \u2022 4.2 mi'}
                </div>
                <div style={{ marginTop: 12, height: 40, borderRadius: 12, background: '#ffd21f', color: '#0b1020', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {v.kind === 'rider' ? 'Track ride' : 'Accept'}
                </div>
              </div>
            </div>
          </div>
        </section>

        <h2 style={sectionTitleStyle}>What you get</h2>
        <div style={gridStyle}>
          {v.features.map((f) => (
            <div key={f.label} style={cardStyle}>
              <div style={{ fontSize: 30 }}>{f.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 10 }}>{f.label}</div>
              <p style={{ color: '#b7c1d9', lineHeight: 1.55, marginTop: 6 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <h2 id="install" style={sectionTitleStyle}>
          Install on your {phoneName}
        </h2>
        <div style={installCardStyle}>
          {v.installSteps.map((s, i) => (
            <div key={i} style={i === 0 ? { ...stepStyle, borderTop: 'none' } : stepStyle}>
              <div style={stepNumStyle}>{i + 1}</div>
              <div style={{ fontSize: 16, lineHeight: 1.5, color: '#e6ebf6', paddingTop: 3 }}>{s}</div>
            </div>
          ))}
          <div style={{ marginTop: 22 }}>
            <Link href={v.webAppHref} style={primaryButtonStyle}>
              Open the web app now
            </Link>
          </div>
        </div>

        <p style={{ marginTop: 40, color: '#7f8dab', fontSize: 14, maxWidth: 720, lineHeight: 1.6 }}>
          On-Time Taxi installs straight from your browser as a home-screen app. No App Store or Google Play
          download is needed while we finish testing.
        </p>
      </div>
    </main>
  )
}
