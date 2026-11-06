/**
 * Generates placeholder rug artwork into public/demo so the seeded catalogue
 * looks like a rug shop until real product photography is added in the admin.
 * The order of RUGS matches PRODUCTS in prisma/seed.ts.
 */
import { promises as fs } from 'fs';
import sharp from 'sharp';

const PALETTES = {
  Ivory: ['#efe7d8', '#b9a98c', '#6f5f4b', '#d9cbb3'],
  Beige: ['#d6c4a8', '#8f7557', '#f0e6d4', '#b49b7a'],
  Blue: ['#27415f', '#d8cdb8', '#8a3f2c', '#4e6f91'],
  Charcoal: ['#34363a', '#a8a39a', '#e4ddd0', '#5a5c60'],
  Rust: ['#a24f2d', '#e6d3b4', '#2f3b4a', '#c98255'],
  Green: ['#4f6348', '#e2d8c0', '#b98a3e', '#75896a'],
  Gold: ['#c09a4c', '#5b3a22', '#f1e6c8', '#8f6f33'],
  Grey: ['#a4a3a0', '#ecebe7', '#4d4d4f', '#c7c6c2'],
};

const RUGS = [
  ['Traditional', 'Ivory', 'Rectangle'], ['Traditional', 'Blue', 'Rectangle'], ['Geometric', 'Beige', 'Rectangle'],
  ['Modern', 'Charcoal', 'Rectangle'], ['Traditional', 'Blue', 'Rectangle'], ['Transitional', 'Rust', 'Rectangle'],
  ['Traditional', 'Ivory', 'Runner'], ['Geometric', 'Green', 'Rectangle'], ['Modern', 'Beige', 'Round'],
  ['Traditional', 'Gold', 'Rectangle'], ['Abstract', 'Grey', 'Rectangle'], ['Modern', 'Ivory', 'Runner'],
];

const W = 900, H = 1125;
const diamond = (cx, cy, rx, ry, fill, extra = '') =>
  `<path d="M${cx} ${cy - ry}L${cx + rx} ${cy}L${cx} ${cy + ry}L${cx - rx} ${cy}Z" fill="${fill}" ${extra}/>`;

function border(w, h, c) {
  let out = `<rect width="${w}" height="${h}" fill="${c[1]}"/><rect x="22" y="22" width="${w - 44}" height="${h - 44}" fill="${c[2]}"/>`;
  out += `<rect x="34" y="34" width="${w - 68}" height="${h - 68}" fill="${c[3]}"/>`;
  for (let x = 58; x < w - 50; x += 44) {
    out += diamond(x, 56, 15, 15, c[2]) + diamond(x, h - 56, 15, 15, c[2]);
  }
  for (let y = 100; y < h - 80; y += 44) {
    out += diamond(56, y, 15, 15, c[2]) + diamond(w - 56, y, 15, 15, c[2]);
  }
  return out + `<rect x="80" y="80" width="${w - 160}" height="${h - 160}" fill="${c[0]}" stroke="${c[1]}" stroke-width="8"/>`;
}

function traditional(w, h, c) {
  const cx = w / 2, cy = h / 2;
  let out = border(w, h, c);
  if (h > w * 2) {
    for (let y = 190; y < h - 150; y += 200) out += diamond(cx, y, 70, 90, c[1]) + diamond(cx, y, 44, 58, c[2]) + diamond(cx, y, 20, 26, c[3]);
    return out;
  }
  out += diamond(cx, cy, w * 0.33, h * 0.33, c[1]) + diamond(cx, cy, w * 0.27, h * 0.27, c[3]);
  out += diamond(cx, cy, w * 0.19, h * 0.19, c[2]) + diamond(cx, cy, w * 0.09, h * 0.09, c[1]);
  for (const [x, y] of [[130, 130], [w - 130, 130], [130, h - 130], [w - 130, h - 130]]) {
    out += diamond(x, y, 62, 62, c[1]) + diamond(x, y, 34, 34, c[2]);
  }
  return out;
}

