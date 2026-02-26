import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const repoRoot = process.cwd();
const iconsDir = path.join(repoRoot, 'icons');
const outDirDefault = path.join(iconsDir, 'generated');
const sizes = [16, 32, 48, 128];

function findSource() {
  const candidates = ['icon128.png', 'icon.png', 'icon48.png', 'icon32.png', 'icon16.png'];
  for (const c of candidates) {
    const p = path.join(iconsDir, c);
    if (fs.existsSync(p)) return p;
  }
  throw new Error('No source icon found in icons/');
}

async function makeIcon(size, srcPath, outPath) {
  const innerScale = 0.8;
  const innerSize = Math.max(1, Math.round(size * innerScale));

  const srcBuffer = await sharp(srcPath)
    .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const svgCircle = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="#ffffff"/></svg>`;

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([
      { input: Buffer.from(svgCircle), gravity: 'centre' },
      { input: srcBuffer, gravity: 'centre' }
    ])
    .png()
    .toFile(outPath);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const apply = args.includes('--apply');
    const outDir = apply ? iconsDir : outDirDefault;

    let srcArg = null;
    let srcSizeArg = null;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--src' && args[i+1]) { srcArg = args[i+1]; i++; }
      if (args[i] === '--src-size' && args[i+1]) { srcSizeArg = parseInt(args[i+1], 10); i++; }
    }

    const src = srcArg ? path.join(repoRoot, srcArg) : findSource();
    console.log('Using source icon:', src);

    ensureDir(outDir);

    let finalSrc = src;
    if (srcSizeArg) {
      const resizedSrc = path.join(outDir, `src-resized-${srcSizeArg}.png`);
      await sharp(src).resize(srcSizeArg, srcSizeArg, { fit: 'contain', background: { r:0,g:0,b:0,alpha:0 } }).png().toFile(resizedSrc);
      finalSrc = resizedSrc;
      console.log('Created resized source', resizedSrc);
    }

    if (apply) {
      const backupDir = path.join(iconsDir, `backup-${Date.now()}`);
      ensureDir(backupDir);
      for (const s of sizes) {
        const p = path.join(iconsDir, `icon${s}.png`);
        if (fs.existsSync(p)) fs.copyFileSync(p, path.join(backupDir, `icon${s}.png`));
      }
      const pMain = path.join(iconsDir, 'icon.png');
      if (fs.existsSync(pMain)) fs.copyFileSync(pMain, path.join(backupDir, 'icon.png'));
      console.log('Backed up current icons to', backupDir);
    }

    for (const s of sizes) {
      const outFile = path.join(outDir, `icon${s}.png`);
      await makeIcon(s, finalSrc, outFile);
      console.log('Wrote', outFile);
    }

    await makeIcon(128, finalSrc, path.join(outDir, 'icon.png'));

    if (!apply) {
      console.log('Icons generated in', outDir, "— run 'npm run apply-icons' to overwrite icons/");
    } else {
      console.log('Icons applied to', iconsDir);
    }

  } catch (err) {
    console.error('Failed to generate icons:', err);
    process.exit(1);
  }
}

main();
