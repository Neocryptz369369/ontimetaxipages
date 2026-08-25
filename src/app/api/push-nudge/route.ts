import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function hold(sec: number) {
  return new Promise((r) => setTimeout(r, sec * 1000))
}

async function run(origin: string) {
  const sb: any = adminClient()
  const since = new Date(Date.now() - 20 * 60 * 1000).toISOString()
  const got: any = await sb
    .from('rides')
    .select('id, pickup, dropoff, fare, created_at, profiles(full_name)')
    .eq('status', 'requested')
    .gte('created_at', since)
  if (got.error) return { ok: false, error: String(got.error.message) }
  const rows: any[] = got.data || []
  let sent = 0
  for (let i = 0; i < rows.length; i++) {
    const r: any = rows[i]
    const p: any = r.profiles
    const rider = p && p.full_name ? String(p.full_name) : (Array.isArray(p) && p[0] && p[0].full_name ? String(p[0].full_name) : '')
    try {
      await fetch(origin + '/api/push-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup: String(r.pickup || ''),
          dropoff: String(r.dropoff || ''),
          fare: '$' + Number(r.fare || 0).toFixed(2),
          rider: rider,
        }),
      })
      sent = sent + 1
    } catch (e) {}
  }
  return { ok: true, waiting: rows.length, sent: sent }
}

export async function POST(req: Request) {
  let b: any = {}
  try { b = await req.json() } catch (e) { b = {} }
  const d = Number(b.delay || 0)
  if (d > 0 && d < 50) await hold(d)
  const out = await run(new URL(req.url).origin)
  return NextResponse.json(out)
}

export async function GET(req: Request) {
  const u = new URL(req.url)
  const d = Number(u.searchParams.get('delay') || 0)
  if (d > 0 && d < 50) await hold(d)
  const out = await run(u.origin)
  return NextResponse.json(out)
}
