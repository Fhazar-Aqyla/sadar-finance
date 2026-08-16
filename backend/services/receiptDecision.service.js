const MONTHS = {
  januari: 1, january: 1, februari: 2, february: 2, feb: 2, maret: 3, march: 3, mar: 3, april: 4, apr: 4, mei: 5, may: 5, juni: 6, june: 6, jun: 6,
  juli: 7, july: 7, jul: 7, agustus: 8, august: 8, aug: 8, september: 9, sep: 9, oktober: 10, october: 10, oct: 10, november: 11, nov: 11, desember: 12, december: 12, dec: 12,
};

const clamp = (value, fallback = 0) => Number.isFinite(Number(value)) ? Math.max(0, Math.min(1, Number(value))) : fallback;
const cleanLine = (line) => String(line || '').replace(/\s+/g, ' ').trim();
const normalizeText = (text) => String(text || '').replace(/\r/g, '');
const moneyFromToken = (token) => {
  const digits = String(token || '').replace(/[^0-9]/g, '');
  if (!digits) return null;
  const value = Number(digits);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
};

const findDate = (lines) => {
  for (const line of lines) {
    let match = line.match(/\b(20\d{2})[\/.\-](\d{1,2})[\/.\-](\d{1,2})\b/);
    if (match) return { value: `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`, line };
    match = line.match(/\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](20\d{2})\b/);
    if (match) return { value: `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`, line };
    match = line.match(/\b(\d{1,2})\s+(januari|january|februari|february|feb|maret|march|mar|april|apr|mei|may|juni|june|jun|juli|july|jul|agustus|august|aug|september|sep|oktober|october|oct|november|nov|desember|december|dec)\s+(20\d{2})\b/i);
    if (match) return { value: `${match[3]}-${String(MONTHS[match[2].toLowerCase()]).padStart(2, '0')}-${match[1].padStart(2, '0')}`, line };
  }
  return { value: null, line: null };
};

const amountsOnLine = (line) => {
  const matches = line.match(/(?:rp\.?\s*)?\d{1,3}(?:[.,]\d{3})+|(?:rp\.?\s*)\d{4,}|\b\d{4,7}\b/gi) || [];
  return matches.map(moneyFromToken).filter(Boolean);
};

const classifyDocument = (text) => {
  if (/transfer keluar|penerima[\s\S]{0,100}sumber dana/i.test(text)) return 'bank_transfer';
  if (/top\s*up\s*(?:mt|kmt)|saldo kartu|kereta commuter|\bkci\b/i.test(text)) return 'top_up';
  if (/qris|qr payment/i.test(text)) return 'qris_payment';
  if (/tap\s*out|gopay.*transport|gojek|stt terpadu/i.test(text)) return 'transport_payment';
  if (/total|subtotal|cash|change|item sold|produk/i.test(text)) return 'purchase_receipt';
  return 'unknown';
};

const scoreAmountLine = (line, documentType) => {
  const lower = line.toLowerCase();
  let score = 0;
  if (/\bgrand\s*total\b|\btotal\s*bayar\b|\btotal\b|\bjumlah\b|\bnominal\b/.test(lower)) score += 8;
  if (/\btop\s*up\b/.test(lower) && documentType === 'top_up') score += 12;
  if (/transaksi berhasil/.test(lower)) score += 3;
  if (/\bpaid\b/.test(lower) && !/total paid/.test(lower)) score += 4;
  if (/\brp\.?\s*\d/i.test(lower) && ['bank_transfer', 'qris_payment', 'transport_payment', 'top_up'].includes(documentType)) score += 3;
  if (/subtotal|sub total|cash|tunai|total paid|change|changes|kembali|saldo|discount|diskon|voucher|ongkir|pengiriman|layanan|pajak|ppn|dpp|hemat/.test(lower)) score -= 12;
  if (/no\.?\s*(?:kartu|resi|pesanan)|rekening|transaksi|order|terminal|rrn|npwp|merchant pan|\bid\b/.test(lower)) score -= 14;
  return score;
};

