var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
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
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
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
var midoramafavorito_exports = {};
__export(midoramafavorito_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(midoramafavorito_exports);

var BASE_URL = "https://midoramafavorito.com";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    if (!tmdbId || !mediaType) return [];
    
    try {
      const url = `${BASE_URL}/dorama/${tmdbId}/`;
      
      const response = yield fetch(url, {
        headers: { "User-Agent": UA }
      });
      
      if (!response.ok) return [];
      
      const html = yield response.text();
      const streams = [];
      
      const videoMatches = [...html.matchAll(/<video[^>]*src=["']([^"']+)["']|<source[^>]*src=["']([^"']+)["']/gi)];
      
      for (const match of videoMatches) {
        const streamUrl = match[1] || match[2];
        if (streamUrl && (streamUrl.includes(".mp4") || streamUrl.includes(".m3u8")) {
          streams.push({
            name: "Mi Dorama Favorito",
            title: "App Gratis",
            url: streamUrl,
            quality: "1080p",
            headers: { "User-Agent": UA, "Referer": url }
          });
        }
      }
      
      return streams;
    } catch (e) {
      console.log(`[MiDoramaFavorito] Error: ${e.message}`);
      return [];
    }
  });
}
