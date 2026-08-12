'use client'

import { useEffect, useRef, useState } from 'react'
import { LANGS, LANG_EVENT, getLang, setLang, langLabel, translateBatch } from '../lib/i18n'

const SKIP_TAGS: { [k: string]: boolean } = { SCRIPT: true, STYLE: true, NOSCRIPT: true, TEXTAREA: true, CODE: true, PRE: true, CANVAS: true, SVG: true, IFRAME: true, OPTION: true }

function hasLetters(s: string) { return /[A-Za-z\u00C0-\u024F]/.test(s) }

function looksLikeAddress(s: string) {
  if (/\d{5}/.test(s)) return true
  if (/^\s*\d+\s+\S/.test(s)) return true
  return false
}

function skipNode(start: any): boolean {
  let n: any = start
  while (n) {
    if (n === document.body) return false
    if (n.nodeType === 1) {
      const tag = String(n.tagName || '').toUpperCase()
      if (SKIP_TAGS[tag]) return true
      if (n.getAttribute) {
        if (n.getAttribute('data-notranslate') !== null) return true
        if (n.getAttribute('translate') === 'no') return true
      }
      const cn = typeof n.className === 'string' ? n.className : ''
      if (cn.indexOf('mapboxgl') >= 0) return true
      if (cn.indexOf('ott-langbar') >= 0) return true
    }
    n = n.parentNode
  }
  return true
}

const KEEP: { [k: string]: boolean } = {
  'on time taxi': true,
  'on time taxi.': true,
  'ontimetaxi': true,
  'ontimetaxi.biz': true,
  'mapbox': true,
  'stripe': true,
  'dennis': true
}

function isBrand(s: string) { return KEEP[String(s || '').trim().toLowerCase()] === true }

const ATTRS = ['placeholder', 'title', 'aria-label', 'alt']

