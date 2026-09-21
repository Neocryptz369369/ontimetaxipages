'use client'

import { useEffect, useRef } from 'react'
import { getLang, LANG_EVENT } from '../lib/i18n'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

type Props = {
  videoId: string
  title?: string
  aspectPercent?: number
}

export default function CaptionedVideo({ videoId, title, aspectPercent }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const wantedLangRef = useRef<string>('en')

  useEffect(function () {
    let cancelled = false
    let retryTimer: any = null

    function applyCaptions() {
      const p = playerRef.current
      if (!p || typeof p.setOption !== 'function') return
      try {
        const target = wantedLangRef.current && wantedLangRef.current !== 'en' ? wantedLangRef.current : 'en'
        p.setOption('captions', 'track', { languageCode: target })
        p.setOption('captions', 'reload', true)
      } catch (e) {}
    }

    function scheduleApply() {
      applyCaptions()
      if (retryTimer) clearTimeout(retryTimer)
      let tries = 0
      const tick = function () {
        tries += 1
        applyCaptions()
        if (tries < 6) retryTimer = setTimeout(tick, 700)
      }
      retryTimer = setTimeout(tick, 400)
    }

    function makePlayer() {
      if (cancelled || !hostRef.current) return
      playerRef.current = new window.YT.Player(hostRef.current, {
        videoId: videoId,
        playerVars: { cc_load_policy: 1, rel: 0 },
        events: {
          onReady: function () {
            wantedLangRef.current = getLang()
            scheduleApply()
          },
          onApiChange: function () {
            scheduleApply()
          },
          onStateChange: function (ev: any) {
            if (ev && ev.data === 1) scheduleApply()
          },
        },
      })
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
      scheduleApply()
    }
    window.addEventListener(LANG_EVENT, onLangChange)

    return function () {
      cancelled = true
      if (retryTimer) clearTimeout(retryTimer)
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
