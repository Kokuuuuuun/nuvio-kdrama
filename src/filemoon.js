// resolvers/filemoon.js
// ⚠️  Filemoon usa AES-256-GCM. crypto-js no soporta GCM nativamente.
// Esta implementación usa una emulación de AES-CTR (núcleo de GCM sin verificar el auth tag).
// Funciona en la práctica para obtener la URL, pero no valida la integridad del mensaje.
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { normalizeResolution } from './quality.js';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

// Decode base64url a WordArray de CryptoJS
function b64urlToWordArray(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (s.length % 4)) % 4;
  return CryptoJS.enc.Base64.parse(s + '='.repeat(pad));
}

// WordArray a Uint8Array
function wordArrayToBytes(wa) {
  const words = wa.words;
  const sigBytes = wa.sigBytes;
  const bytes = new Uint8Array(sigBytes);
  for (let i = 0; i < sigBytes; i++) {
    bytes[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  return bytes;
}

// Uint8Array a WordArray
function bytesToWordArray(bytes) {
  const words = [];
  for (let i = 0; i < bytes.length; i += 4) {
    words.push(
      ((bytes[i] || 0) << 24) |
      ((bytes[i+1] || 0) << 16) |
      ((bytes[i+2] || 0) << 8) |
      (bytes[i+3] || 0)
    );
  }
  return CryptoJS.lib.WordArray.create(words, bytes.length);
}

// Incrementa el contador GCM (big-endian, últimos 4 bytes)
function incCounter(block) {
  const b = new Uint8Array(block);
  for (let i = 15; i >= 12; i--) {
    b[i]++;
    if (b[i] !== 0) break;
  }
  return b;
}

// AES-256-GCM decrypt (sin verificar auth tag)
function aesGcmDecrypt(key32bytes, iv12bytes, ciphertextBytes) {
  try {
    // J0 = IV || 0x00000001
    const j0 = new Uint8Array(16);
    j0.set(iv12bytes, 0);
    j0[15] = 1;

    // El primer bloque de keystream (para auth tag) lo saltamos
    // El cifrado empieza con counter = J0 + 1
    let counter = incCounter(j0); // J0+1 = IV||0x00000002

    const keyWA = bytesToWordArray(key32bytes);
    const result = new Uint8Array(ciphertextBytes.length);

    for (let offset = 0; offset < ciphertextBytes.length; offset += 16) {
      const blockSize = Math.min(16, ciphertextBytes.length - offset);

      // Encriptar el contador con AES-ECB
      const counterWA = bytesToWordArray(counter);
      const encrypted = CryptoJS.AES.encrypt(
        counterWA,
        keyWA,
        { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding }
      );
      const keystreamBytes = wordArrayToBytes(encrypted.ciphertext);

      // XOR con ciphertext
      for (let i = 0; i < blockSize; i++) {
        result[offset + i] = ciphertextBytes[offset + i] ^ keystreamBytes[i];
      }

      counter = incCounter(counter);
    }

    return result;
  } catch (e) {
    console.log('[Filemoon] AES-GCM error:', e.message);
    return null;
  }
}

export async function resolve(embedUrl) {
  console.log(`[Filemoon] Resolviendo: ${embedUrl}`);

  try {
    const match = embedUrl.match(/\/(?:e|d)\/([a-z0-9]{12})/i);
    if (!match) return null;

    const id = match[1];

    const { data: playbackJson } = await axios.get(
      `https://filemooon.link/api/videos/${id}/embed/playback`,
      { timeout: 7000, headers: { 'User-Agent': UA, 'Referer': embedUrl } }
    );

    if (playbackJson.error) {
      console.log(`[Filemoon] API error: ${playbackJson.error}`);
      return null;
    }

    const pb = playbackJson.playback;
    if (pb?.algorithm !== 'AES-256-GCM' || pb.key_parts?.length !== 2) {
      console.log('[Filemoon] Formato de cifrado no soportado');
      return null;
    }

    // Preparar key (32 bytes)
    const k1 = wordArrayToBytes(b64urlToWordArray(pb.key_parts[0]));
    const k2 = wordArrayToBytes(b64urlToWordArray(pb.key_parts[1]));
    const rawKey = new Uint8Array(k1.length + k2.length);
    rawKey.set(k1, 0);
    rawKey.set(k2, k1.length);

    let key32;
    if (rawKey.length === 32) {
      key32 = rawKey;
    } else {
      // SHA-256 si no son exactamente 32 bytes
      const keyWA = bytesToWordArray(rawKey);
      key32 = wordArrayToBytes(CryptoJS.SHA256(keyWA));
    }

    const ivBytes = wordArrayToBytes(b64urlToWordArray(pb.iv));
    const payloadBytes = wordArrayToBytes(b64urlToWordArray(pb.payload));

    if (payloadBytes.length < 16) return null;

    // Últimos 16 bytes = auth tag (lo ignoramos), el resto = ciphertext
    const ciphertext = payloadBytes.slice(0, -16);

    const decrypted = aesGcmDecrypt(key32, ivBytes, ciphertext);
    if (!decrypted) return null;

    // Convertir Uint8Array a string
    let decStr = '';
    for (let i = 0; i < decrypted.length; i++) {
      decStr += String.fromCharCode(decrypted[i]);
    }

    const inner = JSON.parse(decStr);
    const m3u8Url = inner.sources?.[0]?.url;
    if (!m3u8Url) return null;

    console.log(`[Filemoon] URL encontrada: ${m3u8Url.substring(0, 80)}...`);

   // Obtener mejor calidad del master
    let finalUrl = m3u8Url;
    let quality = '1080p';

    if (m3u8Url.includes('master')) {
      try {
        const masterResp = await axios.get(m3u8Url, {
          timeout: 3000,
          headers: { 'User-Agent': UA, 'Referer': embedUrl },
          responseType: 'text'
        });
        const lines = masterResp.data.split('\n');
        let bestHeight = 0;
        let bestWidth = 0;
        let bestUrl = m3u8Url;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith('#EXT-X-STREAM-INF')) {
            const mRes = line.match(/RESOLUTION=(\d+)x(\d+)/);
            const w = mRes ? parseInt(mRes[1]) : 0;
            const h = mRes ? parseInt(mRes[2]) : 0;
            for (let j = i + 1; j < i + 3 && j < lines.length; j++) {
              const urlLine = lines[j].trim();
              if (urlLine && !urlLine.startsWith('#') && h > bestHeight) {
                bestHeight = h;
                bestWidth = w;
                bestUrl = urlLine.startsWith('http') ? urlLine : new URL(urlLine, m3u8Url).toString();
                break;
              }
            }
          }
        }

        if (bestHeight > 0) {
          finalUrl = bestUrl;
          quality = normalizeResolution(bestWidth, bestHeight);
          console.log(`[Filemoon] Mejor calidad: ${quality}`);
        }
      } catch (e) {
        console.log(`[Filemoon] No se pudo parsear master: ${e.message}`);
      }
    }

    return {
      url: finalUrl,
      quality,
      headers: {
        'User-Agent': UA,
        'Referer': embedUrl,
        'Origin': 'https://filemoon.sx'
      }
    };
  } catch (error) {
    console.log(`[Filemoon] Error: ${error.message}`);
    return null;
  }
}
