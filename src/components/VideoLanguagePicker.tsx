'use client'

import { useEffect, useState } from 'react'
import { getLang, LANG_EVENT } from '../lib/i18n'

type VideoOption = {
  code: string
  label: string
  flag: string
  videoId: string
}

const VIDEOS: VideoOption[] = [
  { code: 'en', label: 'English', flag: '🇺🇸', videoId: '4o9HHi7S2rI' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸', videoId: 'co-a89-Mg5w' },
  { code: 'ar', label: 'Arabic', flag: '🇸🇦', videoId: 'K5LShNnSHfQ' },
  { code: 'zh-CN', label: 'Chinese', flag: '🇨🇳', videoId: 'FbwsucT9sYM' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵', videoId: '8pW2TxwtliU' },
  { code: 'km', label: 'Khmer', flag: '🇰🇭', videoId: 'd8o_2ohFYoc' },
  { code: 'ru', label: 'Russian', flag: '🇷🇺', videoId: 'GLfKTY7pQII' },
  { code: 'fr', label: 'French', flag: '🇫🇷', videoId: 't1xV3A_3xlI' },
  { code: 'tl', label: 'Filipino', flag: '🇵🇭', videoId: 'HLMBNz0ryEQ' },
  { code: 'af', label: 'Afrikaans', flag: '🇿🇦', videoId: 'PRji7sWa6pY' },
  { code: 'el', label: 'Greek', flag: '🇬🇷', videoId: '7aOPJWMI-pA' },
  { code: 'iw', label: 'Hebrew', flag: '🇮🇱', videoId: '-tulmR1gcyc' },
  { code: 'sw', label: 'Swahili', flag: '🇰🇪', videoId: 'nd5qE1WKYDE' },
  { code: 'uk', label: 'Ukrainian', flag: '🇺🇦', videoId: 'aGC63d1-Gdc' },
  { code: 'kn', label: 'Kannada', flag: '🇮🇳', videoId: 'g3umVG3F1Bo' },
  { code: 'sv', label: 'Swedish', flag: '🇸🇪', videoId: 'Jc0GG08PF9A' },
  { code: 'id', label: 'Indonesian', flag: '🇮🇩', videoId: '1trMwfwMjSU' },
  { code: 'nl', label: 'Dutch', flag: '🇳🇱', videoId: '5mSfLQ0SiaI' },
  { code: 'it', label: 'Italian', flag: '🇮🇹', videoId: 'LX9a20uG7tA' },
  { code: 'de', label: 'German', flag: '🇩🇪', videoId: 'EZk2lERjqPs' },
  { code: 'fi', label: 'Finnish', flag: '🇫🇮', videoId: 'ekT0BChbhaM' },
  { code: 'ga', label: 'Irish', flag: '🇮🇪', videoId: 'NB8LfR5s9fk' },
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
                {v.flag + ' ' + v.label}
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