const findTotal = (lines, documentType) => {
  const candidates = [];
  lines.forEach((line, index) => {
    const score = scoreAmountLine(line, documentType);
    amountsOnLine(line).forEach((amount) => candidates.push({ amount, line, score, index }));
  });
  candidates.sort((a, b) => b.score - a.score || b.index - a.index);
  const best = candidates.find((candidate) => candidate.score > 0) || null;
  return { value: best?.amount || null, line: best?.line || null, candidates };
};

const findMerchant = (lines, documentType) => {
  const noise = /^\[[^\]]+\]$|tanggal|date|waktu|npwp|alamat|jl\.|total|subtotal|cash|change|pembayaran|status|transaksi|no\.?\s|\bid\b|saldo/i;
  if (documentType === 'bank_transfer') {
    const recipientIndex = lines.findIndex((line) => /^penerima\b/i.test(line));
    if (recipientIndex >= 0) {
      const same = lines[recipientIndex].replace(/^penerima\s*:?[\s]*/i, '').trim();
      return { value: same || lines[recipientIndex + 1] || null, line: same ? lines[recipientIndex] : lines[recipientIndex + 1] };
    }
  }
  const branded = lines.find((line) => /familymart|oh!?\s*some|mie gacoan|kereta commuter|kci\b|kebab|stt terpadu/i.test(line));
  const line = branded || lines.slice(0, 8).find((value) => value.length >= 3 && !noise.test(value) && /[a-z]/i.test(value));
  return { value: line ? cleanLine(line).slice(0, 120) : null, line: line || null };
};

const determineCategory = (text, items = []) => {
  const haystack = `${text}\n${items.map((item) => item.name).join(' ')}`.toLowerCase();
  if (/dana darurat|tabungan|menabung|investasi|deposito|reksadana|saham|emas investasi/.test(haystack)) return { group: 'savings', detail: 'investment', basis: 'Tabungan atau investasi disebutkan secara eksplisit' };
  if (/kacamata|optik|dokter|klinik|apotek|obat|kesehatan/.test(haystack)) return { group: 'needs', detail: 'health', basis: 'Pengeluaran kesehatan' };
  if (/kereta commuter|\bkci\b|\bkmt\b|tap\s*out|stt terpadu|transport|gojek|angkutan|bensin|parkir|tol/.test(haystack)) return { group: 'needs', detail: 'transportation', basis: 'Pengeluaran transportasi' };
  if (/sekolah|kuliah|kampus|pendidikan|buku pelajaran|uang spp/.test(haystack)) return { group: 'needs', detail: 'education', basis: 'Pengeluaran pendidikan' };
  if (/familymart|mie gacoan|kebab|restaurant|restoran|cafe|kopi|butterscotch|cheese|bento|makanan|minuman|food/.test(haystack)) return { group: 'wants', detail: 'food_and_dining', basis: 'Restoran, jajan, atau makanan siap saji' };
  if (/oh!?\s*some|shopping|belanja non|fashion|furniture|paper shopping/.test(haystack)) return { group: 'wants', detail: 'shopping', basis: 'Belanja non-esensial' };
  if (/supermarket|minimarket|sembako|beras|sayur|grocer|kebutuhan pokok/.test(haystack)) return { group: 'needs', detail: 'groceries', basis: 'Kebutuhan pokok' };
  return { group: null, detail: null, basis: null };
};

const findAccountHint = (text) => {
  if (/\bjago\b/i.test(text)) return 'Jago';
  if (/\bbtn\b|bal[eé]\s+by\s+btn/i.test(text)) return 'BTN';
  if (/saldo\s+dana|id\s+dana|dana\s+(?:qris|protection)|metode pembayaran[\s\S]{0,40}dana/i.test(text)) return 'DANA';
  if (/\bcash\b|\btunai\b/i.test(text)) return 'Cash';
  return null;
};

