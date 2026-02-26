#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, obj) {
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

// Use current working directory as repository root
const root = process.cwd();
const manifestPath = path.join(root, 'manifest.json');
const packagePath = path.join(root, 'package.json');
const projectPackagePath = path.join(root, 'project', 'package.json');

try {
  const manifest = readJson(manifestPath);
  const targetVersion = manifest.version;
  if (!targetVersion) {
    console.error('manifest.json has no version field');
    process.exit(1);
  }

  const filesUpdated = [];

  const pkg = readJson(packagePath);
  if (pkg.version !== targetVersion) {
    pkg.version = targetVersion;
    writeJson(packagePath, pkg);
    filesUpdated.push(packagePath);
  }

  if (fs.existsSync(projectPackagePath)) {
    const projPkg = readJson(projectPackagePath);
    if (projPkg.version !== targetVersion) {
      projPkg.version = targetVersion;
      writeJson(projectPackagePath, projPkg);
      filesUpdated.push(projectPackagePath);
    }
  }

  if (filesUpdated.length === 0) {
    console.log('All versions already synchronized to', targetVersion);
  } else {
    console.log('Synchronized version to', targetVersion, 'in files:');
    filesUpdated.forEach(f => console.log(' -', f));
  }
} catch (err) {
  console.error('Error syncing versions:', err.message || err);
  process.exit(1);
}
