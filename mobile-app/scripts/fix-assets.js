/**
 * Regenerate app store assets from a single source image.
 *
 * Produces:
 *   - assets/icon.png           1024x1024 opaque iOS/store icon
 *   - assets/adaptive-icon.png  1024x1024 foreground with ~66% safe zone, transparent bg
 *   - assets/splash.png         1242x2436 centered logo on the app's primary color
 *   - assets/favicon.png        48x48 web favicon
 *
 * The background color for splash & icon matches app.json's primaryColor.
 * Source priority:
 *   1. assets/source.png / source.jpg (preferred, commit a clean logo here)
 *   2. ../frontend/public/logo-icon.jpeg
 *   3. minimal transparent placeholder (so builds don't break in CI)
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const projectRoot = path.join(__dirname, '..');
const outDir = path.join(projectRoot, 'assets');
const BG = '#4F46E5';

function pickSource() {
  const candidates = [
    path.join(outDir, 'source.png'),
    path.join(outDir, 'source.jpg'),
    path.join(outDir, 'source.jpeg'),
    path.join(projectRoot, '..', 'frontend', 'public', 'logo-icon.jpeg'),
  ];
  return candidates.find((p) => fs.existsSync(p));
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

async function run() {
  const src = pickSource();
  if (!src) {
    console.warn('No source image found; writing placeholders.');
    await writePlaceholders();
    return;
  }
  console.log(`Using source: ${path.relative(projectRoot, src)}`);

  // iOS/store icon: 1024x1024 opaque, fill background with the brand color.
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: BG,
    },
  })
    .composite([
      {
        input: await sharp(src)
          .resize(720, 720, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer(),
        gravity: 'center',
      },
    ])
    .png()
    .toFile(path.join(outDir, 'icon.png'));

  // Android adaptive icon foreground: 1024x1024, transparent background, logo
  // confined to the inner ~66% safe zone (Google Play guidance).
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: await sharp(src)
          .resize(660, 660, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer(),
        gravity: 'center',
      },
    ])
    .png()
    .toFile(path.join(outDir, 'adaptive-icon.png'));

  // Splash: centered logo on solid primary color (1242x2436 covers iPhone + Android).
  await sharp({
    create: {
      width: 1242,
      height: 2436,
      channels: 4,
      background: BG,
    },
  })
    .composite([
      {
        input: await sharp(src)
          .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer(),
        gravity: 'center',
      },
    ])
    .png()
    .toFile(path.join(outDir, 'splash.png'));

  // Favicon: 48x48 opaque.
  await sharp({
    create: {
      width: 48,
      height: 48,
      channels: 4,
      background: BG,
    },
  })
    .composite([
      {
        input: await sharp(src)
          .resize(34, 34, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer(),
        gravity: 'center',
      },
    ])
    .png()
    .toFile(path.join(outDir, 'favicon.png'));

  console.log('Assets generated: icon.png, adaptive-icon.png, splash.png, favicon.png');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
