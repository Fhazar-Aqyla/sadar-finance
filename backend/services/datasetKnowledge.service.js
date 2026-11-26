/**
 * SADAR Dataset Knowledge & Empirical Benchmark Service (V 3.0)
 * Powered by Marsela0603/SADAR-Finance-Dashboard (main_transactions_clean.csv)
 * 9,579 Indonesian financial transactions | 187 merchants | 11 categories
 */

const fs = require('fs');
const path = require('path');

const DATASET_PATH = path.join(__dirname, '../data/main_transactions_clean.csv');

const DETAIL_TO_LABEL = {
  food: 'Makanan & Minuman',
  groceries: 'Belanja Harian & Sembako',
  utilities: 'Tagihan & Utilitas',
  transport: 'Transportasi',
  health: 'Kesehatan & Kebugaran',
  education: 'Pendidikan & Kursus',
  entertainment: 'Hiburan & Langganan',
  shopping: 'Belanja & Gaya Hidup',
  travel: 'Perjalanan & Liburan',
  self_care: 'Perawatan Diri',
  investment: 'Tabungan & Investasi',
};

const normalizePrimaryGroup = (rawPrimary, rawDetail = '') => {
  const p = String(rawPrimary || '').trim().toLowerCase();
  const d = String(rawDetail || '').trim().toLowerCase();
  if (p === 'investment' || p === 'savings' || d === 'investment') return 'Savings';
  if (p === 'needs' || ['groceries', 'utilities', 'transport', 'health'].includes(d)) return 'Needs';
  if (p === 'wants') return 'Wants';
  return 'Wants';
};

const computePercentile = (sortedArr, p) => {
  if (!sortedArr || sortedArr.length === 0) return 0;
  const idx = Math.min(sortedArr.length - 1, Math.max(0, Math.floor(sortedArr.length * p)));
  return Math.round(sortedArr[idx]);
};

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

class DatasetKnowledgeService {
  constructor() {
    this._loaded = false;
    this._totalRows = 0;
    this._uniqueUsers = 0;
    this._merchants = new Map(); // normalizedName -> profile
    this._sortedMerchantKeys = []; // longest first for accurate phrase matching
    this._categoryStats = {}; // detail -> { count, avg, p50, p75, p90, primary, label }
    this._primaryStats = {}; // Needs/Wants/Savings -> { count, avg, p50, p75, p90 }
    this._weekendRatio = 1.01;
    this._load();
  }

