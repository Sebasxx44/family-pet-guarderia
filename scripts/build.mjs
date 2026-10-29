import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

// ==================== CONFIGURATION ====================
const root = process.cwd();
const siteUrl = (
  process.env.SITE_URL || "https://family-pet-sebaz.vercel.app"
).replace(/\/$/, "");
const originalUrl = "https://guarderiafamilypet.com";
const isOriginalDomain = [
  "guarderiafamilypet.com",
  "www.guarderiafamilypet.com",
].includes(new URL(siteUrl).hostname);
const robots = isOriginalDomain
  ? "index,follow,max-image-preview:large"
  : "noindex,follow";
/** @type {import('@/types').SiteRoute[]} */
const routes = JSON.parse(
  await readFile(join(root, "src/data/routes.json"), "utf8"),
);

// ==================== ICON TA ====================
/** @type {Record<string, string>} */
const paths = {
  arrow: '<path d="M6.5 17.5 17.5 6.5M6.5 6.5h11v11"/>',
  down: '<path d="M12 4v16m-6-6 6 6 6-6"/>',
  paw: '<ellipse cx="5.5" cy="9" rx="2.5" ry="3.4" transform="rotate(-22 5.5 9)"/><ellipse cx="11" cy="5.5" rx="2.2" ry="3"/><ellipse cx="17.2" cy="6.7" rx="2.2" ry="3" transform="rotate(18 17.2 6.7)"/><ellipse cx="21" cy="12.2" rx="2" ry="2.8" transform="rotate(30 21 12.2)"/><path d="M6 18c0-3 3.3-6.5 6-6.5s6 3.5 6 6.5c0 2-1.4 3-3 2.3a7 7 0 0 0-6 0C7.4 21 6 20 6 18Z"/>',
  heart:
    '<path d="M20 5.5c-2-2-5.5-1.7-8 1C9.5 3.8 6 3.5 4 5.5c-3 3 0 7 8 13 8-6 11-10 8-13Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  moon: '<path d="M20 14A8.5 8.5 0 0 1 10 4a8.5 8.5 0 1 0 10 10Z"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.3"/>',
  bus: '<rect x="4" y="4" width="16" height="14" rx="3"/><path d="M4 11h16M8 18v3m8-3v3M8 15h.1m7.9 0h.1M9 7h6"/>',
  check: '<path d="m5 12 4.5 4.5L19 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  instagram:
    '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".7" fill="currentColor" stroke="none"/>',
  whatsapp:
    '<path d="M20 11.5A8.5 8.5 0 0 1 7.4 19L3 20l1.2-4.1A8.5 8.5 0 1 1 20 11.5Z"/><path d="m8 7 1 3-1 1c1 2 2 3 4 4l1-1 3 1c-.4 2-2 3-4 2-4-1.8-7-5-6-8 .3-1 1-2 2-2Z"/>',
  bone: '<path d="m8 8 8 8m-4-11c2-2 5 0 4 2 2-1 4 2 2 4l-8 8c-2 2-5 0-4-2-2 1-4-2-2-4Z"/>',
};
/** @param {string} name */
const iconTA = (name) => {
  if (!paths[name]) throw new Error(`Icono no definido: ${name}`);
  return `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
};

// ==================== TEMPLATES ====================
const layout = await readFile(join(root, "src/layout.html"), "utf8");
const header = await readFile(
  join(root, "src/components/ActionHeaderTA.html"),
  "utf8",
);
const footer = await readFile(
  join(root, "src/components/FooterTA.html"),
  "utf8",
);
const runner = await readFile(
  join(root, "public/assets/dog-runner.svg"),
  "utf8",
);
const play = await readFile(join(root, "public/assets/dog-play.svg"), "utf8");
const sleep = await readFile(join(root, "public/assets/dog-sleep.svg"), "utf8");
/** @param {string} value */
const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

// ==================== PHOTO TA ====================
const photoTemplate = await readFile(
  join(root, "src/components/PhotoTA.html"),
  "utf8",
);
/** @type {Record<string, import('@/types').EditorialPhoto>} */
const editorialPhotos = JSON.parse(
  await readFile(join(root, "src/data/photos.json"), "utf8"),
);
/** @type {Record<string, string>} */
const heroSources = {
  home: editorialPhotos.manada.source,
  about: "/assets/familypet-equipo.jpg",
  services: editorialPhotos.manada.source,
  contact: "/assets/familypet-cercania.png",
};
/** @param {string} name @param {string} className */
const photoTA = (name, className) => {
  const photo = editorialPhotos[name];
  if (!photo) throw new Error(`Foto no definida: ${name}`);
  /** @type {Record<string, string>} */
  const attributes = {
    PHOTO_CLASS: className,
    PHOTO_CROP: photo.crop.join(" "),
    PHOTO_WIDTH: String(photo.crop[2]),
    PHOTO_HEIGHT: String(photo.crop[3]),
    PHOTO_POSITION: photo.position,
    PHOTO_SOURCE: photo.source,
    SOURCE_WIDTH: String(photo.width),
    SOURCE_HEIGHT: String(photo.height),
  };
  return photoTemplate.replace(/\{\{([A-Z_]+)\}\}/g, (token, key) =>
    escapeHtml(attributes[key] ?? token),
  );
};

/** @param {import('@/types').SiteRoute} route */
const structuredData = (route) =>
  JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${originalUrl}/#business`,
        name: "Guardería Campestre Family Pet",
        url: `${originalUrl}/`,
        telephone: "+573148664384",
        foundingDate: "2022-12-20",
        image: `${siteUrl}/assets/familypet-manada.webp`,
        description:
          "Guardería, hotel y pasadía canino en un entorno campestre en Pereira.",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Vereda Mangas, La Florida",
          addressLocality: "Pereira",
          addressRegion: "Risaralda",
          addressCountry: "CO",
        },
        sameAs: [
          "https://www.instagram.com/guarderiafamilypet/",
          "https://www.facebook.com/guarderiafamilypet/",
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${originalUrl}${route.path}#page`,
        url: `${originalUrl}${route.path}`,
        name: route.title,
        description: route.description,
        inLanguage: "es-CO",
        about: { "@id": `${originalUrl}/#business` },
      },
      ...(route.path === "/"
        ? []
        : [
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Inicio",
                  item: `${originalUrl}/`,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: route.label,
                  item: `${originalUrl}${route.path}`,
                },
              ],
            },
          ]),
    ],
  }).replaceAll("<", "\\u003c");

