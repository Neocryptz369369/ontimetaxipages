'use client'

import { useEffect, useState } from 'react'
import { getLang, LANG_EVENT } from '../lib/i18n'

type VideoOption = {
  code: string
  label: string
  videoId: string
}

const VIDEOS: VideoOption[] = [
  { code: 'en', label: 'English', videoId: '4o9HHi7S2rI' },
  { code: 'es', label: 'Spanish', videoId: 'co-a89-Mg5w' },
  { code: 'ar', label: 'Arabic', videoId: 'K5LShNnSHfQ' },
  { code: 'zh-CN', label: 'Chinese', videoId: 'FbwsucT9sYM' },
  { code: 'ja', label: 'Japanese', videoId: '8pW2TxwtliU' },
  { code: 'km', label: 'Khmer', videoId: 'd8o_2ohFYoc' },
  { code: 'ru', label: 'Russian', videoId: 'GLfKTY7pQII' },
  { code: 'fr', label: 'French', videoId: 't1xV3A_3xlI' },
]

export default function VideoLanguagePicker() {
  const [selected, setSelected] = useState('en')
  const [userPicked, setUserPicked] = useState(false)

  useEffect(function () {
    function pickForLang(code: string) {
      const match = VIDEOS.find(function (v) {
        return v.code === code
      })
      return match ? match.code : 'en'
    }

    setSelected(pickForLang(getLang()))

    function onLangChange(ev: any) {
      if (userPicked) return
      const code = ev && ev.detail ? String(ev.detail) : getLang()
      setSelected(pickForLang(code))
    }
    window.addEventListener(LANG_EVENT, onLangChange)
    return function () {
      window.removeEventListener(LANG_EVENT, onLangChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPicked])

  const current = VIDEOS.find(function (v) {
    return v.code === selected
  }) || VIDEOS[0]

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '10px',
        }}
      >
        <div
          style={{
            fontSize: '13px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#8fdcff',
          }}
        >
          Rider Guide Video
        </div>
        <select
          value={selected}
          onChange={function (e) {
            setUserPicked(true)
            setSelected(e.target.value)
          }}
          aria-label="Choose video language"
          style={{
            background: 'rgba(255,255,255,0.10)',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '999px',
            padding: '8px 14px',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          {VIDEOS.map(function (v) {
            return (
              <option key={v.code} value={v.code} style={{ color: '#000000' }}>
                {v.label}
              </option>
            )
          })}
        </select>
      </div>
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '56.25%',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.30)',
        }}
      >
        <iframe
          key={current.videoId}
          src={'https://www.youtube.com/embed/' + current.videoId + '?cc_load_policy=1&rel=0'}
          title={'On Time Taxi Rider Guide - ' + current.label}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
        />
      </div>
    </div>
  )
}
