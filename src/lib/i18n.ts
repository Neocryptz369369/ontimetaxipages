'use client'

export type LangDef = { code: string; label: string }

export const LANGS: LangDef[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Espanol / Spanish' },
  { code: 'fr', label: 'Francais / French' },
  { code: 'ht', label: 'Kreyol Ayisyen / Haitian Creole' },
  { code: 'pt', label: 'Portugues / Portuguese' },
  { code: 'de', label: 'Deutsch / German' },
  { code: 'it', label: 'Italiano / Italian' },
  { code: 'pl', label: 'Polski / Polish' },
  { code: 'ro', label: 'Romana / Romanian' },
  { code: 'ru', label: 'Russian' },
  { code: 'uk', label: 'Ukrainian' },
  { code: 'tr', label: 'Turkish' },
  { code: 'ar', label: 'Arabic' },
  { code: 'fa', label: 'Farsi / Persian' },
  { code: 'ur', label: 'Urdu' },
  { code: 'hi', label: 'Hindi' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'bn', label: 'Bengali' },
  { code: 'ne', label: 'Nepali' },
  { code: 'so', label: 'Somali' },
  { code: 'am', label: 'Amharic' },
  { code: 'sw', label: 'Swahili' },
  { code: 'zh-CN', label: 'Chinese (Simplified)' },
  { code: 'zh-TW', label: 'Chinese (Traditional)' },
  { code: 'vi', label: 'Vietnamese' },
  { code: 'ko', label: 'Korean' },
  { code: 'ja', label: 'Japanese' },
  { code: 'th', label: 'Thai' },
  { code: 'my', label: 'Burmese' },
  { code: 'tl', label: 'Tagalog / Filipino' },
]

export const LANG_EVENT = 'ott-lang-change'
const LANG_KEY = 'ott_lang'
const CACHE_KEY = 'ott_tcache_v1'

let cache: { [k: string]: string } = {}
let cacheLoaded = false

function loadCache() {
  if (cacheLoaded) return
  cacheLoaded = true
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (raw) cache = JSON.parse(raw) || {}
  } catch (e) { cache = {} }
}

let saveTimer: any = null
function saveCache() {
  if (typeof window === 'undefined') return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(function () {
    try {
      const keys = Object.keys(cache)
      if (keys.length > 4000) {
        const trimmed: { [k: string]: string } = {}
        keys.slice(keys.length - 3000).forEach(function (k) { trimmed[k] = cache[k] })
        cache = trimmed
      }
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    } catch (e) {}
  }, 900)
}

export function getLang(): string {
  if (typeof window === 'undefined') return 'en'
  try {
    const v = window.localStorage.getItem(LANG_KEY)
    if (v) return v
  } catch (e) {}
  return 'en'
}

export function setLang(code: string) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(LANG_KEY, code) } catch (e) {}
  try { window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: code })) } catch (e) {}
}

export function langLabel(code: string): string {
  for (let i = 0; i < LANGS.length; i++) { if (LANGS[i].code === code) return LANGS[i].label }
  return code
}

function ckey(text: string, from: string, to: string) { return from + '>' + to + '|' + text }

const TTS: { [k: string]: string } = {
  'en': 'en-US',
  'es': 'es-US',
  'fr': 'fr-FR',
  'ht': 'fr-FR',
  'pt': 'pt-BR',
  'de': 'de-DE',
  'it': 'it-IT',
  'pl': 'pl-PL',
  'ro': 'ro-RO',
  'ru': 'ru-RU',
  'uk': 'uk-UA',
  'tr': 'tr-TR',
  'ar': 'ar-SA',
  'fa': 'fa-IR',
  'ur': 'ur-PK',
  'hi': 'hi-IN',
  'pa': 'pa-IN',
  'bn': 'bn-IN',
  'ne': 'ne-NP',
  'so': 'so-SO',
  'am': 'am-ET',
  'sw': 'sw-KE',
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  'vi': 'vi-VN',
  'ko': 'ko-KR',
  'ja': 'ja-JP',
  'th': 'th-TH',
  'my': 'my-MM',
  'tl': 'fil-PH',
}

export function ttsLang(code: string): string { return TTS[code] || code }

export function canSpeak(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as any).speechSynthesis && !!(window as any).SpeechSynthesisUtterance
}

export function stopSpeaking() {
  if (!canSpeak()) return
  try { (window as any).speechSynthesis.cancel() } catch (e) {}
}

