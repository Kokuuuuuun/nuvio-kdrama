const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

export function normalizeResolution(width, height) {
  if (width >= 3840 || height >= 2160) return '4K';
  if (width >= 1920 || height >= 1080) return '1080p';
  if (width >= 1280 || height >= 720)  return '720p';
  if (width >= 854  || height >= 480)  return '480p';
  return '360p';
}

export async function detectQuality(m3u8Url, headers = {}) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(m3u8Url, {
      headers: { 'User-Agent': UA, ...headers },
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timer);

    const data = await res.text();

    if (!data.includes('#EXT-X-STREAM-INF')) {
      // No es master — intentar sacar resolución de la URL
      const match = m3u8Url.match(/[_-](\d{3,4})p/);
      return match ? `${match[1]}p` : '1080p';
    }

    let bestWidth = 0;
    let bestHeight = 0;
    const lines = data.split('\n');
    for (const line of lines) {
      const m = line.match(/RESOLUTION=(\d+)x(\d+)/);
      if (m) {
        const w = parseInt(m[1]);
        const h = parseInt(m[2]);
        if (h > bestHeight) {
          bestHeight = h;
          bestWidth = w;
        }
      }
    }

    return bestHeight > 0 ? normalizeResolution(bestWidth, bestHeight) : '1080p';
  } catch (e) {
    return '1080p';
  }
}