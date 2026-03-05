const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const projectRoot = path.join(__dirname, '..');
const src = path.join(projectRoot, '../frontend/public/logo-icon.jpeg');
const outDir = path.join(projectRoot, 'assets');

if (!fs.existsSync(src)) {
  console.warn('Source image not found, creating minimal placeholder');
  const minimalPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );
  ['icon.png', 'splash.png', 'adaptive-icon.png'].forEach((f) => {
    fs.writeFileSync(path.join(outDir, f), minimalPng);
  });
  console.log('Wrote minimal placeholders to assets/');
  process.exit(0);
}

const size = 1024;
sharp(src)
  .resize(size, size)
  .png()
  .toFile(path.join(outDir, 'icon.png'))
  .then(() => sharp(src).resize(size, size).png().toFile(path.join(outDir, 'adaptive-icon.png')))
  .then(() => sharp(src).resize(size, size).png().toFile(path.join(outDir, 'splash.png')))
  .then(() => console.log('Assets generated: icon.png, adaptive-icon.png, splash.png'))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
