/**
 * Regenerate app store assets from source images.
 *
 * Sources (drop them in assets/ and re-run):
 *   - assets/logomark.{png,jpg,jpeg}  (preferred) — square mark only,
 *                                      used for icon/adaptive-icon/favicon.
 *   - assets/source.{png,jpg,jpeg}    (preferred) — full logo (mark + wordmark),
 *                                      used for splash. Falls back to icon
 *                                      sources if no logomark is provided.
 *
 * Outputs:
 *   assets/icon.png           1024×1024 opaque, brand bg, logomark filling ~80%.
 *   assets/adaptive-icon.png  1024×1024 transparent bg, logomark in 66% safe zone
 *                             (Android Material guidance).
 *   assets/splash.png         1242×2436 full logo on brand bg.
 *   assets/favicon.png        48×48 brand bg with logomark.
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const projectRoot = path.join(__dirname, '..');
const outDir = path.join(projectRoot, 'assets');
// Splash + Android adaptive-icon background use the brand color.
// Store / iOS icon uses a white tile so the multicolor mark stays legible
// at small sizes (matches the "colored-logo-on-white-tile" pattern used by
// most Google and Apple-style apps).
const BRAND_BG = '#4F46E5';
const ICON_BG = '#FFFFFF';

const ICON_FILES = ['logomark.png', 'logomark.jpg', 'logomark.jpeg'];
const SOURCE_FILES = ['source.png', 'source.jpg', 'source.jpeg'];

function pick(names) {
  for (const n of names) {
    const p = path.join(outDir, n);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function writePlaceholders() {
  const placeholder = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  );
  ['icon.png', 'splash.png', 'adaptive-icon.png', 'favicon.png'].forEach((f) => {
    fs.writeFileSync(path.join(outDir, f), placeholder);
  });
  console.log('Wrote minimal placeholders to assets/');
}

/**
 * If a dedicated logomark file exists, use it as-is. Otherwise crop a
 * top-anchored square out of `source` so we exclude any wordmark / tagline
 * sitting below the symbol.
 */
async function deriveLogomarkBuffer(logomarkPath, sourcePath) {
  if (logomarkPath) {
    return fs.readFileSync(logomarkPath);
  }
  const meta = await sharp(sourcePath).metadata();
  const w = meta.width || 1;
  const h = meta.height || 1;
  // Heuristic: assume the symbol occupies ~70% of the source's height,
  // centered horizontally, anchored at the top. Adjust if needed.
  const side = Math.min(w, Math.floor(h * 0.7));
  return sharp(sourcePath)
    .extract({
      left: Math.max(0, Math.floor((w - side) / 2)),
      top: 0,
      width: side,
      height: side,
    })
    .png()
    .toBuffer();
}

async function compose({ width, height, bg, inner, innerSize }) {
  return sharp({
    create: { width, height, channels: 4, background: bg },
  }).composite([
    {
      input: await sharp(inner)
        .resize(innerSize, innerSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer(),
      gravity: 'center',
    },
  ]);
}

async function run() {
  const logomark = pick(ICON_FILES);
  const source = pick(SOURCE_FILES);

  if (!logomark && !source) {
    console.warn('No logomark.* or source.* found in assets/; writing placeholders.');
    await writePlaceholders();
    return;
  }

  console.log(`Logomark: ${logomark ? path.basename(logomark) : '(derived from ' + path.basename(source) + ')'}`);
  console.log(`Splash source: ${path.basename(source || logomark)}`);

  const logomarkBuf = await deriveLogomarkBuffer(logomark, source || logomark);
  const splashSource = source || logomark;

  await (
    await compose({ width: 1024, height: 1024, bg: ICON_BG, inner: logomarkBuf, innerSize: 880 })
  )
    .png()
    .toFile(path.join(outDir, 'icon.png'));

  await (
    await compose({
      width: 1024,
      height: 1024,
      bg: { r: 0, g: 0, b: 0, alpha: 0 },
      inner: logomarkBuf,
      innerSize: 660,
    })
  )
    .png()
    .toFile(path.join(outDir, 'adaptive-icon.png'));

  await (
    await compose({ width: 1242, height: 2436, bg: ICON_BG, inner: splashSource, innerSize: 820 })
  )
    .png()
    .toFile(path.join(outDir, 'splash.png'));

  await (
    await compose({ width: 48, height: 48, bg: ICON_BG, inner: logomarkBuf, innerSize: 44 })
  )
    .png()
    .toFile(path.join(outDir, 'favicon.png'));

  console.log('Assets generated: icon.png, adaptive-icon.png, splash.png, favicon.png');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
