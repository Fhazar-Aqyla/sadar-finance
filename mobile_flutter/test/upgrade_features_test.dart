import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:sadar_finance/core/utils/currency_input_formatter.dart';
import 'package:sadar_finance/core/utils/formatters.dart';
import 'package:sadar_finance/data/models/analytics_models.dart';
import 'package:sadar_finance/data/models/financial_plan_models.dart';

void main() {
  group('CurrencyInputFormatter', () {
    const formatter = CurrencyInputFormatter();

    test('formats plain digits with Indonesian thousand separators', () {
      const oldVal = TextEditingValue.empty;
      const newVal = TextEditingValue(
        text: '150000',
        selection: TextSelection.collapsed(offset: 6),
      );
      final result = formatter.formatEditUpdate(oldVal, newVal);
      expect(result.text, '150.000');
      expect(result.selection.baseOffset, 7);
      expect(AppFormatters.parseAmount(result.text), 150000);
    });

    test('strips non-numeric characters cleanly', () {
      const oldVal = TextEditingValue.empty;
      const newVal = TextEditingValue(
        text: 'Rp 2.500.000abc',
        selection: TextSelection.collapsed(offset: 15),
      );
      final result = formatter.formatEditUpdate(oldVal, newVal);
      expect(result.text, '2.500.000');
      expect(AppFormatters.parseAmount(result.text), 2500000);
    });

    test('handles empty input safely', () {
      const oldVal = TextEditingValue(text: '5');
      const newVal = TextEditingValue.empty;
      final result = formatter.formatEditUpdate(oldVal, newVal);
      expect(result.text, '');
      expect(result.selection.baseOffset, 0);
    });
  });

  group('Alert & Insight Indonesian Sanitizer', () {
    test('translates legacy English GMT+0000 alert into clean Bahasa Indonesia', () {
      const raw =
          'You are approaching your budget limit for Sun Nov 01 2026 00:00:00 GMT+0000 (Coordinated Universal Time). Predicted: Rp 123,200, Budget: Rp 112,000.';
      final sanitized = sanitizeIndonesianFinanceText(raw);
      expect(
        sanitized,
        'Pengeluaran bulan ini diprediksi mendekati batas anggaran. Prediksi: Rp 123.200 dari anggaran Rp 112.000.',
      );
    });

    test('normalizes comma-formatted Rupiah in smart insights', () {
      const raw = 'Alokasikan Rp28,000 dari pos kebutuhan Anda hari ini.';
      expect(
        sanitizeIndonesianFinanceText(raw),
        'Alokasikan Rp 28.000 dari pos kebutuhan Anda hari ini.',
      );
    });
  });

  group('Fase 2 Financial Plan Models', () {
    test('SavingsGoalModel computes progress ratio and remaining amount', () {
      final goal = SavingsGoalModel(
        id: 'g1',
        title: 'Dana Darurat',
        targetAmount: 10000000,
        currentAmount: 2500000,
        createdAt: DateTime(2026, 11, 23),
      );
      expect(goal.progressPercent, 25);
      expect(goal.remainingAmount, 7500000);
      expect(goal.isCompleted, isFalse);
    });

    test('RecurringItemModel tracks monthly paid status accurately', () {
      final now = DateTime(2026, 11, 23);
      final bill = RecurringItemModel(
        id: 'r1',
        title: 'Listrik PLN',
        amount: 350000,
        dayOfMonth: 10,
        createdAt: now,
      );
      expect(bill.isPaidFor(now), isFalse);
      final paid = bill.copyWith(
        lastPaidPeriod: RecurringItemModel.periodKey(now),
      );
      expect(paid.isPaidFor(now), isTrue);
    });
  });
}
