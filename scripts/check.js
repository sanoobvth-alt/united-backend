import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

async function files(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await files(path));
    else if (path.endsWith('.js')) out.push(path);
  }
  return out;
}
const sourceFiles = [...await files('src'), ...await files('scripts'), ...await files('prisma')];
let failed = false;
for (const file of sourceFiles) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) failed = true;
  const source = await readFile(file, 'utf8');
  if (/\b(require\s*\(|module\.exports)\b/.test(source)) { console.error(`CommonJS syntax found in ${file}`); failed = true; }
}
if (failed) process.exit(1);
console.info(`Syntax checked ${sourceFiles.length} JavaScript files`);
