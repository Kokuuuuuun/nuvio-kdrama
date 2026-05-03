# 🎬 Provider DoramasFlix.co para Nuvio Media Hub

**Documentación Técnica Completa**  
*Versión: 1.0*  
*Fecha: 5 de Mayo de 2026*

---

## 📋 Overview del Provider

### 🎯 Información General
- **Provider Name:** DoramasFlix.co
- **Base URL:** `https://doramasflix.co`
- **Tipo:** Streaming de Doramas, Películas y TV Shows
- **Idiomas:** Sub Español, Latino
- **Calidad:** 720p HD, 1080p Full HD
- **Protecciones:** Cloudflare Turnstile, Anti-bot

### 🏷️ Categorías Soportadas
- **Doramas:** Series coreanas y asiáticas
- **Películas:** largometrajes asiáticos
- **TV Shows:** Programas de variedades y reality shows
- **Colecciones:** Contenido agrupado por temas

---

## 🔧 Configuración Técnica

### 🌐 Endpoints Principales

| Endpoint | Método | Descripción | Protección |
|----------|--------|-------------|------------|
| `/` | GET | Página principal | ✅ Cloudflare |
| `/doramas` | GET | Listado de doramas | ✅ Cloudflare |
| `/peliculas` | GET | Listado de películas | ✅ Cloudflare |
| `/variedades` | GET | Listado de TV Shows | ✅ Cloudflare |
| `/doramas/{slug}` | GET | Detalles del dorama | ✅ Cloudflare |
| `/capitulos/{slug}` | GET | Reproductor de episodio | ✅ Cloudflare |

### 🛡️ Métodos de Bypass
```javascript
// Configuración anti-bot requerida
const antiBotConfig = {
    stealthy: true,
    solveCloudflare: true,
    headless: true,
    networkIdle: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    extraHeaders: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
    }
};
```

---

## 🎥 Sistema de Resolución de Contenido

### 📺 Estructura de URLs

#### Doramas
```
Formato: /doramas/{dorama-slug}
Ejemplo: https://doramasflix.co/doramas/born-with-luck
```

#### Episodios
```
Formato: /capitulos/{dorama-slug}-{season}x{episode}
Ejemplo: https://doramasflix.co/capitulos/born-with-luck-1x5
```

#### Películas
```
Formato: /peliculas/{pelicula-slug}
Ejemplo: https://doramasflix.co/peliculas/new-normal-2023
```

#### TV Shows
```
Formato: /variedades/{show-slug}
Ejemplo: https://doramasflix.co/variedades/wanna-one-go-back-to-base
```

---

## 🔍 Métodos de Extracción de Datos

### 🏠 Página Principal
```javascript
async function extractHomepage() {
    const selectors = {
        featured: '.slide',
        latestEpisodes: '.grid .gap-4',
        latestDoramas: '.grid .gap-4'
    };
    
    return await scrapeWithStealth('https://doramasflix.co', selectors);
}
```

### 📝 Listado de Doramas
```javascript
async function extractDoramas() {
    const selectors = {
        items: '.grid > div',
        title: 'h3, .text-lg',
        link: 'a',
        image: 'img',
        status: '.text-xs',
        episodes: '.text-sm'
    };
    
    return await scrapeWithStealth('https://doramasflix.co/doramas', selectors);
}
```

