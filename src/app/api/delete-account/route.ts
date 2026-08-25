import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function POST(req: Request) {
  const head = String(req.headers.get('authorization') || '')
  const token = head.replace(/^Bearer /i, '').trim()
  if (!token) return NextResponse.json({ ok: false, error: 'You are not signed in.' }, { status: 401 })
  const sb: any = admin()
  let id = ''
  try {
    const who: any = await sb.auth.getUser(token)
    const user = who && who.data ? who.data.user : null
    id = user && user.id ? String(user.id) : ''
  } catch (e) {
    id = ''
  }
  if (!id) return NextResponse.json({ ok: false, error: 'You are not signed in.' }, { status: 401 })
  const notes: string[] = []
  try {
    const up: any = await sb.from('profiles').update({ full_name: 'Deleted account', phone: null, photo_url: null }).eq('id', id)
    notes.push(up && up.error ? 'details kept' : 'details cleared')
  } catch (e) {
    notes.push('details kept')
  }
  try {
    const gone: any = await sb.auth.admin.deleteUser(id)
    notes.push(gone && gone.error ? 'login kept' : 'login removed')
  } catch (e) {
    notes.push('login kept')
  }
  return NextResponse.json({ ok: true, notes })
}

export async function GET() {
  return NextResponse.json({ ok: true, info: 'Send a POST with your login to delete your account.' })
}
