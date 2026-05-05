# Doramas Nuvio Providers

Providers para Nuvio con contenido de Doramas Coreanos, Chinos, Japoneses y Asiáticos en Español.

Resolvers avanzados implementados desde cero con soporte para múltiples servidores de video.

## ✅ Provider Activo

### DoramasFlix (doramasflix.in)
- **Estado:** Funcional
- **Resolvers:** VOE, StreamWish, VidHide/Do7Go, OkRu, Filemoon
- **Búsqueda:** Usa TMDB API para obtener nombre exacto
- **Versión:** 1.2.0

##  Roadmap / Próximos Pasos

- [ ] **DoramasVIP** - Implementar provider con estructura similar
- [ ] **DoramasMP4** - Implementar provider de MP4
- [ ] **DoramasFlix.co** - Implementar versión del dominio .co
- [ ] **Mejorar resolvers** - Agregar más servidores y patrones
- [ ] **Testing** - Pruebas exhaustivas en diferentes dispositivos

## 🚀 Cargar en Nuvio

### Usar desde GitHub (Raw)

Añade esta URL en Nuvio → Settings → Plugins:

```
https://raw.githubusercontent.com/Kokuuuuuun/Nuvio-Kdramas-Providers-Latino/main/manifest.json
```

## 🛠️ Resolvers Implementados

| Servidor | Técnica | Estado |
|---|---|---|
| VOE | Decodificación específica + base64 | ✅ Funcional |
| StreamWish/FlasWish | Packed JS + hls extraction | ⚠️ No testeado |
| VidHide/Do7Go/DS2Play | Unpacker P,A,C,K,E,R | ⚠️ No testeado |
| OkRu | JSON parsing múltiples calidades | ✅ Funcional |
| Filemoon | Búsqueda directa m3u8 | ⚠️ No testeado |

## 📝 Notas Técnicas

- Usa `fetch` nativo (compatible con Nuvio/Hermes)
- Cloudflare Worker para proxy de API GraphQL
- Build system basado en esbuild
