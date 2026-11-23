import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/currency_input_formatter.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/models/account_model.dart';
import '../../../data/models/financial_plan_models.dart';
import '../../../providers/finance_provider.dart';
import '../../../providers/ui_preferences_provider.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/sadar_card.dart';

class DebtSplitScreen extends ConsumerStatefulWidget {
  final int initialTab;

  const DebtSplitScreen({super.key, this.initialTab = 0});

  @override
  ConsumerState<DebtSplitScreen> createState() => _DebtSplitScreenState();
}

class _DebtSplitScreenState extends ConsumerState<DebtSplitScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Split Bill state
  final _billTitleCtrl = TextEditingController(text: 'Makan Bersama');
  final _billAmountCtrl = TextEditingController();
  final _taxPctCtrl = TextEditingController(text: '10');
  final _friendsCtrl = TextEditingController();
  int _peopleCount = 2;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 2,
      vsync: this,
      initialIndex: widget.initialTab.clamp(0, 1),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    _billTitleCtrl.dispose();
    _billAmountCtrl.dispose();
    _taxPctCtrl.dispose();
    _friendsCtrl.dispose();
    super.dispose();
  }

  void _showAddDebtSheet() {
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final amountCtrl = TextEditingController();
    final noteCtrl = TextEditingController();
    bool isReceivable = true;

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
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Catat Piutang / Utang Baru',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimaryOf(ctx),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: ChoiceChip(
                        label: const Text('Piutang (Teman Pinjam)'),
                        selected: isReceivable,
                        onSelected: (_) =>
                            setModalState(() => isReceivable = true),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ChoiceChip(
                        label: const Text('Utang (Saya Pinjam)'),
                        selected: !isReceivable,
                        onSelected: (_) =>
                            setModalState(() => isReceivable = false),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Nama Teman / Pihak Terkait',
                    hintText: 'Contoh: Budi, Andi, Kos',
                    prefixIcon: Icon(Icons.person_outline_rounded),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: phoneCtrl,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'No. WhatsApp (Opsional, untuk pengingat)',
                    hintText: '0812xxxxxxxx',
                    prefixIcon: Icon(Icons.chat_outlined),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: amountCtrl,
                  keyboardType: TextInputType.number,
                  inputFormatters: const [CurrencyInputFormatter()],
                  decoration: const InputDecoration(
                    labelText: 'Nominal',
                    prefixText: 'Rp ',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: noteCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Catatan (Opsional)',
                    hintText: 'Contoh: Patungan makan malam, Pinjam darurat',
                    prefixIcon: Icon(Icons.notes_rounded),
                  ),
                ),
                const SizedBox(height: 18),
                SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    onPressed: () async {
                      final name = nameCtrl.text.trim();
                      final amt = AppFormatters.parseAmount(amountCtrl.text);
                      if (name.isEmpty || amt <= 0) return;
                      await ref.read(financeProvider.notifier).addDebtItem(
                            personName: name,
                            phone: phoneCtrl.text.trim(),
                            amount: amt,
                            isReceivable: isReceivable,
                            note: noteCtrl.text.trim(),
                          );
                      if (ctx.mounted) Navigator.pop(ctx);
                    },
                    child: const Text('Simpan Catatan'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showSettleSheet(DebtItemModel item, List<AccountModel> accounts) {
    String? accountId = accounts.isNotEmpty ? accounts.first.id : null;
    bool adjustBalance = accounts.isNotEmpty;

    showModalBottomSheet(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Tandai Lunas: ${item.personName}',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimaryOf(ctx),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Nominal: ${AppFormatters.rupiah(item.amount)} (${item.isReceivable ? "Piutang diterima" : "Utang dibayar"})',
                style: TextStyle(color: AppColors.textSecondaryOf(ctx)),
              ),
              if (accounts.isNotEmpty) ...[
                const SizedBox(height: 10),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(
                    item.isReceivable
                        ? 'Tambah ke Saldo Rekening / Dompet'
                        : 'Potong dari Saldo Rekening / Dompet',
                    style: const TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  value: adjustBalance,
                  onChanged: (v) => setModalState(() => adjustBalance = v),
                ),
                if (adjustBalance)
                  DropdownButtonFormField<String>(
                    initialValue: accountId,
                    decoration: const InputDecoration(
                      labelText: 'Pilih Akun',
                      prefixIcon: Icon(Icons.account_balance_wallet_outlined),
                    ),
                    items: accounts
                        .map(
                          (a) => DropdownMenuItem<String>(
                            value: a.id,
                            child: Text(a.name),
                          ),
                        )
                        .toList(),
                    onChanged: (v) => setModalState(() => accountId = v),
                  ),
              ],
              const SizedBox(height: 16),
              SizedBox(
                height: 48,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.success,
                  ),
                  onPressed: () async {
                    await ref.read(financeProvider.notifier).settleDebtItem(
                          item.id,
                          accountId: adjustBalance ? accountId : null,
                        );
                    if (ctx.mounted) Navigator.pop(ctx);
                  },
                  icon: const Icon(Icons.check_circle_outline_rounded),
                  label: const Text('Konfirmasi Lunas'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _sendWhatsAppReminder(DebtItemModel item) async {
    final msg =
        'Halo ${item.personName}, sekadar mengingatkan catatan ${item.note.isNotEmpty ? "(${item.note}) " : ""}sebesar ${AppFormatters.rupiah(item.amount)} ya. Terima kasih!';
    String cleanPhone = item.phone.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62${cleanPhone.substring(1)}';
    }
    final uri = cleanPhone.isNotEmpty
        ? Uri.parse(
            'https://wa.me/$cleanPhone?text=${Uri.encodeComponent(msg)}',
          )
        : Uri.parse('https://wa.me/?text=${Uri.encodeComponent(msg)}');
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    final finance = ref.watch(financeProvider);
    final hidden = ref.watch(uiPreferencesProvider).hideBalances;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Piutang & Split Bill'),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primaryOf(context),
          unselectedLabelColor: AppColors.textSecondaryOf(context),
          indicatorColor: AppColors.primaryOf(context),
          tabs: [
            Tab(
              icon: const Icon(Icons.menu_book_rounded),
              text: 'Piutang & Utang (${finance.debts.length})',
            ),
            const Tab(
              icon: Icon(Icons.groups_rounded),
              text: 'Patungan (Split Bill)',
            ),
          ],
        ),
      ),
      floatingActionButton: _tabController.index == 0
          ? FloatingActionButton.extended(
              onPressed: _showAddDebtSheet,
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              icon: const Icon(Icons.add_rounded),
              label: const Text('Catat'),
            )
          : null,
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildDebtListTab(finance, hidden),
          _buildSplitBillTab(),
        ],
      ),
    );
  }

  Widget _buildDebtListTab(FinanceState finance, bool hidden) {
    final activeReceivables = finance.debts
        .where((d) => d.isReceivable && !d.isSettled)
        .fold<double>(0, (s, d) => s + d.amount);
    final activePayables = finance.debts
        .where((d) => !d.isReceivable && !d.isSettled)
        .fold<double>(0, (s, d) => s + d.amount);

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 88),
      children: [
        Row(
          children: [
            Expanded(
              child: SadarCard(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Total Piutang Aktif',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondaryOf(context),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      hidden
                          ? 'Rp •••••'
                          : AppFormatters.rupiah(activeReceivables),
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppColors.success,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: SadarCard(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Total Utang Aktif',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondaryOf(context),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      hidden
                          ? 'Rp •••••'
                          : AppFormatters.rupiah(activePayables),
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppColors.danger,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (finance.debts.isEmpty)
          const EmptyStateWidget(
            icon: Icons.people_outline_rounded,
            title: 'Belum Ada Catatan Piutang / Utang',
            message:
                'Catat teman yang meminjam uang atau hasil patungan makan (Split Bill) agar tidak lupa ditagih.',
          )
        else
          ...finance.debts.map((item) {
            final color =
                item.isReceivable ? AppColors.success : AppColors.danger;
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: SadarCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          backgroundColor: color.withValues(alpha: 0.14),
                          child: Text(
                            item.personName.isNotEmpty
                                ? item.personName[0].toUpperCase()
                                : 'T',
                            style: TextStyle(
                              fontWeight: FontWeight.w800,
                              color: color,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item.personName,
                                style: TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 15,
                                  color: AppColors.textPrimaryOf(context),
                                ),
                              ),
                              Text(
                                '${item.isReceivable ? "Piutang (Teman Pinjam)" : "Utang (Saya Pinjam)"}${item.note.isNotEmpty ? " · ${item.note}" : ""}',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textSecondaryOf(context),
                                ),
                              ),
                            ],
                          ),
                        ),
                        Text(
                          hidden
                              ? 'Rp •••••'
                              : AppFormatters.rupiah(item.amount),
                          style: TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 14,
                            color: color,
                          ),
                        ),
                        IconButton(
                          icon: Icon(
                            Icons.delete_outline_rounded,
                            size: 18,
                            color: AppColors.textMutedOf(context),
                          ),
                          onPressed: () => ref
                              .read(financeProvider.notifier)
                              .deleteDebtItem(item.id),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        if (item.isSettled)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.success.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: const Text(
                              'Sudah Lunas',
                              style: TextStyle(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w700,
                                color: AppColors.success,
                              ),
                            ),
                          )
                        else ...[
                          if (item.isReceivable)
                            TextButton.icon(
                              onPressed: () => _sendWhatsAppReminder(item),
                              icon: const Icon(Icons.send_rounded, size: 16),
                              label: const Text('Ingatkan WA'),
                            )
                          else
                            const SizedBox.shrink(),
                          ElevatedButton.icon(
                            onPressed: () =>
                                _showSettleSheet(item, finance.accounts),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.success,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                            ),
                            icon: const Icon(Icons.check_rounded, size: 16),
                            label: const Text('Tandai Lunas'),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            );
          }),
      ],
    );
  }

  Widget _buildSplitBillTab() {
    final subTotal = AppFormatters.parseAmount(_billAmountCtrl.text);
    final taxPct = double.tryParse(_taxPctCtrl.text.trim()) ?? 0;
    final grandTotal = subTotal * (1 + (taxPct / 100));
    final perPerson = _peopleCount > 0 ? grandTotal / _peopleCount : 0.0;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: SadarCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SectionHeader(
              title: 'Kalkulator Patungan (Split Bill)',
              subtitle:
                  'Hitung tagihan makan/nongkrong beserta pajak & simpan langsung ke daftar piutang teman',
            ),
            const SizedBox(height: 14),
            TextField(
              controller: _billTitleCtrl,
              decoration: const InputDecoration(
                labelText: 'Nama Acara / Tempat Makan',
                prefixIcon: Icon(Icons.restaurant_rounded),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  flex: 3,
                  child: TextField(
                    controller: _billAmountCtrl,
                    keyboardType: TextInputType.number,
                    inputFormatters: const [CurrencyInputFormatter()],
                    onChanged: (_) => setState(() {}),
                    decoration: const InputDecoration(
                      labelText: 'Subtotal Tagihan',
                      prefixText: 'Rp ',
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  flex: 2,
                  child: TextField(
                    controller: _taxPctCtrl,
                    keyboardType: TextInputType.number,
                    onChanged: (_) => setState(() {}),
                    decoration: const InputDecoration(
                      labelText: 'Pajak/Service',
                      suffixText: '%',
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Jumlah Orang Patungan:',
                  style: TextStyle(fontWeight: FontWeight.w700),
                ),
                Row(
                  children: [
                    IconButton(
                      onPressed: _peopleCount > 2
                          ? () => setState(() => _peopleCount--)
                          : null,
                      icon: const Icon(Icons.remove_circle_outline_rounded),
                    ),
                    Text(
                      '$_peopleCount Orang',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    IconButton(
                      onPressed: () => setState(() => _peopleCount++),
                      icon: const Icon(Icons.add_circle_outline_rounded),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.accent.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: AppColors.accent.withValues(alpha: 0.35),
                ),
              ),
              child: Column(
                children: [
                  Text(
                    'Bagian per Orang ($_peopleCount orang)',
                    style: TextStyle(
                      fontSize: 12.5,
                      color: AppColors.textSecondaryOf(context),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    AppFormatters.rupiah(perPerson),
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      color: AppColors.accentOf(context),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Total termasuk pajak: ${AppFormatters.rupiah(grandTotal)}',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondaryOf(context),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: _friendsCtrl,
              decoration: const InputDecoration(
                labelText: 'Nama Teman Patungan (pisahkan dengan koma)',
                hintText: 'Contoh: Budi, Rina, Dito',
                prefixIcon: Icon(Icons.group_add_outlined),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 48,
              child: ElevatedButton.icon(
                onPressed: perPerson <= 0
                    ? null
                    : () async {
                        final rawNames = _friendsCtrl.text
                            .split(',')
                            .map((s) => s.trim())
                            .where((s) => s.isNotEmpty)
                            .toList();
                        final names = rawNames.isNotEmpty
                            ? rawNames
                            : List.generate(
                                _peopleCount - 1,
                                (i) => 'Teman #${i + 1}',
                              );
                        for (final name in names) {
                          await ref
                              .read(financeProvider.notifier)
                              .addDebtItem(
                                personName: name,
                                amount: perPerson,
                                isReceivable: true,
                                note: 'Split Bill: ${_billTitleCtrl.text.trim()}',
                              );
                        }
                        if (!mounted) return;
                        _tabController.animateTo(0);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            backgroundColor: AppColors.success,
                            content: Text(
                              '${names.length} catatan piutang Split Bill berhasil ditambahkan!',
                            ),
                          ),
                        );
                      },
                icon: const Icon(Icons.playlist_add_check_rounded),
                label: const Text('Simpan ke Daftar Piutang Teman'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
