import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Stripe webhook receiver. Verifies the event signature using the signing
// secret (STRIPE_WEBHOOK_SECRET) with Node's crypto module, so we add no SDK
// dependency. Handles checkout.session.completed to confirm a ride was paid.

function verifyStripeSignature(payload: string, header: string, secret: string): boolean {
  if (!header || !secret) return false
  const parts = header.split(',').reduce((acc: Record<string, string>, part) => {
    const [k, v] = part.split('=')
    if (k && v) acc[k.trim()] = v.trim()
    return acc
  }, {})
  const timestamp = parts['t']
  const sig = parts['v1']
  if (!timestamp || !sig) return false

  const signedPayload = timestamp + '.' + payload
  const expected = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex')

  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(sig, 'utf8')
  if (a.length !== b.length) return false
  if (!crypto.timingSafeEqual(a, b)) return false

  const now = Math.floor(Date.now() / 1000)
  const eventTime = parseInt(timestamp, 10)
  if (isNaN(eventTime) || Math.abs(now - eventTime) > 300) return false

  return true
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const sigHeader = req.headers.get('stripe-signature') || ''
  const payload = await req.text()

  if (!verifyStripeSignature(payload, sigHeader, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: any
  try {
    event = JSON.parse(payload)
  } catch (e) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data && event.data.object ? event.data.object : {}
      const meta = session.metadata || {}
      console.log('[webhook] Ride paid', {
        sessionId: session.id,
        amountTotal: session.amount_total,
        paymentStatus: session.payment_status,
        pickup: meta.pickup,
        dropoff: meta.dropoff,
        miles: meta.miles,
      })
      break
    }
    default:
      break
  }

  return NextResponse.json({ received: true })
}
