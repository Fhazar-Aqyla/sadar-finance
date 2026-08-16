const test = require('node:test');
const assert = require('node:assert/strict');
const { ReceiptPipeline } = require('../services/receiptPipeline.service');

test('continues deterministically when Groq is unavailable', async () => {
  const pipeline = new ReceiptPipeline({
    hf: { recognize: async () => ({ candidates: [{ provider: 'primary', quality: 0.9, rawText: 'FamilyMart\n07/03/2026\nTOTAL Rp77.000\nCASH Rp100.000\nCHANGE Rp23.000' }], errors: [] }) },
    groq: { enabled: false },
    local: { extractReceipt: async () => { throw new Error('local should not run'); } },
  });
  const result = await pipeline.extract({});
  assert.equal(result.data.total, 77000);
  assert.equal(result.data.categoryGroup, 'wants');
  assert.equal(result.data.needsReview, true);
  assert.ok(result.data.warnings.some((warning) => /Groq tidak dikonfigurasi/.test(warning)));
});

test('uses local OCR only after all remote candidates are weak', async () => {
  let localCalls = 0;
  const pipeline = new ReceiptPipeline({
    hf: { recognize: async () => ({ candidates: [{ provider: 'primary', quality: 0.1, rawText: 'blur' }], errors: [] }) },
    groq: { enabled: false },
    local: { extractReceipt: async () => { localCalls += 1; return { rawText: 'KCI\n25 February 2026\nTop up Rp10.000\nSaldo Rp15.500' }; } },
  });
  const result = await pipeline.extract({});
  assert.equal(localCalls, 1);
  assert.equal(result.data.total, 10000);
});
