import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as nodeCrypto from 'node:crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const c: any = nodeCrypto;
const CONTACT = 'mailto:neocryptz@yahoo.com';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function fromB64u(v: string): any {
  const t = String(v || '').replace(/-/g, '+').replace(/_/g, '/');
  const over = t.length % 4;
  const pad = over === 0 ? '' : '===='.slice(over);
  return Buffer.from(t + pad, 'base64');
}

function toB64u(b: any): string {
  return b.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function hkdf(salt: any, ikm: any, info: any, len: number): any {
  const prk = c.createHmac('sha256', salt).update(ikm).digest();
  const one = Buffer.from([1]);
  const out = c.createHmac('sha256', prk).update(Buffer.concat([info, one])).digest();
  return out.subarray(0, len);
}

function sealPayload(plain: any, p256dh: string, authSecret: string): any {
  const clientPub = fromB64u(p256dh);
  const secret = fromB64u(authSecret);
  const ecdh = c.createECDH('prime256v1');
  ecdh.generateKeys();
  const serverPub = ecdh.getPublicKey();
  const shared = ecdh.computeSecret(clientPub);
  const zero = Buffer.from([0]);
  const info = Buffer.concat([Buffer.from('WebPush: info', 'utf8'), zero, clientPub, serverPub]);
  const ikm = hkdf(secret, shared, info, 32);
  const salt = c.randomBytes(16);
  const cekInfo = Buffer.concat([Buffer.from('Content-Encoding: aes128gcm', 'utf8'), zero]);
  const nonceInfo = Buffer.concat([Buffer.from('Content-Encoding: nonce', 'utf8'), zero]);
  const cek = hkdf(salt, ikm, cekInfo, 16);
  const nonce = hkdf(salt, ikm, nonceInfo, 12);
  const cipher = c.createCipheriv('aes-128-gcm', cek, nonce);
  const padded = Buffer.concat([plain, Buffer.from([2])]);
  const sealed = Buffer.concat([cipher.update(padded), cipher.final(), cipher.getAuthTag()]);
  const head = Buffer.alloc(21);
  salt.copy(head, 0);
  head.writeUInt32BE(4096, 16);
  head.writeUInt8(serverPub.length, 20);
  return Buffer.concat([head, serverPub, sealed]);
}

function vapidAuth(endpoint: string): string {
  const pub = String(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '');
  const d = String(process.env.VAPID_PRIVATE_KEY || '');
  if (!pub || !d) return '';
  const raw = fromB64u(pub);
  const x = toB64u(raw.subarray(1, 33));
  const y = toB64u(raw.subarray(33, 65));
  const priv = c.createPrivateKey({ key: { kty: 'EC', crv: 'P-256', d: d, x: x, y: y }, format: 'jwk' });
  const u = new URL(endpoint);
  const head = toB64u(Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'ES256' }), 'utf8'));
  const claims = toB64u(Buffer.from(JSON.stringify({ aud: u.protocol + '//' + u.host, exp: Math.floor(Date.now() / 1000) + 43200, sub: CONTACT }), 'utf8'));
  const unsigned = head + '.' + claims;
  const sig = c.sign('sha256', Buffer.from(unsigned, 'utf8'), { key: priv, dsaEncoding: 'ieee-p1363' });
  return 'vapid t=' + unsigned + '.' + toB64u(sig) + ', k=' + pub;
}

async function pushOne(sub: any, note: any): Promise<string> {
  const auth = vapidAuth(String(sub.endpoint));
  if (!auth) return 'nokeys';
  const body = sealPayload(Buffer.from(JSON.stringify(note), 'utf8'), String(sub.p256dh), String(sub.auth));
  const r: any = await fetch(String(sub.endpoint), {
    method: 'POST',
    headers: {
      Authorization: auth,
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      TTL: '900',
      Urgency: 'high',
    },
    body: body as any,
  });
  return String(r.status);
}

export async function POST(req: Request) {
  let b: any = {};
  try {
    b = await req.json();
  } catch (e) {
    b = {};
  }
  const pickup = String(b.pickup || '');
  const dropoff = String(b.dropoff || '');
  const fare = String(b.fare || '');
  const rider = String(b.rider || '');
  const isTest = b.test === true;
  let line = 'A new taxi order just came in.';
  if (pickup) {
    line = 'Pick up ' + (rider ? rider + ' at ' : '') + pickup;
    if (dropoff) line = line + ' going to ' + dropoff;
    if (fare) line = line + ' - ' + fare;
  }
  if (isTest) line = 'This is a test alert from On Time Taxi. Everything is working.';
  try {
    const sb: any = adminClient();
    const got: any = await sb.from('push_subs').select('id, endpoint, p256dh, auth, who');
    if (got.error) return NextResponse.json({ ok: false, error: String(got.error.message) }, { status: 500 });
    const rows: any[] = got.data || [];
    const results: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const one: any = rows[i];
      const note = {
        title: isTest ? 'On Time Taxi test alert' : 'New taxi order',
        body: line,
        url: one.who === 'driver' ? '/driver-rides' : '/admin',
      };
      try {
        results.push(await pushOne(one, note));
      } catch (e: any) {
        results.push('error');
      }
    }
    return NextResponse.json({ ok: true, phones: rows.length, results: results });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e && e.message ? e.message : e) }, { status: 500 });
  }
}