function geometric(w, h, c) {
  let out = `<rect width="${w}" height="${h}" fill="${c[0]}"/>`;
  const step = 120;
  for (let y = 0, row = 0; y <= h + step; y += step / 2, row++) {
    for (let x = row % 2 ? step / 2 : 0; x <= w + step; x += step) {
      out += diamond(x, y, step / 2 - 6, step / 2 - 6, 'none', `stroke="${c[1]}" stroke-width="10"`);
      out += diamond(x, y, 16, 16, c[2]);
    }
  }
  return out;
}

function modern(w, h, c) {
  let out = `<rect width="${w}" height="${h}" fill="${c[0]}"/>`;
  let y = 0;
  [90, 30, 170, 16, 60, 220, 24, 120, 40, 200, 30, 90].forEach((band, i) => {
    out += `<rect y="${y}" width="${w}" height="${band}" fill="${c[i % 3 === 1 ? 1 : i % 3 === 2 ? 3 : 0]}"/>`;
    y += band;
  });
  return out + `<rect y="${y}" width="${w}" height="${Math.max(0, h - y)}" fill="${c[3]}"/>`;
}

function abstract(w, h, c) {
  return `<rect width="${w}" height="${h}" fill="${c[0]}"/>
    <path d="M-20 ${h * 0.2}C${w * 0.3} ${h * 0.05} ${w * 0.5} ${h * 0.4} ${w + 20} ${h * 0.22}V${h * 0.55}C${w * 0.6} ${h * 0.7} ${w * 0.3} ${h * 0.4} -20 ${h * 0.6}Z" fill="${c[1]}"/>
    <path d="M-20 ${h * 0.72}C${w * 0.25} ${h * 0.58} ${w * 0.6} ${h * 0.9} ${w + 20} ${h * 0.68}V${h + 20}H-20Z" fill="${c[2]}"/>
    <path d="M${w * 0.15} ${h * 0.42}C${w * 0.4} ${h * 0.3} ${w * 0.7} ${h * 0.55} ${w * 0.9} ${h * 0.4}" fill="none" stroke="${c[3]}" stroke-width="26"/>`;
}

const DRAW = { Traditional: traditional, Transitional: traditional, Geometric: geometric, Modern: modern, Abstract: abstract };

async function render([style, colour, shape], i) {
  const c = PALETTES[colour];
  const isRunner = shape === 'Runner', isRound = shape === 'Round';
  const rw = isRunner ? 300 : isRound ? 760 : 700;
  const rh = isRunner ? 960 : isRound ? 760 : 960;
  const x = (W - rw) / 2, y = (H - rh) / 2;
  const clip = isRound ? `<clipPath id="r"><circle cx="${rw / 2}" cy="${rh / 2}" r="${rw / 2}"/></clipPath>` : '';
  const shadow = isRound
    ? `<circle cx="${W / 2}" cy="${H / 2 + 8}" r="${rw / 2}" fill="#000" opacity=".55" filter="url(#b)"/>`
    : `<rect x="${x}" y="${y + 8}" width="${rw}" height="${rh}" fill="#000" opacity=".55" filter="url(#b)"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><filter id="b"><feGaussianBlur stdDeviation="12"/></filter>${clip}</defs>
    <rect width="${W}" height="${H}" fill="#26221d"/>${shadow}
    <g transform="translate(${x} ${y})"${isRound ? ' clip-path="url(#r)"' : ''}>${DRAW[style](rw, rh, c)}</g>
  </svg>`;
  // Per-pixel noise reads as wool pile, where flat vector colour reads as a graphic.
  const base = await sharp(Buffer.from(svg)).flatten().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = base.info;
  const data = Buffer.from(base.data);
  let seed = i * 7919 + 1;
  for (let p = 0; p < data.length; p += channels) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const grain = ((seed >>> 24) - 128) / 7;
    for (let k = 0; k < 3; k++) data[p + k] = Math.max(0, Math.min(255, data[p + k] + grain));
  }
  const out = sharp(data, { raw: { width, height, channels } });
  await out.clone().jpeg({ quality: 84 }).toFile(`public/demo/rug-${i + 1}.jpg`);
  await out.clone().extract({ left: 90, top: 70, width: 480, height: 600 }).resize(W, H).jpeg({ quality: 84 }).toFile(`public/demo/rug-${i + 1}-detail.jpg`);
}

await fs.mkdir('public/demo', { recursive: true });
await Promise.all(RUGS.map(render));
console.log(`public/demo: ${RUGS.length} rugs`);
