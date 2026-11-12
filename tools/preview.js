// Live preview in your browser, drawn by your own graphics card.  Usage: npm run preview [film] [style]
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { exec } from 'node:child_process';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), film = process.argv[2] || 'starter', style = process.argv[3] || 'toon', PORT = +(process.env.PORT || 5173);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.otf': 'font/otf', '.wav': 'audio/wav', '.mp4': 'video/mp4', '.jpg': 'image/jpeg', '.png': 'image/png' };
if (!fs.existsSync(path.join(ROOT, 'films', film, 'film.js'))) { console.error(`No film at films/${film}. Available: ${fs.readdirSync(path.join(ROOT, 'films')).join(', ')}`); process.exit(1); }
http.createServer((req, res) => { const p = path.normalize(path.join(ROOT, decodeURIComponent(req.url.split('?')[0])));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); fs.createReadStream(p).pipe(res);
}).listen(PORT, () => { const url = `http://localhost:${PORT}/engine/preview.html?film=${film}&style=${style}`; console.log(`Preview: ${url}\nEdit the film's files and reload the page. Ctrl+C to stop.`);
  exec(`${process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start ""' : 'xdg-open'} "${url}"`, () => {}); });
