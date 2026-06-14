// Rend en UNE commande tout ce qui existe pour un jour : carrousel (content.json),
// stories, et la preview (preview.json) si elle est là. But : 2 commandes/jour
//   1) npm run fetch -- --date=J --draft --preview   (données + drafts)
//   2) [relecture/édition du draft]  puis  npm run build -- --date=J
//
// Usage : npm run build -- --date=YYYY-MM-DD|nom-dossier
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const dateArg = args.find((a) => a.startsWith('--date='));
const date = dateArg ? dateArg.split('=')[1] : null;
if (!date) {
  console.error('Usage: npm run build -- --date=YYYY-MM-DD');
  process.exit(1);
}

const dir = join(ROOT, 'content', date);
const run = (script, extra = []) => {
  const r = spawnSync(process.execPath, [join(ROOT, 'scripts', script), ...args, ...extra], { stdio: 'inherit' });
  if (r.status !== 0) process.exitCode = r.status || 1;
};

if (existsSync(join(dir, 'content.json'))) {
  console.log(`\n▶ Carrousel — ${date}`);
  run('render.mjs');
  console.log(`\n▶ Stories — ${date}`);
  run('stories.mjs');
} else {
  console.log(`(pas de content.json pour ${date} — carrousel/stories sautés)`);
}

if (existsSync(join(dir, 'preview.json'))) {
  console.log(`\n▶ Preview — ${date}`);
  run('render.mjs', ['--file=preview.json']);
}

if (existsSync(join(dir, 'third.json'))) {
  console.log(`\n▶ 3e post — ${date}`);
  run('render.mjs', ['--file=third.json']);
}

console.log('\n✓ build terminé.');