// ==================== STATIC BUILD ====================
await rm(join(root, "dist"), { recursive: true, force: true });
await cp(join(root, "public"), join(root, "dist"), { recursive: true });
const buildRoutes = [
  ...routes,
  {
    path: "/404.html",
    title: "Página no encontrada | Family Pet",
    description:
      "Vuelve a la manada y encuentra las experiencias de Family Pet.",
    template: "not-found",
    label: "Página no encontrada",
  },
];
for (const route of buildRoutes) {
  const content = await readFile(
    join(root, `src/pages/${route.template}.html`),
    "utf8",
  );
  const activeHeader = header.replace(
    `data-nav="${route.path}"`,
    `data-nav="${route.path}" aria-current="page"`,
  );
  /** @type {Record<string, string>} */
  const values = {
    TITLE: escapeHtml(route.title),
    DESCRIPTION: escapeHtml(route.description),
    CANONICAL: originalUrl + route.path,
    PAGE_URL: siteUrl + route.path,
    ROBOTS: route.template === "not-found" ? "noindex,follow" : robots,
    SCHEMA: structuredData(route),
    HEADER: activeHeader,
    FOOTER: footer,
    BODY: content,
    PAGE: route.template,
    DOG_RUNNER: runner,
    DOG_PLAY: play,
    DOG_SLEEP: sleep,
    PHOTO_PRELOAD: heroSources[route.template]
      ? `<link rel="preload" as="image" href="${heroSources[route.template]}" />`
      : "",
  };
  let html = layout.replace(
    /\{\{([A-Z_]+)\}\}/g,
    (token, name) => values[name] ?? token,
  );
  html = html
    .replace(/\{\{([A-Z_]+)\}\}/g, (token, name) => values[name] ?? token)
    .replace(/\{\{ICON:([a-z-]+)\}\}/g, (token, name) => iconTA(name))
    .replace(/\{\{PHOTO:([a-z-]+):([a-z-]+)\}\}/g, (token, name, className) =>
      photoTA(name, className),
    );
  if (/\{\{/.test(html))
    throw new Error(`Variable sin resolver: ${route.path}`);
  const target = route.path.endsWith(".html")
    ? join(root, "dist", route.path)
    : join(root, "dist", route.path, "index.html");
  await mkdir(join(target, ".."), { recursive: true });
  await writeFile(target, html);
}

// ==================== SEARCH MIGRATION ====================
/** @param {import('@/types').SiteRoute[]} entries */
const sitemap = (entries) =>
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map((route) => `<url><loc>${originalUrl}${route.path}</loc></url>`).join("")}</urlset>`;
await writeFile(join(root, "dist/sitemap.xml"), sitemap(routes));
await writeFile(
  join(root, "dist/page-sitemap.xml"),
  sitemap(routes.filter((route) => !route.template.startsWith("legacy"))),
);
await writeFile(
  join(root, "dist/post-sitemap.xml"),
  sitemap(routes.filter((route) => route.template === "legacy-post")),
);
await writeFile(
  join(root, "dist/category-sitemap.xml"),
  sitemap(routes.filter((route) => route.template === "legacy-category")),
);
await writeFile(
  join(root, "dist/sitemap_index.xml"),
  `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${["page", "post", "category"].map((type) => `<sitemap><loc>${originalUrl}/${type}-sitemap.xml</loc></sitemap>`).join("")}</sitemapindex>`,
);
await writeFile(
  join(root, "dist/robots.txt"),
  `User-agent: *\nAllow: /\n${isOriginalDomain ? `Sitemap: ${originalUrl}/sitemap_index.xml\n` : "# Propuesta: cada pagina incluye noindex,follow y canonical original.\n"}`,
);
console.log(
  `${routes.length} rutas generadas · ${isOriginalDomain ? "dominio original indexable" : "propuesta sin duplicar la indexación original"}`,
);
