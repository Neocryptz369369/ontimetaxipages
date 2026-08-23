// Nobody books another ride, and no driver takes another run,
// until they have put stars on the last one they finished.
// This is the check the server does so it cannot be skipped.

export type Owed = {
  rideId: string;
  otherName: string;
  pickup: string;
  dropoff: string;
} | null;

export async function owedRating(sb: any, userId: string, role: string): Promise<Owed> {
  try {
    const who = role === 'driver' ? 'driver' : 'rider';
    const col = who === 'driver' ? 'driver_id' : 'rider_id';

    const list = await sb
      .from('rides')
      .select('id, rider_id, rider_name, driver_id, driver_name, pickup, dropoff, status, completed_at, created_at')
      .eq(col, userId)
      .order('created_at', { ascending: false })
      .limit(40);

    if (list.error) return null;

    const rows: any[] = list.data ? list.data : [];
    const done: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (String(r.status) === 'cancelled') continue;
      if (!r.completed_at && String(r.status) !== 'completed') continue;
      const other = who === 'driver' ? r.rider_id : r.driver_id;
      if (!other) continue;
      done.push(r);
    }

    if (done.length === 0) return null;

    const ids: string[] = [];
    for (let i = 0; i < done.length; i++) ids.push(String(done[i].id));

    const rated = await sb
      .from('ride_ratings')
      .select('ride_id')
      .eq('rater_type', who)
      .eq('rater_id', userId)
      .in('ride_id', ids);

    if (rated.error) return null;

    const seen: { [key: string]: boolean } = {};
    const marks: any[] = rated.data ? rated.data : [];
    for (let i = 0; i < marks.length; i++) seen[String(marks[i].ride_id)] = true;

    for (let i = 0; i < done.length; i++) {
      const r = done[i];
      if (seen[String(r.id)]) continue;
      return {
        rideId: String(r.id),
        otherName:
          who === 'driver'
            ? String(r.rider_name || 'your rider')
            : String(r.driver_name || 'your driver'),
        pickup: String(r.pickup || ''),
        dropoff: String(r.dropoff || ''),
      };
    }

    return null;
  } catch (e) {
    return null;
  }
}

export function riderMustRateMessage(owed: Owed) {
  if (!owed) return '';
  return 'Please rate your last ride first. The stars are at the top of your ride page.';
}

export function driverMustRateMessage(owed: Owed) {
  if (!owed) return '';
  return 'Please rate your last run first. The stars are at the top of your driver page.';
}
