import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../providers/finance_provider.dart';
import '../utils/formatters.dart';

class PushNotificationService {
  static const MethodChannel _channel = MethodChannel(
    'com.sadarfinance.sadar_finance/notifications',
  );
  static const String _dispatchedKey = 'sadar_dispatched_push_keys_v2';

  static Future<bool> requestPermission() async {
    try {
      final granted = await _channel.invokeMethod<bool>('requestPermission');
      return granted ?? false;
    } catch (_) {
      return false;
    }
  }

  static Future<bool> showNotification({
    required int id,
    required String title,
    required String body,
  }) async {
    try {
      await requestPermission();
      final shown = await _channel.invokeMethod<bool>(
        'showNotification',
        {
          'id': id,
          'title': title,
          'body': body,
        },
      );
      return shown ?? false;
    } catch (_) {
      return false;
    }
  }

  /// Automatically checks broadcasts, budget 50/30/20 threshold, due recurring bills,
  /// and debt due dates, dispatching each unique native Android push notification once.
  static Future<void> evaluateAndDispatch(
    FinanceState finance, {
    required bool enabled,
  }) async {
    if (!enabled) return;
    try {
      await requestPermission();
      final prefs = await SharedPreferences.getInstance();
      final dispatched =
          (prefs.getStringList(_dispatchedKey) ?? const <String>[]).toSet();
      bool changed = false;

      Future<void> dispatchOnce({
        required String key,
        required int id,
        required String title,
        required String body,
      }) async {
        if (dispatched.contains(key)) return;
        final ok = await showNotification(id: id, title: title, body: body);
        if (ok) {
          dispatched.add(key);
          changed = true;
        }
      }

      // 1. Admin Broadcast Push Notification
      for (final b in finance.broadcasts) {
        if (b['active'] == false) continue;
        final bId = (b['id'] ?? 'bcast').toString();
        final updatedAt = (b['updatedAt'] ?? '').toString();
        final title = (b['title'] ?? 'Pengumuman SADAR Finance').toString();
        final msg = (b['message'] ?? '').toString();
        if (msg.isNotEmpty) {
          await dispatchOnce(
            key: 'bcast_${bId}_$updatedAt',
            id: 2100 + (bId.hashCode.abs() % 500),
            title: title,
            body: msg,
          );
        }
      }

      // 2. Monthly Budget 50/30/20 Alert (>= 85% or >= 100%)
      final now = DateTime.now();
      final monthKey = '${now.year}-${now.month.toString().padLeft(2, '0')}';
      final budgetLimit = finance.budget?.totalLimit ?? 0;
      if (budgetLimit > 0) {
        final pct = ((finance.currentMonthExpense / budgetLimit) * 100).round();
        if (pct >= 100) {
          await dispatchOnce(
            key: 'budget_100_$monthKey',
            id: 3101,
            title: 'Peringatan Budget Bulanan ($pct%)',
            body:
                'Pengeluaran bulan ini (${AppFormatters.rupiah(finance.currentMonthExpense)}) telah melampaui target budget ${AppFormatters.rupiah(budgetLimit)}.',
          );
        } else if (pct >= 85) {
          await dispatchOnce(
            key: 'budget_85_$monthKey',
            id: 3102,
            title: 'Waspada Anggaran 50/30/20 ($pct%)',
            body:
                'Pengeluaran bulan ini sudah mencapai $pct% dari batas anggaran. Yuk jaga sisa budget harianmu!',
          );
        }
      }

      // 3. Unpaid Recurring Bills Due Within 3 Days
      for (final r in finance.recurringItems) {
        if (r.isPaidForMonth(now)) continue;
        final diffDays = r.dayOfMonth - now.day;
        if (diffDays >= -2 && diffDays <= 3) {
          await dispatchOnce(
            key: 'rec_${r.id}_$monthKey',
            id: 4100 + (r.id.hashCode.abs() % 500),
            title:
                'Pengingat ${r.isIncome ? "Jadwal Pemasukan" : "Tagihan Rutin"}: ${r.title}',
            body:
                'Jadwal tanggal ${r.dayOfMonth} sebesar ${AppFormatters.rupiah(r.amount)} belum dicatat bulan ini.',
          );
        }
      }

      // 4. Unsettled Debts / Receivables Approaching Due Date
      for (final d in finance.debts) {
        if (d.isSettled || d.dueDate == null) continue;
        final due = DateTime(d.dueDate!.year, d.dueDate!.month, d.dueDate!.day);
        final today = DateTime(now.year, now.month, now.day);
        final diff = due.difference(today).inDays;
        if (diff <= 3) {
          await dispatchOnce(
            key: 'debt_${d.id}_${AppFormatters.isoDateOnly(due)}',
            id: 5100 + (d.id.hashCode.abs() % 500),
            title:
                'Jatuh Tempo ${d.isReceivable ? "Piutang" : "Utang"}: ${d.personName}',
            body:
                'Catatan ${d.title} sebesar ${AppFormatters.rupiah(d.amount)} jatuh tempo pada ${AppFormatters.shortDate(due)}.',
          );
        }
      }

      if (changed) {
        final trimmed = dispatched.toList();
        if (trimmed.length > 150) {
          trimmed.removeRange(0, trimmed.length - 150);
        }
        await prefs.setStringList(_dispatchedKey, trimmed);
      }
    } catch (_) {}
  }
}
