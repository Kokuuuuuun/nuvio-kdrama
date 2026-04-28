// resolvers/voe.js
import axios from 'axios';
import { detectQuality } from './quality.js';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

// Decodificador base64 compatible con Hermes
function b64decode(str) {
  try {
    // React Native tiene atob global
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.log('[VOE] b64decode error:', e.message);
    return null;
  }
}

function b64toString(str) {
  try {
    if (typeof atob !== 'undefined') return atob(str);
    return Buffer.from(str, 'base64').toString('utf8');
  } catch (e) { return null; }
}

function voeDecode(ct, luts) {
  try {
    const rawLuts = luts.replace(/^\[|\]$/g, '').split("','").map(s => s.replace(/^'+|'+$/g, ''));
    const escapedLuts = rawLuts.map(i => i.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    let txt = '';
    for (let ch of ct) {
      let x = ch.charCodeAt(0);
      if (x > 64 && x < 91) x = (x - 52) % 26 + 65;
      else if (x > 96 && x < 123) x = (x - 84) % 26 + 97;
      txt += String.fromCharCode(x);
    }

    for (const pat of escapedLuts) txt = txt.replace(new RegExp(pat, 'g'), '_');
    txt = txt.split('_').join('');

    const decoded1 = b64toString(txt);
    if (!decoded1) return null;

    let step4 = '';
    for (let i = 0; i < decoded1.length; i++) {
      step4 += String.fromCharCode((decoded1.charCodeAt(i) - 3 + 256) % 256);
    }

    const revBase64 = step4.split('').reverse().join('');
    const finalStr = b64toString(revBase64);
    if (!finalStr) return null;

    return JSON.parse(finalStr);
  } catch (e) {
    console.log('[VOE] voeDecode error:', e.message);
    return null;
  }
}

async function fetchUrl(url, headers = {}) {
  return axios.get(url, {
    timeout: 15000,
    maxRedirects: 5,
    headers: {
      'User-Agent': UA,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      ...headers
    },
    validateStatus: s => s < 500
  });
}

export async function resolve(embedUrl) {
  try {
    console.log(`[VOE] Resolviendo: ${embedUrl}`);

    let pageResp = await fetchUrl(embedUrl, { Referer: embedUrl });
    let data = String((pageResp && pageResp.data) ? pageResp.data : '');

    // permanentToken redirect
    if (/permanentToken/i.test(data)) {
      const m = data.match(/window\.location\.href\s*=\s*'([^']+)'/i);
      if (m) {
        console.log(`[VOE] Permanent token redirect -> ${m[1]}`);
        const r2 = await fetchUrl(m[1], { Referer: embedUrl });
        if (r2 && r2.data) {
          data = String(r2.data);
        }
      }
    }

    // Patrón principal: json con array codificado + loader JS
    const rMain = data.match(
      /json">\s*\[\s*['"]([^'"]+)['"]\s*\]\s*<\/script>\s*<script[^>]*src=['"]([^'"]+)['"]/i
    );

    if (rMain) {
      const encodedArray = rMain[1];
      const loaderUrl = rMain[2].startsWith('http') ? rMain[2] : new URL(rMain[2], embedUrl).href;
      console.log(`[VOE] Found encoded array + loader: ${loaderUrl}`);

      const jsResp = await fetchUrl(loaderUrl, { Referer: embedUrl });
      const jsData = jsResp && jsResp.data ? String(jsResp.data) : '';

      const replMatch = jsData.match(/(\[(?:'[^']{1,10}'[\s,]*){4,12}\])/i)
               || jsData.match(/(\[(?:"[^"]{1,10}"[,\s]*){4,12}\])/i);
      if (replMatch) {
        const decoded = voeDecode(encodedArray, replMatch[1]);
        if (decoded && (decoded.source || decoded.direct_access_url)) {
          const url = decoded.source || decoded.direct_access_url;
          const quality = await detectQuality(url, { Referer: embedUrl });
          console.log(`[VOE] URL encontrada: ${url.substring(0, 80)}...`);
          return { url, quality, headers: { Referer: embedUrl } };
        }
      }
    }

    // Fallback: fuentes directas mp4/hls
    const re1 = /(?:mp4|hls)'\s*:\s*'([^']+)'/gi;
    const re2 = /(?:mp4|hls)"\s*:\s*"([^"]+)"/gi;
    const matches = [];
    let m;
    while ((m = re1.exec(data)) !== null) matches.push(m);
    while ((m = re2.exec(data)) !== null) matches.push(m);

    for (const match of matches) {
      const candidate = match[1];
      if (!candidate) continue;
      let url = candidate;
      if (url.startsWith('aHR0')) {
        try { url = atob(url); } catch(e) {}
      }
      console.log(`[VOE] URL encontrada (fallback): ${url.substring(0, 80)}...`);
      return { url, quality: await detectQuality(url, { Referer: embedUrl }), headers: { Referer: embedUrl } };
    }

    console.log('[VOE] No se encontró URL');
    return null;
  } catch (err) {
    console.log(`[VOE] Error: ${err.message}`);
    return null;
  }
}
