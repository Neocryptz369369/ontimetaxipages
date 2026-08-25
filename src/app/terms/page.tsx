import Link from 'next/link'

export const metadata = { title: 'Terms of Service - On Time Taxi' }

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
        <h1 style={h1}>Terms of Service</h1>
        <p style={small}>On Time Taxi - Serving Clark County, Indiana - Last updated August 25, 2026</p>
        <p style={p}>These are the rules for using On Time Taxi. By ordering a ride or by driving for us you agree to them.</p>
        <h2 style={h2}>Where we run</h2>
        <p style={p}>On Time Taxi serves Clark County, Indiana and the nearby towns of southern Indiana. We may refuse a trip that goes outside the area we can safely cover.</p>
        <h2 style={h2}>What a ride costs</h2>
        <p style={p}>A ride is five dollars to get in plus two dollars fifty cents for every mile. The full price is shown on your screen before you order, and it does not change once you order unless you add a stop. A tip is optional and one hundred percent of any tip goes to the driver.</p>
        <h2 style={h2}>Paying</h2>
        <p style={p}>Payment is by credit or debit card only. There is no cash option. Cards are processed by Stripe. If you believe you were charged in error, call 930-216-4166 and a refund will be put back on your card, normally within five business days.</p>
        <h2 style={h2}>Cancelling</h2>
        <p style={p}>You may cancel free of charge any time before a driver accepts your ride. Once a driver is on the way, a cancelled trip may still be charged the five dollar get in fee.</p>
        <h2 style={h2}>Drivers</h2>
        <p style={p}>Drivers are independent contractors, not employees. Every driver must apply, upload a photo and the paperwork needed to drive legally, speak with the owner by phone, and be approved by the owner before taking a single ride.</p>
        <p style={p}>On each completed ride the company keeps the five dollar get in fee and twenty percent of the remaining fare. The driver keeps the rest and keeps all of the tip. Each driver can see what they earned that day inside their own driver page.</p>
        <h2 style={h2}>Safety and conduct</h2>
        <p style={p}>No smoking, no open alcohol, and no weapons in the vehicle. A driver may end a trip if a passenger is threatening, violent, or badly intoxicated. Riders can report a driver for suspected drug or alcohol use from the menu, and any driver reported is suspended straight away until the company finishes looking into it. The owner decides whether a suspended driver comes back.</p>
        <h2 style={h2}>Speed monitoring</h2>
        <p style={p}>While a driver is on the clock their speed is recorded. Drivers are warned by their phone if they go over the posted limit, and repeated speeding can end their contract with On Time Taxi.</p>
        <h2 style={h2}>Recording during an emergency</h2>
        <p style={p}>Both the rider app and the driver app have a panic button. Pressing it records sound and video from that phone and saves it to the company for review and for police if needed. Everyone agrees to this in writing when they sign up. Nothing is recorded at any other time.</p>
        <h2 style={h2}>Ratings</h2>
        <p style={p}>After a trip the rider rates the driver and the driver rates the rider from one to five stars. Anything two stars or lower is flagged for the owner to look at.</p>
        <h2 style={h2}>What we cannot promise</h2>
        <p style={p}>We work hard to be on time but traffic, weather and breakdowns happen, so we cannot guarantee an exact arrival time and are not responsible for missed appointments, flights or connections. Items left in a vehicle should be reported the same day and we will do our best to return them.</p>
        <h2 style={h2}>Account closing</h2>
        <p style={p}>You may delete your account at any time from the Delete my account page. We may close an account that breaks these rules.</p>
        <h2 style={h2}>Which law applies</h2>
        <p style={p}>These terms are governed by the laws of the State of Indiana.</p>
        <h2 style={h2}>Contact us</h2>
        <p style={p}>On Time Taxi, Clark County, Indiana. Phone 930-216-4166 (call or text). Email neocryptz@yahoo.com.</p>
        <p style={small}><Link href="/" style={link}>Back to On Time Taxi</Link> &nbsp; <Link href="/privacy" style={link}>Privacy</Link> &nbsp; <Link href="/terms" style={link}>Terms</Link> &nbsp; <Link href="/support" style={link}>Support</Link> &nbsp; <Link href="/delete-account" style={link}>Delete my account</Link></p>
      </div>
    </main>
  )
}
