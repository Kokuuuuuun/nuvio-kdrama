/**
 * doramasflixco - Built from src/doramasflixco/
 * Generated: 2026-05-05T21:57:01.120Z
 */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/doramasflixco/extractor.js
var import_cheerio_without_node_native = __toESM(require("cheerio-without-node-native"));

// src/doramasflixco/resolvers.js
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
function b64toString(str) {
  try {
    if (typeof atob !== "undefined")
      return atob(str);
    return null;
  } catch (e) {
    return null;
  }
}
function voeDecode(ct, luts) {
  try {
    const rawLuts = luts.replace(/^\[|\]$/g, "").split("','").map((s) => s.replace(/^'+|'+$/g, ""));
    const escapedLuts = rawLuts.map((i) => i.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    let txt = "";
    for (let ch of ct) {
      let x = ch.charCodeAt(0);
      if (x > 64 && x < 91)
        x = (x - 52) % 26 + 65;
      else if (x > 96 && x < 123)
        x = (x - 84) % 26 + 97;
      txt += String.fromCharCode(x);
    }
    for (const pat of escapedLuts)
      txt = txt.replace(new RegExp(pat, "g"), "_");
    txt = txt.split("_").join("");
    const decoded1 = b64toString(txt);
    if (!decoded1)
      return null;
    let step4 = "";
    for (let i = 0; i < decoded1.length; i++) {
      step4 += String.fromCharCode((decoded1.charCodeAt(i) - 3 + 256) % 256);
    }
    const revBase64 = step4.split("").reverse().join("");
    const finalStr = b64toString(revBase64);
    if (!finalStr)
      return null;
    return JSON.parse(finalStr);
  } catch (e) {
    console.log("[VOE] voeDecode error:", e.message);
    return null;
  }
}
function resolveVoe(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log(`[VOE] Resolviendo: ${embedUrl}`);
      const resp = yield fetch(embedUrl, {
        headers: {
          "User-Agent": UA,
          "Referer": embedUrl,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
      });
      if (!resp.ok) {
        console.log(`[VOE] HTTP error: ${resp.status}`);
        return null;
      }
      let data = yield resp.text();
      if (/permanentToken/i.test(data)) {
        const m2 = data.match(/window\.location\.href\s*=\s*'([^']+)'/i);
        if (m2) {
          console.log(`[VOE] Permanent token redirect -> ${m2[1]}`);
          const r2 = yield fetch(m2[1], {
            headers: { "User-Agent": UA, "Referer": embedUrl }
          });
          if (r2 && r2.ok)
            data = yield r2.text();
        }
      }
      const rMain = data.match(
        /json">\s*\[\s*['"]([^'"]+)['"]\s*\]\s*<\/script>\s*<script[^>]*src=['"]([^'"]+)['"]/i
      );
      if (rMain) {
        const encodedArray = rMain[1];
        const loaderUrl = rMain[2].startsWith("http") ? rMain[2] : new URL(rMain[2], embedUrl).href;
        console.log(`[VOE] Found encoded array + loader: ${loaderUrl}`);
        const jsResp = yield fetch(loaderUrl, {
          headers: { "User-Agent": UA, "Referer": embedUrl }
        });
        if (!jsResp.ok) {
          console.log(`[VOE] Loader error: ${jsResp.status}`);
          return null;
        }
        const jsData = yield jsResp.text();
        const replMatch = jsData.match(/(\[(?:'[^']{1,10}'[\s,]*){4,12}\])/i) || jsData.match(/(\[(?:"[^"]{1,10}"[,\s]*){4,12}\])/i);
        if (replMatch) {
          const decoded = voeDecode(encodedArray, replMatch[1]);
          if (decoded && (decoded.source || decoded.direct_access_url)) {
            const url = decoded.source || decoded.direct_access_url;
            console.log(`[VOE] URL encontrada: ${url.substring(0, 80)}...`);
            return { url, quality: "1080p", headers: { "Referer": embedUrl } };
          }
        }
      }
      const re1 = /(?:mp4|hls)'\s*:\s*'([^']+)'/gi;
      const re2 = /(?:mp4|hls)"\s*:\s*"([^"]+)"/gi;
      const matches = [];
      let m;
      while ((m = re1.exec(data)) !== null)
        matches.push(m);
      while ((m = re2.exec(data)) !== null)
        matches.push(m);
      for (const match of matches) {
        const candidate = match[1];
        if (!candidate)
          continue;
        let url = candidate;
        if (url.startsWith("aHR0")) {
          try {
            url = atob(url);
          } catch (e) {
          }
        }
        console.log(`[VOE] URL encontrada (fallback): ${url.substring(0, 80)}...`);
        return { url, quality: "720p", headers: { "Referer": embedUrl } };
      }
      console.log("[VOE] No se encontr\xF3 URL");
      return null;
    } catch (err) {
      console.log(`[VOE] Error: ${err.message}`);
      return null;
    }
  });
}
function resolveDood(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log(`[Dood] Resolviendo: ${embedUrl}`);
      const resp = yield fetch(embedUrl, {
        headers: {
          "User-Agent": UA,
          "Referer": embedUrl,
          "Accept": "text/html"
        }
      });
      if (!resp.ok) {
        console.log(`[Dood] HTTP error: ${resp.status}`);
        return null;
      }
      const data = yield resp.text();
      const m3u8Match = data.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/i);
      if (m3u8Match) {
        console.log(`[Dood] URL m3u8 encontrada: ${m3u8Match[0].substring(0, 80)}...`);
        return { url: m3u8Match[0], quality: "720p", headers: { "Referer": embedUrl } };
      }
      const mp4Match = data.match(/["'](https?:\/\/[^"']+\.mp4[^"']*)["']/i);
      if (mp4Match) {
        console.log(`[Dood] URL mp4 encontrada: ${mp4Match[1].substring(0, 80)}...`);
        return { url: mp4Match[1], quality: "720p", headers: { "Referer": embedUrl } };
      }
      console.log("[Dood] No se encontr\xF3 URL");
      return null;
    } catch (err) {
      console.log(`[Dood] Error: ${err.message}`);
      return null;
    }
  });
}
function resolveFilemoon(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log(`[Filemoon] Resolviendo: ${embedUrl}`);
      const resp = yield fetch(embedUrl, {
        headers: {
          "User-Agent": UA,
          "Referer": "https://doramasflix.co/",
          "Accept": "text/html"
        }
      });
      if (!resp.ok) {
        console.log(`[Filemoon] HTTP error: ${resp.status}`);
        return null;
      }
      const data = yield resp.text();
      const m3u8Match = data.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/i);
      if (m3u8Match) {
        console.log(`[Filemoon] URL encontrada: ${m3u8Match[0].substring(0, 80)}...`);
        return {
          url: m3u8Match[0],
          quality: "720p",
          headers: {
            "User-Agent": UA,
            "Referer": embedUrl,
            "Origin": "https://filemoon.sx"
          }
        };
      }
      console.log("[Filemoon] No se encontr\xF3 URL");
      return null;
    } catch (err) {
      console.log(`[Filemoon] Error: ${err.message}`);
      return null;
    }
  });
}
function unpackEval(packed, radix, symtab) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const unbase = (str) => {
    let result = 0;
    for (let i = 0; i < str.length; i++) {
      const pos = chars.indexOf(str[i]);
      if (pos === -1)
        return NaN;
      result = result * radix + pos;
    }
    return result;
  };
  return packed.replace(/\b([0-9a-zA-Z]+)\b/g, (match) => {
    const idx = unbase(match);
    if (isNaN(idx) || idx >= symtab.length)
      return match;
    return symtab[idx] && symtab[idx] !== "" ? symtab[idx] : match;
  });
}
function resolveStreamwish(embedUrl) {
  return __async(this, null, function* () {
    var _a;
    try {
      console.log(`[StreamWish] Resolviendo: ${embedUrl}`);
      const embedHost = ((_a = embedUrl.match(/^(https?:\/\/[^/]+)/)) == null ? void 0 : _a[1]) || "https://flaswish.com";
      const resp = yield fetch(embedUrl, {
        headers: {
          "User-Agent": UA,
          "Referer": "https://doramasflix.co/",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
      });
      if (!resp.ok) {
        console.log(`[StreamWish] HTTP error: ${resp.status}`);
        return null;
      }
      const data = yield resp.text();
      const fileMatch = data.match(/file\s*:\s*["']([^"']+)["']/i);
      if (fileMatch) {
        let url = fileMatch[1];
        if (url.startsWith("/"))
          url = embedHost + url;
        console.log(`[StreamWish] URL encontrada: ${url.substring(0, 80)}...`);
        return { url, quality: "720p", headers: { "User-Agent": UA, "Referer": embedHost + "/" } };
      }
      const packMatch = data.match(
        /eval\(function\(p,a,c,k,e,[a-z]\)\{[^}]+\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/
      );
      if (packMatch) {
        const unpacked = unpackEval(packMatch[1], parseInt(packMatch[2]), packMatch[4].split("|"));
        const objMatch = unpacked.match(/\{[^{}]*"hls[234]"\s*:\s*"([^"]+)"[^{}]*\}/);
        if (objMatch) {
          try {
            const normalized = objMatch[0].replace(/(\w+)\s*:/g, '"$1":');
            const obj = JSON.parse(normalized);
            const url = obj.hls4 || obj.hls3 || obj.hls2;
            if (url) {
              const fullUrl = url.startsWith("/") ? embedHost + url : url;
              console.log(`[StreamWish] URL encontrada: ${fullUrl.substring(0, 80)}...`);
              return { url: fullUrl, quality: "720p", headers: { "User-Agent": UA, "Referer": embedHost + "/" } };
            }
          } catch (e) {
          }
        }
      }
      const rawM3u8 = data.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
      if (rawM3u8) {
        console.log(`[StreamWish] URL encontrada: ${rawM3u8[0].substring(0, 80)}...`);
        return { url: rawM3u8[0], quality: "720p", headers: { "User-Agent": UA, "Referer": embedHost + "/" } };
      }
      console.log("[StreamWish] No se encontr\xF3 URL");
      return null;
    } catch (err) {
      console.log(`[StreamWish] Error: ${err.message}`);
      return null;
    }
  });
}
function resolveVidhide(embedUrl) {
  return __async(this, null, function* () {
    var _a;
    try {
      console.log(`[VidHide] Resolviendo: ${embedUrl}`);
      const resp = yield fetch(embedUrl, {
        headers: {
          "User-Agent": UA,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Referer": "https://doramasflix.co/"
        }
      });
      if (!resp.ok) {
        console.log(`[VidHide] HTTP error: ${resp.status}`);
        return null;
      }
      const html = yield resp.text();
      const evalMatch = html.match(/eval\(function\(p,a,c,k,e,[rd]\)[\s\S]*?\.split\('\|'\)[^\)]*\)\)/);
      if (!evalMatch) {
        console.log("[VidHide] No se encontr\xF3 bloque eval, intentando patrones directos...");
        const directM3u8 = html.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
        if (directM3u8) {
          console.log(`[VidHide] URL directa encontrada: ${directM3u8[0].substring(0, 80)}...`);
          return { url: directM3u8[0], quality: "720p", headers: { "Referer": embedUrl } };
        }
        const sourcesMatch = html.match(/sources\s*:\s*\[\s*\{\s*file\s*:\s*["']([^"']+)["']/i);
        if (sourcesMatch) {
          console.log(`[VidHide] URL en sources: ${sourcesMatch[1].substring(0, 80)}...`);
          return { url: sourcesMatch[1], quality: "720p", headers: { "Referer": embedUrl } };
        }
        return null;
      }
      const unpacked = unpackEval(evalMatch[1], 36, evalMatch[4].split("|"));
      if (!unpacked) {
        console.log("[VidHide] No se pudo desempacar");
        return null;
      }
      const hls4Match = unpacked.match(/"hls4"\s*:\s*"([^"]+)"/);
      const hls2Match = unpacked.match(/"hls2"\s*:\s*"([^"]+)"/);
      const hlsMatch = unpacked.match(/"hls"\s*:\s*"([^"]+)"/);
      const m3u8Relative = (_a = hls4Match || hls2Match || hlsMatch) == null ? void 0 : _a[1];
      if (!m3u8Relative) {
        console.log("[VidHide] No se encontr\xF3 hls4/hls2/hls");
        return null;
      }
      let m3u8Url = m3u8Relative;
      if (!m3u8Relative.startsWith("http")) {
        const origin2 = new URL(embedUrl).origin;
        m3u8Url = `${origin2}${m3u8Relative}`;
      }
      console.log(`[VidHide] URL encontrada: ${m3u8Url.substring(0, 80)}...`);
      const origin = new URL(embedUrl).origin;
      return {
        url: m3u8Url,
        quality: "720p",
        headers: {
          "User-Agent": UA,
          "Referer": `${origin}/`,
          "Origin": origin
        }
      };
    } catch (e) {
      console.log(`[VidHide] Error: ${e.message}`);
      return null;
    }
  });
}
function resolveStreamtape(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log(`[StreamTape] Resolviendo: ${embedUrl}`);
      const resp = yield fetch(embedUrl, {
        headers: {
          "User-Agent": UA,
          "Referer": embedUrl,
          "Accept": "text/html"
        }
      });
      if (!resp.ok) {
        console.log(`[StreamTape] HTTP error: ${resp.status}`);
        return null;
      }
      const data = yield resp.text();
      const videoMatch = data.match(/["'](https?:\/\/[^"']+\.mp4[^"']*)["']/i) || data.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i);
      if (videoMatch) {
        console.log(`[StreamTape] URL encontrada: ${videoMatch[1].substring(0, 80)}...`);
        return { url: videoMatch[1], quality: "720p", headers: { "Referer": embedUrl } };
      }
      console.log("[StreamTape] No se encontr\xF3 URL");
      return null;
    } catch (err) {
      console.log(`[StreamTape] Error: ${err.message}`);
      return null;
    }
  });
}
function resolveOkru(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log(`[OkRu] Resolviendo: ${embedUrl}`);
      const resp = yield fetch(embedUrl, {
        headers: {
          "User-Agent": UA,
          "Accept": "text/html",
          "Referer": "https://ok.ru/"
        }
      });
      if (!resp.ok) {
        console.log(`[OkRu] HTTP error: ${resp.status}`);
        return null;
      }
      const raw = yield resp.text();
      if (raw.includes("copyrightsRestricted") || raw.includes("COPYRIGHTS_RESTRICTED") || raw.includes("LIMITED_ACCESS") || raw.includes("notFound") || !raw.includes("urls")) {
        console.log("[OkRu] Video no disponible o eliminado");
        return null;
      }
      const data = raw.replace(/\\&quot;/g, '"').replace(/\\u0026/g, "&").replace(/\\/g, "");
      const matches = [...data.matchAll(/"name":"([^"]+)","url":"([^"]+)"/g)];
      const QUALITY_ORDER = ["full", "hd", "sd", "low", "lowest"];
      const videos = matches.map((m) => ({ type: m[1], url: m[2] })).filter((v) => !v.type.toLowerCase().includes("mobile") && v.url.startsWith("http"));
      if (videos.length === 0) {
        console.log("[OkRu] No se encontraron URLs");
        return null;
      }
      const sorted = videos.sort((a, b) => {
        const ai = QUALITY_ORDER.findIndex((q) => a.type.toLowerCase().includes(q));
        const bi = QUALITY_ORDER.findIndex((q) => b.type.toLowerCase().includes(q));
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
      const best = sorted[0];
      console.log(`[OkRu] URL encontrada (${best.type}): ${best.url.substring(0, 80)}...`);
      const QUALITY_MAP = { full: "1080p", hd: "720p", sd: "480p", low: "360p", lowest: "240p" };
      return {
        url: best.url,
        quality: QUALITY_MAP[best.type] || best.type,
        headers: { "User-Agent": UA, "Referer": "https://ok.ru/" }
      };
    } catch (e) {
      console.log(`[OkRu] Error: ${e.message}`);
      return null;
    }
  });
}
function resolveYourupload(embedUrl) {
  return __async(this, null, function* () {
    try {
      console.log(`[YourUpload] Resolviendo: ${embedUrl}`);
      const resp = yield fetch(embedUrl, {
        headers: {
          "User-Agent": UA,
          "Referer": embedUrl,
          "Accept": "text/html"
        }
      });
      if (!resp.ok) {
        console.log(`[YourUpload] HTTP error: ${resp.status}`);
        return null;
      }
      const data = yield resp.text();
      const videoMatch = data.match(/["'](https?:\/\/[^"']+\.mp4[^"']*)["']/i) || data.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i);
      if (videoMatch) {
        console.log(`[YourUpload] URL encontrada: ${videoMatch[1].substring(0, 80)}...`);
        return { url: videoMatch[1], quality: "720p", headers: { "Referer": embedUrl } };
      }
      console.log("[YourUpload] No se encontr\xF3 URL");
      return null;
    } catch (err) {
      console.log(`[YourUpload] Error: ${err.message}`);
      return null;
    }
  });
}
function resolveVideo(embedUrl, serverName) {
  return __async(this, null, function* () {
    console.log(`[Resolver] Dispatching for ${serverName}: ${embedUrl}`);
    const lowerUrl = embedUrl.toLowerCase();
    const lowerServer = serverName.toLowerCase();
    if (lowerUrl.includes("voe.sx") || lowerServer.includes("voe")) {
      return resolveVoe(embedUrl);
    }
    if (lowerUrl.includes("dood") || lowerServer.includes("dood")) {
      return resolveDood(embedUrl);
    }
    if (lowerUrl.includes("filemoon") || lowerServer.includes("filemoon")) {
      return resolveFilemoon(embedUrl);
    }
    if (lowerUrl.includes("streamwish") || lowerUrl.includes("flaswish") || lowerUrl.includes("sfastwish") || lowerServer.includes("streamwish")) {
      return resolveStreamwish(embedUrl);
    }
    if (lowerUrl.includes("vidhide") || lowerUrl.includes("do7go") || lowerUrl.includes("ds2play") || lowerServer.includes("vidhide")) {
      return resolveVidhide(embedUrl);
    }
    if (lowerUrl.includes("streamtape") || lowerServer.includes("streamtape")) {
      return resolveStreamtape(embedUrl);
    }
    if (lowerUrl.includes("ok.ru") || lowerServer.includes("okru")) {
      return resolveOkru(embedUrl);
    }
    if (lowerUrl.includes("yourupload") || lowerServer.includes("yourupload")) {
      return resolveYourupload(embedUrl);
    }
    console.log(`[Resolver] No resolver found for ${serverName}`);
    return null;
  });
}

// src/doramasflixco/extractor.js
var BASE_URL = "https://doramasflix.co";
var TMDB_API_KEY = "925ef0627fa092898f02c1b62e78fa1b";
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3",
  "Accept-Encoding": "gzip, deflate, br",
  "DNT": "1",
  "Connection": "keep-alive",
  "Upgrade-Insecure-Requests": "1"
};
function getContentNameFromTMDB(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      const endpoint = mediaType === "movie" ? `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}` : `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_API_KEY}`;
      console.log(`[DoramasFlix.co] Fetching TMDB info: ${endpoint}`);
      const response = yield fetch(endpoint, {
        headers: {
          "User-Agent": HEADERS["User-Agent"],
          "Accept": "application/json"
        }
      });
      if (!response.ok) {
        console.log(`[DoramasFlix.co] TMDB API error: ${response.status}`);
        return null;
      }
      const data = yield response.json();
      const name = data.title || data.name;
      console.log(`[DoramasFlix.co] TMDB name: ${name}`);
      return name;
    } catch (e) {
      console.log(`[DoramasFlix.co] TMDB fetch error: ${e.message}`);
      return null;
    }
  });
}
function fetchText(_0) {
  return __async(this, arguments, function* (url, options = {}) {
    console.log(`[DoramasFlix.co] Fetching: ${url}`);
    const response = yield fetch(url, __spreadValues({
      headers: __spreadValues(__spreadValues({}, HEADERS), options.headers)
    }, options));
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} for ${url}`);
    }
    return yield response.text();
  });
}
function searchContent(query) {
  return __async(this, null, function* () {
    try {
      const searchUrl = `${BASE_URL}/search?q=${encodeURIComponent(query)}`;
      const html = yield fetchText(searchUrl);
      const $ = import_cheerio_without_node_native.default.load(html);
      const results = [];
      $(".grid > div").each((i, elem) => {
        const titleEl = $(elem).find("h3, .text-lg").first();
        const linkEl = $(elem).find("a").first();
        const imgEl = $(elem).find("img").first();
        const typeEl = $(elem).find(".text-xs").first();
        const yearEl = $(elem).find(".text-sm").first();
        if (titleEl.length && linkEl.length) {
          const href = linkEl.attr("href");
          const slug = href ? href.replace(/^\//, "").split("/").pop() : null;
          results.push({
            slug,
            title: titleEl.text().trim(),
            url: href,
            image: imgEl.attr("src"),
            type: typeEl.text().trim(),
            year: yearEl.text().trim()
          });
        }
      });
      console.log(`[DoramasFlix.co] Found ${results.length} search results`);
      return results;
    } catch (e) {
      console.log(`[DoramasFlix.co] Search error: ${e.message}`);
      return [];
    }
  });
}
function getDoramaDetails(slug) {
  return __async(this, null, function* () {
    try {
      const url = `${BASE_URL}/doramas/${slug}`;
      const html = yield fetchText(url);
      const $ = import_cheerio_without_node_native.default.load(html);
      const title = $("h1, .text-2xl").first().text().trim();
      const description = $(".text-base, p").first().text().trim();
      const image = $('img[alt*="poster"]').first().attr("src") || $("img").first().attr("src");
      const year = $(".text-sm").first().text().trim();
      const status = $(".text-xs").first().text().trim();
      const episodes = [];
      $(".grid .gap-4 a").each((i, elem) => {
        const epLink = $(elem).attr("href");
        const epImg = $(elem).find("img");
        if (epLink) {
          const epSlug = epLink.replace(/^\//, "").split("/").pop();
          episodes.push({
            slug: epSlug,
            title: epImg.attr("alt") || epSlug,
            url: epLink,
            image: epImg.attr("src")
          });
        }
      });
      return {
        slug,
        title,
        description,
        image,
        year,
        status,
        episodes
      };
    } catch (e) {
      console.log(`[DoramasFlix.co] Details error: ${e.message}`);
      return null;
    }
  });
}
function extractEmbedLinks(episodeSlug) {
  return __async(this, null, function* () {
    try {
      const url = `${BASE_URL}/capitulos/${episodeSlug}`;
      const html = yield fetchText(url);
      const $ = import_cheerio_without_node_native.default.load(html);
      const links = [];
      const seen = /* @__PURE__ */ new Set();
      const iframe = $("iframe").first();
      if (iframe.length) {
        const src = iframe.attr("src");
        if (src && !seen.has(src)) {
          seen.add(src);
          const server = extractServerName(src);
          links.push({ url: src, server });
          console.log(`[DoramasFlix.co] Found iframe: ${server} - ${src.substring(0, 60)}`);
        }
      }
      $('.button, [class*="server"]').each((i, elem) => {
        const onclick = $(elem).attr("onclick");
        const dataSrc = $(elem).attr("data-src") || $(elem).attr("data-url");
        let embedUrl = null;
        if (dataSrc) {
          embedUrl = dataSrc;
        } else if (onclick) {
          const match = onclick.match(/['"](https?:\/\/[^'"]+)['"]/);
          if (match)
            embedUrl = match[1];
        }
        if (embedUrl && !seen.has(embedUrl)) {
          seen.add(embedUrl);
          const server = extractServerName(embedUrl);
          links.push({ url: embedUrl, server });
          console.log(`[DoramasFlix.co] Found server button: ${server} - ${embedUrl.substring(0, 60)}`);
        }
      });
      return links;
    } catch (e) {
      console.log(`[DoramasFlix.co] Extract embed error: ${e.message}`);
      return [];
    }
  });
}
function extractServerName(url) {
  if (url.includes("voe.sx"))
    return "VOE";
  if (url.includes("dood"))
    return "Dood";
  if (url.includes("filemoon"))
    return "Filemoon";
  if (url.includes("streamwish") || url.includes("flaswish"))
    return "StreamWish";
  if (url.includes("vidhide") || url.includes("do7go") || url.includes("ds2play"))
    return "VidHide";
  if (url.includes("streamtape"))
    return "StreamTape";
  if (url.includes("ok.ru"))
    return "OkRu";
  if (url.includes("yourupload"))
    return "YourUpload";
  return "Unknown";
}
function extractStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      console.log(`[DoramasFlix.co] Extracting streams for: ${mediaType} ${tmdbId} S${season}E${episode}`);
      const contentName = yield getContentNameFromTMDB(tmdbId, mediaType);
      if (!contentName) {
        console.log(`[DoramasFlix.co] Could not get name from TMDB for: ${tmdbId}`);
        return [];
      }
      const searchResults = yield searchContent(contentName);
      if (!searchResults.length) {
        console.log(`[DoramasFlix.co] No search results for: ${contentName}`);
        return [];
      }
      const result = searchResults[0];
      console.log(`[DoramasFlix.co] Found: ${result.slug} (${result.title})`);
      const details = yield getDoramaDetails(result.slug);
      if (!details) {
        console.log(`[DoramasFlix.co] Could not get details for: ${result.slug}`);
        return [];
      }
      const episodeSlug = `${result.slug}-${season}x${episode}`;
      console.log(`[DoramasFlix.co] Episode slug: ${episodeSlug}`);
      const embedLinks = yield extractEmbedLinks(episodeSlug);
      console.log(`[DoramasFlix.co] Found ${embedLinks.length} embed links`);
      if (!embedLinks.length) {
        return [];
      }
      const streams = [];
      for (const embed of embedLinks) {
        console.log(`[DoramasFlix.co] Resolving ${embed.server}: ${embed.url}`);
        try {
          const resolved = yield resolveVideo(embed.url, embed.server);
          if (resolved && resolved.url) {
            streams.push({
              name: "DoramasFlix.co",
              title: `[${embed.server}] ${resolved.quality || "720p"}`,
              url: resolved.url,
              quality: resolved.quality || "720p",
              headers: resolved.headers || {
                "User-Agent": HEADERS["User-Agent"],
                "Referer": embed.url
              }
            });
            console.log(`[DoramasFlix.co] \u2705 Resolved: ${embed.server} -> ${resolved.url.substring(0, 60)}...`);
          } else {
            console.log(`[DoramasFlix.co] \u274C Could not resolve: ${embed.server}`);
          }
        } catch (err) {
          console.log(`[DoramasFlix.co] \u274C Error resolving ${embed.server}: ${err.message}`);
        }
      }
      console.log(`[DoramasFlix.co] Final streams: ${streams.length}`);
      return streams;
    } catch (error) {
      console.error(`[DoramasFlix.co] Extraction error: ${error.message}`);
      return [];
    }
  });
}

// src/doramasflixco/index.js
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      console.log(`[DoramasFlix.co] Request: ${mediaType} ${tmdbId} S${season}E${episode}`);
      const streams = yield extractStreams(tmdbId, mediaType, season, episode);
      return streams;
    } catch (error) {
      console.error(`[DoramasFlix.co] Error: ${error.message}`);
      return [];
    }
  });
}
module.exports = { getStreams };
