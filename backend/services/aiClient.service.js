/**
 * AI Client Service
 * Centralizes communication with the Python AI microservice.
 */

const fs = require('fs/promises');
const path = require('path');
const { Blob } = require('buffer');
const config = require('../config');

class AiClientService {
  async extractReceipt({ file, scanId }) {
    if (config.ai.mockMode) {
      return this._mockReceiptResult();
    }

    if (!file?.path) {
      throw new Error('Receipt image path is required for OCR');
    }

    this._assertFetchSupport();

    const buffer = await fs.readFile(file.path);
    const formData = new FormData();
    const filename = file.originalname || path.basename(file.path);

    formData.append('image', new Blob([buffer], { type: file.mimetype }), filename);
    formData.append('scanId', scanId);
    formData.append('imagePath', file.path);

    const response = await this._request('/ocr', {
      method: 'POST',
      body: formData,
    });

    return this._normalizeReceiptResult(response);
  }

  async categorize({ text, transactionId, merchant, amount, items }) {
    if (config.ai.mockMode) {
      return this._mockCategoryResult(text, transactionId);
    }

    const response = await this._postJson('/categorize', {
      text,
      transactionId,
      merchant,
      amount,
      items,
    });

    return this._normalizeCategoryResult(response, text, transactionId);
  }

  async generateInsights(payload) {
    if (config.ai.mockMode) {
      return this._mockInsightResult(payload);
    }

    const response = await this._postJson('/insights', payload);
    return this._normalizeInsightResult(response);
  }

  async predictBehavior(payload) {
    if (config.ai.mockMode) {
      return this._mockBehaviorResult(payload);
    }

    const response = await this._postJson('/behavior/predict', payload);
    return this._normalizeBehaviorResult(response);
  }

