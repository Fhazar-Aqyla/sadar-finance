import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/models/account_model.dart';
import '../../../data/models/financial_plan_models.dart';
import '../../../providers/finance_provider.dart';
import '../../widgets/sadar_card.dart';

class EWalletConnectScreen extends ConsumerStatefulWidget {
  const EWalletConnectScreen({super.key});

  @override
  ConsumerState<EWalletConnectScreen> createState() =>
      _EWalletConnectScreenState();
}

class _EWalletConnectScreenState extends ConsumerState<EWalletConnectScreen> {
  static const _channel = MethodChannel(
    'com.sadarfinance.sadar_finance/ewallet_listener',
  );

  bool _listenerPermissionGranted = false;
  bool _simulating = false;

  @override
  void initState() {
    super.initState();
    _checkPermission();
    _channel.setMethodCallHandler(_handleNativeCall);
  }

  Future<void> _checkPermission() async {
    try {
      final granted = await _channel.invokeMethod<bool>(
        'isNotificationListenerEnabled',
      );
      if (mounted) {
        setState(() => _listenerPermissionGranted = granted ?? false);
      }
    } catch (_) {}
  }

  Future<void> _openPermissionSettings() async {
    try {
      await _channel.invokeMethod<bool>('openNotificationListenerSettings');
      await Future.delayed(const Duration(seconds: 1));
      await _checkPermission();
    } catch (_) {}
  }

