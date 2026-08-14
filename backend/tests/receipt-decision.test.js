const test = require('node:test');
const assert = require('node:assert/strict');
const { buildFallback, validate, determineCategory } = require('../services/receiptDecision.service');
const { receiptSchema } = require('../services/groqReceipt.service');

const fixtures = [
  { name: 'FamilyMart', text: 'FamilyMart\n07/03/2026 17:55\nButterscotch 17,000\nSosis 11,000\nEgg Roll 14,000\nBento 36,000\nTOTAL Rp 77,000\nCASH 100,000\nCHANGES 23,000', date: '2026-03-07', total: 77000, group: 'wants', detail: 'food_and_dining' },
  { name: 'KCI February English', text: 'PT KERETA COMMUTER INDONESIA\n25 February 2026 - 11:08\nTop up MT\nTop up Rp.10,000\nSaldo Kartu Rp.15,500', date: '2026-02-25', total: 10000, group: 'needs', detail: 'transportation' },
  { name: 'OH SOME', text: 'OH! SOME\nWaktu checkout: 2026/03/06 17:21:50\nPaper shopping Rp4,000\n2 Produk Rp103,900\nTotal Rp103,900\nCash Rp110,000\nChange Rp6,100', date: '2026-03-06', total: 103900, group: 'wants', detail: 'shopping' },
  { name: 'KCI 23', text: 'PT KERETA COMMUTER INDONESIA\n23 February 2026 - 07:17\nTop up MT\nTopup Rp.10,000\nSaldo Kartu Rp.13,500', date: '2026-02-23', total: 10000, group: 'needs', detail: 'transportation' },
  { name: 'KCI 28', text: 'PT KERETA COMMUTER INDONESIA\n28 February 2026 - 16:10\nTop up MT\nTopup Rp.10,000\nSaldo Kartu Rp.13,500', date: '2026-02-28', total: 10000, group: 'needs', detail: 'transportation' },
  { name: 'BTN purchase transfer', text: 'Transfer Keluar\nTRANSAKSI BERHASIL\nRp 500.000\n26 Februari 2026 | 22:21 WIB\nPenerima TOKO OPTIK\nSumber Dana BTN\nCatatan Bayar kacamata', date: '2026-02-26', total: 500000, group: 'needs', detail: 'health', account: 'BTN' },
  { name: 'GoPay KCI', text: 'Rp4.000\nKCI - QRIS TAP\nTap out berhasil & saldo terpotong\nMetode pembayaran Jago\nTanggal 27 Feb 2026', date: '2026-02-27', total: 4000, group: 'needs', detail: 'transportation', account: 'Jago' },
  { name: 'GoPay transport', text: 'Rp8.500\nSTT Terpadu Kampus B\nMetode pembayaran Jago\nTanggal 27 Feb 2026\nTotal Rp8.500', date: '2026-02-27', total: 8500, group: 'needs', detail: 'transportation', account: 'Jago' },
  { name: 'DANA QRIS', text: 'QRIS\n04 Mei 2026 19:54\nPembayaran ke Mie Gacoan\nTotal Bayar Rp67.000\nMetode Pembayaran Saldo DANA', date: '2026-05-04', total: 67000, group: 'wants', detail: 'food_and_dining', account: 'DANA' },
  { name: 'Kebab order', text: 'Rincian Pesanan\nBeef Kebab Original\nSubtotal Rp101.200\nVoucher Diskon -Rp45.540\nBiaya Pengiriman Rp11.000\nBiaya Layanan Rp1.000\nPaid Rp67.660\nWaktu Pemesanan 24 Feb 2026 17:51', date: '2026-02-24', total: 67660, group: 'wants', detail: 'food_and_dining' },
];

for (const fixture of fixtures) {
  test(`extracts ${fixture.name} without choosing cash, change, subtotal, or balance`, () => {
    const result = buildFallback(fixture.text);
    assert.equal(result.date, fixture.date);
    assert.equal(result.total, fixture.total);
    assert.equal(result.categoryGroup, fixture.group);
    assert.equal(result.categoryDetail, fixture.detail);
    if (fixture.account) assert.equal(result.accountHint, fixture.account);
  });
}

test('rejects hallucinated Groq amount and uses OCR evidence', () => {
  const text = 'Toko Contoh\n01/08/2026\nTOTAL Rp20.000\nCASH Rp50.000\nCHANGE Rp30.000';
  const result = validate({ total: 999999, evidence: { totalLine: 'imagined' }, warnings: [], confidence: { total: 0.99 } }, text);
  assert.equal(result.total, 20000);
  assert.ok(result.warnings.some((warning) => /tidak memiliki kandidat/.test(warning)));
});

test('strict Groq schema requires every supported field', () => {
  assert.equal(receiptSchema.additionalProperties, false);
  assert.ok(receiptSchema.required.includes('evidence'));
  assert.ok(receiptSchema.required.includes('isExpense'));
  assert.deepEqual(receiptSchema.properties.categoryGroup.anyOf[0].enum, ['needs', 'wants', 'savings']);
});

test('emergency fund is savings and own wallet top-up is not an expense', () => {
  assert.equal(determineCategory('Transfer dana darurat').group, 'savings');
  assert.equal(buildFallback('Top up DANA akun sendiri\n01/08/2026\nTotal Rp50.000').isExpense, false);
});
