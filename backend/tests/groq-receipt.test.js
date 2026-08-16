const test = require('node:test');
const assert = require('node:assert/strict');
const { GroqReceiptService } = require('../services/groqReceipt.service');

test('sends the configured small reasoning model with strict JSON Schema', async () => {
  let requestBody;
  const service = new GroqReceiptService({
    apiKey: 'test-key',
    model: 'openai/gpt-oss-20b',
    reasoningEffort: 'low',
    fetch: async (_url, options) => {
      requestBody = JSON.parse(options.body);
      return new Response(JSON.stringify({ choices: [{ message: { content: '{}' } }] }), { status: 200, headers: { 'content-type': 'application/json' } });
    },
  });
  await service.interpret([{ provider: 'primary', quality: 0.9, rawText: 'TOTAL Rp10.000' }]);
  assert.equal(requestBody.model, 'openai/gpt-oss-20b');
  assert.equal(requestBody.temperature, 0);
  assert.equal(requestBody.reasoning_effort, 'low');
  assert.equal(requestBody.response_format.type, 'json_schema');
  assert.equal(requestBody.response_format.json_schema.strict, true);
});