  _load() {
    if (this._loaded) return;
    try {
      if (!fs.existsSync(DATASET_PATH)) {
        this._loaded = true;
        return;
      }
      const raw = fs.readFileSync(DATASET_PATH, 'utf8').trim();
      if (!raw) {
        this._loaded = true;
        return;
      }

      const lines = raw.split(/\r?\n/);
      const users = new Set();
      const merchantAccum = new Map();
      const detailAmounts = {};
      const detailPrimaryVotes = {};
      const primaryAmounts = { Needs: [], Wants: [], Savings: [] };
      let wkndSum = 0;
      let wkndCnt = 0;
      let wkdySum = 0;
      let wkdyCnt = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        const cols = line.split(',');
        if (cols.length < 7) continue;

        const userId = cols[1];
        const dateStr = cols[2];
        const merchantRaw = (cols[3] || '').trim();
        const amount = Number(cols[4] || 0);
        const detail = String(cols[5] || '').trim().toLowerCase();
        const primary = normalizePrimaryGroup(cols[6], detail);

        if (!merchantRaw || !Number.isFinite(amount) || amount <= 0) continue;

        this._totalRows++;
        if (userId) users.add(userId);

        const dObj = new Date(dateStr.replace(' ', 'T'));
        if (!Number.isNaN(dObj.getTime())) {
          const day = dObj.getDay();
          if (day === 0 || day === 6) {
            wkndSum += amount;
            wkndCnt++;
          } else {
            wkdySum += amount;
            wkdyCnt++;
          }
        }

        if (!detailAmounts[detail]) detailAmounts[detail] = [];
        detailAmounts[detail].push(amount);
        if (!detailPrimaryVotes[detail]) detailPrimaryVotes[detail] = {};
        detailPrimaryVotes[detail][primary] = (detailPrimaryVotes[detail][primary] || 0) + 1;

        if (!primaryAmounts[primary]) primaryAmounts[primary] = [];
        primaryAmounts[primary].push(amount);

        const normKey = normalizeText(merchantRaw);
        if (!normKey) continue;
        if (!merchantAccum.has(normKey)) {
          merchantAccum.set(normKey, {
            merchantName: merchantRaw,
            detailVotes: {},
            primaryVotes: {},
            amounts: [],
          });
        }
        const entry = merchantAccum.get(normKey);
        entry.detailVotes[detail] = (entry.detailVotes[detail] || 0) + 1;
        entry.primaryVotes[primary] = (entry.primaryVotes[primary] || 0) + 1;
        entry.amounts.push(amount);
      }

      this._uniqueUsers = users.size;
      const wkdyAvg = wkdyCnt > 0 ? wkdySum / wkdyCnt : 1;
      const wkndAvg = wkndCnt > 0 ? wkndSum / wkndCnt : 1;
      this._weekendRatio = Number((wkndAvg / wkdyAvg).toFixed(3));

      // Finalize categoryStats
      for (const [detail, arr] of Object.entries(detailAmounts)) {
        const sorted = arr.sort((a, b) => a - b);
        const avg = Math.round(sorted.reduce((s, v) => s + v, 0) / sorted.length);
        const topPrimary = Object.entries(detailPrimaryVotes[detail] || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Wants';
        this._categoryStats[detail] = {
          detail,
          label: DETAIL_TO_LABEL[detail] || detail,
          primary: topPrimary,
          count: sorted.length,
          avg,
          p50: computePercentile(sorted, 0.5),
          p75: computePercentile(sorted, 0.75),
          p90: computePercentile(sorted, 0.9),
        };
      }

      // Finalize primaryStats
      for (const [primary, arr] of Object.entries(primaryAmounts)) {
        if (arr.length === 0) continue;
        const sorted = arr.sort((a, b) => a - b);
        const avg = Math.round(sorted.reduce((s, v) => s + v, 0) / sorted.length);
        this._primaryStats[primary] = {
          primary,
          count: sorted.length,
          avg,
          p50: computePercentile(sorted, 0.5),
          p75: computePercentile(sorted, 0.75),
          p90: computePercentile(sorted, 0.9),
        };
      }

      // Finalize merchant index
      for (const [normKey, entry] of merchantAccum.entries()) {
        const sorted = entry.amounts.sort((a, b) => a - b);
        const topDetailEntry = Object.entries(entry.detailVotes).sort((a, b) => b[1] - a[1])[0];
        const topPrimaryEntry = Object.entries(entry.primaryVotes).sort((a, b) => b[1] - a[1])[0];
        const detail = topDetailEntry ? topDetailEntry[0] : 'shopping';
        const primary = topPrimaryEntry ? topPrimaryEntry[0] : 'Wants';
        const consistency = topPrimaryEntry ? topPrimaryEntry[1] / sorted.length : 0.85;

        this._merchants.set(normKey, {
          key: normKey,
          merchantName: entry.merchantName,
          categoryGroup: primary,
          categoryDetailKey: detail,
          categoryDetail: DETAIL_TO_LABEL[detail] || detail,
          sampleCount: sorted.length,
          avgAmount: Math.round(sorted.reduce((s, v) => s + v, 0) / sorted.length),
          p50Amount: computePercentile(sorted, 0.5),
          p75Amount: computePercentile(sorted, 0.75),
          p90Amount: computePercentile(sorted, 0.9),
          confidence: Number(Math.min(0.98, Math.max(0.82, consistency * 0.96)).toFixed(4)),
        });
      }

      // Sort merchant keys by descending length so "kopi kenangan" matches before "kopi"
      this._sortedMerchantKeys = [...this._merchants.keys()].sort((a, b) => b.length - a.length);
      this._loaded = true;
    } catch (err) {
      console.warn('[DatasetKnowledge] Failed to load CSV dataset:', err.message);
      this._loaded = true;
    }
  }

