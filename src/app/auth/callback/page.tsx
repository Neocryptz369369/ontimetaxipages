'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

// Google / Apple send riders back here after they approve sign in.
// New riders (no phone or photo yet) go to /finish-profile; everyone else goes on to `next`.
function Callback() {
  const params = useSearchParams();
  const [msg, setMsg] = useState('Signing you in...');

  useEffect(() => {
    let active = true;
    const nextRaw = params?.get('next') || '/ride';
    const next = nextRaw.startsWith('/') && !nextRaw.startsWith('//') ? nextRaw : '/ride';

    async function run() {
      const providerErr = params?.get('error_description') || params?.get('error');
      if (providerErr) { setMsg('Sign in was cancelled or failed: ' + providerErr); return; }

      // PKCE flow returns ?code=...; implicit flow returns #access_token=... (handled by detectSessionInUrl).
      const code = params?.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error && !/already|used/i.test(error.message)) { setMsg('Could not finish signing in. Please try again.'); return; }
      }

      let session: any = null;
      for (let i = 0; i < 10 && !session; i++) {
        const { data } = await supabase.auth.getSession();
        session = data.session;
        if (!session) await new Promise(r => setTimeout(r, 300));
      }
      if (!active) return;
      if (!session) { setMsg('Could not finish signing in. Please try again.'); return; }

      const { data: row } = await supabase
        .from('profiles')
        .select('phone, photo_url')
        .eq('id', session.user.id)
        .maybeSingle();
      if (!active) return;

      const needsProfile = !row || !row.phone || !row.photo_url;
      window.location.replace(needsProfile ? '/finish-profile?next=' + encodeURIComponent(next) : next);
    }
    run();
    return () => { active = false; };
  }, [params]);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: 'linear-gradient(180deg,#f8fafc 0%,#eef2ff 100%)', fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,sans-serif', color: '#475569', padding: 16, textAlign: 'center' }}>
      <div>{msg}</div>
      {msg !== 'Signing you in...' && <a href="/login" style={{ color: '#2563eb', fontWeight: 600 }}>Back to sign in</a>}
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <Callback />
    </Suspense>
  );
}
