// Entry program for the 22 November 2026 world-news image.
// It takes the image shipped beside this file and places a validated copy
// in the output directory, byte for byte.
import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_IMAGE_BYTES = 1048576;
const JPEG_PREFIX = Buffer.from([0xff, 0xd8, 0xff]);
const PNG_PREFIX = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const sourceDir = dirname(fileURLToPath(import.meta.url));
const sourceFile = join(sourceDir, "entry.png");
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outputFile = join(outputDir, "entry.png");

const image = readFileSync(sourceFile);

if (image.length > MAX_IMAGE_BYTES) {
  throw new Error(
    `entry image is ${image.length} bytes, over the 1 MiB limit of ${MAX_IMAGE_BYTES} bytes`,
  );
}

const isJpeg = image.subarray(0, JPEG_PREFIX.length).equals(JPEG_PREFIX);
const isPng = image.subarray(0, PNG_PREFIX.length).equals(PNG_PREFIX);
if (!isJpeg && !isPng) {
  throw new Error(
    "entry image is neither a JPEG nor a PNG: its first bytes match neither format",
  );
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputFile, image);
// The grader collects the output as a different user, so the file must be
// readable by everyone, and a read-back check proves the copy is exact.
chmodSync(outputFile, 0o644);
const written = readFileSync(outputFile);
if (!written.equals(image)) {
  throw new Error("output does not match the source image");
}
console.log(`wrote ${outputFile}: ${image.length} bytes (${isJpeg ? "JPEG" : "PNG"})`);