  getSummary() {
    this._load();
    return {
      loaded: this._totalRows > 0,
      datasetName: 'SADAR-Finance-Dashboard (main_transactions_clean.csv)',
      totalTransactions: this._totalRows,
      uniqueUsers: this._uniqueUsers,
      uniqueMerchants: this._merchants.size,
      categoriesCount: Object.keys(this._categoryStats).length,
      weekendSpendRatio: this._weekendRatio,
      primaryBenchmarks: this._primaryStats,
      categoryBenchmarks: this._categoryStats,
    };
  }

  /**
   * Instant exact or phrase-boundary lookup against all 187 Indonesian merchants.
   */
  lookupMerchant(text = '', merchant = '') {
    this._load();
    if (this._merchants.size === 0) return null;

    const combined = normalizeText(`${merchant || ''} ${text || ''}`);
    if (!combined) return null;

    // 1. Direct exact match
    if (this._merchants.has(combined)) {
      return { ...this._merchants.get(combined), matchType: 'exact' };
    }

    // 2. Clean phrase match (word boundary so short names like "kai" don't match "pakai")
    const padded = ` ${combined} `;
    for (const key of this._sortedMerchantKeys) {
      if (key.length < 3) continue;
      if (padded.includes(` ${key} `)) {
        return { ...this._merchants.get(key), matchType: 'phrase' };
      }
    }

    return null;
  }

