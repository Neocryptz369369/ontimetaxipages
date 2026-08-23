import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

const GET_IN_FEE = 5;

function pad(n: number) {
  return n < 10 ? '0' + n : String(n);
}

function dayKey(ms: number) {
  const d = new Date(ms);
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function blank() {
  return { rides: 0, fares: 0, tips: 0, companyKeeps: 0, youMade: 0, unpaid: 0 };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function tidy(b: any) {
  return {
    rides: b.rides,
    fares: round2(b.fares),
    tips: round2(b.tips),
    companyKeeps: round2(b.companyKeeps),
    youMade: round2(b.youMade),
    unpaid: b.unpaid,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = String(body.token || '');
    if (!token) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });

    const sb = adminClient();
    const got = await sb.auth.getUser(token);
    if (got.error || !got.data || !got.data.user) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    }
    const user = got.data.user;

    let commissionPct = 20;
    try {
      const s = await sb.from('app_settings').select('commission_pct').limit(1).maybeSingle();
      if (s.data && s.data.commission_pct !== null && s.data.commission_pct !== undefined) {
        commissionPct = Number(s.data.commission_pct);
      }
    } catch (e) {}

    let name = '';
    let code = '';
    try {
      const d = await sb.from('drivers').select('full_name, driver_code').eq('id', user.id).maybeSingle();
      if (d.data) {
        name = d.data.full_name ? String(d.data.full_name) : '';
        code = d.data.driver_code ? String(d.data.driver_code) : '';
      }
    } catch (e) {}

    const q = await sb
      .from('rides')
      .select('id, pickup, dropoff, fare, tip, paid, status, created_at, completed_at')
      .eq('driver_id', user.id)
      .order('created_at', { ascending: false })
      .limit(2000);

    const list: any[] = q.data ? q.data : [];

    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const backToMonday = (now.getDay() + 6) % 7;
    const weekStart = dayStart - backToMonday * 86400000;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const thirtyBack = dayStart - 29 * 86400000;

    const today = blank();
    const week = blank();
    const month = blank();
    const all = blank();
    const byDay: any = {};
    const recent: any[] = [];

    list.forEach(function (r: any) {
      const st = String(r.status || '');
      if (st === 'cancelled' || st === 'canceled') return;

      const when = r.created_at ? new Date(r.created_at).getTime() : 0;
      const fare = Number(r.fare || 0);
      const tip = Number(r.tip || 0);
      const afterFee = fare - GET_IN_FEE > 0 ? fare - GET_IN_FEE : 0;
      const cut = afterFee * (commissionPct / 100);
      const mine = afterFee - cut + tip;
      const keeps = GET_IN_FEE + cut;

      const add = function (b: any) {
        b.rides = b.rides + 1;
        b.fares = b.fares + fare;
        b.tips = b.tips + tip;
        b.companyKeeps = b.companyKeeps + keeps;
        b.youMade = b.youMade + mine;
        if (!r.paid) b.unpaid = b.unpaid + 1;
      };

      add(all);
      if (when >= monthStart) add(month);
      if (when >= weekStart) add(week);
      if (when >= dayStart) add(today);

      if (when >= thirtyBack) {
        const k = dayKey(when);
        if (!byDay[k]) byDay[k] = blank();
        add(byDay[k]);
      }

      if (recent.length < 25) {
        recent.push({
          id: String(r.id),
          pickup: r.pickup ? String(r.pickup) : '',
          dropoff: r.dropoff ? String(r.dropoff) : '',
          when: r.created_at ? String(r.created_at) : '',
          fare: round2(fare),
          tip: round2(tip),
          youMade: round2(mine),
          paid: r.paid === true,
        });
      }
    });

    const days: any[] = [];
    Object.keys(byDay).forEach(function (k) {
      days.push(Object.assign({ day: k }, tidy(byDay[k])));
    });
    days.sort(function (a, b) {
      return a.day < b.day ? 1 : -1;
    });

    return NextResponse.json({
      ok: true,
      name: name,
      code: code,
      getInFee: GET_IN_FEE,
      commissionPct: commissionPct,
      today: tidy(today),
      week: tidy(week),
      month: tidy(month),
      all: tidy(all),
      days: days,
      recent: recent,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong loading your pay.' }, { status: 500 });
  }
}
