import Link from 'next/link'
import type { CSSProperties } from 'react'

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)',
  color: '#0f172a',
  fontFamily: 'Arial, Helvetica, sans-serif',
}

const shellStyle: CSSProperties = {
  maxWidth: '1280px',
  margin: '0 auto',
  padding: '28px 20px 72px',
}

const navStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '24px',
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
  marginBottom: '22px',
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
  maxWidth: '840px',
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

const dashboardLayoutStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '280px minmax(0, 1fr)',
  gap: '20px',
  alignItems: 'start',
}

const sidebarStyle: CSSProperties = {
  background: '#ffffff',
  border: '1px solid #dbe7ff',
  borderRadius: '24px',
  padding: '22px',
  boxShadow: '0 20px 48px rgba(15, 23, 42, 0.07)',
  position: 'sticky',
  top: '20px',
}

const menuHeadingStyle: CSSProperties = {
  margin: '0 0 16px',
  fontSize: '18px',
}

const menuListStyle: CSSProperties = {
  display: 'grid',
  gap: '10px',
}

const menuItemStyle: CSSProperties = {
  padding: '12px 14px',
  borderRadius: '14px',
  background: '#f8fbff',
  border: '1px solid #dbe7ff',
  color: '#1e293b',
  fontWeight: 600,
}

const contentColumnStyle: CSSProperties = {
  display: 'grid',
  gap: '20px',
}

const sectionStyle: CSSProperties = {
  background: '#ffffff',
  border: '1px solid #dbe7ff',
  borderRadius: '24px',
  padding: '24px',
  boxShadow: '0 20px 48px rgba(15, 23, 42, 0.07)',
}

const statGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '16px',
  marginTop: '18px',
}

const statCardStyle: CSSProperties = {
  background: '#f8fbff',
  border: '1px solid #dbe7ff',
  borderRadius: '18px',
  padding: '18px',
}

const featureGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '16px',
  marginTop: '18px',
}

const featureCardStyle: CSSProperties = {
  background: '#f8fbff',
  border: '1px solid #dbe7ff',
  borderRadius: '18px',
  padding: '18px',
}

const buttonRowStyle: CSSProperties = {
  display: 'flex',
  gap: '14px',
  flexWrap: 'wrap',
  marginTop: '22px',
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

const menuItems = [
  'Dashboard Home',
  'Ticker and Alert Controls',
  'User Management',
  'Safety and Emergency',
  'Security Settings',
  'System Settings',
  'Log Out',
]

const statCards = [
  { label: 'Owner access', value: 'Ready for login flow' },
  { label: 'User lookup', value: 'Driver + rider view planned' },
  { label: 'Safety archive', value: 'Panic recording rules tracked' },
  { label: 'ID system', value: 'Driver + customer IDs planned' },
]

const featureCards = [
  {
    title: 'User Management',
    text: 'Search by name, phone, email, or account ID and move quickly between Drivers, Riders, and All Users.',
  },
  {
    title: 'Security Settings',
    text: 'Prepare password, OTP / security code methods, recovery methods, and session controls in one place.',
  },
  {
    title: 'Safety and Emergency',
    text: 'Keep panic archive behavior, recording review, delete safety rules, and restore flows together.',
  },
  {
    title: 'Ticker and Alert Controls',
    text: 'Leave room for ads, alert flows, and owner-side control panels already being tracked.',
  },
  {
    title: 'Owner App Path',
    text: 'Support the owner-only admin launch flow and keep it separate from normal rider and driver paths.',
  },
  {
    title: 'System Settings',
    text: 'Create one place for future connection settings, recovery options, and owner-only controls.',
  },
]

export default function AdminPage() {
  return (
    <main style={pageStyle}>
      <div style={shellStyle}>
        <div style={navStyle}>
          <Link href="/" style={{ textDecoration: 'none', color: '#1d4ed8', fontWeight: 800, fontSize: '20px' }}>
            On-Time Taxi
          </Link>
          <div style={navLinksStyle}>
            <Link href="/" style={{ textDecoration: 'none', color: '#334155' }}>Ride</Link>
            <Link href="/get-app" style={{ textDecoration: 'none', color: '#334155' }}>Get app</Link>
            <Link href="/admin" style={{ textDecoration: 'none', color: '#1d4ed8' }}>Admin</Link>
          </div>
        </div>

        <section style={heroStyle}>
          <div style={badgeStyle}>Admin console</div>
          <h1 style={titleStyle}>Owner control dashboard</h1>
          <p style={leadStyle}>
            This admin page is now a fuller owner/admin website path instead of only a basic placeholder. It gives you a more complete preview of how the owner-side control area can look before the real login and deeper admin logic are wired in.
          </p>
          <div style={infoBoxStyle}>
            <strong>Important:</strong> this is still the website-side admin dashboard preview. The next step is to wire the real login, security flow, and owner-only access behavior behind it.
          </div>
        </section>

        <section style={dashboardLayoutStyle}>
          <aside style={sidebarStyle}>
            <h2 style={menuHeadingStyle}>Main menu</h2>
            <div style={menuListStyle}>
              {menuItems.map((item) => (
                <div key={item} style={menuItemStyle}>{item}</div>
              ))}
            </div>
          </aside>

          <div style={contentColumnStyle}>
            <section style={sectionStyle}>
              <h2 style={{ marginTop: 0, fontSize: '30px' }}>Dashboard Home</h2>
              <p style={{ color: '#475569', lineHeight: 1.7, marginTop: 0 }}>
                This area gives the owner one clear place to land after entering the admin side from the homepage or owner app path.
              </p>

              <div style={statGridStyle}>
                {statCards.map((card) => (
                  <div key={card.label} style={statCardStyle}>
                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {card.label}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '18px' }}>{card.value}</div>
                  </div>
                ))}
              </div>
            </section>

            <section style={sectionStyle}>
              <h2 style={{ marginTop: 0, fontSize: '30px' }}>Admin sections ready for build-out</h2>
              <div style={featureGridStyle}>
                {featureCards.map((card) => (
                  <article key={card.title} style={featureCardStyle}>
                    <div style={{ fontWeight: 800, fontSize: '18px', marginBottom: '8px' }}>{card.title}</div>
                    <div style={{ color: '#475569', lineHeight: 1.7 }}>{card.text}</div>
                  </article>
                ))}
              </div>
            </section>

            <section style={sectionStyle}>
              <h2 style={{ marginTop: 0, fontSize: '30px' }}>Owner-side next focus</h2>
              <p style={{ color: '#475569', lineHeight: 1.7, marginTop: 0 }}>
                The next build step after this page is to connect the real owner/admin access flow behind this dashboard so the Admin @ entry and the owner path behave like one connected system.
              </p>

              <div style={buttonRowStyle}>
                <Link href="/get-app" style={primaryButtonStyle}>Back to Get app flow</Link>
                <Link href="/" style={secondaryButtonStyle}>Back to homepage</Link>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}