### 🎬 Detalles del Dorama
```javascript
async function extractDoramaDetails(slug) {
    const url = `https://doramasflix.co/doramas/${slug}`;
    const selectors = {
        title: 'h1, .text-2xl',
        description: '.text-base, p',
        image: 'img[alt*="poster"]',
        episodes: '.grid .gap-4 a',
        genres: '.flex .gap-2',
        year: '.text-sm',
        status: '.text-xs'
    };
    
    return await scrapeWithStealth(url, selectors);
}
```

### 🎞️ Episodio Individual
```javascript
async function extractEpisode(slug) {
    const url = `https://doramasflix.co/capitulos/${slug}`;
    const selectors = {
        player: 'iframe',
        servers: '.button',
        title: 'h1',
        episodeNumber: 'h1',
        nextEpisode: 'a[href*="capitulos"]',
        prevEpisode: 'a[href*="capitulos"]'
    };
    
    return await scrapeWithStealth(url, selectors);
}
```

---

## 🎬 Sistema de Reproducción

### 📺 Player Integration

#### Estructura del Player
```javascript
const playerStructure = {
    container: '.aspect-video iframe',
    sources: [
        {
            name: 'Voe',
            server: 'fkplayer.xyz',
            type: 'iframe'
        },
        {
            name: 'Dood',
            server: 'doodstream',
            type: 'iframe'
        },
        {
            name: 'Filemoon',
            server: 'filemoon',
            type: 'iframe'
        }
    ]
};
```

#### Extracción de URL de Video
```javascript
async function extractVideoURL(episodeSlug, server = 'Voe') {
    const episodePage = await extractEpisode(episodeSlug);
    const iframeSrc = episodePage.player.src;
    
    // Decodificar URL del player
    const decodedURL = decodePlayerURL(iframeSrc);
    
    return {
        streamURL: decodedURL,
        server: server,
        type: 'application/x-mpegURL',
        subtitles: await extractSubtitles(episodeSlug)
    };
}

