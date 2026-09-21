'use client'

import { useEffect, useRef } from 'react'
import { getLang, LANG_EVENT } from '../lib/i18n'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
    __cvAll?: any
  }
}

type Props = {
  videoId: string
  title?: string
  aspectPercent?: number
}

const DEBUG = true

export default function CaptionedVideo({ videoId, title, aspectPercent }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const wantedLangRef = useRef<string>('en')
  const watchdogRef = useRef<any>(null)
  const historyRef = useRef<any[]>([])

  useEffect(function () {
    let cancelled = false

    function pushHistory(entry: any) {
      if (!DEBUG) return
      entry.t = Date.now()
      historyRef.current.push(entry)
      if (historyRef.current.length > 40) historyRef.current.shift()
    }

    function currentTrackLang(): string | null {
      const p = playerRef.current
      if (!p || typeof p.getOption !== 'function') return null
      try {
        const t = p.getOption('captions', 'track')
        if (!t) return null
        if (t.translationLanguage && t.translationLanguage.languageCode) return t.translationLanguage.languageCode
        return t.languageCode || null
      } catch (e) {
        return null
      }
    }

    function rawTrack(): any {
      const p = playerRef.current
      if (!p || typeof p.getOption !== 'function') return null
      try {
        return p.getOption('captions', 'track')
      } catch (e) {
        return { error: String(e) }
      }
    }

    function applyCaptions(reason: string) {
      const p = playerRef.current
      if (!p || typeof p.setOption !== 'function') return
      const target = wantedLangRef.current && wantedLangRef.current !== 'en' ? wantedLangRef.current : 'en'
      try {
        const cur = currentTrackLang()
        const track = rawTrack()
        const state = typeof p.getPlayerState === 'function' ? p.getPlayerState() : null
        pushHistory({ reason: reason, target: target, cur: cur, track: track, state: state })
        if (cur === target) return
        p.setOption('captions', 'track', { languageCode: target })
        p.setOption('captions', 'reload', true)
      } catch (e) {
        pushHistory({ reason: reason, error: String(e) })
      }
    }

    function stopWatchdog() {
      if (watchdogRef.current) {
        clearInterval(watchdogRef.current)
        watchdogRef.current = null
      }
    }

    function startWatchdog() {
      stopWatchdog()
      let ticks = 0
      watchdogRef.current = setInterval(function () {
        ticks += 1
        applyCaptions('watchdog-tick-' + ticks)
        if (ticks > 20) stopWatchdog()
      }, 1000)
    }

    function makePlayer() {
      if (cancelled || !hostRef.current) return
      playerRef.current = new window.YT.Player(hostRef.current, {
        videoId: videoId,
        playerVars: { cc_load_policy: 1, rel: 0 },
        events: {
          onReady: function () {
            wantedLangRef.current = getLang()
            pushHistory({ reason: 'onReady', wantedLang: wantedLangRef.current })
          },
          onApiChange: function () {
            applyCaptions('apiChange')
          },
          onStateChange: function (ev: any) {
            pushHistory({ reason: 'onStateChange', data: ev && ev.data })
            if (ev && ev.data === 1) {
              applyCaptions('state-playing')
              startWatchdog()
            } else if (ev && (ev.data === 2 || ev.data === 0)) {
              stopWatchdog()
            }
          },
        },
      })

      if (DEBUG) {
        window.__cvAll = window.__cvAll || {}
        window.__cvAll[videoId] = {
          player: function () {
            return playerRef.current
          },
          wantedLang: function () {
            return wantedLangRef.current
          },
          currentTrackLang: currentTrackLang,
          rawTrack: rawTrack,
          history: function () {
            return historyRef.current
          },
          apply: function () {
            applyCaptions('manual')
          },
        }
      }
    }

    if (window.YT && window.YT.Player) {
      makePlayer()
    } else {
      const already = document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
      if (!already) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        document.body.appendChild(tag)
      }
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = function () {
        if (typeof prev === 'function') prev()
        makePlayer()
      }
    }

    function onLangChange(ev: any) {
      const code = ev && ev.detail ? String(ev.detail) : getLang()
      wantedLangRef.current = code
      pushHistory({ reason: 'onLangChange', code: code })
      applyCaptions('langEvent')
      startWatchdog()
    }
    window.addEventListener(LANG_EVENT, onLangChange)

    return function () {
      cancelled = true
      stopWatchdog()
      window.removeEventListener(LANG_EVENT, onLangChange)
      try {
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy()
        }
      } catch (e) {}
    }
  }, [videoId])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        paddingBottom: (aspectPercent || 56.25) + '%',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.14)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.30)',
      }}
    >
      <div
        ref={hostRef}
        title={title}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      />
    </div>
  )
}