const determineExpense = (text, documentType) => {
  if (documentType === 'top_up' && /kereta commuter|\bkci\b|\bkmt\b|saldo kartu/i.test(text)) return true;
  if (/dana darurat|tabungan|investasi/i.test(text)) return true;
  if (/top\s*up\s*(?:dana|gopay|ovo|shopeepay)|transfer (?:ke )?(?:rekening|akun) sendiri|antarakun/i.test(text)) return false;
  return true;
};

const paymentMethod = (text, documentType) => {
  if (/\bjago\b/i.test(text)) return 'Jago';
  if (/saldo\s+dana|id\s+dana|metode pembayaran[\s\S]{0,40}dana/i.test(text)) return 'DANA';
  if (documentType === 'bank_transfer') return 'bank_transfer';
  if (/\bcash\b|\btunai\b/i.test(text)) return 'cash';
  return documentType === 'qris_payment' ? 'QRIS' : null;
};

const buildFallback = (rawText) => {
  const text = normalizeText(rawText);
  const lines = text.split('\n').map(cleanLine).filter(Boolean);
  const documentType = classifyDocument(text);
  const date = findDate(lines);
  const total = findTotal(lines, documentType);
  const merchant = findMerchant(lines, documentType);
  const category = determineCategory(text);
  const expense = determineExpense(text, documentType);
  const noteMatch = text.match(/(?:catatan|note)\s*:?\s*([^\n]+)/i);
  const expenseName = noteMatch?.[1]?.trim() || (documentType === 'top_up' ? 'Top up KMT' : merchant.value);
  const warnings = [];
  if (!date.value) warnings.push('Tanggal tidak ditemukan pada teks OCR.');
  if (!total.value) warnings.push('Nominal total tidak ditemukan pada teks OCR.');
  if (!category.group) warnings.push('Kategori tidak dapat ditentukan dengan yakin.');
  if (!expense) warnings.push('Bukti terlihat sebagai transfer antarakun atau top-up saldo sendiri, bukan pengeluaran.');
  const fieldScores = { merchant: merchant.value ? 0.72 : 0, date: date.value ? 0.9 : 0, total: total.value ? 0.86 : 0, category: category.group ? 0.82 : 0 };
  const overall = Object.values(fieldScores).reduce((sum, score) => sum + score, 0) / 4;
  return {
    expenseName: expenseName || null, merchant: merchant.value, date: date.value, total: total.value, items: [],
    categoryGroup: category.group, categoryDetail: category.detail,
    description: expenseName ? `${expenseName}${merchant.value && merchant.value !== expenseName ? ` - ${merchant.value}` : ''}`.slice(0, 500) : null,
    accountHint: findAccountHint(text), documentType, isExpense: expense, paymentMethod: paymentMethod(text, documentType), transactionReference: null,
    confidence: { ...fieldScores, overall }, needsReview: warnings.length > 0, warnings,
    evidence: { merchantLine: merchant.line, dateLine: date.line, totalLine: total.line, categoryBasis: category.basis },
  };
};

