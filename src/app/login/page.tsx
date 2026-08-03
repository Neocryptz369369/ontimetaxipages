'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';

async function uploadPendingPhoto(userId: string) {
  try {
    const raw = sessionStorage.getItem('pendingPhoto');
    if (!raw) return;
    const { name, type, dataUrl } = JSON.parse(raw);
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const ext = (name.split('.').pop() || 'jpg').toLowerCase();
    const path = userId + '/avatar.' + ext;
    const { error: upErr } = await supabase.storage
      .from('profile-photos')
      .upload(path, blob, { upsert: true, contentType: type });
    if (upErr) throw upErr;
    await supabase.from('profiles').update({ photo_url: path }).eq('id', userId);
    sessionStorage.removeItem('pendingPhoto');
  } catch {
    // Non-fatal: user can add their photo later from their account.
  }
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params?.get('next') || '/ride';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    try {
      const { data, error: signErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signErr) throw signErr;
      const userId = data.user?.id;
      if (userId) await uploadPendingPhoto(userId);
      router.push(next);
    } catch (err: any) {
      setError(err?.message || 'Could not sign in. Please check your details.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#f8fafc 0%,#eef2ff 100%)', fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,sans-serif', padding: '32px 16px' }}>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Link href="/" style={{ color: '#2563eb', fontWeight: 700, fontSize: 20, textDecoration: 'none' }}>On-Time Taxi</Link>
        </div>
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', boxShadow: '0 10px 30px rgba(15,23,42,0.06)', padding: 28 }}>
          <form onSubmit={onSubmit}>
            <h1 style={{ color: '#0f172a', fontSize: 24, margin: '0 0 6px' }}>Sign in</h1>
            <p style={{ color: '#475569', margin: '0 0 22px', fontSize: 14 }}>Sign in to book your ride.</p>

            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />

            <label style={labelStyle}>Password</label>
            <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" />

            {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 12px', borderRadius: 10, fontSize: 14, marginBottom: 16 }}>{error}</div>}

            <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', padding: '13px', borderRadius: 10, fontWeight: 600, fontSize: 15, cursor: loading ? 'default' : 'pointer' }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <p style={{ textAlign: 'center', color: '#475569', fontSize: 14, margin: '18px 0 0' }}>
              New here? <Link href="/signup" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Create an account</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', color: '#0f172a', fontSize: 14, fontWeight: 600, margin: '0 0 6px' };
const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '11px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 15, marginBottom: 16, outline: 'none' };
