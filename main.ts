// news-image-20261117 entry (Node 22, standard library only): the repository holds
// entry.png, a 1024x1024 newspaper page summing up Tuesday 17 November 2026, and
// this program copies it to /output/entry.png. The gate takes a whole PNG or JPEG
// of at most 1 MiB and 1024 by 1024 pixels, and the judge sees exactly the bytes
// copied, so the program checks the file is really a PNG inside those caps first
// and refuses to write anything else.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MAX_BYTES = 1024 * 1024;

const source = new URL('./entry.png', import.meta.url);
const bytes = readFileSync(source);

if (!bytes.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error('main.ts: entry.png is not a PNG file');
}
if (bytes.length > MAX_BYTES) {
  throw new Error(`main.ts: entry.png is ${bytes.length} bytes, over the 1 MiB cap`);
}

// A PNG's IHDR chunk holds its pixel size at fixed offsets: width at bytes
// 16..19 and height at bytes 20..23, both big-endian. The gate caps the image
// at 1024 by 1024 pixels, so check the header agrees before copying.
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`main.ts: entry.png is ${width}x${height}, over the 1024x1024 cap`);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
copyFileSync(source, join(outDir, 'entry.png'));
console.log(`main.ts: wrote entry.png (${width}x${height}, ${bytes.length} bytes) to ${outDir}`);
