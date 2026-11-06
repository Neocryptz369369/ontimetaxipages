'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// "Continue with Google" / "Continue with Apple" buttons.
// Both providers must be turned on in Supabase > Authentication > Providers,
// and https://<your site>/auth/callback must be listed under
// Supabase > Authentication > URL Configuration > Redirect URLs.
export default function SocialLogin({ next = '/ride' }: { next?: string }) {
  const [busy, setBusy] = useState<'google' | 'apple' | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Only show a button once that provider is switched on in Supabase,
  // so riders never see a button that leads to an error page.
  const [enabled, setEnabled] = useState<{ google: boolean; apple: boolean }>({ google: false, apple: false });

  useEffect(() => {
    let active = true;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;
    fetch(url + '/auth/v1/settings', { headers: { apikey: key } })
      .then(r => r.json())
      .then(j => { if (active) setEnabled({ google: !!j?.external?.google, apple: !!j?.external?.apple }); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  if (!enabled.google && !enabled.apple) return null;

  async function go(provider: 'google' | 'apple') {
    setError(null);
    setBusy(provider);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        ...(provider === 'google' ? { queryParams: { prompt: 'select_account' } } : {}),
      },
    });
    if (err) {
      setError(err.message || 'Could not start sign in. Please try again.');
      setBusy(null);
    }
    // On success the browser leaves this page, so there is nothing else to do here.
  }

  return (
    <div style={{ marginBottom: 6 }}>
      {enabled.apple && (
        <button type="button" onClick={() => go('apple')} disabled={busy !== null} style={{ ...btn, background: '#000', color: '#fff', border: '1px solid #000' }}>
          {busy === 'apple' ? 'Opening Apple...' : 'Continue with Apple'}
        </button>
      )}
      {enabled.google && (
        <button type="button" onClick={() => go('google')} disabled={busy !== null} style={{ ...btn, background: '#fff', color: '#1f2937', border: '1px solid #cbd5e1' }}>
          {busy === 'google' ? 'Opening Google...' : 'Continue with Google'}
        </button>
      )}

      {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 12px', borderRadius: 10, fontSize: 14, margin: '4px 0 12px' }}>{error}</div>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0 18px', color: '#94a3b8', fontSize: 13 }}>
        <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
        or use your email
        <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  width: '100%',
  padding: '13px',
  borderRadius: 10,
  fontWeight: 600,
  fontSize: 15,
  cursor: 'pointer',
  marginBottom: 10,
  fontFamily: 'inherit',
};
