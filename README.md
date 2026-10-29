# Family Pet · Propuesta web

Rediseño de la guardería campestre Family Pet en Pereira, con fotografía oficial, ilustraciones SVG y una experiencia canina conectada al scroll.

## Desarrollo

`npm run dev` genera la web y la sirve en `http://127.0.0.1:4174`. No requiere dependencias. `npm run build` genera `dist/` y `npm run check` revisa rutas, SEO, recursos y módulos.

Las páginas se construyen desde `src/pages/`, con `ActionHeaderTA` y `FooterTA` compartidos. La lógica del navegador vive en composables separados dentro de `public/composables/`. Los iconos se generan como SVG, sin emojis ni fuentes de iconos.

## Publicación e indexación

- Propuesta: https://family-pet-sebaz.vercel.app/
- Código: https://github.com/Sebasxx44/family-pet-guarderia
- Portafolio: https://sebaz.online/

Se conservan las seis rutas del sitemap original: inicio, quiénes somos, servicios, contacto y dos archivos heredados de WordPress. También se generan los índices XML existentes. La auditoría está en `research/seo-audit.json`.

La propuesta usa `noindex,follow` y canonical hacia la dirección original para evitar contenido duplicado. Para migrar al dominio original, configura `SITE_URL=https://guarderiafamilypet.com` en Vercel y publica: el build activa `index,follow` y el sitemap original. La indexación y el posicionamiento dependen de los buscadores; no se ha modificado el sitio original ni su DNS.

Las fotografías pertenecen a Family Pet; sus fuentes están documentadas en `public/assets/assets-manifest.json`. Las ilustraciones vectoriales son originales de esta propuesta. El formulario prepara un mensaje de WhatsApp y el visitante decide cuándo enviarlo; no almacena datos ni confirma reservas automáticamente.
