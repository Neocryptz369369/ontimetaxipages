import { freeDrivers, nearestFreeMiles } from './dispatch';

export const MAX_PICKUP_MILES = 25;
export const HANDOFF_WAIT_MINUTES = 8;
export const PULL_OFF_OVER_BY = 15;

const WIDE =
  'id, status, fare, tip, paid, created_at, rider_id, rider_lat, rider_lng, pickup_lat, pickup_lng, no_pay_driver_ids, removed_driver_id, removed_driver_name, removed_reason, removed_at, handoff_needed, refunded, refunded_at, refund_reason, stripe_payment_intent';
const PLAIN =
  'id, status, fare, tip, paid, created_at, rider_id, rider_lat, rider_lng, pickup_lat, pickup_lng, no_pay_driver_ids, removed_driver_id, removed_driver_name, removed_reason, removed_at, handoff_needed';

// A refund is ONLY ever sent when a driver was pulled off a live run for going
// 15 mph or more over the posted speed limit. Nothing else on the site can
// start an automatic refund.
export function wasSpeedingPullOff(ride: any) {
  if (!ride) return false;
  if (ride.handoff_needed !== true) return false;
  if (!ride.removed_driver_id) return false;
  if (!ride.removed_at) return false;
  const why = ride.removed_reason ? String(ride.removed_reason) : '';
  const hit = why.match(/(\d+) mph over/);
  if (!hit) return false;
  const overBy = Number(hit[1]);
  if (!isFinite(overBy) || overBy < PULL_OFF_OVER_BY) return false;
  return true;
}

async function askStripeForRefund(paymentIntent: string) {
  const secret = process.env.STRIPE_SECRET_KEY ? String(process.env.STRIPE_SECRET_KEY) : '';
  if (!secret || !paymentIntent) return false;
  try {
    const form = new URLSearchParams();
    form.append('payment_intent', paymentIntent);
    form.append('reason', 'requested_by_customer');
    const resp = await fetch('https://api.stripe.com/v1/refunds', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + secret,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });
    return resp.ok;
  } catch (e) {
    return false;
  }
}

export async function refundRide(sb: any, ride: any, why: string) {
  if (!wasSpeedingPullOff(ride)) return false;
  let moneyBack = false;
  const pi = ride && ride.stripe_payment_intent ? String(ride.stripe_payment_intent) : '';
  const wasPaid = ride && ride.paid === true;
  const already = ride && ride.refunded === true;
  if (wasPaid && !already && pi) {
    moneyBack = await askStripeForRefund(pi);
  }
  const full: any = {
    status: 'canceled',
    handoff_needed: false,
    refunded: moneyBack,
    refunded_at: new Date().toISOString(),
    refund_reason: why,
  };
  let done = false;
  try {
    const up = await sb.from('rides').update(full).eq('id', ride.id).eq('status', 'requested');
    if (!up.error) done = true;
  } catch (e) {}
  if (!done) {
    try {
      await sb.from('rides').update({ status: 'canceled' }).eq('id', ride.id).eq('status', 'requested');
    } catch (e) {}
  }
  return moneyBack;
}

export async function runHandoffChecks(sb: any) {
  const out: any[] = [];
  try {
    let q: any = await sb.from('rides').select(WIDE).eq('handoff_needed', true).eq('status', 'requested').limit(25);
    if (q.error) {
      q = await sb.from('rides').select(PLAIN).eq('handoff_needed', true).eq('status', 'requested').limit(25);
    }
    if (q.error) return out;
    const rows: any[] = q.data ? q.data : [];
    if (rows.length === 0) return out;
    const list = await freeDrivers(sb);
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!wasSpeedingPullOff(r)) continue;
      const near = nearestFreeMiles(r, list);
      const nobody = near < 0 || near > MAX_PICKUP_MILES;
      const startedAt = r.removed_at ? new Date(r.removed_at).getTime() : 0;
      const waitedMins = startedAt > 0 ? (Date.now() - startedAt) / 60000 : 0;
      const tooLong = waitedMins >= HANDOFF_WAIT_MINUTES;
      if (!nobody && !tooLong) continue;
      const why = nobody
        ? 'No other driver was close enough to take over this run'
        : 'No other driver picked the run up in time';
      const moneyBack = await refundRide(sb, r, why);
      out.push({ id: String(r.id), refunded: moneyBack, why: why });
    }
  } catch (e) {}
  return out;
}
