import 'package:flutter/services.dart';
import 'formatters.dart';

/// Formats numeric Rupiah input with Indonesian dot thousand separators in real time
/// (e.g., "150000" -> "150.000") while keeping cursor alignment natural.
class CurrencyInputFormatter extends TextInputFormatter {
  final int maxDigits;

  const CurrencyInputFormatter({this.maxDigits = 14});

  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final digitsOnly = newValue.text.replaceAll(RegExp(r'[^0-9]'), '');
    if (digitsOnly.isEmpty) {
      return const TextEditingValue(
        text: '',
        selection: TextSelection.collapsed(offset: 0),
      );
    }

    final trimmed = digitsOnly.length > maxDigits
        ? digitsOnly.substring(0, maxDigits)
        : digitsOnly;
    final numeric = int.tryParse(trimmed);
    if (numeric == null) return oldValue;

    final formatted = AppFormatters.number(numeric);

    // Count how many digits appeared before the user's cursor in newValue
    final rawCursor = newValue.selection.end.clamp(0, newValue.text.length);
    final digitsBeforeCursor = newValue.text
        .substring(0, rawCursor)
        .replaceAll(RegExp(r'[^0-9]'), '')
        .length;

    int targetOffset = formatted.length;
    if (digitsBeforeCursor <= 0) {
      targetOffset = 0;
    } else {
      int seenDigits = 0;
      for (int i = 0; i < formatted.length; i++) {
        if (RegExp(r'[0-9]').hasMatch(formatted[i])) {
          seenDigits++;
          if (seenDigits == digitsBeforeCursor) {
            targetOffset = i + 1;
            break;
          }
        }
      }
    }

    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: targetOffset),
    );
  }
}
