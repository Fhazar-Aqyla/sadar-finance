const test = require('node:test');
const assert = require('node:assert/strict');
const { HfOcrClient, normalizeResponse, parseRetryAfter } = require('../services/hfOcrClient.service');

const file = { buffer: Buffer.from('image'), mimetype: 'image/jpeg', originalname: 'fixture.jpg' };

test('normalizes both supported Hugging Face response shapes', () => {
  assert.equal(normalizeResponse({ success: true, data: { rawText: 'TOTAL 10.000', confidence: 0.8 } }, 'a').rawText, 'TOTAL 10.000');
  assert.equal(normalizeResponse([{ generated_text: 'TOTAL 20.000' }], 'b').rawText, 'TOTAL 20.000');
});

test('calls secondary only when primary quality is low', async () => {
  let calls = 0;
  const fakeFetch = async () => {
    calls += 1;
    const body = calls === 1 ? { data: { rawText: 'blur' } } : { data: { rawText: 'TOKO\n25 February 2026\nTOTAL Rp10.000', confidence: 0.95 } };
    return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const client = new HfOcrClient({ fetch: fakeFetch, minQuality: 0.65, providers: [{ name: 'primary', url: 'https://primary.test' }, { name: 'secondary', url: 'https://secondary.test' }] });
  const result = await client.recognize(file);
  assert.equal(calls, 2);
  assert.equal(result.candidates.length, 2);
  assert.equal(result.usedFallback, true);
});

test('respects Retry-After cooldown after a 429', async () => {
  let calls = 0;
  const client = new HfOcrClient({
    fetch: async () => { calls += 1; return new Response('{}', { status: 429, headers: { 'retry-after': '30' } }); },
    providers: [{ name: 'primary', url: 'https://primary.test' }],
  });
  await client.recognize(file);
  await client.recognize(file);
  assert.equal(calls, 1);
  assert.equal(parseRetryAfter('2'), 2000);
});
