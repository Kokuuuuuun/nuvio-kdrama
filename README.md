# KDramas Providers para Nuvio

Plugin para Nuvio con múltiples fuentes de K-Dramas (doramas) con subtítulos en español.

## Fuentes incluidas

| Provider | Sitio | Descripción |
|----------|-------|-------------|
| doramasflix | doramasflix.in | K-Dramas, C-Dramas, J-Dramas y doramas tailandeses |
| doramasmp4 | doramasmp4.io | Doramas online en MP4 gratis |
| pandrama | pandrama.tv | Dramas asiáticos en Español Latino y Subtitulado |
| doramasyt | doramasyt.com | Doramas online gratis en HD |
| estrenosdoramas | estrenosdoramas.top | Últimos estrenos de doramas |
| doramasvip | doramasvip.com | Doramas exclusivos con subtítulos |
| doramasgo | doramasgo.com | Ver doramas online |
| midoramafavorito | midoramafavorito.com | App para ver doramas en español |

## Instalación en Nuvio

1. Abrir **Nuvio** > **Configuración** > **Plugins**
2. Agregar la URL de este repositorio:
   ```
   https://raw.githubusercontent.com/TU_USUARIO/nuvio-kdramas/main
   ```
3. Actualizar y habilitar los providers que desees

## Estructura del Proyecto

```
nuvio-kdramas/
├── providers/              # Archivos de providers
│   ├── doramasflix.js
│   ├── doramasmp4.js
│   ├── pandrama.js
│   ├── doramasyt.js
│   ├── estrenosdoramas.js
│   ├── doramasvip.js
│   ├── doramasgo.js
│   └── midoramafavorito.js
├── manifest.json           # Registro de providers
└── README.md
```

## Notas Importantes

- Los sitios de doramas modernos usan JavaScript para renderizar contenido
- Algunos providers pueden requerir ajustes según cambios en los sitios
- Las fuentes están especializadas en K-Dramas, C-Dramas, J-Dramas y doramas tailandeses
- Todo el contenido viene con subtítulos en español o latino

## Contribuir

Si conoces más sitios de doramas que funcionen, puedes agregarlos modificando el archivo correspondiente en `providers/`.

## Disclaimer

- **No se aloja contenido** en este repositorio
- Los providers obtienen contenido disponible públicamente
- El usuario es responsable de cumplir con las leyes locales
- Para temas de DMCA, contactar a los alojadores de contenido
