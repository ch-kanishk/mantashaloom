/**
 * Regenerate assets/logo-source.png for the Mantashaloom brand.
 *
 * The brand SVGs in public/brand are potrace *tracings* of this bitmap, so the
 * lettering cannot be edited after the fact — a rename means redrawing the
 * source. This script lays out the three content bands at exactly the offsets
 * gen-brand.mjs slices out (see BOX there), so the derived assets and the
 * aspect ratios hard-coded in src/components/Logo.tsx stay valid:
 *
 *   monogram  46,112  384x202
 *   wordmark  46,326  384x38
 *   tagline   below, inside the 384x286 "full" band
 *
 * Each element is rendered on its own, trimmed to its ink bounds and then
 * placed, so the result does not depend on font metrics guessed in advance.
 *
 * The canvas is drawn at SCALE x the 500x500 layout above. The original artwork
 * was a 500px photo-like bitmap whose heavy Didone strokes traced cleanly at
 * that size; generated text is much thinner, and the 21-character tagline ends
 * up ~15px tall at 1x, which potrace renders as mush. gen-brand.mjs shares the
 * same SCALE so its slice boxes stay aligned.
 *
 * Replace assets/logo-source.png with real artwork and re-run `npm run brand`
 * to skip this step entirely.
 */
import { promises as fs } from 'fs';
import sharp from 'sharp';

// Keep in step with SCALE in gen-brand.mjs.
const SCALE = 4;
const box = (left, top, width, height) => ({
  left: left * SCALE, top: top * SCALE, width: width * SCALE, height: height * SCALE,
});

const SERIF = 'Liberation Serif, DejaVu Serif, FreeSerif, serif';

/** Render one line of text and trim it to the pixels actually inked. */
async function ink(markup, w, h) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${markup}</svg>`;
  return sharp(Buffer.from(svg), { density: 300 })
    .png()
    .toBuffer()
    .then((buf) => sharp(buf).trim({ threshold: 1 }).png().toBuffer());
}

/** Scale a trimmed element to fit inside box, preserving aspect, and centre it. */
async function place(buffer, box) {
  const meta = await sharp(buffer).metadata();
  const scale = Math.min(box.width / meta.width, box.height / meta.height);
  const w = Math.max(1, Math.round(meta.width * scale));
  const h = Math.max(1, Math.round(meta.height * scale));
  return {
    input: await sharp(buffer).resize(w, h, { kernel: 'lanczos3' }).png().toBuffer(),
    left: box.left + Math.round((box.width - w) / 2),
    top: box.top + Math.round((box.height - h) / 2),
  };
}

// ---- Mark: a hand-knotted rug seen from above, landscape so it fills the wide
// band gen-brand.mjs slices out. Fringed ends, a border of small lozenges,
// corner spandrels, and a stepped kilim medallion with the M knocked out of it.
const diamond = (cx, cy, r, attrs) =>
  `<path d="M${cx} ${cy - r}L${cx + r} ${cy}L${cx} ${cy + r}L${cx - r} ${cy}Z" ${attrs}/>`;

/** Stepped (kilim) diamond: the union of n stacked rectangles. */
const stepped = (cx, cy, rx, ry, n, fill) =>
  Array.from({ length: n }, (_, i) => {
    const w = (2 * rx * (i + 1)) / n;
    const h = (2 * ry * (n - i)) / n;
    return `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" fill="${fill}"/>`;
  }).join('');

