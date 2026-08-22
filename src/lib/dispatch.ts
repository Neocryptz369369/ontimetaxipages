export const OFFER_SECONDS = 30;

export function milesBetween(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 3958.8;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const la1 = (aLat * Math.PI) / 180;
  const la2 = (bLat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export type FreeDriver = { id: string; lat: number | null; lng: number | null; fresh: boolean };

export async function freeDrivers(sb: any): Promise<FreeDriver[]> {
  const out: FreeDriver[] = [];
  try {
    const dr = await sb
      .from('drivers')
      .select('id, status, last_lat, last_lng, last_seen_at')
      .eq('status', 'approved')
      .limit(500);
    const rows: any[] = (dr && dr.data) || [];
    if (rows.length === 0) return out;
    const busy: any = {};
    try {
      const br = await sb
        .from('rides')
        .select('driver_id')
        .in('status', ['accepted', 'picked_up'])
        .limit(500);
      const blist: any[] = (br && br.data) || [];
      blist.forEach(function (b: any) {
        if (b && b.driver_id) busy[String(b.driver_id)] = true;
      });
    } catch (e) {}
    const now = Date.now();
    rows.forEach(function (d: any) {
      const id = String(d.id);
      if (busy[id]) return;
      const rawLat = d.last_lat === null || d.last_lat === undefined ? null : Number(d.last_lat);
      const rawLng = d.last_lng === null || d.last_lng === undefined ? null : Number(d.last_lng);
      const seen = d.last_seen_at ? new Date(d.last_seen_at).getTime() : 0;
      out.push({
        id: id,
        lat: rawLat !== null && isFinite(rawLat) ? rawLat : null,
        lng: rawLng !== null && isFinite(rawLng) ? rawLng : null,
        fresh: seen > 0 && now - seen < 10 * 60 * 1000,
      });
    });
  } catch (e) {}
  return out;
}

export function orderForRide(ride: any, list: FreeDriver[]): string[] {
  const pickLat = ride && ride.pickup_lat !== null && ride.pickup_lat !== undefined ? Number(ride.pickup_lat) : null;
  const pickLng = ride && ride.pickup_lng !== null && ride.pickup_lng !== undefined ? Number(ride.pickup_lng) : null;
  let rl = ride && ride.rider_lat !== null && ride.rider_lat !== undefined ? Number(ride.rider_lat) : null;
  let rg = ride && ride.rider_lng !== null && ride.rider_lng !== undefined ? Number(ride.rider_lng) : null;
  if (rl === null || rg === null || !isFinite(rl as number) || !isFinite(rg as number)) {
    rl = pickLat;
    rg = pickLng;
  }
  const scored = list.map(function (d) {
    let mi = 99999;
    if (rl !== null && rg !== null && isFinite(rl) && isFinite(rg) && d.lat !== null && d.lng !== null && d.fresh) {
      mi = milesBetween(rl, rg, d.lat, d.lng);
    }
    return { id: d.id, miles: mi };
  });
  scored.sort(function (a, b) {
    if (a.miles !== b.miles) return a.miles - b.miles;
    return a.id < b.id ? -1 : 1;
  });
  return scored.map(function (x) {
    return x.id;
  });
}

export function allowedCount(ride: any): number {
  const made = ride && ride.created_at ? new Date(ride.created_at).getTime() : 0;
  if (!made) return 99999;
  const secs = Math.max(0, Math.floor((Date.now() - made) / 1000));
  return 1 + Math.floor(secs / OFFER_SECONDS);
}

export function turnInfo(ride: any, list: FreeDriver[], driverId: string) {
  if (!list || list.length === 0) {
    return { rank: 0, allowed: 1, mine: true, waitSecs: 0, queue: 0 };
  }
  const order = orderForRide(ride, list);
  let rank = order.indexOf(driverId);
  if (rank < 0) rank = order.length;
  const allowed = allowedCount(ride);
  const mine = rank < allowed;
  let waitSecs = 0;
  if (!mine) {
    const made = ride && ride.created_at ? new Date(ride.created_at).getTime() : Date.now();
    waitSecs = Math.max(1, Math.round((made + rank * OFFER_SECONDS * 1000 - Date.now()) / 1000));
  }
  return { rank: rank, allowed: allowed, mine: mine, waitSecs: waitSecs, queue: order.length };
}
