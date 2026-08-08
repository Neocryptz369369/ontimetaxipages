'use client'
import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RideSuccess() {
  const router = useRouter()
  useEffect(() => {
    const t = setTimeout(() => { router.push('/ride') }, 4000)
    return () => clearTimeout(t)
  }, [router])
  return (
    <div className="sx-wrap">
      <div className="sx-card">
        <div className="sx-check">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="sx-title">Payment received</h1>
        <p className="sx-text">Thank you. Your On Time Taxi ride is confirmed. Taking you to live tracking...</p>
        <Link href="/ride" className="sx-btn">Track your ride</Link>
        <Link href="/" className="sx-home">Back to home</Link>
      </div>
      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        .sx-wrap { min-height: 100vh; background: #0e0e10; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .sx-card { background: #17171b; border-radius: 20px; padding: 40px 28px; max-width: 400px; width: 100%; text-align: center; }
        .sx-check { width: 66px; height: 66px; border-radius: 50%; background: #22c55e; display: flex; align-items: center; justify-content: center; margin: 0 auto 22px; }
        .sx-title { font-size: 22px; font-weight: 800; margin: 0 0 10px; }
        .sx-text { color: #aaa; font-size: 15px; line-height: 1.5; margin: 0 0 26px; }
        .sx-btn { display: block; background: #f5b301; color: #111; text-decoration: none; border-radius: 12px; padding: 14px; font-weight: 700; font-size: 16px; }
        .sx-home { display: block; color: #888; text-decoration: none; font-size: 14px; margin-top: 16px; }
      `}</style>
    </div>
  )
}
