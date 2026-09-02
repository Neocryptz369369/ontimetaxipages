'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function RideLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  // The Stripe return page must stay reachable without a fresh session check blocking it.
  const isSuccess = pathname?.startsWith('/ride/success');

  useEffect(() => {
    if (isSuccess) { setAllowed(true); setChecked(true); return; }
  let active = true;
    async function check(retriesLeft: number) {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (data.session) { setAllowed(true); setChecked(true); return; }
      if (retriesLeft > 0) { setTimeout(() => { if (active) check(retriesLeft - 1); }, 400); return; }
      router.replace('/login?next=/ride');
    }
    check(3);
    return () => { active = false; };
  }, [isSuccess, pathname, router]);

  if (isSuccess) return <>{children}</>;

  if (!checked) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,#f8fafc 0%,#eef2ff 100%)', fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,sans-serif', color: '#475569' }}>
        Checking your account...
      </main>
    );
  }

  if (!allowed) return null;

  return <>{children}</>;
}
