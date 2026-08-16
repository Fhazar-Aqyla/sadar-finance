const config = require('../config');
const hfOcrClient = require('./hfOcrClient.service');
const groqReceipt = require('./groqReceipt.service');
const localOcr = require('./localOcr.service');
const receiptDecision = require('./receiptDecision.service');

class ReceiptPipeline {
  constructor(dependencies = {}) {
    this.hf = dependencies.hf || hfOcrClient;
    this.groq = dependencies.groq || groqReceipt;
    this.local = dependencies.local || localOcr;
  }

  async extract(file) {
    const hfResult = await this.hf.recognize(file);
    const candidates = [...hfResult.candidates];
    const warnings = hfResult.errors.map((error) => `${error.provider}: ${error.message}`);

    const allRemoteCandidatesAreWeak = candidates.length > 0 && candidates.every((candidate) => (candidate.quality || 0) < config.hfOcr.minQuality);
    if ((!candidates.length || allRemoteCandidatesAreWeak) && config.ocr.localFallback) {
      try {
        const localResult = await this.local.extractReceipt(file);
        if (localResult?.rawText) candidates.push({ provider: 'local_tesseract', rawText: localResult.rawText, quality: 0.45, confidence: localResult.confidence || null, lines: [] });
      } catch (error) {
        warnings.push(`local_tesseract: ${error.message}`);
      }
    }
    if (!candidates.length) throw new Error(warnings.join('; ') || 'Tidak ada OCR provider yang menghasilkan teks');

    const combinedText = candidates.map((candidate) => `[${candidate.provider}]\n${candidate.rawText}`).join('\n\n');
    let interpreted = null;
    if (this.groq.enabled) {
      try { interpreted = await this.groq.interpret(candidates); } catch (error) { warnings.push(`Groq: ${error.message}`); }
    } else {
      warnings.push('Groq tidak dikonfigurasi; validator deterministik digunakan.');
    }
    const data = receiptDecision.validate(interpreted, combinedText);
    if (warnings.length) {
      data.warnings = [...new Set([...data.warnings, ...warnings])];
      data.needsReview = true;
    }
    const best = [...candidates].sort((a, b) => (b.quality || 0) - (a.quality || 0))[0];
    return { rawText: combinedText, data, confidence: data.confidence.overall, modelVersion: this.groq.enabled ? config.groq.model : 'deterministic-fallback', ocrProvider: best.provider };
  }
}

module.exports = new ReceiptPipeline();
module.exports.ReceiptPipeline = ReceiptPipeline;
