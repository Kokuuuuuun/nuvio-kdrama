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
var doramasflix_exports = {};
__export(doramasflix_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(doramasflix_exports);

var BASE_URL = "https://doramasflix.in";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function getTmdbData(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      const url = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=439c478a771f35c05022f9feabcca01c&language=es-MX`;
      const data = yield fetch(url).then((r) => r.json());
      const title = mediaType === "movie" ? data.title : data.name;
      const originalTitle = mediaType === "movie" ? data.original_title : data.original_name;
      return { title, originalTitle };
    } catch (e) {
      return null;
    }
  });
}

function buildSlug(title) {
  return title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    if (!tmdbId || !mediaType) return [];
    
    try {
      const tmdbInfo = yield getTmdbData(tmdbId, mediaType);
      if (!tmdbInfo) return [];
      
      const slug = buildSlug(tmdbInfo.title);
      const url = `${BASE_URL}/dorama/${slug}/`;
      
      const response = yield fetch(url, {
        headers: { "User-Agent": UA, "Accept": "text/html" }
      });
      
      if (!response.ok) return [];
      
      const html = yield response.text();
      
      if (html.includes("error") || html.includes("404")) return [];
      
      const streams = [];
      
      if (mediaType === "tv" && season && episode) {
        const episodeSlug = `temporada-${season}-capitulo-${episode}`;
        const epUrl = `${url}${episodeSlug}/`;
        
        try {
          const epResponse = yield fetch(epUrl, {
            headers: { "User-Agent": UA, "Referer": url }
          });
          const epHtml = yield epResponse.text();
          
          const iframeMatches = [...epHtml.matchAll(/<iframe[^>]*src=["']([^"']+)["']/gi)];
          
          for (const match of iframeMatches) {
            const streamUrl = match[1];
            if (streamUrl.includes(".m3u8") || streamUrl.includes("embed") || streamUrl.includes("stream")) {
              streams.push({
                name: "DoramasFlix",
                title: `Sub Español - T${season}E${episode}`,
                url: streamUrl,
                quality: "1080p",
                headers: { "User-Agent": UA, "Referer": epUrl }
              });
            }
          }
        } catch (e) {
          console.log(`[DoramasFlix] Error episodio: ${e.message}`);
        }
      }
      
      return streams;
    } catch (e) {
      console.log(`[DoramasFlix] Error: ${e.message}`);
      return [];
    }
  });
}
