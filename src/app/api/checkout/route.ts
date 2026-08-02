import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Creates a Stripe Checkout Session via Stripe's REST API (no SDK dependency).
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
  }

  let body: any = {}
  try { body = await req.json() } catch (e) { body = {} }

  const fare = Number(body.fare)
  const pickup = typeof body.pickup === 'string' ? body.pickup : ''
  const dropoff = typeof body.dropoff === 'string' ? body.dropoff : ''
  const miles = Number(body.miles) || 0

  if (!fare || isNaN(fare) || fare <= 0) {
    return NextResponse.json({ error: 'Invalid fare' }, { status: 400 })
  }

  const amount = Math.round(fare * 100)
  const origin = req.headers.get('origin') || 'https://ontimetaxi.biz'
  const desc = 'On Time Taxi ride' + (miles ? ' (' + miles.toFixed(1) + ' mi)' : '')

  const params = new URLSearchParams()
  params.append('mode', 'payment')
  params.append('success_url', origin + '/ride/success?session_id={CHECKOUT_SESSION_ID}')
  params.append('cancel_url', origin + '/ride?canceled=1')
  params.append('automatic_payment_methods[enabled]', 'true')
  params.append('line_items[0][quantity]', '1')
  params.append('line_items[0][price_data][currency]', 'usd')
  params.append('line_items[0][price_data][unit_amount]', String(amount))
  params.append('line_items[0][price_data][product_data][name]', 'On Time Taxi ride')
  params.append('line_items[0][price_data][product_data][description]', desc)
  if (pickup) params.append('metadata[pickup]', pickup.slice(0, 480))
  if (dropoff) params.append('metadata[dropoff]', dropoff.slice(0, 480))
  if (miles) params.append('metadata[miles]', miles.toFixed(2))

  try {
    const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + secret,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })
    const data = await resp.json()
    if (!resp.ok) {
      const msg = data && data.error && data.error.message ? data.error.message : 'Stripe error'
      return NextResponse.json({ error: msg }, { status: 400 })
    }
    return NextResponse.json({ url: data.url })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
