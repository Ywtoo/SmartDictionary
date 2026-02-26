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
  let newVersion = manifest.version;
  // Only change the version if user explicitly passed --version
  if (opts.version) {
    newVersion = opts.version;
    // update manifest version
    manifest.version = newVersion;
    writeJson(manifestPath, manifest);
    console.log('Updated', manifestPath, '->', newVersion);
  } else {
    console.log('No --version supplied: keeping manifest version', newVersion);
  }

  // If a sync script exists, run it to update package.json (this will be a no-op if versions already match)
  const syncScript = path.join(root, 'tools', 'syncVersion.js');
  if (fs.existsSync(syncScript)) {
    run(`node "${syncScript}"`);
  } else {
    // fallback: update package.json version to match (only if user provided --version)
    if (opts.version) {
      pkg.version = newVersion;
      writeJson(packagePath, pkg);
    }
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
  // include styles referenced by manifest
  copy(path.join(root, 'styles'), path.join(releaseDir, 'styles'));
  copy(path.join(root, 'popup'), path.join(releaseDir, 'popup'));
  copy(path.join(root, 'background.js'), path.join(releaseDir, 'background.js'));
  copy(path.join(root, 'README.md'), path.join(releaseDir, 'README.md'));
  copy(path.join(root, 'LICENSE'), path.join(releaseDir, 'LICENSE'));

  // 6) create zip
  const zipName = `SmartDictionary-v${newVersion}.zip`;
  const zipPath = path.join(releaseDir, zipName);
  try { fs.unlinkSync(zipPath); } catch(e){}
  if (process.platform === 'win32') {
    // use PowerShell Compress-Archive with robust quoting to handle spaces in paths
    // Build a command string that wraps paths in single quotes inside the -Command argument
    const safeReleaseDir = releaseDir.replace(/'/g, "''");
    const safeZipPath = zipPath.replace(/'/g, "''");
    const psCmd = `powershell -NoProfile -Command "Compress-Archive -Path '${safeReleaseDir}\\*' -DestinationPath '${safeZipPath}' -Force"`;
    run(psCmd);
  } else {
    run(`zip -r "${zipPath}" "${releaseDir}"`);
  }

  console.log('Release created:', zipPath);

  // Note: commit/tag intentionally skipped — this script only creates the release ZIP.
}

main().catch(err => { console.error(err); process.exit(1); });
