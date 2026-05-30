const fs = require('fs/promises');
const path = require('path');
const { spawn } = require('child_process');

const MONTHS_ID = {
  jan: '01',
  januari: '01',
  feb: '02',
  februari: '02',
  mar: '03',
  maret: '03',
  apr: '04',
  april: '04',
  mei: '05',
  may: '05',
  jun: '06',
  juni: '06',
  jul: '07',
  juli: '07',
  agu: '08',
  agustus: '08',
  aug: '08',
  september: '09',
  sep: '09',
  okt: '10',
  oktober: '10',
  oct: '10',
  nov: '11',
  november: '11',
  des: '12',
  desember: '12',
  dec: '12',
};

const cleanLine = (line) => String(line || '').replace(/\s+/g, ' ').trim();

const toIsoDate = (year, month, day) => {
  const parsedYear = Number(year) < 100 ? Number(year) + 2000 : Number(year);
  const parsedMonth = String(month).padStart(2, '0');
  const parsedDay = String(day).padStart(2, '0');
  return `${parsedYear}-${parsedMonth}-${parsedDay}`;
};

const parseAmount = (value) => {
  const digits = String(value || '').replace(/[^\d]/g, '');
  if (!digits) return null;

  const amount = Number(digits);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100000000) return null;
  return amount;
};

const extractAmounts = (text) => {
  const matches = String(text || '').matchAll(/(?:rp\s*)?(\d{1,3}(?:[.\s]\d{3})+|\d{4,})(?:,\d{2})?/gi);
  return Array.from(matches)
    .map((match) => parseAmount(match[1]))
    .filter((amount) => amount !== null);
};

const cleanMerchant = (value) => cleanLine(value)
  .replace(/\b(KAB|KOTA|KABUPATEN)\b.*$/i, '')
  .replace(/\b(ID|RRN|QRIS|PAN|TERMINAL)\b.*$/i, '')
  .replace(/[^\w\s.&'-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const LOCAL_OCR_TIMEOUT_MS = 20000;
const LOCAL_OCR_SUPPORTED_MIME_TYPES = new Set(['image/jpeg', 'image/png']);

class LocalOcrService {
  async extractReceipt(file) {
    await this._assertSupportedLocalImage(file);
    const rawText = await this._recognizeInChildProcess(file.path);
    const parsed = this.parseReceiptText(rawText);

    return {
      rawText,
      data: {
        ...parsed,
        currency: 'IDR',
        ocrSource: 'local-tesseract-js',
      },
      confidence: this._estimateConfidence(rawText, parsed),
      modelVersion: 'local-tesseract-js-v1',
    };
  }

  async _assertSupportedLocalImage(file) {
    if (!LOCAL_OCR_SUPPORTED_MIME_TYPES.has(file?.mimetype)) {
      throw new Error(`Local OCR does not support ${file?.mimetype || 'unknown file type'}`);
    }

    const handle = await fs.open(file.path, 'r');
    try {
      const { buffer } = await handle.read(Buffer.alloc(8), 0, 8, 0);
      const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
      const isPng = buffer.equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));

      if (!isJpeg && !isPng) {
        throw new Error('Local OCR only supports valid JPEG or PNG images');
      }
    } finally {
      await handle.close();
    }
  }

  _recognizeInChildProcess(imagePath) {
    const workerPath = path.join(__dirname, '..', 'scripts', 'local-ocr-worker.js');

    return new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [workerPath, imagePath], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';
      let settled = false;

      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        child.kill('SIGKILL');
        reject(new Error(`Local OCR timed out after ${LOCAL_OCR_TIMEOUT_MS}ms`));
      }, LOCAL_OCR_TIMEOUT_MS);

      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      child.on('error', (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        reject(err);
      });

      child.on('close', (code) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);

        if (code !== 0) {
          reject(new Error(stderr.trim() || `Local OCR worker exited with code ${code}`));
          return;
        }

        try {
          const payload = JSON.parse(stdout);
          resolve(payload.rawText || '');
        } catch (_err) {
          reject(new Error('Local OCR worker returned invalid output'));
        }
      });
    });
  }

  parseReceiptText(rawText) {
    const lines = String(rawText || '')
      .split(/\r?\n/)
      .map(cleanLine)
      .filter(Boolean);

    return {
      merchant: this._extractMerchant(lines),
      date: this._extractDate(rawText),
      items: this._extractItems(lines),
      total: this._extractTotal(lines, rawText),
      categoryGroup: null,
      categoryDetail: null,
    };
  }

  _extractTotal(lines, rawText) {
    const totalKeywords = /\b(total|total bayar|grand total|jumlah|nominal|amount|bayar)\b/i;

    for (const line of lines) {
      if (!totalKeywords.test(line)) continue;
      const amounts = extractAmounts(line);
      if (amounts.length) return Math.max(...amounts);
    }

    const fallbackAmounts = extractAmounts(rawText).filter((amount) => amount >= 1000);
    return fallbackAmounts.length ? Math.max(...fallbackAmounts) : null;
  }

  _extractMerchant(lines) {
    const merchantPatterns = [
      /pembayaran\s+ke\s+(.+)/i,
      /pay\s+to\s+(.+)/i,
      /nama\s+merchant\s+(.+)/i,
      /^merchant\s+(.+)/i,
      /^store\s*[:\-]?\s*(.+)/i,
    ];

    for (const line of lines) {
      for (const pattern of merchantPatterns) {
        const match = line.match(pattern);
        if (!match) continue;

        const merchant = cleanMerchant(match[1]);
        if (merchant) return merchant;
      }
    }

    return lines.find((line) => {
      if (line.length < 3 || line.length > 80) return false;
      if (/\d{3,}|total|tanggal|date|transaksi|pembayaran|metode|detail|qris|saldo/i.test(line)) return false;
      return true;
    }) || null;
  }

  _extractDate(rawText) {
    const text = String(rawText || '');
    const wordDate = text.match(/\b(\d{1,2})\s+([a-zA-Z]+)\s+(\d{2,4})\b/);
    if (wordDate) {
      const month = MONTHS_ID[wordDate[2].toLowerCase()];
      if (month) return toIsoDate(wordDate[3], month, wordDate[1]);
    }

    const numericDate = text.match(/\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/);
    if (numericDate) {
      return toIsoDate(numericDate[3], numericDate[2], numericDate[1]);
    }

    return null;
  }

  _extractItems(lines) {
    return lines
      .filter((line) => {
        if (/total|bayar|saldo|transaksi|merchant|terminal|qris|rrn|pan|id |dana|metode|detail|penerbit/i.test(line)) return false;
        if (this._extractDate(line)) return false;
        return extractAmounts(line).length > 0;
      })
      .slice(0, 10)
      .map((line) => {
        const amounts = extractAmounts(line);
        const amount = amounts.length ? Math.max(...amounts) : null;
        return {
          name: cleanLine(line.replace(/(?:rp\s*)?\d[\d.\s]*(?:,\d{2})?/gi, '')),
          amount,
        };
      })
      .filter((item) => item.name && item.amount);
  }

  _estimateConfidence(rawText, parsed) {
    let score = rawText && rawText.trim().length > 20 ? 0.35 : 0;
    if (parsed.total) score += 0.3;
    if (parsed.merchant) score += 0.2;
    if (parsed.date) score += 0.1;
    if (parsed.items?.length) score += 0.05;
    return Math.min(0.9, Number(score.toFixed(2)));
  }
}

module.exports = new LocalOcrService();