const RUG = { x0: 80, x1: 640, y0: 40, y1: 320 };   // rug body, fringes outside it
const rugMark = (() => {
  const { x0, x1, y0, y1 } = RUG;
  const parts = [];

  // Fringes: knotted warp ends on the short sides
  for (let y = y0 + 14; y <= y1 - 14; y += 18) {
    parts.push(`<line x1="${x0 - 46}" y1="${y}" x2="${x0}" y2="${y}" stroke="#000" stroke-width="7" stroke-linecap="round"/>`);
    parts.push(`<line x1="${x1}" y1="${y}" x2="${x1 + 46}" y2="${y}" stroke="#000" stroke-width="7" stroke-linecap="round"/>`);
  }

  // Outer selvedge and inner guard line
  parts.push(`<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="#000"/>`);
  parts.push(`<rect x="${x0 + 12}" y="${y0 + 12}" width="${x1 - x0 - 24}" height="${y1 - y0 - 24}" fill="#fff"/>`);

  // Border band of small solid lozenges
  const bx0 = x0 + 30, bx1 = x1 - 30, by0 = y0 + 30, by1 = y1 - 30;
  const lz = 'fill="#000"';
  for (let x = bx0; x <= bx1 + 0.1; x += (bx1 - bx0) / 14) {
    parts.push(diamond(x, by0, 9, lz), diamond(x, by1, 9, lz));
  }
  for (let y = by0; y <= by1 + 0.1; y += (by1 - by0) / 6) {
    parts.push(diamond(bx0, y, 9, lz), diamond(bx1, y, 9, lz));
  }

  // Field, framed by a thin guard
  const fx0 = x0 + 48, fx1 = x1 - 48, fy0 = y0 + 48, fy1 = y1 - 48;
  parts.push(`<rect x="${fx0}" y="${fy0}" width="${fx1 - fx0}" height="${fy1 - fy0}" fill="#000"/>`);
  parts.push(`<rect x="${fx0 + 6}" y="${fy0 + 6}" width="${fx1 - fx0 - 12}" height="${fy1 - fy0 - 12}" fill="#fff"/>`);

  // Corner spandrels
  const s = 58, ix0 = fx0 + 6, ix1 = fx1 - 6, iy0 = fy0 + 6, iy1 = fy1 - 6;
  parts.push(
    `<path d="M${ix0} ${iy0}h${s}L${ix0} ${iy0 + s}Z" fill="#000"/>`,
    `<path d="M${ix1} ${iy0}h${-s}L${ix1} ${iy0 + s}Z" fill="#000"/>`,
    `<path d="M${ix0} ${iy1}h${s}L${ix0} ${iy1 - s}Z" fill="#000"/>`,
    `<path d="M${ix1} ${iy1}h${-s}L${ix1} ${iy1 - s}Z" fill="#000"/>`
  );

  // Side guls flanking the medallion
  const cy = (y0 + y1) / 2, cx = (x0 + x1) / 2;
  for (const gx of [fx0 + 62, fx1 - 62]) {
    parts.push(diamond(gx, cy, 26, 'fill="none" stroke="#000" stroke-width="8"'));
    parts.push(diamond(gx, cy, 8, 'fill="#000"'));
  }

  // Central stepped medallion, white inner step, knocked-out M
  parts.push(stepped(cx, cy, 128, 84, 6, '#000'));
  parts.push(`<text x="${cx}" y="${cy + 38}" text-anchor="middle" font-family="${SERIF}" font-weight="bold" font-size="108" fill="#fff">M</text>`);
  return parts.join('\n');
})();

const monogram = await ink(rugMark, 720, 360);

// ---- Wordmark: letterspaced serif caps --------------------------------------
const wordmark = await ink(
  `<text x="10" y="60" font-family="${SERIF}" font-size="56" letter-spacing="14"
         fill="#000">MANTASHALOOM</text>`,
  900,
  90
);

// ---- Tagline ---------------------------------------------------------------
const tagline = await ink(
  `<text x="10" y="60" font-family="${SERIF}" font-weight="bold" font-size="46"
         letter-spacing="1" fill="#000">HANDMADE RUGS &amp; CARPETS</text>`,
  900,
  90
);

const layers = await Promise.all([
  place(monogram, box(46, 112, 384, 202)),
  place(wordmark, box(46, 326, 384, 38)),
  place(tagline, box(118, 380, 240, 18)),
]);

await sharp({
  create: { width: 500 * SCALE, height: 500 * SCALE, channels: 3, background: '#ffffff' },
})
  .composite(layers)
  .png()
  .toFile('assets/logo-source.png');

console.log(`assets/logo-source.png rebuilt (${500 * SCALE}x${500 * SCALE})`);
for (const [i, name] of ['monogram', 'wordmark', 'tagline'].entries()) {
  console.log(`  ${name} placed at ${layers[i].left},${layers[i].top}`);
}
await fs.access('assets/logo-source.png');
