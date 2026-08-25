import Link from 'next/link'

export const metadata = { title: 'Support and Contact - On Time Taxi' }

const wrap: any = { minHeight: '100vh', background: '#05070f', color: '#e8eaf1', padding: '28px 18px 60px' }
const box: any = { maxWidth: 820, margin: '0 auto' }
const h1: any = { fontSize: 28, fontWeight: 900, color: '#f5b301', margin: '0 0 6px' }
const h2: any = { fontSize: 18, fontWeight: 800, color: '#fff', margin: '26px 0 8px' }
const p: any = { fontSize: 15, lineHeight: 1.7, color: '#c8cddb', margin: '0 0 10px' }
const small: any = { fontSize: 13, color: '#8b93a7', margin: '0 0 18px' }
const link: any = { color: '#f5b301', fontWeight: 700, textDecoration: 'none' }

export default function Page() {
  return (
    <main style={wrap}>
      <div style={box}>
        <h1 style={h1}>Support and Contact</h1>
        <p style={small}>On Time Taxi - Serving Clark County, Indiana - Last updated August 25, 2026</p>
        <p style={p}>Need help with a ride, a charge, or your account? Reach a real person here. On Time Taxi is a small local company, so you get the owner, not a call center.</p>
        <h2 style={h2}>Call or text us</h2>
        <p style={p}>Phone 930-216-4166. Call or text any day. If we are driving we will call you straight back.</p>
        <h2 style={h2}>Email us</h2>
        <p style={p}>Email neocryptz@yahoo.com. We answer within one business day.</p>
        <h2 style={h2}>A charge looks wrong</h2>
        <p style={p}>Call or text us with the day and time of the ride. If we charged you in error the money goes back on the same card, normally within five business days.</p>
        <h2 style={h2}>Report a driver</h2>
        <p style={p}>If you believe a driver was under the influence of drugs or alcohol, use Report a driver in the ride menu. The driver is suspended immediately while we investigate. You can also call us.</p>
        <h2 style={h2}>Trouble with the app</h2>
        <p style={p}>If the pickup box will not fill in your address, drop a pin on the map instead and drag it to where you are standing. If you are not getting order alerts on an iPhone, the site has to be saved to your Home Screen first, then turn Sounds on for On Time Taxi in your phone Settings under Notifications.</p>
        <h2 style={h2}>Lost property</h2>
        <p style={p}>Tell us the same day if you can. We will contact the driver and arrange to get your things back to you.</p>
        <h2 style={h2}>Want to drive for us</h2>
        <p style={p}>Start on the Drive page. You upload a photo and your paperwork, then speak with the owner by phone. No driver starts until the owner approves them.</p>
        <h2 style={h2}>Contact us</h2>
        <p style={p}>On Time Taxi, Clark County, Indiana. Phone 930-216-4166 (call or text). Email neocryptz@yahoo.com.</p>
        <p style={small}><Link href="/" style={link}>Back to On Time Taxi</Link> &nbsp; <Link href="/privacy" style={link}>Privacy</Link> &nbsp; <Link href="/terms" style={link}>Terms</Link> &nbsp; <Link href="/support" style={link}>Support</Link> &nbsp; <Link href="/delete-account" style={link}>Delete my account</Link></p>
      </div>
    </main>
  )
}
