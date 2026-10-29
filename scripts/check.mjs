import assert from "node:assert/strict";
import { readFile, readdir, access } from "node:fs/promises";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

// ==================== ROUTE AND SEARCH CHECKS ====================
const root = process.cwd();
/** @type {import('@/types').SiteRoute[]} */
const routes = JSON.parse(
  await readFile(join(root, "src/data/routes.json"), "utf8"),
);
const expectedPaths = [
  "/",
  "/quienes-somos/",
  "/servicios/",
  "/contacto/",
  "/hello-world/",
  "/category/uncategorized/",
];
assert.deepEqual(
  routes.map((route) => route.path).sort(),
  expectedPaths.sort(),
  "Deben conservarse las seis rutas originales.",
);
const isOriginal = [
  "guarderiafamilypet.com",
  "www.guarderiafamilypet.com",
].includes(
  new URL(process.env.SITE_URL || "https://family-pet-sebaz.vercel.app")
    .hostname,
);
for (const route of routes) {
  const html = await readFile(
    join(root, "dist", route.path, "index.html"),
    "utf8",
  );
  assert.equal(
    (html.match(/<h1[\s>]/g) || []).length,
    1,
    `${route.path}: debe tener un único H1.`,
  );
  assert(
    html.includes(
      `rel="canonical" href="https://guarderiafamilypet.com${route.path}"`,
    ),
    `${route.path}: canonical original.`,
  );
  assert(
    html.includes(
      `name="robots" content="${isOriginal ? "index,follow,max-image-preview:large" : "noindex,follow"}"`,
    ),
    `${route.path}: política de indexación.`,
  );
  assert(!html.includes("{{"), `${route.path}: variables resueltas.`);
  assert(
    !/[↗▶✳×]/u.test(html),
    `${route.path}: iconos SVG, sin glifos del sistema.`,
  );
  const schemaMatch = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  );
  assert(schemaMatch, `${route.path}: datos estructurados.`);
  assert.equal(JSON.parse(schemaMatch[1])["@context"], "https://schema.org");
  for (const match of html.matchAll(/(?:src|href)="(\/[^"#?]*)[^\"]*"/g)) {
    const target = join(root, "dist", match[1]);
    await access(match[1].endsWith("/") ? join(target, "index.html") : target);
  }
}
const sitemap = await readFile(join(root, "dist/sitemap.xml"), "utf8");
for (const route of routes)
  assert(
    sitemap.includes(`<loc>https://guarderiafamilypet.com${route.path}</loc>`),
  );
assert(
  (await readFile(join(root, "dist/404.html"), "utf8")).includes(
    "noindex,follow",
  ),
);

// ==================== JAVASCRIPT SYNTAX ====================
/** @param {string} directory */
const verifyModules = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = join(directory, entry.name);
    if (entry.isDirectory()) await verifyModules(target);
    else if (entry.name.endsWith(".js"))
      execFileSync(process.execPath, ["--check", target], { stdio: "pipe" });
  }
};
await verifyModules(join(root, "public"));
console.log(
  "6 rutas, enlaces locales, canonical, robots, sitemap, datos estructurados y módulos verificados.",
);
