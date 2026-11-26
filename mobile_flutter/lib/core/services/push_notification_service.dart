import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../providers/finance_provider.dart';
import '../network/api_client.dart';
import '../utils/formatters.dart';

class PushNotificationService {
  static const MethodChannel _channel = MethodChannel(
    'com.sadarfinance.sadar_finance/notifications',
  );
  static const String _dispatchedKey = 'sadar_dispatched_push_keys_v3';

  static void initTapHandler(void Function(String route) onTap) {
    _channel.setMethodCallHandler((call) async {
      if (call.method == 'onNotificationTapped') {
        final args = call.arguments;
        if (args is Map) {
          final route = (args['route'] ?? '').toString().trim();
          if (route.startsWith('/')) {
            onTap(route);
          }
        }
      }
      return null;
    });
  }

  static Future<String?> consumeInitialRoute() async {
    try {
      final route = await _channel.invokeMethod<String>('consumeInitialRoute');
      if (route != null && route.trim().startsWith('/')) {
        return route.trim();
      }
      return null;
    } catch (_) {
      return null;
    }
  }

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
    String route = '/dashboard',
  }) async {
    try {
      final shown = await _channel.invokeMethod<bool>(
        'showNotification',
        {
          'id': id,
          'title': title,
          'body': body,
          'route': route,
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

  /// Polls `/app/push-feed` so remote Push Notifications sent from the
  /// Web Developer Panel (`/developer-panel`) immediately trigger a
  /// native Android heads-up status bar notification on the phone
  /// and returns newly arrived items for in-app banner display.
  static Future<List<Map<String, String>>> pollRemotePushFeed(
    ApiClient api, {
    required bool enabled,
  }) async {
    if (!enabled) return const <Map<String, String>>[];
    final newlyDispatched = <Map<String, String>>[];
    try {
      final res = await api.get('/app/push-feed');
      if (res is! Map) return newlyDispatched;
      final data = (res['data'] is Map) ? res['data'] as Map : res;
      final list = data['notifications'];
      if (list is! List || list.isEmpty) return newlyDispatched;

      final prefs = await SharedPreferences.getInstance();
      final dispatched =
          (prefs.getStringList(_dispatchedKey) ?? const <String>[]).toSet();
      bool changed = false;

      // Mark older items beyond the latest 2 as already seen so we never flood the tray
      for (final oldRaw in list.skip(2)) {
        if (oldRaw is! Map) continue;
        final oldId = (oldRaw['id'] ?? '').toString();
        if (oldId.isNotEmpty && dispatched.add('remote_$oldId')) {
          changed = true;
        }
      }

      for (final raw in list.take(2)) {
        if (raw is! Map) continue;
        final target = (raw['target'] ?? 'all').toString();
        if (target == 'web') continue;
        final idStr = (raw['id'] ?? '').toString();
        if (idStr.isEmpty) continue;
        final key = 'remote_$idStr';
        if (dispatched.contains(key)) continue;

        final title = (raw['title'] ?? 'SADAR Finance V 3.0').toString();
        final body = (raw['body'] ?? raw['message'] ?? '').toString();
        final rawRoute = (raw['actionRoute'] ?? '/dashboard').toString().trim();
        final actionRoute = rawRoute.startsWith('/') ? rawRoute : '/dashboard';
        if (body.isEmpty) continue;

        final ok = await showNotification(
          id: 6100 + (idStr.hashCode.abs() % 800),
          title: title,
          body: body,
          route: actionRoute,
        );
        if (ok) {
          dispatched.add(key);
          changed = true;
        }
        newlyDispatched.add({
          'id': idStr,
          'title': title,
          'body': body,
          'actionRoute': actionRoute,
          'nativeShown': ok ? 'true' : 'false',
        });
      }

      if (changed) {
        final trimmed = dispatched.toList();
        if (trimmed.length > 150) {
          trimmed.removeRange(0, trimmed.length - 150);
        }
        await prefs.setStringList(_dispatchedKey, trimmed);
      }
    } catch (_) {}
    return newlyDispatched;
  }
}