export function speak(text: string, code: string) {
  if (!canSpeak()) return
  if (!text || !text.trim()) return
  const synth: any = (window as any).speechSynthesis
  const want = ttsLang(code || 'en')
  const go = function () {
    try {
      synth.cancel()
      const u: any = new (window as any).SpeechSynthesisUtterance(text)
      u.lang = want
      const wl = want.toLowerCase()
      const base = wl.split('-')[0]
      const vs: any[] = synth.getVoices() || []
      let pick: any = null
      for (let i = 0; i < vs.length; i++) {
        const vl = String(vs[i].lang || '').toLowerCase().split('_').join('-')
        if (vl === wl) { pick = vs[i]; break }
      }
      if (!pick) {
        for (let i = 0; i < vs.length; i++) {
          const vl = String(vs[i].lang || '').toLowerCase().split('_').join('-')
          if (vl.split('-')[0] === base) { pick = vs[i]; break }
        }
      }
      if (pick) u.voice = pick
      u.rate = 0.98
      u.pitch = 1
      u.volume = 1
      synth.speak(u)
    } catch (e) {}
  }
  try {
    const have = synth.getVoices() || []
    if (have.length === 0) {
      let fired = false
      const once = function () { if (fired) return; fired = true; go() }
      synth.onvoiceschanged = once
      setTimeout(once, 350)
      return
    }
  } catch (e) {}
  go()
}

const ENDPOINT = 'https://translate.googleapis.com/translate_a/single'

async function callGoogle(q: string, from: string, to: string): Promise<{ text: string; src: string }> {
  const url = ENDPOINT + '\u003Fclient=gtx&dt=t&dj=1&sl=' + encodeURIComponent(from || 'auto') + '&tl=' + encodeURIComponent(to) + '&q=' + encodeURIComponent(q)
  const r = await fetch(url)
  if (!r.ok) throw new Error('translate failed')
  const j: any = await r.json()
  const arr: any[] = j && j.sentences ? j.sentences : []
  let outStr = ''
  for (let i = 0; i < arr.length; i++) { outStr += arr[i] && arr[i].trans ? arr[i].trans : '' }
  return { text: outStr, src: String((j && j.src) || from || 'en') }
}

export async function detectLang(text: string): Promise<string> {
  if (typeof window === 'undefined') return 'en'
  if (!text || !text.trim()) return 'en'
  try {
    const r = await callGoogle(text.slice(0, 300), 'auto', 'en')
    return r.src || 'en'
  } catch (e) { return 'en' }
}

export async function translateBatch(texts: string[], to: string, from?: string): Promise<string[]> {
  const target = to || 'en'
  const src = from || 'auto'
  const out = texts.slice()
  if (typeof window === 'undefined') return out
  if (src !== 'auto' && src === target) return out
  loadCache()
  const need: number[] = []
  for (let i = 0; i < texts.length; i++) {
    const t = texts[i]
    if (!t || !t.trim()) continue
    const k = ckey(t, src, target)
    if (typeof cache[k] === 'string') { out[i] = cache[k]; continue }
    need.push(i)
  }
  const chunks: number[][] = []
  let cur: number[] = []
  let len = 0
  for (let n = 0; n < need.length; n++) {
    const i = need[n]
    const l = texts[i].length + 1
    if (cur.length > 0 && (len + l > 1100 || cur.length >= 40)) { chunks.push(cur); cur = []; len = 0 }
    cur.push(i)
    len += l
  }
  if (cur.length > 0) chunks.push(cur)
  for (let c = 0; c < chunks.length; c++) {
    const grp = chunks[c]
    const q = grp.map(function (i) { return texts[i].split('\r').join(' ').split('\n').join(' ') }).join('\n')
    try {
      const res = await callGoogle(q, src, target)
      const parts = res.text.split('\n')
      if (parts.length === grp.length) {
        for (let n = 0; n < grp.length; n++) {
          const val = parts[n]
          if (typeof val !== 'string' || val.length === 0) continue
          out[grp[n]] = val
          cache[ckey(texts[grp[n]], src, target)] = val
        }
      } else {
        for (let n = 0; n < grp.length; n++) {
          const one = texts[grp[n]].split('\r').join(' ').split('\n').join(' ')
          try {
            const r2 = await callGoogle(one, src, target)
            if (r2.text) { out[grp[n]] = r2.text; cache[ckey(texts[grp[n]], src, target)] = r2.text }
          } catch (e2) {}
        }
      }
    } catch (e) {}
  }
  saveCache()
  return out
}

export async function translateText(text: string, to: string, from?: string): Promise<string> {
  const r = await translateBatch([text], to, from)
  return r && typeof r[0] === 'string' ? r[0] : text
}
