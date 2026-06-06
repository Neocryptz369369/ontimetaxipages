import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { CSSProperties } from 'react'

type Variant = {
  badge: string
  title: string
  lead: string
  installHeading: string
  installSteps: string[]
  features: string[]
  accountNotes: string[]
}

const variants: Record<string, Variant> = {
  'android-rider': {
    badge: 'Android Rider',
    title: 'Get the Android Rider app.',
    lead:
      'This page is the website-first path for riders using Android. It gives a cleaner next step after the chooser page and keeps the install flow inside your website for now.',
    installHeading: 'Android Rider install flow',
    installSteps: [
      'Open this page from the Get app chooser page.',
      'Review the Android Rider notes and install path here first.',
      'Use this page as the website-controlled handoff point until store publishing happens later.',
    ],
    features: [
      'Made for riders using Android devices.',
      'Keeps the app flow on the website for now.',
      'Acts as the rider-specific page after the chooser screen.',
    ],
    accountNotes: [
      'Rider login and rider account data should later line up with the admin console.',
      'Customer ID numbers should remain permanent once assigned.',
      'The rider should be able to easily find the customer ID inside the rider app.',
    ],
  },
  'android-driver': {
    badge: 'Android Driver',
    title: 'Get the Android Driver app.',
    lead:
      'This page is the website-first path for drivers using Android. It gives drivers a clear place to land after the chooser page without sending them to Google Play yet.',
    installHeading: 'Android Driver install flow',
    installSteps: [
      'Open this page from the Get app chooser page.',
      'Review the Android Driver notes and install path here first.',
      'Keep the handoff website-based until store publishing happens later.',
    ],
    features: [
      'Made for drivers using Android devices.',
      'Separates driver install guidance from rider guidance.',
      'Supports the larger driver/admin workflow that is being tracked now.',
    ],
    accountNotes: [
      'Driver login and driver data should later line up with the admin console.',
      'Driver ID numbers should remain permanent once assigned.',
      'The driver should be able to easily find the driver ID inside the driver app.',
    ],
  },
  'iphone-rider': {
    badge: 'iPhone Rider',
    title: 'Get the iPhone Rider app.',
    lead:
      'This page is the website-first path for riders using iPhone. It keeps the rider flow simple and separate while the website build continues.',
    installHeading: 'iPhone Rider install flow',
    installSteps: [
      'Open this page from the Get app chooser page.',
      'Review the iPhone Rider notes and install path here first.',
      'Use this page as the rider handoff until App Store publishing happens later.',
    ],
    features: [
      'Made for riders using iPhone devices.',
      'Keeps rider install guidance separate from driver guidance.',
      'Stays inside the website-first rollout for now.',
    ],
    accountNotes: [
      'Rider login and rider account data should later line up with the admin console.',
      'Customer ID numbers should remain permanent once assigned.',
      'The rider should be able to easily find the customer ID inside the rider app.',
    ],
  },
  'iphone-driver': {
    badge: 'iPhone Driver',
    title: 'Get the iPhone Driver app.',
    lead:
      'This page is the website-first path for drivers using iPhone. It gives the driver side its own path and keeps the website flow organized before full release.',
    installHeading: 'iPhone Driver install flow',
    installSteps: [
      'Open this page from the Get app chooser page.',
      'Review the iPhone Driver notes and install path here first.',
      'Use this page as the driver handoff until App Store publishing happens later.',
    ],
    features: [
      'Made for drivers using iPhone devices.',
      'Keeps the driver path separate from rider pages.',
      'Supports the larger admin and driver workflow already being tracked.',
    ],
    accountNotes: [
      'Driver login and driver data should later line up with the admin console.',
      'Driver ID numbers should remain permanent once assigned.',
      'The driver should be able to easily find the driver ID inside the driver app.',
    ],
  },
}

const platformLabels: Record<string, string> = {
  android: 'Android',
  iphone: 'iPhone',
}

const roleLabels: Record<string, string> = {
  rider: 'Rider',
  driver: 'Driver',
}

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
  marginBottom: '28px',
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
  marginBottom: '24px',
}

const badgeStyle: CSSProperties = {
  display: 'inline-block',
  padding: '8px 12px',
  borderRadius: '999px',
  background: '#dbeafe',
  color: '#1d4ed8',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: '16px',
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
  maxWidth: '820px',
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '20px',
  marginBottom: '24px',
}

const cardStyle: CSSProperties = {
  background: '#ffffff',
  border: '1px solid #dbe7ff',
  borderRadius: '24px',
  padding: '24px',
  boxShadow: '0 20px 48px rgba(15, 23, 42, 0.07)',
}

const cardHeadingStyle: CSSProperties = {
  fontSize: '22px',
  margin: '0 0 14px',
}

const listStyle: CSSProperties = {
  margin: 0,
  paddingLeft: '20px',
  color: '#334155',
  lineHeight: 1.8,
}

const calloutStyle: CSSProperties = {
  marginTop: '22px',
  padding: '18px 20px',
  borderRadius: '18px',
  background: '#eff6ff',
  border: '1px solid #bfdbfe',
  color: '#1e3a8a',
  lineHeight: 1.6,
}

const footerActionsStyle: CSSProperties = {
  display: 'flex',
  gap: '14px',
  flexWrap: 'wrap',
  marginTop: '28px',
}

const primaryButtonStyle: CSSProperties = {
  display: 'inline-block',
  textDecoration: 'none',
  background: '#1d4ed8',
  color: '#ffffff',
  fontWeight: 700,
  padding: '14px 18px',
  borderRadius: '14px',
}

const secondaryButtonStyle: CSSProperties = {
  display: 'inline-block',
  textDecoration: 'none',
  background: '#eff6ff',
  color: '#1d4ed8',
  fontWeight: 700,
  padding: '14px 18px',
  borderRadius: '14px',
  border: '1px solid #bfdbfe',
}

type PageProps = {
  params: {
    platform: string
    role: string
  }
}

export default function AppDetailPage({ params }: PageProps) {
  const platform = params.platform.toLowerCase()
  const role = params.role.toLowerCase()

  if (!platformLabels[platform] || !roleLabels[role]) {
    notFound()
  }

  const key = `${platform}-${role}`
  const variant = variants[key]

  if (!variant) {
    notFound()
  }

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
          <div style={badgeStyle}>{variant.badge}</div>
          <h1 style={titleStyle}>{variant.title}</h1>
          <p style={leadStyle}>{variant.lead}</p>

          <div style={calloutStyle}>
            <strong>Owner app note:</strong> Dennis&apos;s own app stays on its own admin-console-only path.
            These public pages are only for rider and driver app flows.
          </div>
        </section>

        <section style={gridStyle}>
          <article style={cardStyle}>
            <h2 style={cardHeadingStyle}>{variant.installHeading}</h2><ol style={listStyle}>
              {variant.installSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>

          <article style={cardStyle}>
            <h2 style={cardHeadingStyle}>What this page covers</h2><ul style={listStyle}>
              {variant.features.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article style={cardStyle}>
            <h2 style={cardHeadingStyle}>Account and admin alignment</h2><ul style={listStyle}>
              {variant.accountNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>

        <section style={heroStyle}>
          <h2 style={{ marginTop: 0, fontSize: '28px' }}>Next build direction</h2>
          <p style={leadStyle}>
            After these public pages are in place, the next website path is the admin page and then the owner-app admin-console route.
          </p>

          <div style={footerActionsStyle}>
            <Link href="/get-app" style={primaryButtonStyle}>
              Back to Get app chooser
            </Link>
            <Link href="/" style={secondaryButtonStyle}>
              Back to homepage
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
