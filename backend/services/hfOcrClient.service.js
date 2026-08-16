const fs = require('fs/promises');
const config = require('../config');

class OcrProviderError extends Error {
  constructor(message, { status = null, retryAfterMs = 0 } = {}) {
    super(message);
    this.name = 'OcrProviderError';
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }
}

const parseRetryAfter = (value) => {
  if (!value) return 0;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : Math.max(0, timestamp - Date.now());
};

const endpointUrl = (url) => {
  const clean = String(url || '').replace(/\/$/, '');
  if (!clean) return '';
  return /\/ocr$/i.test(clean) ? clean : `${clean}/ocr`;
};

const normalizeLines = (lines, rawText) => {
  if (Array.isArray(lines)) {
    return lines
      .map((line) => typeof line === 'string' ? { text: line, confidence: null } : {
        text: String(line?.text || '').trim(),
        confidence: Number.isFinite(Number(line?.confidence)) ? Number(line.confidence) : null,
      })
      .filter((line) => line.text);
  }
  return String(rawText || '').split(/\r?\n/).map((text) => ({ text: text.trim(), confidence: null })).filter((line) => line.text);
};

const normalizeResponse = (payload, provider) => {
  let data = payload?.data ?? payload;
  if (Array.isArray(data)) data = data[0] || {};
  if (typeof data === 'string') data = { rawText: data };

  const rawText = String(
    data?.rawText ?? data?.raw_text ?? data?.text ?? data?.generated_text ?? payload?.rawText ?? '',
  ).trim();
  const confidenceValue = data?.ocrConfidence ?? data?.confidence ?? payload?.confidence;
  const confidence = Number.isFinite(Number(confidenceValue)) ? Number(confidenceValue) : null;

  return {
    provider,
    rawText,
    confidence,
    lines: normalizeLines(data?.lines, rawText),
    modelVersion: data?.modelVersion || data?.model_version || null,
  };
};

const scoreTextQuality = (result) => {
  const text = String(result?.rawText || '').trim();
  if (!text) return 0;
  const alnum = (text.match(/[A-Za-z0-9]/g) || []).length;
  const printableRatio = alnum / Math.max(text.length, 1);
  const lengthScore = Math.min(1, alnum / 180);
  const hasMoney = /(?:rp\s*)?\d{1,3}(?:[.,]\d{3})+|\b\d{4,}\b/i.test(text) ? 1 : 0;
  const hasDate = /\b(?:20\d{2}[\/.\-]\d{1,2}[\/.\-]\d{1,2}|\d{1,2}[\/.\-]\d{1,2}[\/.\-]20\d{2}|\d{1,2}\s+[a-z]+\s+20\d{2})\b/i.test(text) ? 1 : 0;
  const hasReceiptKeyword = /\b(total|jumlah|bayar|paid|cash|change|tanggal|date|top\s*up|transaksi|subtotal)\b/i.test(text) ? 1 : 0;
  const ocrConfidence = result?.confidence == null ? 0.55 : Math.max(0, Math.min(1, Number(result.confidence) > 1 ? Number(result.confidence) / 100 : Number(result.confidence)));
  return Math.max(0, Math.min(1,
    (lengthScore * 0.22) + (Math.min(printableRatio / 0.65, 1) * 0.18) +
    (hasMoney * 0.2) + (hasDate * 0.15) + (hasReceiptKeyword * 0.15) + (ocrConfidence * 0.1),
  ));
};

class HfOcrClient {
  constructor(options = {}) {
    this.fetch = options.fetch || global.fetch;
    this.providers = options.providers || [
      { name: 'primary', url: config.hfOcr.primaryUrl, token: config.hfOcr.primaryToken },
      { name: 'secondary', url: config.hfOcr.secondaryUrl, token: config.hfOcr.secondaryToken },
    ];
    this.timeoutMs = options.timeoutMs || config.hfOcr.timeoutMs;
    this.minQuality = options.minQuality ?? config.hfOcr.minQuality;
    this.cooldowns = new Map();
  }

  async recognize(file) {
    const candidates = [];
    const errors = [];
    const primary = this.providers[0];
    let primaryResult = null;

    try {
      primaryResult = await this._call(primary, file);
      primaryResult.quality = scoreTextQuality(primaryResult);
      candidates.push(primaryResult);
    } catch (error) {
      errors.push({ provider: primary?.name || 'primary', message: error.message, status: error.status || null });
    }

    const shouldFallback = !primaryResult || primaryResult.quality < this.minQuality;
    const secondary = this.providers[1];
    if (shouldFallback && secondary?.url) {
      try {
        const result = await this._call(secondary, file);
        result.quality = scoreTextQuality(result);
        candidates.push(result);
      } catch (error) {
        errors.push({ provider: secondary.name || 'secondary', message: error.message, status: error.status || null });
      }
    }

    return { candidates, errors, usedFallback: shouldFallback && Boolean(secondary?.url) };
  }

  async _call(provider, file) {
    if (!provider?.url) throw new OcrProviderError('OCR provider URL is not configured');
    const cooldownUntil = this.cooldowns.get(provider.name) || 0;
    if (cooldownUntil > Date.now()) {
      throw new OcrProviderError(`OCR provider ${provider.name} is cooling down`, { status: 429, retryAfterMs: cooldownUntil - Date.now() });
    }

    const buffer = file.buffer || await fs.readFile(file.path);
    const form = new FormData();
    form.append('file', new Blob([buffer], { type: file.mimetype || 'application/octet-stream' }), file.originalname || 'receipt.jpg');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetch(endpointUrl(provider.url), {
        method: 'POST',
        headers: provider.token ? { Authorization: `Bearer ${provider.token}` } : {},
        body: form,
        signal: controller.signal,
      });
      if (!response.ok) {
        const retryAfterMs = parseRetryAfter(response.headers.get('retry-after'));
        if (response.status === 429 && retryAfterMs) this.cooldowns.set(provider.name, Date.now() + retryAfterMs);
        throw new OcrProviderError(`OCR provider ${provider.name} returned ${response.status}`, { status: response.status, retryAfterMs });
      }
      const normalized = normalizeResponse(await response.json(), provider.name);
      if (!normalized.rawText) throw new OcrProviderError(`OCR provider ${provider.name} returned no text`);
      return normalized;
    } catch (error) {
      if (error.name === 'AbortError') throw new OcrProviderError(`OCR provider ${provider.name} timed out`);
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
}

module.exports = new HfOcrClient();
module.exports.HfOcrClient = HfOcrClient;
module.exports.OcrProviderError = OcrProviderError;
module.exports.normalizeResponse = normalizeResponse;
module.exports.scoreTextQuality = scoreTextQuality;
module.exports.parseRetryAfter = parseRetryAfter;