  async _postJson(endpoint, payload) {
    return this._request(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  async _request(endpoint, options) {
    this._assertFetchSupport();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.ai.timeoutMs);

    try {
      const response = await fetch(this._buildUrl(endpoint), {
        ...options,
        signal: controller.signal,
      });

      const body = await this._readResponseBody(response);

      if (!response.ok) {
        const message = body?.message || body?.error || `AI service returned ${response.status}`;
        throw new Error(message);
      }

      return body;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error(`AI service timed out after ${config.ai.timeoutMs}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  async _readResponseBody(response) {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      return response.json();
    }

    const text = await response.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch (_err) {
      return { message: text };
    }
  }

  _buildUrl(endpoint) {
    return new URL(endpoint, `${config.ai.serviceUrl.replace(/\/$/, '')}/`).toString();
  }

  _assertFetchSupport() {
    if (typeof fetch !== 'function' || typeof FormData !== 'function') {
      throw new Error('Node.js 18+ fetch/FormData support is required for AI integration');
    }
  }

  _unwrapPayload(response) {
    return response?.data && typeof response.data === 'object' ? response.data : response;
  }

  _normalizeReceiptResult(response) {
    const payload = this._unwrapPayload(response) || {};
    const parsed = payload.parsedData || payload.parsed_data || payload.data || {};

    return {
      rawText: payload.rawText || payload.raw_text || parsed.rawText || '',
      data: {
        merchant: parsed.merchant || payload.merchant || null,
        date: parsed.date || payload.date || null,
        items: Array.isArray(parsed.items || payload.items) ? (parsed.items || payload.items) : [],
        total: parsed.total ?? payload.total ?? null,
        currency: parsed.currency || payload.currency || 'IDR',
        categoryGroup: parsed.categoryGroup || parsed.category_group || payload.categoryGroup || payload.category_group || null,
      },
      confidence: this._safeConfidence(payload.confidence ?? parsed.confidence),
      modelVersion: payload.modelVersion || payload.model_version || null,
    };
  }

  _normalizeCategoryResult(response, text, transactionId) {
    const payload = this._unwrapPayload(response) || {};
    return {
      inputText: payload.inputText || payload.input_text || text,
      predictedCategory: payload.predictedCategory || payload.categoryGroup || payload.category_group || payload.category || 'Other',
      confidence: this._safeConfidence(payload.confidence, 0.5),
      modelVersion: payload.modelVersion || payload.model_version || 'ai-service',
      transactionId: payload.transactionId || payload.transaction_id || transactionId || null,
    };
  }

  _normalizeInsightResult(response) {
    const payload = this._unwrapPayload(response) || {};
    const insights = Array.isArray(payload.insights) ? payload.insights : [];

    return {
      insights: insights
        .map((insight) => ({
          title: insight.title || insight.name,
          description: insight.description || insight.message || insight.body,
        }))
        .filter((insight) => insight.title && insight.description),
      alerts: Array.isArray(payload.alerts) ? payload.alerts : [],
      recommendations: Array.isArray(payload.recommendations) ? payload.recommendations : [],
      modelVersion: payload.modelVersion || payload.model_version || 'ai-service',
    };
  }

  _normalizeBehaviorResult(response) {
    const payload = this._unwrapPayload(response) || {};
    const budgetBucket = payload.budgetBucket || payload.budget_bucket || {};

    return {
      spikeProbability: this._safeConfidence(payload.spikeProbability ?? payload.spike_probability, 0),
      predictedSpike: Boolean(payload.predictedSpike ?? payload.predicted_spike),
      riskLevel: payload.riskLevel || payload.risk_level || 'low',
      categoryPrimary: payload.categoryPrimary || payload.category_primary || null,
      budgetBucket: {
        name: budgetBucket.name || payload.categoryPrimary || payload.category_primary || null,
        recommendedAllocation: this._safeConfidence(
          budgetBucket.recommendedAllocation ?? budgetBucket.recommended_allocation,
          null
        ),
      },
      modelName: payload.modelName || payload.model_name || null,
      modelVersion: payload.modelVersion || payload.model_version || 'behavior-spike-v1',
      recommendation: payload.recommendation || '',
    };
  }

  _safeConfidence(value, fallback = null) {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return fallback;
    return Math.max(0, Math.min(1, parseFloat(parsed.toFixed(4))));
  }

  _mockReceiptResult() {
    return {
      rawText: 'SAMPLE RECEIPT\nStore: Indomaret\nDate: 2025-01-15\nItems:\n- Rice 5kg: Rp 75.000\n- Cooking Oil 1L: Rp 18.000\nTotal: Rp 93.000',
      data: {
        merchant: 'Indomaret',
        date: '2025-01-15',
        items: [
          { name: 'Rice 5kg', amount: 75000 },
          { name: 'Cooking Oil 1L', amount: 18000 },
        ],
        total: 93000,
        currency: 'IDR',
        categoryGroup: 'Food & Dining',
      },
      confidence: 0.9235,
      modelVersion: 'mock-ocr-v1',
    };
  }

  _mockCategoryResult(text, transactionId) {
    return {
      inputText: text,
      predictedCategory: /grab|gojek|taxi|bensin/i.test(text) ? 'Transportation' : 'Food & Dining',
      confidence: 0.9,
      modelVersion: 'mock-category-v1',
      transactionId: transactionId || null,
    };
  }

  _mockInsightResult(payload) {
    return {
      insights: [
        {
          title: 'Pratinjau Insight AI',
          description: `Tren pengeluaran ${payload.spendingTrend || 'stabil'} dengan rasio tabungan ${payload.savingsRate || 0}%.`,
        },
      ],
      alerts: [],
      recommendations: [],
      modelVersion: 'mock-insight-v1',
    };
  }

  _mockBehaviorResult(payload) {
    const amount = Number(payload.amount || 0);
    const categoryPrimary = payload.categoryPrimary || payload.category_primary || payload.categoryGroup || 'Wants';
    const probability = amount >= 1000000 ? 0.82 : amount >= 350000 ? 0.56 : 0.24;
    const riskLevel = probability >= 0.7 ? 'high' : probability >= 0.4 ? 'medium' : 'low';

    return {
      spikeProbability: probability,
      predictedSpike: probability >= 0.5,
      riskLevel,
      categoryPrimary,
      budgetBucket: {
        name: categoryPrimary,
        recommendedAllocation: categoryPrimary === 'Needs' ? 0.5 : categoryPrimary === 'Investment' ? 0.2 : 0.3,
      },
      modelName: 'mock-behavior',
      modelVersion: 'mock-behavior-spike-v1',
      recommendation:
        riskLevel === 'high'
          ? 'Transaksi ini terlihat tinggi dibanding pola normal. Cek ulang prioritas sebelum saldo terpakai.'
          : 'Risiko transaksi masih terkendali. Tetap catat transaksi supaya insight makin akurat.',
    };
  }
}

module.exports = new AiClientService();
