// Shared by player.html and preview.html: load the bundled font, then the film named in the URL.
const FONTS = { 500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold' };
export async function boot() {
  await Promise.all(Object.entries(FONTS).map(async ([w, n]) => { const f = new FontFace('Inter', `url(./fonts/Inter-${n}.otf)`, { weight: w }); document.fonts.add(await f.load()); }));
  const film = new URLSearchParams(location.search).get('film');
  if (!film) { window.filmError = 'Add ?film=<name> to the URL'; return null; }
  try { await import(`../films/${film}/film.js`); } catch (e) { console.error(e); window.filmError = String(e); return null; }
  return film;
}