function decodePlayerURL(encodedURL) {
    // Extraer y decodificar JWT del iframe
    const jwtMatch = encodedURL.match(/eyJ[A-Za-z0-9-_]*\.eyJ[A-Za-z0-9-_]*\.eyJ[A-Za-z0-9-_]*/);
    if (jwtMatch) {
        const decoded = jwt.decode(jwtMatch[0]);
        return decoded.link;
    }
    return null;
}
```

### 🎵 Sistema de Subtítulos
```javascript
async function extractSubtitles(episodeSlug) {
    return {
        spanish: {
            url: `https://doramasflix.co/subtitles/${episodeSlug}/es.srt`,
            language: 'es',
            label: 'Español'
        },
        latin: {
            url: `https://doramasflix.co/subtitles/${episodeSlug}/lat.srt`, 
            language: 'es-LA',
            label: 'Latino'
        }
    };
}
```

---

## 🗄️ Base de Datos y Caching

### 📊 Estructura de Datos

#### Dorama Model
```javascript
const DoramaModel = {
    id: 'string',           // born-with-luck
    title: 'string',        // Born with Luck
    slug: 'string',         // born-with-luck
    description: 'string',
    image: 'string',        // URL de la imagen
    year: 'number',
    status: 'string',       // 'En emisión' | 'Finalizado' | 'Próximamente'
    genres: ['string'],
    episodes: [{
        season: 'number',
        episode: 'number',
        slug: 'string',     // born-with-luck-1x5
        title: 'string',    // Born with Luck 1x5
        url: 'string',      // /capitulos/born-with-luck-1x5
        airDate: 'date',
        duration: 'number'  // minutos
    }],
    metadata: {
        rating: 'number',
        views: 'number',
        lastUpdated: 'date'
    }
};
```

#### Película Model
```javascript
const PeliculaModel = {
    id: 'string',
    title: 'string',
    slug: 'string',
    description: 'string',
    image: 'string',
    year: 'number',
    duration: 'number',     // minutos
    genres: ['string'],
    status: 'string',       // 'Finalizado' | 'Próximamente'
    quality: ['string'],     // ['720p', '1080p']
    servers: ['string'],     // ['Voe', 'Dood', 'Filemoon']
    subtitles: ['string']    // ['es', 'es-LA']
};
```

### 💾 Caching Strategy
```javascript
const cacheConfig = {
    homepage: { ttl: 3600 },        // 1 hora
    doramasList: { ttl: 7200 },     // 2 horas
    doramaDetails: { ttl: 86400 },  // 24 horas
    episodes: { ttl: 1800 },        // 30 minutos
    videoURLs: { ttl: 300 }         // 5 minutos
};
```

---

## 🔌 API Endpoints para Nuvio Media Hub

### 📡 Endpoints del Provider

#### GET /doramasflix/search
```javascript
// Búsqueda de contenido
app.get('/doramasflix/search', async (req, res) => {
    const { q, type = 'all', page = 1 } = req.query;
    
    try {
        const results = await searchContent(q, type, page);
        res.json({
            success: true,
            data: results,
            pagination: {
                page: parseInt(page),
                total: results.total,
                hasNext: results.hasNext
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
```

#### GET /doramasflix/doramas
```javascript
// Listado de doramas
app.get('/doramasflix/doramas', async (req, res) => {
    const { page = 1, genre, status, year } = req.query;
    
    try {
        const doramas = await getDoramasList({ page, genre, status, year });
        res.json({
            success: true,
            data: doramas.items,
            pagination: doramas.pagination
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
```

#### GET /doramasflix/dorama/:slug
```javascript
// Detalles del dorama
app.get('/doramasflix/dorama/:slug', async (req, res) => {
    const { slug } = req.params;
    
    try {
        const dorama = await getDoramaDetails(slug);
        res.json({ success: true, data: dorama });
    } catch (error) {
        res.status(404).json({ success: false, error: 'Dorama not found' });
    }
});
```

#### GET /doramasflix/episode/:slug
```javascript
// Información del episodio
app.get('/doramasflix/episode/:slug', async (req, res) => {
    const { slug } = req.params;
    const { server = 'Voe' } = req.query;
    
    try {
        const episode = await getEpisodeInfo(slug, server);
        res.json({ success: true, data: episode });
    } catch (error) {
        res.status(404).json({ success: false, error: 'Episode not found' });
    }
});
```

#### GET /doramasflix/stream/:slug
```javascript
// URL de streaming directa
app.get('/doramasflix/stream/:slug', async (req, res) => {
    const { slug } = req.params;
    const { server = 'Voe' } = req.query;
    
    try {
        const streamInfo = await getStreamURL(slug, server);
        
        // Redireccionar al stream o retornar URL directa
        if (streamInfo.directURL) {
            res.redirect(302, streamInfo.directURL);
        } else {
            res.json({ 
                success: true, 
                data: {
                    streamURL: streamInfo.streamURL,
                    subtitles: streamInfo.subtitles,
                    server: server
                }
            });
        }
    } catch (error) {
        res.status(404).json({ success: false, error: 'Stream not available' });
    }
});
```

---

## 🛠️ Implementación del Provider

### 📦 Configuración del Provider
```javascript
// providers/doramasflix.js
class DoramasFlixProvider {
    constructor() {
        this.name = 'DoramasFlix.co';
        this.baseUrl = 'https://doramasflix.co';
        this.supportedTypes = ['dorama', 'pelicula', 'tvshow'];
        this.requiresStealth = true;
        this.rateLimit = 1000; // 1 segundo entre requests
    }
    
    async initialize() {
        // Inicializar sesión stealth persistente
        this.session = await createStealthSession({
            solveCloudflare: true,
            headless: true
        });
    }
    
    async search(query, type = 'all') {
        const searchURL = `${this.baseUrl}/search?q=${encodeURIComponent(query)}`;
        return await this.scrapeWithSession(searchURL);
    }
    
    async getDetails(slug, type) {
        const url = `${this.baseUrl}/${type}s/${slug}`;
        return await this.scrapeWithSession(url);
    }
    
    async getStreamURL(episodeSlug, server = 'Voe') {
        const url = `${this.baseUrl}/capitulos/${episodeSlug}`;
        const page = await this.scrapeWithSession(url);
        
        // Extraer URL del player
        const iframeSrc = page.querySelector('iframe')?.src;
        if (!iframeSrc) throw new Error('No player found');
        
        return await this.decodePlayerURL(iframeSrc);
    }
}
```

### 🔧 Scraping Core
```javascript
// utils/scrapling.js
const { StealthyFetcher } = require('scrapling');

class ScrapingCore {
    constructor() {
        this.session = null;
        this.lastRequest = 0;
    }
    
    async createSession() {
        this.session = await StealthyFetcher.createSession({
            headless: true,
            solveCloudflare: true,
            networkIdle: true,
            blockAds: true
        });
    }
    
    async scrape(url, selectors = {}) {
        // Rate limiting
        await this.rateLimit();
        
        try {
            const response = await this.session.fetch(url);
            const content = response.content;
            
            return this.extractData(content, selectors);
        } catch (error) {
            console.error(`Scraping error for ${url}:`, error);
            throw error;
        }
    }
    
    extractData(html, selectors) {
        const result = {};
        
        for (const [key, selector] of Object.entries(selectors)) {
            const elements = html.querySelectorAll(selector);
            result[key] = Array.from(elements).map(el => ({
                text: el.textContent?.trim(),
                href: el.href,
                src: el.src,
                alt: el.alt
            }));
        }
        
        return result;
    }
    
    async rateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequest;
        
        if (timeSinceLastRequest < 1000) {
            const delay = 1000 - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        this.lastRequest = Date.now();
    }
    
    async close() {
        if (this.session) {
            await this.session.close();
        }
    }
}
```

---

## 🎯 Métodos de Resolución

### 🔍 Búsqueda de Contenido
```javascript
async function searchContent(query, type = 'all', page = 1) {
    const searchURL = `https://doramasflix.co/search?q=${encodeURIComponent(query)}&page=${page}`;
    
    const selectors = {
        results: '.grid > div',
        title: 'h3, .text-lg',
        link: 'a',
        image: 'img',
        type: '.text-xs',
        year: '.text-sm'
    };
    
    const results = await scrapeWithStealth(searchURL, selectors);
    
    return {
        items: results.results.map(item => ({
            id: extractSlugFromURL(item.link[0]?.href),
            title: item.title[0]?.text,
            image: item.image[0]?.src,
            type: item.type[0]?.text,
            year: item.year[0]?.text,
            url: item.link[0]?.href
        })),
        pagination: {
            page: page,
            hasNext: results.results.length > 0
        }
    };
}
```

### 📋 Listado por Categoría
```javascript
async function getDoramasList(options = {}) {
    const { page = 1, genre, status, year } = options;
    let url = `https://doramasflix.co/doramas?page=${page}`;
    
    if (genre) url += `&genre=${encodeURIComponent(genre)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    if (year) url += `&year=${year}`;
    
    const selectors = {
        items: '.grid > div',
        title: 'h3, .text-lg',
        link: 'a',
        image: 'img',
        status: '.text-xs',
        episodes: '.text-sm',
        rating: '.flex .gap-2'
    };
    
    const data = await scrapeWithStealth(url, selectors);
    
    return {
        items: data.items.map(item => ({
            id: extractSlugFromURL(item.link[0]?.href),
            title: item.title[0]?.text,
            image: item.image[0]?.src,
            status: item.status[0]?.text,
            episodes: item.episodes[0]?.text,
            rating: item.rating[0]?.text,
            url: item.link[0]?.href
        })),
        pagination: {
            page: page,
            hasNext: data.items.length > 0
        }
    };
}
```

### 🎬 Detalles del Contenido
```javascript
async function getDoramaDetails(slug) {
    const url = `https://doramasflix.co/doramas/${slug}`;
    
    const selectors = {
        title: 'h1, .text-2xl',
        description: '.text-base, p',
        image: 'img[alt*="poster"]',
        episodes: '.grid .gap-4 a',
        genres: '.flex .gap-2',
        year: '.text-sm',
        status: '.text-xs',
        rating: '.text-lg'
    };
    
    const data = await scrapeWithStealth(url, selectors);
    
    return {
        id: slug,
        title: data.title[0]?.text,
        description: data.description[0]?.text,
        image: data.image[0]?.src,
        year: data.year[0]?.text,
        status: data.status[0]?.text,
        rating: data.rating[0]?.text,
        genres: data.genres.map(g => g.text),
        episodes: data.episodes.map(ep => ({
            slug: extractSlugFromURL(ep.href),
            title: ep.querySelector('img')?.alt,
            url: ep.href,
            image: ep.querySelector('img')?.src
        }))
    };
}
```

### 🎞️ Información del Episodio
```javascript
async function getEpisodeInfo(slug, server = 'Voe') {
    const url = `https://doramasflix.co/capitulos/${slug}`;
    
    const selectors = {
        title: 'h1',
        player: 'iframe',
        servers: '.button',
        nextEpisode: 'a[href*="capitulos"]:contains("Siguiente")',
        prevEpisode: 'a[href*="capitulos"]:contains("Anterior")'
    };
    
    const data = await scrapeWithStealth(url, selectors);
    
    // Extraer URL del video
    const videoURL = await extractVideoURL(slug, server);
    
    return {
        slug: slug,
        title: data.title[0]?.text,
        streamURL: videoURL.streamURL,
        server: server,
        subtitles: videoURL.subtitles,
        nextEpisode: data.nextEpisode[0]?.href,
        prevEpisode: data.prevEpisode[0]?.href,
        availableServers: data.servers.map(s => s.textContent)
    };
}
```

---

## 🚀 Implementación en Nuvio Media Hub

### 📦 Instalación y Configuración
```bash
# Instalar dependencias
npm install scrapling express cors helmet rate-limited

# Crear estructura de archivos
mkdir -p providers utils routes
touch providers/doramasflix.js utils/scraping.js routes/doramasflix.js
```

### ⚙️ Configuración del Servidor
```javascript
// app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const doramasflixRoutes = require('./routes/doramasflix');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de 100 requests por IP
});
app.use(limiter);

// Routes
app.use('/api/doramasflix', doramasflixRoutes);

// Error handling
app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### 🔄 Actualización Automática
```javascript
// utils/updater.js
class ContentUpdater {
    constructor(provider) {
        this.provider = provider;
        this.updateInterval = 3600000; // 1 hora
    }
    
    async start() {
        await this.updateAllContent();
        setInterval(() => this.updateAllContent(), this.updateInterval);
    }
    
    async updateAllContent() {
        try {
            console.log('Updating DoramasFlix content...');
            
            // Actualizar doramas
            await this.updateDoramas();
            
            // Actualizar películas
            await this.updatePeliculas();
            
            // Actualizar TV shows
            await this.updateTVShows();
            
            console.log('Content update completed');
        } catch (error) {
            console.error('Content update failed:', error);
        }
    }
    
    async updateDoramas() {
        const doramas = await this.provider.getDoramasList();
        // Guardar en base de datos
        await this.saveToDatabase('doramas', doramas.items);
    }
    
    async updatePeliculas() {
        const peliculas = await this.provider.getPeliculasList();
        await this.saveToDatabase('peliculas', peliculas.items);
    }
    
    async updateTVShows() {
        const shows = await this.provider.getTVShowsList();
        await this.saveToDatabase('tvshows', shows.items);
    }
    
    async saveToDatabase(collection, items) {
        // Implementar guardado en base de datos
        // MongoDB, PostgreSQL, etc.
    }
}
```

---

## 📊 Métricas y Monitoreo

### 📈 Estadísticas de Uso
```javascript
// utils/metrics.js
class MetricsCollector {
    constructor() {
        this.stats = {
            requests: 0,
            searches: 0,
            streams: 0,
            errors: 0,
            responseTime: []
        };
    }
    
    recordRequest(type, responseTime) {
        this.stats.requests++;
        this.stats[type] = (this.stats[type] || 0) + 1;
        this.stats.responseTime.push(responseTime);
    }
    
    recordError() {
        this.stats.errors++;
    }
    
    getStats() {
        const avgResponseTime = this.stats.responseTime.reduce((a, b) => a + b, 0) / this.stats.responseTime.length;
        
        return {
            ...this.stats,
            avgResponseTime: Math.round(avgResponseTime),
            successRate: ((this.stats.requests - this.stats.errors) / this.stats.requests * 100).toFixed(2) + '%'
        };
    }
}
```

### 🔍 Health Check
```javascript
// routes/health.js
app.get('/health', async (req, res) => {
    try {
        // Verificar conexión con DoramasFlix
        const response = await scrapeWithStealth('https://doramasflix.co');
        
        res.json({
            status: 'healthy',
            provider: 'DoramasFlix.co',
            timestamp: new Date().toISOString(),
            responseTime: response.responseTime
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
```

---

## 🛡️ Consideraciones de Seguridad

### 🔒 Protección Anti-Bot
- **Session Persistence:** Mantener sesión activa
- **Rate Limiting:** Limitar requests a 1/segundo
- **User Agent Rotation:** Rotar user agents
- **Proxy Support:** Soporte para proxies residenciales
- **Header Spoofing:** Headers realistas de navegador

### 🚫 Manejo de Errores
```javascript
class ErrorHandler {
    static handle(error, context) {
        console.error(`[${context}] Error:`, error.message);
        
        if (error.message.includes('Cloudflare')) {
            return {
                error: 'Anti-bot protection detected',
                retryAfter: 5000,
                action: 'retry_with_new_session'
            };
        }
        
        if (error.message.includes('404')) {
            return {
                error: 'Content not found',
                action: 'return_empty'
            };
        }
        
        return {
            error: 'Internal error',
            action: 'retry_later'
        };
    }
}
```

---

## 📝 Ejemplos de Uso

### 🔍 Búsqueda de Doramas
```javascript
// GET /api/doramasflix/search?q=born%20with%20luck&type=dorama
{
    "success": true,
    "data": {
        "items": [
            {
                "id": "born-with-luck",
                "title": "Born with Luck",
                "image": "https://doramasflix.co/_next/image?url=...",
                "type": "DORAMA",
                "status": "En emisión",
                "year": "2026",
                "url": "/doramas/born-with-luck"
            }
        ],
        "pagination": {
            "page": 1,
            "hasNext": false
        }
    }
}
```

### 🎬 Detalles del Dorama
```javascript
// GET /api/doramasflix/dorama/born-with-luck
{
    "success": true,
    "data": {
        "id": "born-with-luck",
        "title": "Born with Luck",
        "description": "Un dorama sobre...",
        "image": "https://image.tmdb.org/t/p/w500/...",
        "year": "2026",
        "status": "En emisión",
        "rating": "8.5",
        "genres": ["Drama", "Comedia", "Romance"],
        "episodes": [
            {
                "slug": "born-with-luck-1x1",
                "title": "Born with Luck 1x1",
                "url": "/capitulos/born-with-luck-1x1",
                "image": "https://..."
            }
        ]
    }
}
```

### 🎞️ Stream del Episodio
```javascript
// GET /api/doramasflix/stream/born-with-luck-1x5?server=Voe
{
    "success": true,
    "data": {
        "streamURL": "https://fkplayer.xyz/e/eyJ...",
        "subtitles": {
            "spanish": {
                "url": "https://doramasflix.co/subtitles/born-with-luck-1x5/es.srt",
                "language": "es",
                "label": "Español"
            },
            "latin": {
                "url": "https://doramasflix.co/subtitles/born-with-luck-1x5/lat.srt",
                "language": "es-LA", 
                "label": "Latino"
            }
        },
        "server": "Voe"
    }
}
```

---

## 🔄 Actualización y Mantenimiento

### 📅 Tareas Programadas
- **Horario:** Cada 6 horas
- **Tareas:** 
  - Actualizar catálogo de doramas
  - Verificar nuevos episodios
  - Actualizar estado de series
  - Limpiar cache antigua

### 🐛 Troubleshooting Común

#### Cloudflare Detection
```javascript
// Solución: Crear nueva sesión
if (error.includes('cloudflare')) {
    await createNewSession();
    return retryRequest();
}
```

#### Rate Limiting
```javascript
// Solución: Incrementar delay
if (error.includes('429')) {
    await delay(10000); // 10 segundos
    return retryRequest();
}
```

#### Video URL Expired
```javascript
// Solución: Refrescar URL del episodio
if (error.includes('expired')) {
    const freshURL = await getStreamURL(episodeSlug, server);
    return freshURL;
}
```

---

## 📚 Referencias y Recursos

### 🔗 Links Útiles
- **Scrapling Docs:** https://scrapling.readthedocs.io
- **DoramasFlix.co:** https://doramasflix.co
- **Nuvio Media Hub:** Documentación interna

### 🛠️ Herramientas Recomendadas
- **Scrapling:** Para web scraping con anti-bypass
- **Express.js:** Para API server
- **Redis:** Para caching
- **MongoDB:** Para base de datos

### 📞 Soporte
- **Issues:** GitHub repository
- **Documentation:** Wiki del proyecto
- **Community:** Discord/Telegram

---

**Este provider está diseñado para integrarse seamlessly con Nuvio Media Hub, proporcionando acceso a todo el catálogo de DoramasFlix.co con bypass automático de protecciones anti-bot y resolución de streaming en tiempo real.**