  /**
   * Keyword + dataset-calibrated fallback classifier covering all 11 SADAR categories.
   */
  classifyFallback(text = '', merchant = '', transactionId = null) {
    const matched = this.lookupMerchant(text, merchant);
    if (matched) {
      return {
        inputText: text || merchant,
        predictedCategory: matched.categoryGroup,
        categoryGroup: matched.categoryGroup,
        categoryDetail: matched.categoryDetail,
        categoryDetailKey: matched.categoryDetailKey,
        matchedMerchant: matched.merchantName,
        merchantBenchmark: {
          sampleCount: matched.sampleCount,
          avgAmount: matched.avgAmount,
          p50Amount: matched.p50Amount,
          p90Amount: matched.p90Amount,
        },
        decisionSource: 'sadar-dataset-kb',
        needsReview: false,
        confidence: matched.confidence,
        modelVersion: 'v3.0-sadar-dataset-9579',
        transactionId: transactionId || null,
      };
    }

    const lower = normalizeText(`${merchant || ''} ${text || ''}`);
    const rules = [
      { re: /invest|saham|reksadana|reksa dana|crypto|kripto|deposito|emas|tabung|bibit|bareksa|ajaib|pluang|pintu|tokocrypto|sbn|obligasi/, group: 'Savings', detail: 'investment' },
      { re: /listrik|pln|air|pdam|internet|wifi|indihome|biznet|first media|pulsa|paket data|telkomsel|xl|indosat|smartfren|token|kos|sewa|kontrakan|iuran|bpjs/, group: 'Needs', detail: 'utilities' },
      { re: /indomaret|alfamart|alfamidi|lawson|superindo|hypermart|transmart|lottemart|sembako|beras|sayur|buah|pasar|minimarket|supermarket|groceries|belanja bulanan/, group: 'Needs', detail: 'groceries' },
      { re: /grab|gojek|ojol|maxim|bluebird|taxi|taksi|bensin|pertamina|shell|pertamax|pertalite|parkir|tol|toll|krl|mrt|lrt|transjakarta|kai|kereta|busway/, group: 'Needs', detail: 'transport' },
      { re: /apotek|kimia farma|k24|halodoc|alodokter|rumah sakit|rsud|klinik|dokter|obat|vitamin|lab|gym|fitness|kesehatan/, group: 'Needs', detail: 'health' },
      { re: /makan|warteg|padang|nasi|bakso|mie|soto|ayam|sate|sarapan|makan siang|makan malam|resto|kantin|warung|food|gofood|grabfood|shopeefood|kopi|coffee|cafe|starbucks|fore|kenangan|boba|minum/, group: 'Needs', detail: 'food' },
      { re: /kuliah|spp|buku|gramedia|course|kursus|udemy|coursera|ruangguru|skill academy|sertifikasi|sekolah|les|adobe|canva/, group: 'Wants', detail: 'education' },
      { re: /bioskop|xxi|cgv|cinepolis|netflix|spotify|youtube|disney|vidio|steam|mobile legends|valorant|game|konser|tiket|hiburan|karaoke/, group: 'Wants', detail: 'entertainment' },
      { re: /hotel|reddoorz|oyo|santika|airasia|citilink|garuda|lion air|traveloka|tiket com|liburan|staycation|pesawat|wisata/, group: 'Wants', detail: 'travel' },
      { re: /salon|barber|spa|reflexology|skincare|kosmetik|innisfree|wardah|somethinc|luxcrime|sociolla|facial|parfum/, group: 'Wants', detail: 'self_care' },
      { re: /shopee|tokopedia|lazada|blibli|zalora|uniqlo|hnm|zara|nike|adidas|sepatu|baju|jaket|tas|gadget|hp|elektronik|mall|shop|belanja/, group: 'Wants', detail: 'shopping' },
    ];

    for (const rule of rules) {
      if (rule.re.test(lower)) {
        const stats = this._categoryStats[rule.detail];
        return {
          inputText: text || merchant,
          predictedCategory: rule.group,
          categoryGroup: rule.group,
          categoryDetail: DETAIL_TO_LABEL[rule.detail] || rule.detail,
          categoryDetailKey: rule.detail,
          categoryBenchmark: stats || null,
          decisionSource: 'dataset-keyword-rules',
          needsReview: false,
          confidence: 0.87,
          modelVersion: 'v3.0-dataset-rules',
          transactionId: transactionId || null,
        };
      }
    }

    return {
      inputText: text || merchant,
      predictedCategory: 'Wants',
      categoryGroup: 'Wants',
      categoryDetail: 'Lainnya',
      categoryDetailKey: 'shopping',
      decisionSource: 'dataset-keyword-rules',
      needsReview: true,
      confidence: 0.55,
      modelVersion: 'v3.0-dataset-rules',
      transactionId: transactionId || null,
    };
  }

