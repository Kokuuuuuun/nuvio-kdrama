import { detectQuality } from './quality.js';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function unpackPacker(data) {
  const match = data.match(/eval\(function\(p,a,c,k,e,d\)\{.*?\}\('([\s\S]*?)',(\d+),(\d+),'([\s\S]*?)'\.split\('\|'\)\)\)/);
  if (!match) return null;

  let [, p, a, c, k] = match;
  a = parseInt(a); c = parseInt(c); k = k.split('|');

  while (c--) {
    if (k[c]) p = p.replace(new RegExp('\\b' + c.toString(a) + '\\b', 'g'), k[c]);
  }
  return p;
}

export async function resolveFastream(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Referer': 'https://www3.seriesmetro.net/' }
    });
    const data = await res.text();

    const unpacked = unpackPacker(data);
    if (!unpacked) return null;

    const m3u8 = unpacked.match(/file:"(https?:\/\/[^"]+\.m3u8[^"]*)"/)?.[1];
    if (!m3u8) return null;

    const quality = await detectQuality(m3u8, { 'Referer': 'https://fastream.to/' });
    return {
      url: m3u8,
      quality,
      headers: { 'User-Agent': UA, 'Referer': 'https://fastream.to/' }
    };
  } catch (e) {
    console.error('[Fastream] Error:', e.message);
    return null;
  }
}