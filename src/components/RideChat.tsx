'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { LANG_EVENT, getLang, langLabel, translateText, speak, stopSpeaking, canSpeak, ttsLang } from '../lib/i18n'

type Msg = {
  id: any
  ride_id: string
  sender: string
  body: string
  lang: string | null
  created_at: string
}

const AUTO_KEY = 'ott_chat_autoread'

function timeOf(s: string) {
  try {
    const d = new Date(s)
    let h = d.getHours()
    const m = d.getMinutes()
    const ap = h >= 12 ? 'PM' : 'AM'
    h = h % 12
    if (h === 0) h = 12
    return h + ':' + (m < 10 ? '0' + m : String(m)) + ' ' + ap
  } catch (e) { return '' }
}

export default function RideChat(props: { rideId: any; role: string; handsFree?: boolean }) {
  const role = props.role === 'driver' ? 'driver' : 'rider'
  const other = role === 'driver' ? 'rider' : 'driver'
  const rideId = props.rideId ? String(props.rideId) : ''

  const [msgs, setMsgs] = useState<Msg[]>([])
  const [shown, setShown] = useState<{ [k: string]: string }>({})
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [myLang, setMyLang] = useState('en')
  const [autoRead, setAutoRead] = useState(false)
  const [note, setNote] = useState('')
  const [openOrig, setOpenOrig] = useState<{ [k: string]: boolean }>({})

  const langRef = useRef('en')
  const listRef = useRef<any>(null)
  const seenRef = useRef<{ [k: string]: boolean }>({})
  const firstLoadRef = useRef(true)
  const autoRef = useRef(false)

  useEffect(function () {
    const l = getLang()
    langRef.current = l
    setMyLang(l)
    try {
      const a = (window.localStorage.getItem(AUTO_KEY) || '1') === '1'
      autoRef.current = a
      setAutoRead(a)
    } catch (e) {}
    const onLang = function () {
      const nl = getLang()
      langRef.current = nl
      setMyLang(nl)
      setShown({})
    }
    window.addEventListener(LANG_EVENT, onLang as any)
    return function () { window.removeEventListener(LANG_EVENT, onLang as any) }
  }, [])

  async function load() {
    if (!rideId) return
    try {
      const res: any = await supabase
        .from('messages')
        .select('*')
        .eq('ride_id', rideId)
        .order('created_at', { ascending: true })
      if (res && res.error) { setNote('chat-unavailable'); return }
      const rows: Msg[] = res && res.data ? res.data : []
      setNote('')
      setMsgs(rows)
    } catch (e) { setNote('chat-unavailable') }
  }

  useEffect(function () {
    load()
    const iv = setInterval(load, 4000)
    return function () { clearInterval(iv) }
  }, [rideId])

  const shownRef = useRef<{ [k: string]: string }>({})
  const [tick, setTick] = useState(0)

  useEffect(function () {
    let alive = true
    const run = async function () {
      const fresh: string[] = []
      for (let i = 0; i < msgs.length; i++) {
        const m = msgs[i]
        const idk = String(m.id)
        const k = idk + '|' + myLang
        let out = shownRef.current[k]
        if (typeof out !== 'string') {
          const from = m.lang ? String(m.lang) : ''
          if (from && from === myLang) {
            out = m.body
          } else {
            try { out = await translateText(m.body, myLang, from || undefined) } catch (e) { out = m.body }
          }
          if (!alive) return
          shownRef.current[k] = out
          setTick(function (t) { return t + 1 })
        }
        if (!seenRef.current[idk]) {
          seenRef.current[idk] = true
          if (!firstLoadRef.current && m.sender === other) fresh.push(out)
        }
      }
      firstLoadRef.current = false
      if (autoRef.current && fresh.length > 0) {
        try { speak(fresh.join('. '), myLang) } catch (e) {}
      }
      try {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
      } catch (e) {}
    }
    run()
    return function () { alive = false }
  }, [msgs, myLang])

  async function send() {
    const t = text.trim()
    if (!t || !rideId || sending) return
    setSending(true)
    try {
      const res: any = await supabase.from('messages').insert({
        ride_id: rideId,
        sender: role,
        body: t,
        lang: langRef.current || 'en'
      })
      if (res && res.error) {
        setNote('chat-unavailable')
      } else {
        setText('')
        setNote('')
        await load()
      }
    } catch (e) { setNote('chat-unavailable') }
    setSending(false)
  }

  function toggleAuto() {
    const v = !autoRef.current
    autoRef.current = v
    setAutoRead(v)
    try { window.localStorage.setItem(AUTO_KEY, v ? '1' : '0') } catch (e) {}
    if (!v) stopSpeaking()
  }

  function toggleOrig(id: string) {
    setOpenOrig(function (prev) {
      const n: { [k: string]: boolean } = {}
      const keys = Object.keys(prev)
      for (let i = 0; i < keys.length; i++) n[keys[i]] = prev[keys[i]]
      n[id] = !n[id]
      return n
    })
  }

  const [speakOk, setSpeakOk] = useState(false)
  useEffect(function () { setSpeakOk(canSpeak()) }, [])

  const hfRef = useRef(false)
  const recRef = useRef<any>(null)
  const bufRef = useRef('')
  const [hfOn, setHfOn] = useState(false)
  const [heard, setHeard] = useState('')
  const [hfNote, setHfNote] = useState('')

  function canHear() {
    if (typeof window === 'undefined') return false
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  }

  const SEND_WORDS = ['send', 'send it', 'sent', 'send message', 'enviar', 'envoyer', 'senden', 'invia', 'wyslij', 'gonder', 'otpravit']

  function stripSendWord(raw: string) {
    let t = String(raw || '').trim()
    while (t.length > 0) {
      const last = t.charAt(t.length - 1)
      if (last === '.' || last === ',' || last === '!' || last === String.fromCharCode(63)) t = t.slice(0, t.length - 1)
      else break
    }
    t = t.trim()
    const low = t.toLowerCase()
    for (let i = 0; i < SEND_WORDS.length; i++) {
      const w = SEND_WORDS[i]
      if (low === w) return ''
      const tail = ' ' + w
      if (low.length > tail.length && low.slice(low.length - tail.length) === tail) {
        return t.slice(0, t.length - tail.length).trim()
      }
    }
    return null
  }

  async function sendBody(b: string) {
    const t = String(b || '').trim()
    if (!t || !rideId) return
    try {
      const res: any = await supabase.from('messages').insert({
        ride_id: rideId,
        sender: role,
        body: t,
        lang: langRef.current || 'en'
      })
      if (res && res.error) setNote('chat-unavailable')
      else { setNote(''); await load() }
    } catch (e) { setNote('chat-unavailable') }
  }

  function stopHands() {
    hfRef.current = false
    setHfOn(false)
    setHeard('')
    bufRef.current = ''
    try { if (recRef.current) recRef.current.stop() } catch (e) {}
  }

  function startHands() {
    if (!canHear()) { setHfNote('This phone will not listen. You can still type.'); return }
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    try {
      const rec: any = new SR()
      rec.continuous = true
      rec.interimResults = true
      try { rec.lang = ttsLang(langRef.current || 'en') } catch (e) {}
      rec.onresult = function (ev: any) {
        if (!hfRef.current) return
        try { if ((window as any).speechSynthesis && (window as any).speechSynthesis.speaking) return } catch (e2) {}
        let fin = ''
        let inter = ''
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const r: any = ev.results[i]
          const piece = String(r[0] && r[0].transcript ? r[0].transcript : '')
          if (r.isFinal) fin = fin + ' ' + piece
          else inter = inter + ' ' + piece
        }
        if (fin.trim().length > 0) bufRef.current = (bufRef.current + ' ' + fin).trim()
        setHeard((bufRef.current + ' ' + inter).trim())
        const out = stripSendWord(bufRef.current)
        if (out !== null) {
          bufRef.current = ''
          setHeard('')
          if (out.length > 0) sendBody(out)
        }
      }
      rec.onerror = function (ev: any) {
        const k = ev && ev.error ? String(ev.error) : ''
        if (k === 'not-allowed' || k === 'service-not-allowed') {
          hfRef.current = false
          setHfOn(false)
          setHfNote('Let the browser use your microphone, then tap the button again.')
        }
      }
      rec.onend = function () {
        if (!hfRef.current) return
        try { rec.start() } catch (e) {}
      }
      recRef.current = rec
      hfRef.current = true
      setHfOn(true)
      setHfNote('')
      bufRef.current = ''
      if (!autoRef.current) toggleAuto()
      try { rec.start() } catch (e) {}
      try { speak('Hands free is on. Talk when you need to, then say the word send.', langRef.current || 'en') } catch (e) {}
    } catch (e) {
      setHfNote('This phone will not listen. You can still type.')
    }
  }

  useEffect(function () {
    return function () {
      hfRef.current = false
      try { if (recRef.current) recRef.current.stop() } catch (e) {}
    }
  }, [])

  useEffect(function () {
    if (!canSpeak()) return
    let used = false
    const unlock = function () {
      if (used) return
      used = true
      try {
        const sy: any = (window as any).speechSynthesis
        const u: any = new (window as any).SpeechSynthesisUtterance(' ')
        u.volume = 0
        sy.speak(u)
      } catch (e) {}
    }
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return function () {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  if (!rideId) return null

  const linkBtn: any = {
    background: 'none',
    border: 'none',
    padding: 0,
    margin: 0,
    color: '#cfe6ff',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    textDecoration: 'underline'
  }

  return (
    <div style={{ marginTop: 16, padding: 14, borderRadius: 14, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.14)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>
          {role === 'driver' ? 'Message your rider' : 'Message your driver'}
        </div>
        {speakOk && (
          <button type="button" onClick={toggleAuto} style={{ padding: '6px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.22)', background: autoRead ? '#1a7f37' : 'transparent', color: '#fff' }}>
            {autoRead ? 'Read aloud: on' : 'Read aloud: off'}
          </button>
        )}
      </div>
      {props.handsFree ? (
        <div style={{ marginBottom: 10, padding: 11, borderRadius: 12, background: hfOn ? 'rgba(22,163,74,0.22)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.16)' }}>
          <button
            type="button"
            onClick={function () { if (hfOn) stopHands(); else startHands() }}
            style={{ display: 'block', width: '100%', padding: '15px 12px', borderRadius: 12, border: 'none', background: hfOn ? '#16a34a' : '#f5b301', color: hfOn ? '#fff' : '#1a1a1a', fontWeight: 900, fontSize: 16, cursor: 'pointer' }}
          >
            {hfOn ? 'Hands free is ON - tap to stop' : 'Start hands free talking'}
          </button>
          <div style={{ fontSize: 12, color: '#dcdcdc', marginTop: 8, lineHeight: 1.5 }}>
            {hfOn
              ? 'Just talk. When you finish a sentence, say the word send and it goes out by itself. Everything the rider sends back is read out loud to you.'
              : 'Tap this one time before you pull off. After that you never touch the phone: talk, then say the word send.'}
          </div>
          {heard ? (
            <div data-notranslate="1" style={{ marginTop: 8, fontSize: 13, color: '#fff', fontStyle: 'italic' }}>{heard}</div>
          ) : null}
          {hfNote ? (
            <div style={{ marginTop: 8, fontSize: 12, color: '#ffb4b4', fontWeight: 700 }}>{hfNote}</div>
          ) : null}
        </div>
      ) : null}
      <div style={{ fontSize: 12, color: '#bdbdbd', marginBottom: 10 }}>
        Messages are translated into your language automatically. Your language:{' '}
        <strong data-notranslate="1" style={{ color: '#f5b301' }}>{langLabel(myLang)}</strong>
      </div>
      <div
        ref={listRef}
        data-tick={tick}
        style={{ maxHeight: 230, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}
      >
        {msgs.length === 0 && (
          <div style={{ fontSize: 13, color: '#9a9a9a' }}>No messages yet. Send the first one.</div>
        )}
        {msgs.map(function (m) {
          const idk = String(m.id)
          const mine = m.sender === role
          const disp = shownRef.current[idk + '|' + myLang]
          const body = typeof disp === 'string' ? disp : m.body
          const fromLang = m.lang ? String(m.lang) : ''
          const translated = !mine && fromLang !== myLang
          return (
            <div
              key={idk}
              style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '90%', background: mine ? '#1f6feb' : '#2a2b33', color: '#fff', borderRadius: 12, padding: '8px 11px' }}
            >
              <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 3 }}>
                {mine ? 'You' : other === 'driver' ? 'Driver' : 'Rider'}
                <span data-notranslate="1">{' \u00b7 ' + timeOf(m.created_at)}</span>
              </div>
              <div data-notranslate="1" style={{ fontSize: 14, lineHeight: 1.35, whiteSpace: 'pre-wrap' }}>{body}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 5 }}>
                {speakOk && (
                  <button type="button" onClick={function () { speak(body, myLang) }} style={linkBtn}>
                    <span data-notranslate="1">{'\uD83D\uDD0A '}</span>Listen
                  </button>
                )}
                {translated && (
                  <button type="button" onClick={function () { toggleOrig(idk) }} style={linkBtn}>
                    {openOrig[idk] ? 'Hide original' : 'Show original'}
                  </button>
                )}
              </div>
              {translated && openOrig[idk] && (
                <div data-notranslate="1" style={{ marginTop: 5, fontSize: 12, opacity: 0.72, fontStyle: 'italic' }}>{m.body}</div>
              )}
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <input
          value={text}
          onChange={function (e: any) { setText(e.target.value) }}
          onKeyDown={function (e: any) { if (e.key === 'Enter') { e.preventDefault(); send() } }}
          placeholder="Type a message"
          style={{ flex: 1, minWidth: 0, padding: '11px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: '#15161c', color: '#fff', fontSize: 14 }}
        />
        <button
          type="button"
          onClick={send}
          disabled={sending}
          style={{ padding: '11px 16px', borderRadius: 10, border: 'none', background: '#f5b301', color: '#1a1a1a', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
        >
          {sending ? 'Sending' : 'Send'}
        </button>
      </div>
      {note === 'chat-unavailable' && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#ffb4b4' }}>Chat is not available yet.</div>
      )}
    </div>
  )
}
