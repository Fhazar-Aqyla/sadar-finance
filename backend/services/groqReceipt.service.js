const config = require('../config');

const nullable = (type) => ({ anyOf: [{ type }, { type: 'null' }] });
const receiptSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['expenseName', 'merchant', 'date', 'total', 'items', 'categoryGroup', 'categoryDetail', 'description', 'accountHint', 'documentType', 'isExpense', 'paymentMethod', 'transactionReference', 'confidence', 'needsReview', 'warnings', 'evidence'],
  properties: {
    expenseName: nullable('string'), merchant: nullable('string'), date: nullable('string'), total: nullable('integer'),
    items: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['name', 'quantity', 'unitPrice', 'amount'], properties: { name: { type: 'string' }, quantity: nullable('number'), unitPrice: nullable('integer'), amount: nullable('integer') } } },
    categoryGroup: { anyOf: [{ type: 'string', enum: ['needs', 'wants', 'savings'] }, { type: 'null' }] },
    categoryDetail: nullable('string'), description: nullable('string'), accountHint: nullable('string'),
    documentType: { type: 'string', enum: ['purchase_receipt', 'bank_transfer', 'qris_payment', 'transport_payment', 'top_up', 'internal_transfer', 'unknown'] },
    isExpense: { type: 'boolean' }, paymentMethod: nullable('string'), transactionReference: nullable('string'),
    confidence: { type: 'object', additionalProperties: false, required: ['merchant', 'date', 'total', 'category', 'overall'], properties: { merchant: { type: 'number' }, date: { type: 'number' }, total: { type: 'number' }, category: { type: 'number' }, overall: { type: 'number' } } },
    needsReview: { type: 'boolean' }, warnings: { type: 'array', items: { type: 'string' } },
    evidence: { type: 'object', additionalProperties: false, required: ['merchantLine', 'dateLine', 'totalLine', 'categoryBasis'], properties: { merchantLine: nullable('string'), dateLine: nullable('string'), totalLine: nullable('string'), categoryBasis: nullable('string') } },
  },
};

const systemPrompt = `Anda menafsirkan teks OCR bukti transaksi Indonesia. Jangan pernah mengarang nilai yang tidak ada pada teks OCR.
Pilih TOTAL transaksi sebenarnya, bukan subtotal, uang tunai/cash, total paid, kembalian/change, saldo, pajak, nomor rekening, atau ID transaksi. Untuk top-up KCI/KMT gunakan nilai Top up, bukan saldo kartu. Gunakan bukti baris persis pada evidence.
Kategori 50/30/20 wajib: needs untuk kebutuhan pokok, kesehatan, pendidikan, transportasi; wants untuk restoran/jajan dan belanja non-esensial; savings hanya tabungan/investasi eksplisit. Struk campuran memakai nilai item dominan.
Top-up KCI/KMT dan transfer untuk pembelian adalah pengeluaran. Transfer antarakun sendiri atau top-up e-wallet sendiri bukan pengeluaran. Jika data bertentangan atau lemah, isi kandidat terbaik yang memiliki bukti, set needsReview=true, dan tulis warning. Jika tidak ada kandidat OCR, gunakan null.`;

class GroqReceiptService {
  constructor(options = {}) {
    this.fetch = options.fetch || global.fetch;
    this.apiKey = options.apiKey ?? config.groq.apiKey;
    this.model = options.model || config.groq.model;
    this.timeoutMs = options.timeoutMs || config.groq.timeoutMs;
    this.reasoningEffort = options.reasoningEffort || config.groq.reasoningEffort;
  }

  get enabled() { return Boolean(this.apiKey); }

  async interpret(candidates) {
    if (!this.enabled) return null;
    const sources = candidates.map((candidate) => ({ provider: candidate.provider, quality: candidate.quality, text: candidate.rawText }));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          temperature: 0,
          reasoning_effort: this.reasoningEffort,
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: JSON.stringify({ ocrSources: sources }) }],
          response_format: { type: 'json_schema', json_schema: { name: 'receipt_transaction', strict: true, schema: receiptSchema } },
        }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Groq returned ${response.status}`);
      const payload = await response.json();
      const content = payload?.choices?.[0]?.message?.content;
      if (!content) throw new Error('Groq returned no structured result');
      return typeof content === 'string' ? JSON.parse(content) : content;
    } finally {
      clearTimeout(timer);
    }
  }
}

module.exports = new GroqReceiptService();
module.exports.GroqReceiptService = GroqReceiptService;
module.exports.receiptSchema = receiptSchema;