  Future<dynamic> _handleNativeCall(MethodCall call) async {
    if (call.method == 'onEWalletNotification' && call.arguments is Map) {
      final map = Map<String, dynamic>.from(call.arguments as Map);
      final providerId = (map['providerId'] ?? 'gopay').toString();
      final amount = (map['amount'] as num?)?.toDouble() ?? 0;
      final title = (map['title'] ?? 'Pembayaran Otomatis').toString();
      final isIncome = map['isIncome'] == true;

      final ok = await ref
          .read(financeProvider.notifier)
          .ingestEWalletNotification(
            providerId: providerId,
            amount: amount,
            merchantOrTitle: title,
            isIncome: isIncome,
          );
      if (ok && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppColors.success,
            content: Text(
              'Otomatis tercatat dari $providerId: ${AppFormatters.rupiah(amount)}',
            ),
          ),
        );
      }
    }
  }

  Future<void> _simulateNotification({
    required String providerId,
    required String merchant,
    required double amount,
    bool isIncome = false,
  }) async {
    if (_simulating) return;
    setState(() => _simulating = true);
    try {
      final ok = await ref
          .read(financeProvider.notifier)
          .ingestEWalletNotification(
            providerId: providerId,
            amount: amount,
            merchantOrTitle: merchant,
            isIncome: isIncome,
          );
      if (ok && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppColors.success,
            content: Text(
              'Auto-Catat berhasil! "$merchant" (${AppFormatters.rupiah(amount)}) tercatat otomatis.',
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppColors.danger,
            content: Text('Simulasi gagal: $e'),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _simulating = false);
    }
  }

  void _showConfigSheet(
    EWalletLinkModel item,
    List<AccountModel> accounts,
  ) {
    String? selectedAccId = item.linkedAccountId ??
        (accounts.isNotEmpty ? accounts.first.id : null);
    bool enabled = item.autoRecordEnabled;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.fromLTRB(
            20,
            20,
            20,
            MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Koneksikan ${item.providerName}',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimaryOf(ctx),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Setiap notifikasi pembayaran atau transfer masuk dari aplikasi ${item.providerName} di HP Anda akan otomatis dicatat ke akun dompet di bawah ini.',
                style: TextStyle(
                  fontSize: 12.5,
                  color: AppColors.textSecondaryOf(ctx),
                ),
              ),
              const SizedBox(height: 14),
              if (accounts.isNotEmpty)
                DropdownButtonFormField<String>(
                  initialValue: accounts.any((a) => a.id == selectedAccId)
                      ? selectedAccId
                      : accounts.first.id,
                  decoration: const InputDecoration(
                    labelText: 'Hubungkan ke Rekening / Dompet SADAR',
                    prefixIcon: Icon(Icons.account_balance_wallet_outlined),
                  ),
                  items: accounts
                      .map(
                        (a) => DropdownMenuItem<String>(
                          value: a.id,
                          child: Text(
                            '${a.name} (${AppFormatters.compactRupiah(a.balance)})',
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      )
                      .toList(),
                  onChanged: (v) => setModalState(() => selectedAccId = v),
                )
              else
                const Text(
                  'Tambahkan minimal 1 akun/dompet di menu Profil terlebih dahulu.',
                  style: TextStyle(fontSize: 12.5, color: AppColors.warning),
                ),
              const SizedBox(height: 12),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text(
                  'Aktifkan Auto-Catat Transaksi',
                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                ),
                subtitle: const Text(
                  'Deteksi nominal Rp & merchant otomatis saat ada notifikasi',
                  style: TextStyle(fontSize: 12),
                ),
                value: enabled,
                onChanged: (v) => setModalState(() => enabled = v),
              ),
              const SizedBox(height: 16),
              SizedBox(
                height: 48,
                child: ElevatedButton(
                  onPressed: () async {
                    await ref
                        .read(financeProvider.notifier)
                        .configureEWalletLink(
                          providerId: item.providerId,
                          linkedAccountId: selectedAccId,
                          autoRecordEnabled: enabled,
                        );
                    if (ctx.mounted) Navigator.pop(ctx);
                  },
                  child: const Text('Simpan Koneksi E-Wallet'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final finance = ref.watch(financeProvider);
    final links = finance.ewalletLinks.isNotEmpty
        ? finance.ewalletLinks
        : EWalletLinkModel.defaultProviders;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Koneksi E-Wallet Otomatis'),
        actions: [
          IconButton(
            tooltip: 'Cek Izin Notifikasi',
            onPressed: _checkPermission,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Permission Banner Card
          SadarCard(
            color: (_listenerPermissionGranted
                    ? AppColors.success
                    : AppColors.primary)
                .withValues(alpha: 0.10),
            borderColor: (_listenerPermissionGranted
                    ? AppColors.success
                    : AppColors.primary)
                .withValues(alpha: 0.35),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      _listenerPermissionGranted
                          ? Icons.verified_rounded
                          : Icons.notifications_active_outlined,
                      color: _listenerPermissionGranted
                          ? AppColors.success
                          : AppColors.primaryOf(context),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        _listenerPermissionGranted
                            ? 'Pendeteksi Notifikasi E-Wallet Aktif'
                            : 'Izin Pembaca Notifikasi Transaksi',
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 14.5,
                          color: AppColors.textPrimaryOf(context),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  _listenerPermissionGranted
                      ? 'SADAR Finance siap mencatat otomatis setiap kali ada notifikasi pembayaran QRIS, GoPay, DANA, OVO, ShopeePay, atau Mobile Banking di HP Anda.'
                      : 'Aktifkan akses notifikasi untuk SADAR Finance agar transaksi GoPay, DANA, OVO, ShopeePay, dan Mobile Banking bisa langsung tercatat otomatis tanpa input manual.',
                  style: TextStyle(
                    fontSize: 12.5,
                    color: AppColors.textSecondaryOf(context),
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: _openPermissionSettings,
                    icon: Icon(
                      _listenerPermissionGranted
                          ? Icons.settings_outlined
                          : Icons.lock_open_rounded,
                      size: 18,
                    ),
                    label: Text(
                      _listenerPermissionGranted
                          ? 'Pengaturan Akses Notifikasi Android'
                          : 'Beri Izin Akses Notifikasi Android',
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Live Simulation Card
          SadarCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SectionHeader(
                  title: 'Uji Coba Auto-Catat Sekarang',
                  subtitle:
                      'Simulasikan notifikasi transaksi masuk dari E-Wallet untuk melihat pencatatan otomatis',
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    ActionChip(
                      avatar: const Icon(
                        Icons.qr_code_scanner_rounded,
                        size: 16,
                        color: AppColors.accent,
                      ),
                      label: const Text('Tes GoPay QRIS · Rp 25.000'),
                      onPressed: _simulating
                          ? null
                          : () => _simulateNotification(
                                providerId: 'gopay',
                                merchant: 'QRIS Kopi Kenangan',
                                amount: 25000,
                              ),
                    ),
                    ActionChip(
                      avatar: const Icon(
                        Icons.account_balance_wallet_rounded,
                        size: 16,
                        color: AppColors.primaryLight,
                      ),
                      label: const Text('Tes DANA · Rp 45.000'),
                      onPressed: _simulating
                          ? null
                          : () => _simulateNotification(
                                providerId: 'dana',
                                merchant: 'Minimarket Alfamart',
                                amount: 45000,
                              ),
                    ),
                    ActionChip(
                      avatar: const Icon(
                        Icons.call_received_rounded,
                        size: 16,
                        color: AppColors.success,
                      ),
                      label: const Text('Tes Transfer Masuk · +Rp 150.000'),
                      onPressed: _simulating
                          ? null
                          : () => _simulateNotification(
                                providerId: 'mandiri',
                                merchant: 'Transfer Masuk Livin',
                                amount: 150000,
                                isIncome: true,
                              ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          const SectionHeader(
            title: 'Daftar E-Wallet & Mobile Banking',
            subtitle: 'Ketuk untuk memilih akun tujuan pencatatan otomatis',
          ),
          const SizedBox(height: 10),
          ...links.map((item) {
            final linkedAcc = finance.accountNameById(item.linkedAccountId);
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: SadarCard(
                onTap: () => _showConfigSheet(item, finance.accounts),
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: (item.autoRecordEnabled
                                ? AppColors.accent
                                : AppColors.primaryOf(context))
                            .withValues(alpha: 0.13),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        item.autoRecordEnabled
                            ? Icons.bolt_rounded
                            : Icons.account_balance_wallet_outlined,
                        color: item.autoRecordEnabled
                            ? AppColors.accent
                            : AppColors.primaryOf(context),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.providerName,
                            style: TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 14.5,
                              color: AppColors.textPrimaryOf(context),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            item.autoRecordEnabled
                                ? 'Terhubung ke: ${linkedAcc != '-' ? linkedAcc : 'Akun Utama'} · ${item.syncedCount}x tercatat'
                                : 'Ketuk untuk menghubungkan ke akun dompet',
                            style: TextStyle(
                              fontSize: 12,
                              color: item.autoRecordEnabled
                                  ? AppColors.accentOf(context)
                                  : AppColors.textSecondaryOf(context),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Switch(
                      value: item.autoRecordEnabled,
                      onChanged: (v) => ref
                          .read(financeProvider.notifier)
                          .configureEWalletLink(
                            providerId: item.providerId,
                            linkedAccountId: item.linkedAccountId ??
                                (finance.accounts.isNotEmpty
                                    ? finance.accounts.first.id
                                    : null),
                            autoRecordEnabled: v,
                          ),
                    ),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
