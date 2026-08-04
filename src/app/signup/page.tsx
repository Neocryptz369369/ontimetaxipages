'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

async function uploadPhoto(userId: string, photo: File) {
  const ext = (photo.name.split('.').pop() || 'jpg').toLowerCase();
  const path = userId + '/avatar.' + ext;
  const { error: upErr } = await supabase.storage
    .from('profile-photos')
    .upload(path, photo, { upsert: true, contentType: photo.type });
  if (upErr) throw upErr;
  const { error: updErr } = await supabase
    .from('profiles')
    .update({ photo_url: path })
    .eq('id', userId);
  if (updErr) throw updErr;
}

export default function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setPhoto(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (!phone.trim()) { setError('Please enter your phone number.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (!photo) { setError('A profile photo is required so your driver can recognize you.'); return; }

    setLoading(true);
    try {
      const { data, error: signErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim(), phone: phone.trim() },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      if (signErr) throw signErr;
      const userId = data.user?.id;

      // The profile row is created automatically by a database trigger.
      // If we already have a session (email confirmation disabled), upload the
      // photo now. Otherwise stash it and upload on first sign-in.
      if (data.session && userId) {
        await uploadPhoto(userId, photo);
      } else {
        try {
          const reader = new FileReader();
          const dataUrl: string = await new Promise((res, rej) => {
            reader.onload = () => res(reader.result as string);
            reader.onerror = rej;
            reader.readAsDataURL(photo);
          });
          sessionStorage.setItem('pendingPhoto', JSON.stringify({ name: photo.name, type: photo.type, dataUrl }));
        } catch {}
      }

      setDone(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#f8fafc 0%,#eef2ff 100%)', fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,sans-serif', padding: '32px 16px' }}>
      <div style={{ maxWidth: 460, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Link href="/" style={{ color: '#2563eb', fontWeight: 700, fontSize: 20, textDecoration: 'none' }}>On-Time Taxi</Link>
        </div>
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', boxShadow: '0 10px 30px rgba(15,23,42,0.06)', padding: 28 }}>
          {done ? (
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ color: '#0f172a', fontSize: 22, margin: '0 0 12px' }}>Check your email</h1>
              <p style={{ color: '#475569', lineHeight: 1.6, margin: '0 0 20px' }}>
                We sent a confirmation link to <strong>{email}</strong>. Please confirm your email address, then sign in to finish setting up your account and book your ride.
              </p>
              <Link href="/login" style={{ display: 'inline-block', background: '#2563eb', color: '#fff', padding: '12px 22px', borderRadius: 10, textDecoration: 'none', fontWeight: 600 }}>Go to sign in</Link>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <h1 style={{ color: '#0f172a', fontSize: 24, margin: '0 0 6px' }}>Create your account</h1>
              <p style={{ color: '#475569', margin: '0 0 22px', fontSize: 14 }}>Sign up before you book. Your driver will see your name, phone, and photo at pickup.</p>

              <label style={labelStyle}>Full name</label>
              <input style={inputStyle} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Doe" autoComplete="name" />

              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />

              <label style={labelStyle}>Phone number</label>
              <input style={inputStyle} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(812) 555-0100" autoComplete="tel" />

              <label style={labelStyle}>Password</label>
              <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" />

              <label style={labelStyle}>Profile photo (required)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f1f5f9', border: '1px solid #e5e7eb', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {preview ? <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#94a3b8', fontSize: 12 }}>No photo</span>}
                </div>
                <input type="file" accept="image/*" onChange={onPhoto} style={{ fontSize: 14, color: '#475569' }} />
              </div>

              {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 12px', borderRadius: 10, fontSize: 14, marginBottom: 16 }}>{error}</div>}

              <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', padding: '13px', borderRadius: 10, fontWeight: 600, fontSize: 15, cursor: loading ? 'default' : 'pointer' }}>
                {loading ? 'Creating account...' : 'Create account'}
              </button>

              <p style={{ textAlign: 'center', color: '#475569', fontSize: 14, margin: '18px 0 0' }}>
                Already have an account? <Link href="/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', color: '#0f172a', fontSize: 14, fontWeight: 600, margin: '0 0 6px' };
const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '11px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 15, marginBottom: 16, outline: 'none' };
