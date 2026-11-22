// News-image daily entry (Node 22, standard library only): the image beside this
// file is copied to /output/entry.png. The gate takes a whole PNG or JPEG of at
// most 1 MiB and 1024 by 1024 pixels; the judge sees exactly the bytes copied.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// The gate's limits: a whole PNG or JPEG, at most 1 MiB. Validate the source
// before writing it out, so a corrupt or oversized image fails loudly here
// instead of silently becoming an invalid entry.
const MAX_BYTES = 1048576;
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const bytes = readFileSync(new URL('./entry.png', import.meta.url));

if (bytes.length > MAX_BYTES) {
  throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB gate limit`);
}
if (!bytes.subarray(0, 3).equals(JPEG_MAGIC) && !bytes.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error('entry.png is neither a JPEG nor a PNG (bad magic bytes)');
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), bytes);
