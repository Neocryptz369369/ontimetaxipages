'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const wrap: any = { minHeight: '100vh', background: '#05070f', color: '#e8eaf1', padding: '28px 18px 60px' }
const box: any = { maxWidth: 620, margin: '0 auto' }
const h1: any = { fontSize: 26, fontWeight: 900, color: '#f5b301', margin: '0 0 10px' }
const p: any = { fontSize: 15, lineHeight: 1.7, color: '#c8cddb', margin: '0 0 12px' }
const card: any = { border: '1px solid #2a2a2e', borderRadius: 14, padding: 16, background: '#0b1020', marginTop: 18 }
const danger: any = { width: '100%', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 16px', fontWeight: 900, fontSize: 16, marginTop: 12 }
const off: any = { width: '100%', background: '#334155', color: '#94a3b8', border: 'none', borderRadius: 12, padding: '14px 16px', fontWeight: 900, fontSize: 16, marginTop: 12 }
const link: any = { color: '#f5b301', fontWeight: 700, textDecoration: 'none' }
const rowc: any = { display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 10, fontSize: 14, color: '#e8eaf1' }

export default function Page() {
  const [who, setWho] = useState('')
  const [ready, setReady] = useState(false)
  const [agree, setAgree] = useState(false)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    let go = true
    ;(async () => {
      try {
        const s: any = await supabase.auth.getSession()
        const u = s && s.data && s.data.session ? s.data.session.user : null
        if (go) setWho(u ? String(u.email || u.phone || 'your account') : '')
      } catch (e) {
        if (go) setWho('')
      }
      if (go) setReady(true)
    })()
    return () => { go = false }
  }, [])

  async function removeMe() {
    setBusy(true)
    setMsg('Deleting your account...')
    try {
      const s: any = await supabase.auth.getSession()
      const tok = s && s.data && s.data.session ? String(s.data.session.access_token) : ''
      if (!tok) { setMsg('Please sign in again, then try once more.'); setBusy(false); return }
      const r = await fetch('/api/delete-account', { method: 'POST', headers: { Authorization: 'Bearer ' + tok } })
      const j: any = await r.json()
      if (j && j.ok) {
        try { await supabase.auth.signOut() } catch (e) {}
        try { window.localStorage.clear() } catch (e) {}
        setDone(true)
        setMsg('')
      } else {
        setMsg('We could not delete it from here. Please call 930-216-4166 and we will remove it for you.')
      }
    } catch (e) {
      setMsg('We could not delete it from here. Please call 930-216-4166 and we will remove it for you.')
    }
    setBusy(false)
  }

  return (
    <main style={wrap}>
      <div style={box}>
        <h1 style={h1}>Delete my account</h1>
        {done ? (
          <div style={card}>
            <p style={p}>Your account has been deleted. Your name, phone number, photo and login are gone and you have been signed out.</p>
            <p style={p}>Ride and payment records the law makes us keep for seven years stay on file with your name taken off them.</p>
            <p style={p}><Link href="/" style={link}>Back to On Time Taxi</Link></p>
          </div>
        ) : (
          <div>
            <p style={p}>This removes your On Time Taxi account for good. It cannot be undone.</p>
            <p style={p}>What goes: your name, your phone number, your photo, your login, and your order alerts. What stays: ride and payment records, which tax and insurance rules make us keep for seven years, with your name removed from them.</p>
            {ready && !who ? (
              <div style={card}>
                <p style={p}>You need to be signed in before you can delete your account.</p>
                <p style={p}><Link href="/login" style={link}>Sign in first</Link></p>
                <p style={p}>Or call 930-216-4166 and we will delete it for you.</p>
              </div>
            ) : null}
            {ready && who ? (
              <div style={card}>
                <p style={p}>Signed in as {who}</p>
                <label style={rowc}>
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                  <span>I understand this is permanent and cannot be undone.</span>
                </label>
                {agree && !busy ? (
                  <button type="button" style={danger} onClick={removeMe}>Delete my account for good</button>
                ) : (
                  <button type="button" style={off} disabled>{busy ? 'Working...' : 'Tick the box first'}</button>
                )}
                {msg ? <p style={p}>{msg}</p> : null}
              </div>
            ) : null}
            <p style={p}>Changed your mind? <Link href="/" style={link}>Go back</Link> or read our <Link href="/privacy" style={link}>Privacy Policy</Link>.</p>
          </div>
        )}
      </div>
    </main>
  )
}