const validate = (candidate, rawText) => {
  const fallback = buildFallback(rawText);
  const result = { ...fallback, ...(candidate || {}) };
  result.confidence = { ...fallback.confidence, ...(candidate?.confidence || {}) };
  result.evidence = { ...fallback.evidence, ...(candidate?.evidence || {}) };
  result.warnings = [...new Set([...(candidate?.warnings || []), ...fallback.warnings.filter((warning) => {
    if (warning.startsWith('Tanggal')) return !result.date;
    if (warning.startsWith('Nominal')) return !result.total;
    if (warning.startsWith('Kategori')) return !result.categoryGroup;
    return !result.isExpense;
  })])];

  const evidenceText = Object.values(result.evidence).filter(Boolean).join(' ');
  const rawDigits = normalizeText(rawText).replace(/[^0-9]/g, '');
  const evidenceTotalDigits = String(result.evidence.totalLine || '').replace(/[^0-9]/g, '');
  if (result.total != null && (!rawDigits.includes(String(result.total)) || (result.evidence.totalLine && !evidenceTotalDigits.includes(String(result.total))))) {
    result.warnings.push('Nominal hasil AI tidak memiliki kandidat yang sama pada teks OCR.');
    result.total = fallback.total;
    result.evidence.totalLine = fallback.evidence.totalLine;
    result.confidence.total = Math.min(clamp(result.confidence.total), 0.5);
  }
  const suspicious = result.total && /cash|total paid|change|changes|saldo/i.test(result.evidence.totalLine || '') && fallback.total && fallback.total !== result.total;
  if (suspicious) {
    result.warnings.push('Nominal cash, kembalian, atau saldo diabaikan; total transaksi digunakan.');
    result.total = fallback.total;
    result.evidence.totalLine = fallback.evidence.totalLine;
  }
  if (result.date && fallback.date && result.date !== fallback.date) {
    result.warnings.push('Tanggal hasil AI berbeda dari kandidat tanggal yang terbaca OCR.');
    result.date = fallback.date;
    result.evidence.dateLine = fallback.evidence.dateLine;
    result.confidence.date = Math.min(clamp(result.confidence.date), 0.6);
  }
  const lines = normalizeText(rawText).split('\n').map(cleanLine).filter(Boolean);
  const labeledAmount = (pattern) => {
    const line = lines.find((value) => pattern.test(value));
    return line ? amountsOnLine(line).at(-1) || null : null;
  };
  const cash = labeledAmount(/\bcash\b|\btunai\b/i);
  const change = labeledAmount(/change|changes|kembali/i);
  if (cash && change && result.total && cash - change !== Number(result.total)) {
    result.warnings.push(`Validasi cash - change tidak cocok dengan total (${cash} - ${change}).`);
  }
  const subtotal = labeledAmount(/subtotal|sub total/i);
  const discount = labeledAmount(/discount|diskon|voucher/i);
  const feeLines = lines.filter((line) => /ongkir|pengiriman|layanan|service fee|biaya admin/i.test(line));
  const fees = feeLines.reduce((sum, line) => sum + (amountsOnLine(line).at(-1) || 0), 0);
  if (subtotal && result.total && (discount || fees) && subtotal - (discount || 0) + fees !== Number(result.total)) {
    result.warnings.push('Rumus subtotal - diskon + biaya tidak cocok persis dengan total; periksa komponen struk.');
  }
  const itemAmounts = Array.isArray(result.items) ? result.items.map((item) => Number(item.amount)).filter((amount) => Number.isFinite(amount) && amount > 0) : [];
  if (itemAmounts.length && result.total && itemAmounts.reduce((sum, amount) => sum + amount, 0) < Number(result.total) * 0.5) {
    result.warnings.push('Jumlah item OCR jauh di bawah total transaksi.');
  }
  if (result.date && !normalizeText(rawText).toLowerCase().includes(String(result.date).replace(/-/g, '/')) && !fallback.date) {
    result.warnings.push('Tanggal hasil AI tidak dapat diverifikasi dari OCR.');
    result.date = null;
  }
  if (result.date) {
    const parsedDate = new Date(`${result.date}T00:00:00Z`);
    if (Number.isNaN(parsedDate.getTime()) || parsedDate.getTime() > Date.now() + 86400000) {
      result.warnings.push('Tanggal transaksi tidak wajar atau berada di masa depan.');
    }
  }
  if (result.categoryGroup && !['needs', 'wants', 'savings'].includes(result.categoryGroup)) result.categoryGroup = fallback.categoryGroup;
  if (!result.expenseName) result.expenseName = result.merchant;
  if (fallback.isExpense === false) result.isExpense = false;
  if (['top_up', 'transport_payment'].includes(fallback.documentType) && /kereta commuter|\bkci\b|\bkmt\b|tap\s*out|stt terpadu/i.test(rawText)) result.isExpense = true;
  result.isExpense = Boolean(result.isExpense);
  result.needsReview = Boolean(result.needsReview || result.warnings.length || !result.total || !result.date || !result.categoryGroup || !evidenceText);
  Object.keys(result.confidence).forEach((key) => { result.confidence[key] = clamp(result.confidence[key]); });
  return result;
};

module.exports = { buildFallback, validate, findDate, findTotal, determineCategory, classifyDocument, moneyFromToken };
