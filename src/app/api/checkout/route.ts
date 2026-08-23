import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { owedRating, riderMustRateMessage } from '../../../lib/ratinggate'

export const runtime = 'nodejs'

// Creates a Stripe Checkout Session via Stripe's REST API (no SDK dependency).
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
  }

  let body: any = {}
  try { body = await req.json() } catch (e) { body = {} }

  // Nobody pays for a new ride until the last one has stars on it,
  // and nobody rides without a photo on their profile.
  try {
    const rider = String(body.token || '')
    const sbUrl0 = process.env.NEXT_PUBLIC_SUPABASE_URL
    const svc0 = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (rider && sbUrl0 && svc0) {
      const sb0 = createClient(sbUrl0, svc0, { auth: { persistSession: false, autoRefreshToken: false } })
      const me0 = await sb0.auth.getUser(rider)
      if (me0.data && me0.data.user) {
        const uid0 = String(me0.data.user.id)
        try {
          const face = await sb0.from('profiles').select('photo_url').eq('id', uid0).maybeSingle()
          if (!face.error && face.data && !face.data.photo_url) {
            return NextResponse.json({ error: 'Please add a photo of yourself first. Your driver has to know who they are picking up.' }, { status: 403 })
          }
        } catch (e) {}
        const owed0 = await owedRating(sb0, uid0, 'rider')
        if (owed0) {
          return NextResponse.json({ error: riderMustRateMessage(owed0), mustRate: owed0 }, { status: 409 })
        }
      }
    }
  } catch (e) {}

  const miles = Number(body.miles) || 0
  const rawTip = Number(body.tip)
  const tip = isNaN(rawTip) || rawTip < 0 ? 0 : Math.min(Math.round(rawTip * 100) / 100, 1000)
  // Server-side pricing: recompute fare from admin settings so it cannot be tampered with.
  let baseFee = 5.0
  let perMile = 2.0
  try {
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (sbUrl && sbKey) {
      const sres = await fetch(sbUrl + '/rest/v1/app_settings?id=eq.1&select=base_fee,per_mile', {
        headers: { apikey: sbKey, Authorization: 'Bearer ' + sbKey },
        cache: 'no-store',
      })
      if (sres.ok) {
        const rows = await sres.json()
        if (Array.isArray(rows) && rows[0]) {
          if (rows[0].base_fee != null) baseFee = Number(rows[0].base_fee)
          if (rows[0].per_mile != null) perMile = Number(rows[0].per_mile)
        }
      }
    }
  } catch (e) {}
  const fare = miles > 0 ? baseFee + perMile * miles : baseFee
  const pickup = typeof body.pickup === 'string' ? body.pickup : ''
  const dropoff = typeof body.dropoff === 'string' ? body.dropoff : ''
  const rideId = body.rideId ? String(body.rideId) : ''

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
  params.append('line_items[0][quantity]', '1')
  params.append('line_items[0][price_data][currency]', 'usd')
  params.append('line_items[0][price_data][unit_amount]', String(amount))
  params.append('line_items[0][price_data][product_data][name]', 'On Time Taxi ride')
  params.append('line_items[0][price_data][product_data][description]', desc)
  if (pickup) params.append('metadata[pickup]', pickup.slice(0, 480))
  if (dropoff) params.append('metadata[dropoff]', dropoff.slice(0, 480))
  if (miles) params.append('metadata[miles]', miles.toFixed(2))
  if (rideId) params.append('metadata[ride_id]', rideId.slice(0, 120))
  if (tip > 0) {
    params.append('line_items[1][quantity]', '1')
    params.append('line_items[1][price_data][currency]', 'usd')
    params.append('line_items[1][price_data][unit_amount]', String(Math.round(tip * 100)))
    params.append('line_items[1][price_data][product_data][name]', 'Driver tip')
    params.append('line_items[1][price_data][product_data][description]', 'Thank you for tipping your driver')
    params.append('metadata[tip]', tip.toFixed(2))
  }

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
