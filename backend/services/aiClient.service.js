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

    let hfResult = null;
    try {
      const response = await this._postJson('/categorize', {
        text,
        transactionId,
        merchant,
        amount,
        items,
      });
      hfResult = this._normalizeCategoryResult(response, text, transactionId);
    } catch (_hfErr) {
      // Hugging Face unavailable or timed out; Groq AI will handle below
    }

    // Return Hugging Face result directly if high confidence, otherwise enhance/fallback with Groq AI
    if (hfResult && hfResult.confidence >= 0.75 && !hfResult.needsReview) {
      return hfResult;
    }

    if (config.groq?.apiKey) {
      try {
        const groqResult = await this._categorizeWithGroq({
          text,
          transactionId,
          merchant,
          amount,
          items,
        });
        return {
          ...groqResult,
          decisionSource: hfResult ? 'huggingface+groq' : 'groq-fallback',
          modelVersion: hfResult
            ? `${hfResult.modelVersion}+${groqResult.modelVersion}`
            : groqResult.modelVersion,
        };
      } catch (_groqErr) {
        if (hfResult) return hfResult;
        throw _groqErr;
      }
    }

    if (hfResult) return hfResult;
    throw new Error('AI categorization service unavailable');
  }

  async generateInsights(payload) {
    if (config.ai.mockMode) {
      return this._mockInsightResult(payload);
    }

    let hfInsights = null;
    try {
      const response = await this._postJson('/insights', payload);
      hfInsights = this._normalizeInsightResult(response);
    } catch (_hfErr) {
      // Hugging Face unavailable or endpoint not active; Groq AI will supplement
    }

    if (config.groq?.apiKey) {
      try {
        const groqInsights = await this._generateInsightsWithGroq(payload);
        const combined = [
          ...(hfInsights?.insights || []),
          ...(groqInsights?.insights || []),
        ].slice(0, 4);
        return {
          insights: combined.length > 0 ? combined : groqInsights.insights,
          alerts: hfInsights?.alerts || [],
          recommendations:
            groqInsights.recommendations?.length > 0
              ? groqInsights.recommendations
              : hfInsights?.recommendations || [],
          modelVersion: hfInsights
            ? `${hfInsights.modelVersion}+${groqInsights.modelVersion}`
            : groqInsights.modelVersion,
        };
      } catch (_groqErr) {
        if (hfInsights) return hfInsights;
        throw _groqErr;
      }
    }

    if (hfInsights) return hfInsights;
    throw new Error('AI insights service unavailable');
  }

  async predictBehavior(payload) {
    if (config.ai.mockMode) {
      return this._mockBehaviorResult(payload);
    }

    let hfBehavior = null;
    try {
      const response = await this._postJson('/behavior/predict', payload);
      hfBehavior = this._normalizeBehaviorResult(response);
    } catch (_hfErr) {
      // Hugging Face unavailable; Groq AI will act as fallback
    }

    if (config.groq?.apiKey) {
      try {
        const groqBehavior = await this._predictBehaviorWithGroq({
          ...payload,
          hfPrediction: hfBehavior,
        });
        if (hfBehavior) {
          return {
            ...hfBehavior,
            recommendation: groqBehavior.recommendation || hfBehavior.recommendation,
            modelVersion: `${hfBehavior.modelVersion}+${groqBehavior.modelVersion}`,
          };
        }
        return groqBehavior;
      } catch (_groqErr) {
        if (hfBehavior) return hfBehavior;
        throw _groqErr;
      }
    }

    if (hfBehavior) return hfBehavior;
    throw new Error('AI behavior service unavailable');
  }

  async _callGroqJson({ systemPrompt, userPayload, schemaName, schema }) {
    this._assertFetchSupport();
    const controller = new AbortController();
    const timeoutMs = config.groq?.timeoutMs || 15000;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.groq.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.groq.model || 'openai/gpt-oss-20b',
          temperature: 0.1,
          reasoning_effort: config.groq.reasoningEffort || 'low',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(userPayload) },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: schemaName,
              strict: true,
              schema,
            },
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Groq API returned ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Groq returned empty content');
      }
      return typeof content === 'string' ? JSON.parse(content) : content;
    } finally {
      clearTimeout(timer);
    }
  }

  async _categorizeWithGroq({ text, transactionId, merchant, amount, items }) {
    const schema = {
      type: 'object',
      additionalProperties: false,
      required: ['categoryGroup', 'categoryDetail', 'confidence', 'needsReview'],
      properties: {
        categoryGroup: {
          type: 'string',
          enum: ['Needs', 'Wants', 'Savings'],
        },
        categoryDetail: { type: 'string' },
        confidence: { type: 'number' },
        needsReview: { type: 'boolean' },
      },
    };

    const systemPrompt = `Anda adalah sistem klasifikasi transaksi keuangan pribadi Indonesia berbasis metode anggaran 50/30/20 (SADAR Finance).
Klasifikasikan deskripsi/merchant transaksi ke dalam salah satu categoryGroup berikut:
- "Needs": kebutuhan pokok, makan sehari-hari/warteg/sembako/minimarket (Indomaret/Alfamart), transportasi harian (Grab/Gojek/KRL/Bensin/Parkir), tagihan rutin (Listrik PLN, Air PDAM, Internet/WiFi, Pulsa, Kos/Sewa), kesehatan (Apotek, RS, Obat), dan pendidikan.
- "Wants": gaya hidup, kopi/kafe/boba (Kopi Kenangan, Fore, Starbucks), restoran/kuliner hiburan, belanja marketplace non-pokok (Shopee, Tokopedia, Fashion, Gadget), langganan hiburan (Netflix, Spotify, Bioskop, Game), liburan/staycation.
- "Savings": tabungan, dana darurat, deposito, reksa dana, saham, emas, investasi (Bibit, Bareksa, Ajaib, Pluang).
Isi categoryDetail dengan label singkat Bahasa Indonesia yang rapi (contoh: "Makanan & Kebutuhan Pokok", "Transportasi Harian", "Kopi & Gaya Hidup", "Tagihan & Utilitas", "Belanja Online", "Tabungan & Investasi").`;

    const parsed = await this._callGroqJson({
      systemPrompt,
      userPayload: {
        text: text || '',
        merchant: merchant || text || '',
        amount: amount || null,
        items: items || [],
      },
      schemaName: 'transaction_categorization',
      schema,
    });

    return {
      inputText: text,
      predictedCategory: parsed.categoryGroup,
      categoryGroup: parsed.categoryGroup,
      categoryDetail: parsed.categoryDetail,
      decisionSource: 'groq-ai',
      needsReview: Boolean(parsed.needsReview),
      confidence: this._safeConfidence(parsed.confidence, 0.92),
      modelVersion: config.groq.model || 'openai/gpt-oss-20b',
      transactionId: transactionId || null,
    };
  }

  async _generateInsightsWithGroq(payload) {
    const schema = {
      type: 'object',
      additionalProperties: false,
      required: ['insights', 'recommendations'],
      properties: {
        insights: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['title', 'description'],
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
            },
          },
        },
        recommendations: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    };

    const systemPrompt = `Anda adalah penasihat keuangan pribadi AI resmi SADAR Finance (Smart Automated Digital Assistant for Resourceful Finance).
Hasilkan 3 sampai 4 insight perilaku keuangan yang sangat relevan, profesional, dan personal dalam Bahasa Indonesia baku yang mudah dipahami berdasarkan data ringkasan pengguna.
Aturan penulisan:
1. Setiap description harus berupa paragraf 2 kalimat yang informatif, menyebutkan angka Rupiah atau persentase nyata dari data pengguna, serta memberikan saran konkret berpedoman pada prinsip 50/30/20 (50% Kebutuhan, 30% Keinginan, 20% Tabungan & Investasi).
2. Jangan gunakan tanda em-dash (—) atau titik tengah (·); gunakan tanda hubung biasa (-).`;

    const parsed = await this._callGroqJson({
      systemPrompt,
      userPayload: payload,
      schemaName: 'financial_behavior_insights',
      schema,
    });

    return {
      insights: (parsed.insights || []).filter((i) => i.title && i.description),
      alerts: [],
      recommendations: parsed.recommendations || [],
      modelVersion: config.groq.model || 'openai/gpt-oss-20b',
    };
  }

  async _predictBehaviorWithGroq(payload) {
    const schema = {
      type: 'object',
      additionalProperties: false,
      required: [
        'spikeProbability',
        'predictedSpike',
        'riskLevel',
        'categoryPrimary',
        'recommendedAllocation',
        'recommendation',
      ],
      properties: {
        spikeProbability: { type: 'number' },
        predictedSpike: { type: 'boolean' },
        riskLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
        categoryPrimary: { type: 'string', enum: ['Needs', 'Wants', 'Savings'] },
        recommendedAllocation: { type: 'number' },
        recommendation: { type: 'string' },
      },
    };

    const systemPrompt = `Anda adalah mesin analisis risiko lonjakan belanja (Behavior Spike Prediction) SADAR Finance.
Evaluasi transaksi terbaru dan total pengeluaran 7 hari terakhir (rolling7dSpending) pengguna:
- Tentukan spikeProbability (0.05 s/d 0.95), predictedSpike (true jika spikeProbability >= 0.5), dan riskLevel ("low", "medium", atau "high").
- Tulis recommendation dalam Bahasa Indonesia formal sepanjang 2 hingga 3 kalimat yang menjelaskan kondisi laju pengeluaran mingguan pengguna serta langkah pengendalian anggaran 50/30/20 secara spesifik. Jangan gunakan simbol em-dash (—).`;

    const parsed = await this._callGroqJson({
      systemPrompt,
      userPayload: payload,
      schemaName: 'behavior_spike_prediction',
      schema,
    });

    return {
      spikeProbability: this._safeConfidence(parsed.spikeProbability, 0.25),
      predictedSpike: Boolean(parsed.predictedSpike),
      riskLevel: parsed.riskLevel || 'low',
      categoryPrimary: parsed.categoryPrimary || payload.categoryGroup || 'Needs',
      budgetBucket: {
        name: parsed.categoryPrimary || payload.categoryGroup || 'Needs',
        recommendedAllocation: this._safeConfidence(parsed.recommendedAllocation, 0.5),
      },
      modelName: 'groq-behavior-ai',
      modelVersion: config.groq.model || 'openai/gpt-oss-20b',
      recommendation: parsed.recommendation || '',
    };
  }

  async _postJson(endpoint, payload) {
    return this._request(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  async _request(endpoint, options = {}) {
    this._assertFetchSupport();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.ai.timeoutMs);

    const headers = {
      ...(options.headers || {}),
    };
    if (config.ai.apiKey) {
      headers['Authorization'] = `Bearer ${config.ai.apiKey}`;
      headers['x-api-key'] = config.ai.apiKey;
    }

    try {
      const response = await fetch(this._buildUrl(endpoint), {
        ...options,
        headers,
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
        categoryDetail: parsed.categoryDetail || parsed.category_detail || payload.categoryDetail || payload.category_detail || null,
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
      categoryGroup: payload.categoryGroup || payload.category_group || payload.predictedCategory || payload.category || null,
      categoryDetail: payload.categoryDetail || payload.category_detail || null,
      decisionSource: payload.decisionSource || payload.decision_source || null,
      needsReview: Boolean(payload.needsReview ?? payload.needs_review ?? false),
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
