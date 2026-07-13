// Génère l'image OpenGraph de marque en PNG RÉEL (1200×630) — les scrapers
// sociaux (Facebook, LinkedIn, X) ne rendent pas fiablement le SVG. Zéro
// dépendance : encodage PNG à la main (zlib intégré). Reproductible :
//   node scripts/generate-og.mjs
// Composition : dégradé forêt→charbon + halos roux/cream (miroir de brand.svg,
// hors texte que l'on ne rasterise pas sans police embarquée).
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const W = 1200;
const H = 630;

// Palette de marque (global.css).
const FOREST = [0x1f, 0x3a, 0x1f];
const CHARCOAL = [0x2b, 0x24, 0x20];
const ROUX = [0xa0, 0x52, 0x2d];
const CREAM = [0xfb, 0xf8, 0xe9];

const mix = (a, b, t) => a.map((c, i) => Math.round(c + (b[i] - c) * t));
const over = (base, top, alpha) =>
  base.map((c, i) => Math.round(c * (1 - alpha) + top[i] * alpha));

function pixel(x, y) {
  // Dégradé diagonal forêt → charbon.
  const t = (x / W + y / H) / 2;
  let rgb = mix(FOREST, CHARCOAL, t);
  // Halo roux haut-gauche.
  const d1 = Math.hypot(x - 150, y - 120);
  if (d1 < 220) rgb = over(rgb, ROUX, 0.18 * (1 - d1 / 220));
  // Halo cream bas-droite.
  const d2 = Math.hypot(x - 1080, y - 560);
  if (d2 < 260) rgb = over(rgb, CREAM, 0.1 * (1 - d2 / 260));
  return rgb;
}

// Lignes filtrées (filtre 0) : 1 octet de filtre + W*3 octets RGB.
const raw = Buffer.alloc(H * (1 + W * 3));
for (let y = 0; y < H; y++) {
  const rowStart = y * (1 + W * 3);
  raw[rowStart] = 0;
  for (let x = 0; x < W; x++) {
    const [r, g, b] = pixel(x, y);
    const p = rowStart + 1 + x * 3;
    raw[p] = r;
    raw[p + 1] = g;
    raw[p + 2] = b;
  }
}

// CRC32 (table).
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // color type 2 = RGB
// 10,11,12 = 0 (deflate, no filter method variant, no interlace)

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "og", "brand.png");
writeFileSync(out, png);
console.log(`[generate-og] ${out} — ${W}×${H}, ${png.length} octets`);
