import { mkdir, readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { basename, extname, join, resolve } from "node:path";

// ==================== TYPES ====================
/** @typedef {{ width?: number, height?: number, orientation?: number }} MasterMetadata */
/** @typedef {{ width: number, height: number, size: number }} EncodedImage */
/**
 * @typedef {object} ImagePipeline
 * @property {() => Promise<MasterMetadata>} metadata
 * @property {() => ImagePipeline} rotate
 * @property {(options: { width: number, withoutEnlargement: boolean }) => ImagePipeline} resize
 * @property {(options: { quality: number, effort: number, smartSubsample: boolean }) => ImagePipeline} webp
 * @property {(destination: string) => Promise<EncodedImage>} toFile
 */
/** @typedef {{ file: string, width: number, height: number, bytes: number }} ImageVariant */
/** @typedef {{ source: string, width: number, height: number, variants: ImageVariant[] }} PreparedMaster */

// ==================== CLI OPTIONS ====================
const argumentsList = process.argv.slice(2);
const readOption = (/** @type {string} */ flag, fallback = "") => {
  const index = argumentsList.indexOf(flag);
  if (index === -1) return fallback;
  const value = argumentsList[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`Falta el valor de ${flag}.`);
  return value;
};

const main = async () => {
  if (argumentsList.includes("--help")) {
    console.log([
      "Genera WebP responsive desde masters HD, sin ampliar ni recortar.",
      "Uso: node scripts/prepare-image-variants.mjs --input /ruta/masters --output /ruta/public/assets/responsive --sharp-path /ruta/node_modules/sharp",
      "Opciones: --widths 480,768,1280,1920,2048,2560 --quality 84 --min-master-width 1600 --dry-run",
      "No instala dependencias ni modifica HTML, CSS, build o manifests. El resumen JSON se escribe en stdout.",
    ].join("\n"));
    return;
  }

  const inputArgument = readOption("--input");
  if (!inputArgument) throw new Error("Indica el directorio de masters HD con --input.");
  const inputDirectory = resolve(inputArgument);
  const outputDirectory = resolve(readOption("--output", "public/assets/responsive"));
  if (inputDirectory === outputDirectory) throw new Error("Los masters y las variantes deben estar en directorios distintos.");
  const requestedWidths = [...new Set(readOption("--widths", "480,768,1280,1920,2048,2560").split(",").map(Number))].sort((a, b) => a - b);
  const quality = Number(readOption("--quality", "84"));
  const minimumWidth = Number(readOption("--min-master-width", "1600"));
  const dryRun = argumentsList.includes("--dry-run");
  if (!requestedWidths.length || requestedWidths.some((width) => !Number.isInteger(width) || width < 1)) throw new Error("Los anchos deben ser enteros positivos.");
  if (!Number.isInteger(quality) || quality < 1 || quality > 100) throw new Error("La calidad debe estar entre 1 y 100.");
  if (!Number.isInteger(minimumWidth) || minimumWidth < 1) throw new Error("El ancho mínimo del master debe ser positivo.");

  // ==================== LOCAL ENCODER ====================
  const require = createRequire(import.meta.url);
  /** @type {(source: string) => ImagePipeline} */
  const sharp = require(readOption("--sharp-path", "sharp"));
  const entries = (await readdir(inputDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && /\.(avif|jpe?g|png|webp)$/i.test(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name));
  if (!entries.length) throw new Error("El directorio no contiene masters compatibles.");
  const stems = entries.map((entry) => basename(entry.name, extname(entry.name)));
  if (new Set(stems).size !== stems.length) throw new Error("Hay masters con el mismo nombre base; renómbralos para evitar sobrescribir variantes.");
  /** @type {PreparedMaster[]} */
  const prepared = [];
  /** @type {Array<{ source: string, reason: string }>} */
  const skipped = [];

  // ==================== RESPONSIVE VARIANTS ====================
  for (const entry of entries) {
    const source = join(inputDirectory, entry.name);
    const metadata = await sharp(source).metadata();
    if (!metadata.width || !metadata.height) throw new Error(`No se pudieron leer las dimensiones de ${entry.name}.`);
    const rotated = (metadata.orientation || 1) >= 5;
    const sourceWidth = rotated ? metadata.height : metadata.width;
    const sourceHeight = rotated ? metadata.width : metadata.height;
    if (sourceWidth < minimumWidth) {
      skipped.push({ source: entry.name, reason: `Master de ${sourceWidth}px; mínimo requerido ${minimumWidth}px. No se amplía.` });
      continue;
    }
    const maximumWidth = requestedWidths[requestedWidths.length - 1];
    const widths = [...new Set([
      ...requestedWidths.filter((width) => width <= sourceWidth),
      Math.min(sourceWidth, maximumWidth),
    ])].sort((a, b) => a - b);
    /** @type {ImageVariant[]} */
    const variants = [];
    for (const width of widths) {
      const file = `${basename(entry.name, extname(entry.name))}-${width}.webp`;
      if (dryRun) {
        variants.push({ file, width, height: Math.round(sourceHeight * width / sourceWidth), bytes: 0 });
        continue;
      }
      await mkdir(outputDirectory, { recursive: true });
      const result = await sharp(source)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality, effort: 5, smartSubsample: true })
        .toFile(join(outputDirectory, file));
      variants.push({ file, width: result.width, height: result.height, bytes: result.size });
    }
    prepared.push({ source: entry.name, width: sourceWidth, height: sourceHeight, variants });
  }

  // ==================== REPORT ====================
  console.log(JSON.stringify({ dryRun, outputDirectory, prepared, skipped }, null, 2));
  if (!prepared.length) process.exitCode = 2;
};

await main();