  /**
   * Computes empirical spike probability using the real P50/P75/P90 benchmarks
   * from 9,579 Indonesian transactions (category-level or merchant-level).
   */
  evaluateEmpiricalSpike(payload = {}) {
    this._load();
    const amount = Number(payload.amount || 0);
    const merchantHint = payload.merchant || payload.description || payload.text || '';
    const matchedMerchant = this.lookupMerchant(merchantHint, payload.merchant);

    const rawDetail = String(
      matchedMerchant?.categoryDetailKey ||
      payload.categoryDetail ||
      payload.category_detail ||
      ''
    ).trim().toLowerCase();

    let resolvedDetail = rawDetail;
    if (!this._categoryStats[resolvedDetail]) {
      const fb = this.classifyFallback(merchantHint, payload.merchant);
      resolvedDetail = fb.categoryDetailKey || 'food';
    }

    const catBench = this._categoryStats[resolvedDetail] || this._primaryStats.Wants || {
      avg: 350000,
      p50: 250000,
      p75: 450000,
      p90: 750000,
      count: this._totalRows,
      label: DETAIL_TO_LABEL[resolvedDetail] || 'Pengeluaran',
      primary: 'Wants',
    };

    const p50 = matchedMerchant?.p50Amount || catBench.p50 || 200000;
    const p75 = matchedMerchant?.p75Amount || catBench.p75 || 350000;
    const p90 = matchedMerchant?.p90Amount || catBench.p90 || 500000;
    const avg = matchedMerchant?.avgAmount || catBench.avg || 250000;

    const categoryPrimary =
      matchedMerchant?.categoryGroup ||
      normalizePrimaryGroup(payload.categoryPrimary || payload.categoryGroup || catBench.primary, resolvedDetail);

    const rolling7dSpending = Number(payload.rolling7dSpending || amount);
    const shareOf7d = rolling7dSpending > 0 ? amount / rolling7dSpending : 0;

    // Empirical piecewise risk scoring against real P50/P75/P90 distribution
    let spikeProbability = 0.18;
    if (amount <= 0) {
      spikeProbability = 0.1;
    } else if (amount >= p90 * 1.35) {
      spikeProbability = 0.89;
    } else if (amount >= p90) {
      spikeProbability = 0.74 + Math.min(0.14, ((amount - p90) / Math.max(p90, 1)) * 0.3);
    } else if (amount >= p75) {
      spikeProbability = 0.52 + ((amount - p75) / Math.max(p90 - p75, 1)) * 0.2;
    } else if (amount >= p50) {
      spikeProbability = 0.30 + ((amount - p50) / Math.max(p75 - p50, 1)) * 0.2;
    } else {
      spikeProbability = 0.12 + (amount / Math.max(p50, 1)) * 0.16;
    }

    // Small upward adjustment if single transaction dominates 7-day rolling spend
    if (shareOf7d >= 0.65 && amount > p50) {
      spikeProbability = Math.min(0.94, spikeProbability + 0.08);
    }

    spikeProbability = Number(Math.max(0.08, Math.min(0.94, spikeProbability)).toFixed(4));
    const riskLevel = spikeProbability >= 0.7 ? 'high' : spikeProbability >= 0.45 ? 'medium' : 'low';
    const fmt = (n) => Math.round(n).toLocaleString('id-ID');
    const catLabel = DETAIL_TO_LABEL[resolvedDetail] || catBench.label || categoryPrimary;

    let recommendation;
    if (riskLevel === 'high') {
      recommendation = `Nominal Rp ${fmt(amount)} pada pos ${catLabel} melampaui persentil 90 benchmark SADAR (Rp ${fmt(p90)}, median normal Rp ${fmt(p50)} dari ${catBench.count || this._totalRows} transaksi). Sebaiknya cek sisa kuota 50/30/20 bulan ini sebelum melanjutkan.`;
    } else if (riskLevel === 'medium') {
      recommendation = `Nominal Rp ${fmt(amount)} pada pos ${catLabel} berada di atas median normal (Rp ${fmt(p50)}) dan mendekati batas atas wajar (Rp ${fmt(p90)}). Tetap pantau frekuensi belanja minggu ini agar alokasi tetap seimbang.`;
    } else {
      recommendation = `Nominal Rp ${fmt(amount)} pada pos ${catLabel} masih berada dalam rentang wajar dibanding median benchmark SADAR (Rp ${fmt(p50)}). Pertahankan disiplin pengeluaran harian Anda.`;
    }

    return {
      spikeProbability,
      predictedSpike: spikeProbability >= 0.5,
      riskLevel,
      categoryPrimary,
      categoryDetail: catLabel,
      budgetBucket: {
        name: categoryPrimary,
        recommendedAllocation: categoryPrimary === 'Needs' ? 0.5 : categoryPrimary === 'Savings' ? 0.2 : 0.3,
      },
      benchmark: {
        source: 'sadar-dataset-9579',
        category: resolvedDetail,
        matchedMerchant: matchedMerchant?.merchantName || null,
        sampleSize: matchedMerchant?.sampleCount || catBench.count || this._totalRows,
        avgAmount: avg,
        p50Amount: p50,
        p75Amount: p75,
        p90Amount: p90,
      },
      modelName: 'sadar-empirical-dataset-v3',
      modelVersion: 'v3.0-dataset-9579-empirical',
      recommendation,
    };
  }
}

module.exports = new DatasetKnowledgeService();
