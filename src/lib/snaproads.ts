// Turns the raw GPS dots we save while a driver drives into a line that
// sits on the real streets instead of cutting straight across the map.

const MATCH_MAX = 90;
const DIR_MAX = 24;
const JUMP_METRES = 3000;
const MAX_GROUPS = 24;

const cache: Record<string, number[][]> = {};

function metres(a: number[], b: number[]) {
  const R = 6371000;
  const dLat = ((b[1] - a[1]) * Math.PI) / 180;
  const dLng = ((b[0] - a[0]) * Math.PI) / 180;
  const la1 = (a[1] * Math.PI) / 180;
  const la2 = (b[1] * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const h = s1 * s1 + Math.cos(la1) * Math.cos(la2) * s2 * s2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function tidy(points: any[]): number[][] {
  const out: number[][] = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (!p || p.length < 2) continue;
    const lng = Number(p[0]);
    const lat = Number(p[1]);
    if (!isFinite(lng) || !isFinite(lat)) continue;
    if (lng === 0 && lat === 0) continue;
    if (lat > 90 || lat < -90 || lng > 180 || lng < -180) continue;
    const last = out.length ? out[out.length - 1] : null;
    if (last && metres(last, [lng, lat]) < 8) continue;
    out.push([lng, lat]);
  }
  return out;
}

function groupsOf(pts: number[][]): number[][][] {
  const groups: number[][][] = [];
  let cur: number[][] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const gap = metres(pts[i - 1], pts[i]);
    if (gap > JUMP_METRES) {
      if (cur.length > 1) groups.push(cur);
      groups.push([pts[i - 1], pts[i]]);
      cur = [pts[i]];
    } else if (cur.length >= MATCH_MAX) {
      groups.push(cur);
      cur = [pts[i - 1], pts[i]];
    } else {
      cur.push(pts[i]);
    }
  }
  if (cur.length > 1) groups.push(cur);
  return groups;
}

function joined(pts: number[][]) {
  return pts.map(function (p) { return p[0].toFixed(6) + ',' + p[1].toFixed(6); }).join(';');
}

async function onRoads(group: number[][], token: string) {
  try {
    const rad = group.map(function () { return '30'; }).join(';');
    const url =
      'https://api.mapbox.com/matching/v5/mapbox/driving/' + joined(group) +
      '?geometries=geojson&overview=full&tidy=true&radiuses=' + rad +
      '&access_token=' + token;
    const j = await fetch(url).then(function (r) { return r.json(); });
    if (j && j.code === 'Ok' && j.matchings && j.matchings.length) {
      let out: number[][] = [];
      j.matchings.forEach(function (mm: any) {
        if (mm && mm.geometry && mm.geometry.coordinates) out = out.concat(mm.geometry.coordinates);
      });
      if (out.length > 1) return out;
    }
  } catch (e) {}
  return null;
}

async function throughStreets(group: number[][], token: string) {
  try {
    let pick = group;
    if (pick.length > DIR_MAX) {
      const step = (pick.length - 1) / (DIR_MAX - 1);
      const cut: number[][] = [];
      for (let i = 0; i < DIR_MAX; i++) cut.push(pick[Math.min(pick.length - 1, Math.round(i * step))]);
      pick = cut;
    }
    const url =
      'https://api.mapbox.com/directions/v5/mapbox/driving/' + joined(pick) +
      '?geometries=geojson&overview=full&access_token=' + token;
    const j = await fetch(url).then(function (r) { return r.json(); });
    if (j && j.routes && j.routes[0] && j.routes[0].geometry && j.routes[0].geometry.coordinates) {
      const out = j.routes[0].geometry.coordinates;
      if (out.length > 1) return out;
    }
  } catch (e) {}
  return null;
}

export async function snapToRoads(points: any[], token: string): Promise<number[][]> {
  const pts = tidy(points || []);
  if (pts.length < 2) return pts;
  if (!token) return pts;
  const key = pts.length + '|' + joined([pts[0], pts[Math.floor(pts.length / 2)], pts[pts.length - 1]]);
  if (cache[key]) return cache[key];
  const groups = groupsOf(pts);
  const out: number[][] = [];
  for (let i = 0; i < groups.length; i++) {
    let piece: number[][] | null = null;
    if (i < MAX_GROUPS) {
      piece = await onRoads(groups[i], token);
      if (!piece) piece = await throughStreets(groups[i], token);
    }
    if (!piece) piece = groups[i];
    for (let k = 0; k < piece.length; k++) {
      const last = out.length ? out[out.length - 1] : null;
      if (last && metres(last, piece[k]) < 3) continue;
      out.push(piece[k]);
    }
  }
  const done = out.length > 1 ? out : pts;
  cache[key] = done;
  return done;
}
