import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:sadar_finance/core/utils/currency_input_formatter.dart';
import 'package:sadar_finance/core/utils/formatters.dart';

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
}
