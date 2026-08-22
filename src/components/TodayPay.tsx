'use client';

import { useCallback, useEffect, useState } from 'react';

type Props = {
  token: string;
};

function money(n: any) {
  const v = Number(n || 0);
  return '$' + v.toFixed(2);
}

export default function TodayPay(props: Props) {
  const [pay, setPay] = useState<any>(null);

  const load = useCallback(async () => {
    if (!props.token) return;
    try {
      const res = await fetch('/api/driver-me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: props.token }),
      });
      const data = await res.json();
      if (res.ok && data && data.earnings) setPay(data.earnings);
    } catch (e) {}
  }, [props.token]);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  if (!pay) return null;

  const pct = pay.commissionPct == null ? 20 : Number(pay.commissionPct);

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        boxShadow: '0 6px 18px rgba(15,23,42,0.06)',
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', letterSpacing: '0.12em' }}>
        WHAT YOU MADE TODAY
      </div>
      <div style={{ fontSize: 34, fontWeight: 800, color: '#0f172a', marginTop: 6 }}>{money(pay.youMade)}</div>
      <div style={{ color: '#64748b', marginTop: 6 }}>{pay.rides} rides today</div>
      <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 12, paddingTop: 12, color: '#475569', lineHeight: 1.7 }}>
        <div>Fares you drove: {money(pay.fares)}</div>
        <div>Tips: {money(pay.tips)}</div>
        <div>Company keeps: {money(pay.companyKeeps)}</div>
        <div style={{ color: '#94a3b8', marginTop: 6 }}>
          That is the {money(pay.getInFee)} get in fee on every ride, plus {pct} percent of what is left. Tips are all yours.
        </div>
        {pay.unpaid > 0 ? (
          <div style={{ color: '#b45309', marginTop: 6 }}>
            {pay.unpaid} of those were not paid by card, so they were cash runs you collected yourself.
          </div>
        ) : null}
      </div>
    </div>
  );
}
