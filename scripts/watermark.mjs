import sharp from "sharp";
import { readdirSync, statSync, writeFileSync, renameSync } from "fs";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const logoPath = join(__dirname, "assets", "watermark-logo.png");

const WATERMARK_WIDTH_RATIO = 0.26; // % da largura da foto
const OPACITY = 0.75;
const MARGIN_RATIO = 0.025;

const skipDirs = new Set(["scripts", "node_modules", ".git"]);

function imageFolders(root) {
  return readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !skipDirs.has(d.name) && !d.name.startsWith("."))
    .map((d) => join(root, d.name));
}

async function makeWatermark(targetWidth) {
  const w = Math.round(targetWidth * WATERMARK_WIDTH_RATIO);
  const resized = await sharp(logoPath).resize({ width: w }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { data, info } = resized;
  for (let i = 3; i < data.length; i += 4) {
    data[i] = Math.round(data[i] * OPACITY);
  }
  return sharp(data, { raw: info }).png().toBuffer();
}

async function watermarkImage(filePath) {
  const img = sharp(filePath);
  const meta = await img.metadata();
  const wm = await makeWatermark(meta.width);
  const wmMeta = await sharp(wm).metadata();
  const margin = Math.round(meta.width * MARGIN_RATIO);
  const left = margin; // canto inferior ESQUERDO — o direito já tem o selo CRECI/SC existente
  const top = meta.height - wmMeta.height - margin;

  const out = await sharp(filePath)
    .composite([{ input: wm, left, top }])
    .jpeg({ quality: 90 })
    .toBuffer();

  return out;
}

async function run(targetFolders) {
  const folders = targetFolders.length ? targetFolders.map((f) => join(repoRoot, f)) : imageFolders(repoRoot);
  let count = 0;
  for (const folder of folders) {
    let files;
    try {
      files = readdirSync(folder);
    } catch {
      console.warn(`Pasta não encontrada: ${folder}`);
      continue;
    }
    for (const file of files) {
      if (!/\.(jpe?g)$/i.test(file)) continue;
      const full = join(folder, file);
      if (!statSync(full).isFile()) continue;
      const out = await watermarkImage(full);
      const tmp = full + ".tmp";
      writeFileSync(tmp, out);
      renameSync(tmp, full);
      count++;
    }
    console.log(`OK: ${basename(folder)}`);
  }
  console.log(`Marca d'água aplicada em ${count} fotos.`);
}

const args = process.argv.slice(2);
run(args);