export default function LangBar() {
  const [lang, setLangState] = useState('en')
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)
  const langRef = useRef('en')
  const obsRef = useRef<any>(null)
  const timerRef = useRef<any>(null)
  const runRef = useRef(false)

  function gather() {
    const items: any[] = []
    try {
      const w: any = document.createTreeWalker(document.body, 4)
      let node: any = w.nextNode()
      while (node) {
        const stored = node.__ottOrig
        const val = String(typeof stored === 'string' ? stored : node.nodeValue || '')
        if (val.trim().length > 1 && hasLetters(val) && !looksLikeAddress(val) && !isBrand(val) && !skipNode(node.parentNode)) {
          if (typeof stored !== 'string') node.__ottOrig = val
          items.push({ node: node, attr: null, orig: val })
        }
        node = w.nextNode()
      }
    } catch (e) {}
    try {
      const els: any = document.body.querySelectorAll('[placeholder],[title],[aria-label],[alt]')
      for (let i = 0; i < els.length; i++) {
        const el: any = els[i]
        if (skipNode(el)) continue
        for (let a = 0; a < ATTRS.length; a++) {
          const name = ATTRS[a]
          if (!el.hasAttribute(name)) continue
          const slot = '__ottA_' + name
          const stored = el[slot]
          const val = String(typeof stored === 'string' ? stored : el.getAttribute(name) || '')
          if (val.trim().length < 2 || !hasLetters(val) || looksLikeAddress(val) || isBrand(val)) continue
          if (typeof stored !== 'string') el[slot] = val
          items.push({ node: el, attr: name, orig: val })
        }
      }
    } catch (e) {}
    return items
  }

  async function apply(target: string) {
    if (typeof document === 'undefined' || !document.body) return
    if (runRef.current) return
    runRef.current = true
    try { if (obsRef.current) obsRef.current.disconnect() } catch (e) {}
    try {
      const items = gather()
      if (!target || target === 'en') {
        for (let i = 0; i < items.length; i++) {
          const it = items[i]
          if (it.attr) {
            if (it.node.getAttribute(it.attr) !== it.orig) it.node.setAttribute(it.attr, it.orig)
            it.node['__ottD_' + it.attr] = null
          } else {
            if (it.node.nodeValue !== it.orig) it.node.nodeValue = it.orig
            it.node.__ottD = null
          }
        }
      } else {
        const todo: any[] = []
        for (let i = 0; i < items.length; i++) {
          const it = items[i]
          const slot = it.attr ? '__ottD_' + it.attr : '__ottD'
          const cur = it.attr ? it.node.getAttribute(it.attr) : it.node.nodeValue
          const done = it.node[slot]
          if (done && done.lang === target && done.out === cur) continue
          todo.push(it)
        }
        if (todo.length > 0) {
          setBusy(true)
          const src = todo.map(function (x) { return x.orig })
          const res = await translateBatch(src, target, 'en')
          for (let i = 0; i < todo.length; i++) {
            const it = todo[i]
            const out = res[i]
            if (typeof out !== 'string' || out.length === 0) continue
            const slot = it.attr ? '__ottD_' + it.attr : '__ottD'
            if (it.attr) { it.node.setAttribute(it.attr, out) } else { it.node.nodeValue = out }
            it.node[slot] = { lang: target, out: out }
          }
          setBusy(false)
        }
      }
    } catch (e) { setBusy(false) }
    runRef.current = false
    try { if (obsRef.current) obsRef.current.observe(document.body, { childList: true, subtree: true, characterData: true }) } catch (e) {}
  }

  useEffect(function () {
    const saved = getLang()
    langRef.current = saved
    setLangState(saved)
    setReady(true)
    try { document.documentElement.lang = saved } catch (e) {}

    const schedule = function (ms: number) {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(function () { apply(langRef.current) }, ms)
    }

    let obs: any = null
    try {
      obs = new MutationObserver(function () { if (langRef.current !== 'en') schedule(300) })
      obsRef.current = obs
      obs.observe(document.body, { childList: true, subtree: true, characterData: true })
    } catch (e) {}

    const iv = setInterval(function () { if (langRef.current !== 'en') apply(langRef.current) }, 2500)

    const onLang = function (ev: any) {
      const code = ev && ev.detail ? String(ev.detail) : getLang()
      langRef.current = code
      setLangState(code)
      try { document.documentElement.lang = code } catch (e2) {}
      apply(code)
    }
    window.addEventListener(LANG_EVENT, onLang as any)

    if (saved !== 'en') schedule(400)

    return function () {
      try { if (obs) obs.disconnect() } catch (e) {}
      clearInterval(iv)
      if (timerRef.current) clearTimeout(timerRef.current)
      window.removeEventListener(LANG_EVENT, onLang as any)
    }
  }, [])

  function choose(code: string) {
    setOpen(false)
    setLang(code)
  }

  if (!ready) return null

  const shortLabel = langLabel(lang).split(' / ')[0]

  return (
    <div
      className="ott-langbar"
      data-notranslate="1"
      style={{ position: 'fixed', right: 12, top: 12, zIndex: 2147483000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif' }}
    >
      <button
        type="button"
        onClick={function () { setOpen(!open) }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '9px 14px',
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.18)',
          background: '#15161c',
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
        }}
      >
        <span style={{ fontSize: 15 }}>{'\uD83C\uDF10'}</span>
        <span>{busy ? 'Translating...' : shortLabel}</span>
      </button>
      {open && (
        <div
          style={{
            width: 250,
            marginTop: 8,
            borderRadius: 14,
            overflow: 'hidden',
            background: '#15161c',
            border: '1px solid rgba(255,255,255,0.16)',
            boxShadow: '0 14px 40px rgba(0,0,0,0.45)'
          }}
        >
          <div style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#f5b301', letterSpacing: 0.3 }}>
            Language / Idioma / Langue
          </div>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {LANGS.map(function (l) {
              const on = l.code === lang
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={function () { choose(l.code) }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 12px',
                    fontSize: 14,
                    cursor: 'pointer',
                    border: 'none',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    background: on ? 'rgba(245,179,1,0.18)' : 'transparent',
                    color: on ? '#f5b301' : '#e6e6e6'
                  }}
                >
                  {l.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
