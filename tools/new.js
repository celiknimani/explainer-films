// Start a new film from a template.  Usage: npm run new <name> [starter|explainer|engineering|sales|<existing film>]
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), [name, from = 'starter'] = process.argv.slice(2);
const ALIAS = { explainer: 'kosovo-electricity', engineering: 'liburna', sales: 'acme-sales' }, src = path.join(ROOT, 'films', ALIAS[from] || from), dst = path.join(ROOT, 'films', name || '');
if (!name || !/^[a-z0-9-]+$/.test(name)) { console.error('Usage: npm run new <name> [starter|explainer|engineering|sales]   (name: lowercase letters, digits, dashes)'); process.exit(1); }
if (!fs.existsSync(src)) { console.error(`No template "${from}".`); process.exit(1); }
if (fs.existsSync(dst)) { console.error(`films/${name} already exists.`); process.exit(1); }
fs.cpSync(src, dst, { recursive: true, filter: p => !/[\\/](out|narr)([\\/]|$)/.test(p) });
// A copy should not move or sound like its template: drop the template's explicit choices so the new name picks its own.
const edit = (f, fn) => { const p = path.join(dst, f); if (fs.existsSync(p)) fs.writeFileSync(p, fn(fs.readFileSync(p, 'utf8'))); };
edit('audio.py', s => s.replaceAll(ALIAS[from] || from, name).replace(/Mix\("([\w-]+)"(?:, kit="\w+")?\)/, 'Mix("$1", kit="auto")').replace(/m\.music\("[a-z]+"\)/, 'm.music()'));
edit('film.js', s => s.replace(/motion: '[a-z]+', transition: '[a-z]+', /, ''));
console.log(`Created films/${name} from ${ALIAS[from] || from}.\nNext:\n  1. Edit films/${name}/script.json (what the narrator says, phrase by phrase)\n  2. npm run narrate ${name}      (voice + cue times)\n  3. npm run preview ${name}      (edit film.js, reload)\n  4. npm run film ${name} -- --skip-narration   (render, sound, final mp4)\nMotion, transition, music mood and sound kit are picked from the film's name. To choose them yourself, set motion and transition in play() in film.js, and the mood and kit in audio.py.`);
