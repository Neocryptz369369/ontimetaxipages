import Link from 'next/link'

export const metadata = { title: 'Privacy Policy - On Time Taxi' }

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
        <h1 style={h1}>Privacy Policy</h1>
        <p style={small}>On Time Taxi - Serving Clark County, Indiana - Last updated August 25, 2026</p>
        <p style={p}>This page explains what On Time Taxi collects when you use our website or our app, why we collect it, and how you can have it removed. We do not sell your information to anyone.</p>
        <h2 style={h2}>What we collect</h2>
        <p style={p}>Your name and phone number when you set up an account. Your pickup address, your dropoff address, any extra stops, and the record of rides you have taken. A profile photo, only if you choose to add one.</p>
        <p style={p}>Your location. While you have a ride open we read your phone location so your driver can reach you and so you can watch the car coming. Drivers who are on the clock also have their location and their speed recorded while they are working, because our insurance requires it.</p>
        <p style={p}>Driver paperwork. People who apply to drive upload a photo of themselves and copies of the documents needed to drive legally.</p>
        <h2 style={h2}>Card payments</h2>
        <p style={p}>Card payments are handled entirely by Stripe. Your card number is typed into Stripe, not into our site, and we never see it or store it. We only see whether a ride was paid and the last four digits.</p>
        <h2 style={h2}>Panic button recordings</h2>
        <p style={p}>If a rider or a driver presses the panic button, the app records sound and video from that phone and saves it so the company can review what happened and hand it to police if needed. Every rider and every driver agrees to this in writing when they sign up. Nothing is recorded unless a panic button is pressed.</p>
        <h2 style={h2}>Who we share it with</h2>
        <p style={p}>The driver taking your ride sees your first name, your phone number, your pickup and your dropoff. Nobody else sees your ride. We use Stripe for payments, Mapbox for maps and addresses, and Supabase to store the account and ride records. Our insurance broker receives driver hours and accident reports only, never rider details.</p>
        <h2 style={h2}>How long we keep it</h2>
        <p style={p}>Ride and payment records are kept for seven years because tax and insurance rules require it. Panic recordings are kept while a complaint is open and deleted afterwards. Everything else is deleted when you delete your account.</p>
        <h2 style={h2}>Deleting your account</h2>
        <p style={p}>You can delete your own account at any time from the Delete my account page, or by calling 930-216-4166. Deleting removes your name, phone number, photo and login. Records the law makes us keep are stripped of your name and kept only as a total.</p>
        <h2 style={h2}>Age</h2>
        <p style={p}>On Time Taxi accounts are for people 18 and over. We do not knowingly collect anything from children.</p>
        <h2 style={h2}>Your choices</h2>
        <p style={p}>You can turn location off in your phone settings and still book a ride by dropping a pin on the map. You can turn off order alerts at any time. You can ask us what we hold on you by calling or emailing, and we will tell you within thirty days.</p>
        <h2 style={h2}>Contact us</h2>
        <p style={p}>On Time Taxi, Clark County, Indiana. Phone 930-216-4166 (call or text). Email neocryptz@yahoo.com.</p>
        <p style={small}><Link href="/" style={link}>Back to On Time Taxi</Link> &nbsp; <Link href="/privacy" style={link}>Privacy</Link> &nbsp; <Link href="/terms" style={link}>Terms</Link> &nbsp; <Link href="/support" style={link}>Support</Link> &nbsp; <Link href="/delete-account" style={link}>Delete my account</Link></p>
      </div>
    </main>
  )
}
