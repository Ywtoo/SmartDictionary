#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function writeJson(p, obj) { fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8'); }

const root = process.cwd();
const manifestPath = path.join(root, 'manifest.json');
const packagePath = path.join(root, 'package.json');
const releaseDir = path.join(root, 'release');

function bumpVersion(v) {
  const parts = v.split('.').map(n => parseInt(n, 10));
  parts[2] = (parts[2] || 0) + 1;
  return parts.join('.');
}

function run(cmd) {
  console.log('> ', cmd);
  execSync(cmd, { stdio: 'inherit' });
}

function copy(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const f of fs.readdirSync(src)) copy(path.join(src, f), path.join(dest, f));
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const opts = {};
  for (const a of args) {
    if (a.startsWith('--version=')) opts.version = a.split('=')[1];
    if (a === '--commit') opts.commit = true;
    if (a === '--tag') opts.tag = true;
  }

  // 1) ensure deps
  run('npm install');

  // 2) determine new version
  const manifest = readJson(manifestPath);
  const pkg = readJson(packagePath);
  let newVersion = opts.version || manifest.version;
  if (!opts.version) {
    newVersion = bumpVersion(manifest.version || pkg.version || '0.1.0');
  }

  // 3) update manifest version and sync package.json (call existing sync script if present)
  manifest.version = newVersion;
  writeJson(manifestPath, manifest);
  console.log('Updated', manifestPath, '->', newVersion);

  // If a sync script exists, run it to update package.json
  const syncScript = path.join(root, 'tools', 'syncVersion.js');
  if (fs.existsSync(syncScript)) {
    run(`node "${syncScript}"`);
  } else {
    // fallback: update package.json version to match
    pkg.version = newVersion;
    writeJson(packagePath, pkg);
  }

  // 4) build
  run('npm run build');

  // 5) prepare release folder
  if (fs.existsSync(releaseDir)) {
    fs.rmSync(releaseDir, { recursive: true, force: true });
  }
  fs.mkdirSync(releaseDir, { recursive: true });

  // copy required files
  copy(path.join(root, 'dist'), path.join(releaseDir, 'dist'));
  copy(manifestPath, path.join(releaseDir, 'manifest.json'));
  copy(path.join(root, 'icons'), path.join(releaseDir, 'icons'));
  copy(path.join(root, 'popup'), path.join(releaseDir, 'popup'));
  copy(path.join(root, 'background.js'), path.join(releaseDir, 'background.js'));
  copy(path.join(root, 'README.md'), path.join(releaseDir, 'README.md'));
  copy(path.join(root, 'LICENSE'), path.join(releaseDir, 'LICENSE'));

  // 6) create zip
  const zipName = `SmartDictionary-v${newVersion}.zip`;
  const zipPath = path.join(root, zipName);
  try { fs.unlinkSync(zipPath); } catch(e){}
  if (process.platform === 'win32') {
    // use PowerShell Compress-Archive
    run(`powershell Compress-Archive -Path "${releaseDir}\\*" -DestinationPath "${zipPath}" -Force`);
  } else {
    run(`zip -r "${zipPath}" "${releaseDir}"`);
  }

  console.log('Release created:', zipPath);

  // 7) optional commit/tag
  if (opts.commit) {
    run('git add package.json manifest.json');
    run(`git commit -m "chore(release): v${newVersion}"`);
    if (opts.tag) {
      run(`git tag -a v${newVersion} -m "v${newVersion}"`);
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
