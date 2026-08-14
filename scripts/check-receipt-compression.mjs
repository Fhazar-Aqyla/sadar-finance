import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  OCR_IMAGE_TARGET_BYTES,
  scaleReceiptDimensions,
} from "../frontend/src/Components/services/receiptImage.js";

assert.equal(OCR_IMAGE_TARGET_BYTES, 850 * 1024);
assert.deepEqual(scaleReceiptDimensions(4000, 2000), { width: 2400, height: 1200 });
assert.deepEqual(scaleReceiptDimensions(1200, 1800), { width: 1200, height: 1800 });

const desktopSource = await readFile(new URL("../frontend/src/Components/services/receiptImage.js", import.meta.url), "utf8");
const mobileSource = await readFile(new URL("../frontend-mobile/src/Components/services/receiptImage.js", import.meta.url), "utf8");
assert.equal(mobileSource, desktopSource, "Implementasi kompresi desktop dan mobile harus sama.");

console.log("Receipt image compression checks passed.");
