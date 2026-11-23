import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/constants/category_helpers.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/currency_input_formatter.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/models/ocr_scan_model.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/finance_provider.dart';
import '../../widgets/sadar_card.dart';

class RecordScreen extends ConsumerStatefulWidget {
  final bool openScanner;

  const RecordScreen({super.key, this.openScanner = false});

  @override
  ConsumerState<RecordScreen> createState() => _RecordScreenState();
}

class _RecordScreenState extends ConsumerState<RecordScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Expense form
  final _expFormKey = GlobalKey<FormState>();
  final _expAmountCtrl = TextEditingController();
  final _expDescCtrl = TextEditingController();
  final _expDetailCtrl = TextEditingController();
  String? _expAccountId;
  String _expCategoryGroup = 'Needs';
  DateTime _expDate = DateTime.now();
  bool _expSubmitting = false;

  // OCR & AI state
  final _picker = ImagePicker();
  File? _receiptImage;
  bool _scanning = false;
  OcrScanModel? _scanResult;
  bool _categorizingAi = false;
  String? _aiCategoryBadge;

  // Income form
  final _incFormKey = GlobalKey<FormState>();
  final _incAmountCtrl = TextEditingController();
  final _incSourceCtrl = TextEditingController(text: 'Gaji');
  String? _incAccountId;
  DateTime _incDate = DateTime.now();
  bool _incSubmitting = false;

  // Transfer form
  final _trfFormKey = GlobalKey<FormState>();
  final _trfAmountCtrl = TextEditingController();
  final _trfNoteCtrl = TextEditingController();
  String? _trfFromAccountId;
  String? _trfToAccountId;
  bool _trfSubmitting = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    Future.microtask(() {
      final accounts = ref.read(financeProvider).accounts;
      if (accounts.isNotEmpty) {
        setState(() {
          _expAccountId ??= accounts.first.id;
          _incAccountId ??= accounts.first.id;
          _trfFromAccountId ??= accounts.first.id;
          if (accounts.length > 1) {
            _trfToAccountId ??= accounts[1].id;
          }
        });
      }
      if (widget.openScanner) {
        _pickAndScanReceipt(ImageSource.camera);
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _expAmountCtrl.dispose();
    _expDescCtrl.dispose();
    _expDetailCtrl.dispose();
    _incAmountCtrl.dispose();
    _incSourceCtrl.dispose();
    _trfAmountCtrl.dispose();
    _trfNoteCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickAndScanReceipt(ImageSource source) async {
    if (ref.read(financeProvider).isOffline) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: AppColors.warning,
          content: Text(
            'Mode Offline: Scan Struk AI membutuhkan koneksi internet. Gunakan pencatatan manual, data akan otomatis sinkron saat online.',
          ),
        ),
      );
      return;
    }
    try {
      final picked = await _picker.pickImage(
        source: source,
        maxWidth: 1200,
        imageQuality: 80,
      );
      if (picked == null) return;
      final file = File(picked.path);
      setState(() {
        _receiptImage = file;
        _scanning = true;
        _scanResult = null;
      });

      final scan = await ref.read(sadarApiServiceProvider).uploadReceipt(file);
      if (!mounted) return;

      setState(() {
        _scanResult = scan;
        _scanning = false;
        if (scan.totalAmount != null && scan.totalAmount! > 0) {
          _expAmountCtrl.text = AppFormatters.number(scan.totalAmount!);
        }
        if (scan.description != null && scan.description!.isNotEmpty) {
          _expDescCtrl.text = scan.description!;
        }
        if (scan.categoryGroup != null) {
          _expCategoryGroup = scan.categoryGroup!;
        }
        if (scan.categoryDetail != null && scan.categoryDetail!.isNotEmpty) {
          _expDetailCtrl.text = scan.categoryDetail!;
        }
        if (scan.transactionDate != null) {
          final parsed = DateTime.tryParse(scan.transactionDate!);
          if (parsed != null) _expDate = parsed;
        }
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Struk berhasil diproses! Silakan periksa hasil sebelum menyimpan.',
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _scanning = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.danger,
          content: Text('Gagal memproses struk: $e'),
        ),
      );
    }
  }

  Future<void> _detectCategoryWithAi() async {
    if (ref.read(financeProvider).isOffline) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: AppColors.warning,
          content: Text(
            'Mode Offline: Deteksi Kategori AI memerlukan internet. Pilih kategori secara manual.',
          ),
        ),
      );
      return;
    }
    final desc = _expDescCtrl.text.trim();
    if (desc.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Isi nama merchant atau catatan dulu untuk deteksi AI.'),
        ),
      );
      return;
    }
    setState(() {
      _categorizingAi = true;
      _aiCategoryBadge = null;
    });
    try {
      final amount = AppFormatters.parseAmount(_expAmountCtrl.text);
      final res = await ref.read(sadarApiServiceProvider).categorizeTransaction(
            text: desc,
            merchant: desc,
            amount: amount > 0 ? amount : null,
          );
      if (!mounted) return;
      final group = CategoryHelpers.normalizeGroup(
        (res['categoryGroup'] ?? res['predictedCategory'] ?? 'Wants').toString(),
      );
      final detail = (res['categoryDetail'] ?? '').toString();
      final conf = double.tryParse((res['confidence'] ?? '').toString());
      setState(() {
        _expCategoryGroup = group;
        if (detail.isNotEmpty) _expDetailCtrl.text = detail;
        _aiCategoryBadge = conf != null
            ? 'AI - ${(conf * 100).round()}%'
            : 'Kategori AI';
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.accentDark,
          content: Text(
            'Kategori terdeteksi: ${CategoryHelpers.labelForGroup(group)}${detail.isNotEmpty ? ' ($detail)' : ''}',
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.danger,
          content: Text('Deteksi AI gagal: $e'),
        ),
      );
    } finally {
      if (mounted) setState(() => _categorizingAi = false);
    }
  }

  Future<void> _submitExpense() async {
    if (!_expFormKey.currentState!.validate()) return;
    final amount = AppFormatters.parseAmount(_expAmountCtrl.text);
    if (amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Nominal pengeluaran harus lebih dari 0')),
      );
      return;
    }
    setState(() => _expSubmitting = true);
    try {
      final syncedOnline = await ref.read(financeProvider.notifier).addTransaction(
            accountId: _expAccountId,
            categoryGroup: _expCategoryGroup,
            categoryDetail: _expDetailCtrl.text,
            transactionDate: _expDate,
            description: _expDescCtrl.text.trim().isNotEmpty
                ? _expDescCtrl.text.trim()
                : CategoryHelpers.labelForGroup(_expCategoryGroup),
            amount: amount,
            source: _scanResult != null ? 'ocr' : 'manual',
            ocrScanId: _scanResult?.id,
          );
      if (!mounted) return;
      _expAmountCtrl.clear();
      _expDescCtrl.clear();
      _expDetailCtrl.clear();
      setState(() {
        _receiptImage = null;
        _scanResult = null;
        _expDate = DateTime.now();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: syncedOnline ? AppColors.success : AppColors.warning,
          content: Text(
            syncedOnline
                ? 'Pengeluaran berhasil dicatat & saldo diperbarui!'
                : 'Tersimpan lokal (Offline). Akan otomatis tersinkron saat online!',
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(backgroundColor: AppColors.danger, content: Text('$e')),
      );
    } finally {
      if (mounted) setState(() => _expSubmitting = false);
    }
  }

  Future<void> _submitIncome() async {
    if (!_incFormKey.currentState!.validate()) return;
    final amount = AppFormatters.parseAmount(_incAmountCtrl.text);
    if (amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Nominal pemasukan harus lebih dari 0')),
      );
      return;
    }
    setState(() => _incSubmitting = true);
    try {
      final syncedOnline = await ref.read(financeProvider.notifier).addIncome(
            accountId: _incAccountId,
            amount: amount,
            incomeDate: _incDate,
            source: _incSourceCtrl.text.trim().isNotEmpty
                ? _incSourceCtrl.text.trim()
                : 'Pemasukan',
          );
      if (!mounted) return;
      _incAmountCtrl.clear();
      setState(() => _incDate = DateTime.now());
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: syncedOnline ? AppColors.success : AppColors.warning,
          content: Text(
            syncedOnline
                ? 'Pemasukan berhasil dicatat & saldo bertambah!'
                : 'Tersimpan lokal (Offline). Akan otomatis tersinkron saat online!',
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(backgroundColor: AppColors.danger, content: Text('$e')),
      );
    } finally {
      if (mounted) setState(() => _incSubmitting = false);
    }
  }

  Future<void> _submitTransfer() async {
    if (!_trfFormKey.currentState!.validate()) return;
    final amount = AppFormatters.parseAmount(_trfAmountCtrl.text);
    if (amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Nominal transfer harus lebih dari 0')),
      );
      return;
    }
    if (_trfFromAccountId == null ||
        _trfToAccountId == null ||
        _trfFromAccountId == _trfToAccountId) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: AppColors.warning,
          content: Text('Pilih dua akun berbeda untuk transfer saldo.'),
        ),
      );
      return;
    }
    setState(() => _trfSubmitting = true);
    try {
      final syncedOnline =
          await ref.read(financeProvider.notifier).transferBetweenAccounts(
                fromAccountId: _trfFromAccountId!,
                toAccountId: _trfToAccountId!,
                amount: amount,
                note: _trfNoteCtrl.text.trim(),
              );
      if (!mounted) return;
      _trfAmountCtrl.clear();
      _trfNoteCtrl.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: syncedOnline ? AppColors.success : AppColors.warning,
          content: Text(
            syncedOnline
                ? 'Transfer saldo antar akun berhasil!'
                : 'Transfer disimpan lokal (Offline). Akan sinkron otomatis saat online.',
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(backgroundColor: AppColors.danger, content: Text('$e')),
      );
    } finally {
      if (mounted) setState(() => _trfSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final finance = ref.watch(financeProvider);
    final accounts = finance.accounts;
    if (_expAccountId == null && accounts.isNotEmpty) {
      _expAccountId = accounts.first.id;
    }
    if (_incAccountId == null && accounts.isNotEmpty) {
      _incAccountId = accounts.first.id;
    }
    if (_trfFromAccountId == null && accounts.isNotEmpty) {
      _trfFromAccountId = accounts.first.id;
    }
    if (_trfToAccountId == null && accounts.length > 1) {
      _trfToAccountId = accounts[1].id;
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Catat Keuangan'),
        actions: [
          TextButton.icon(
            onPressed: () => context.push('/financial-plans?tab=1'),
            icon: const Icon(Icons.event_repeat_rounded, size: 18),
            label: const Text('Jadwal Rutin'),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primaryOf(context),
          unselectedLabelColor: AppColors.textSecondaryOf(context),
          indicatorColor: AppColors.primaryOf(context),
          tabs: const [
            Tab(icon: Icon(Icons.receipt_long_rounded), text: 'Pengeluaran'),
            Tab(icon: Icon(Icons.savings_rounded), text: 'Pemasukan'),
            Tab(icon: Icon(Icons.swap_horiz_rounded), text: 'Transfer'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildExpenseTab(accounts, finance.isOffline),
          _buildIncomeTab(accounts),
          _buildTransferTab(accounts),
        ],
      ),
    );
  }

  Widget _buildExpenseTab(List accounts, bool isOffline) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Receipt OCR Scanner Card
          SadarCard(
            color: AppColors.isDark(context)
                ? AppColors.darkPrimary.withValues(alpha: 0.1)
                : AppColors.primary.withValues(alpha: 0.04),
            borderColor: AppColors.isDark(context)
                ? AppColors.darkPrimary.withValues(alpha: 0.3)
                : AppColors.primary.withValues(alpha: 0.16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.document_scanner_rounded,
                      color: isOffline
                          ? AppColors.warning
                          : AppColors.accentOf(context),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Pindai Struk Belanja Otomatis',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 15,
                          color: AppColors.textPrimaryOf(context),
                        ),
                      ),
                    ),
                    if (isOffline)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.warning.withValues(alpha: 0.18),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: const Text(
                          'Offline',
                          style: TextStyle(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w700,
                            color: AppColors.warning,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  isOffline
                      ? 'Mode Offline: Pindai struk & kategori AI membutuhkan internet. Gunakan form manual di bawah, otomatis sinkron saat online.'
                      : 'Ambil foto atau unggah gambar struk. Sistem akan mengisi nominal, merchant, dan tanggal secara otomatis.',
                  style: TextStyle(
                    fontSize: 12.5,
                    color: AppColors.textSecondaryOf(context),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: _scanning
                            ? null
                            : () => _pickAndScanReceipt(ImageSource.camera),
                        icon: const Icon(Icons.camera_alt_rounded, size: 18),
                        label: const Text('Kamera'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _scanning
                            ? null
                            : () => _pickAndScanReceipt(ImageSource.gallery),
                        icon: const Icon(Icons.photo_library_rounded, size: 18),
                        label: const Text('Galeri'),
                      ),
                    ),
                  ],
                ),
                if (_scanning) ...[
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        'Sedang memproses struk...',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primaryOf(context),
                        ),
                      ),
                    ],
                  ),
                ],
                if (_receiptImage != null && !_scanning) ...[
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.file(
                      _receiptImage!,
                      height: 130,
                      width: double.infinity,
                      fit: BoxFit.cover,
                    ),
                  ),
                ],
                if (_scanResult != null) ...[
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.success.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.check_circle_rounded,
                          color: AppColors.success,
                          size: 18,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Struk terbaca (${_scanResult!.merchant ?? "Merchant"}), periksa formulir di bawah lalu simpan.',
                            style: const TextStyle(fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),
          SadarCard(
            child: Form(
              key: _expFormKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'Detail Pengeluaran',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 14),
                  if (accounts.isNotEmpty) ...[
                    DropdownButtonFormField<String>(
                      initialValue: accounts.any((a) => a.id == _expAccountId)
                          ? _expAccountId
                          : accounts.first.id,
                      decoration: const InputDecoration(
                        labelText: 'Pilih Akun Sumber Dana',
                        prefixIcon: Icon(Icons.account_balance_wallet_outlined),
                      ),
                      items: accounts
                          .map<DropdownMenuItem<String>>(
                            (a) => DropdownMenuItem<String>(
                              value: a.id,
                              child: Text(
                                '${a.name} (${AppFormatters.compactRupiah(a.balance)})',
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          )
                          .toList(),
                      onChanged: (v) => setState(() => _expAccountId = v),
                    ),
                    const SizedBox(height: 14),
                  ],
                  TextFormField(
                    controller: _expAmountCtrl,
                    keyboardType: TextInputType.number,
                    inputFormatters: const [CurrencyInputFormatter()],
                    decoration: const InputDecoration(
                      labelText: 'Nominal Pengeluaran',
                      prefixText: 'Rp ',
                      hintText: '50.000',
                    ),
                    validator: (v) => AppFormatters.parseAmount(v ?? '') <= 0
                        ? 'Masukkan nominal valid'
                        : null,
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [10000, 25000, 50000, 100000, 250000, 500000]
                        .map((val) {
                      return ActionChip(
                        label: Text(AppFormatters.compactRupiah(val.toDouble())),
                        onPressed: () => setState(
                          () => _expAmountCtrl.text =
                              AppFormatters.number(val.toDouble()),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _expDescCtrl,
                    decoration: InputDecoration(
                      labelText: 'Nama Merchant / Catatan',
                      hintText: 'Contoh: Indomaret, Kopi Kenangan, Grab',
                      prefixIcon: const Icon(Icons.notes_rounded),
                      suffixIcon: Padding(
                        padding: const EdgeInsets.only(right: 6),
                        child: TextButton.icon(
                          onPressed:
                              _categorizingAi ? null : _detectCategoryWithAi,
                          icon: _categorizingAi
                              ? const SizedBox(
                                  width: 14,
                                  height: 14,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Icon(
                                  Icons.auto_awesome_rounded,
                                  size: 16,
                                  color: AppColors.accent,
                                ),
                          label: const Text(
                            'AI',
                            style: TextStyle(
                              fontWeight: FontWeight.w800,
                              color: AppColors.accent,
                            ),
                          ),
                        ),
                      ),
                    ),
                    validator: (v) => (v == null || v.trim().isEmpty)
                        ? 'Deskripsi singkat wajib diisi'
                        : null,
                  ),
                  if (ref.watch(financeProvider).merchantSuggestions.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: ref
                            .watch(financeProvider)
                            .merchantSuggestions
                            .map((m) {
                          return Padding(
                            padding: const EdgeInsets.only(right: 6),
                            child: ActionChip(
                              avatar: Icon(
                                Icons.history_rounded,
                                size: 15,
                                color: AppColors.primaryOf(context),
                              ),
                              label: Text(
                                '${m.description} (${CategoryHelpers.labelForGroup(m.categoryGroup)})',
                                style: const TextStyle(fontSize: 11.5),
                              ),
                              onPressed: () {
                                setState(() {
                                  _expDescCtrl.text = m.description;
                                  _expCategoryGroup = m.categoryGroup;
                                  if (m.categoryDetail != null &&
                                      m.categoryDetail!.isNotEmpty) {
                                    _expDetailCtrl.text = m.categoryDetail!;
                                  }
                                  _aiCategoryBadge = 'Riwayat Pintar';
                                });
                              },
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Text(
                        'Kelompok Anggaran (50/30/20)',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textSecondaryOf(context),
                        ),
                      ),
                      if (_aiCategoryBadge != null) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.accent.withValues(alpha: 0.14),
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            _aiCategoryBadge!,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: AppColors.accentOf(context),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: CategoryHelpers.groups.map((g) {
                      final selected = _expCategoryGroup == g;
                      return ChoiceChip(
                        label: Text(CategoryHelpers.labelForGroup(g)),
                        selected: selected,
                        selectedColor:
                            CategoryHelpers.colorForGroup(g).withValues(alpha: 0.2),
                        onSelected: (_) => setState(() => _expCategoryGroup = g),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _expDetailCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Kategori Detail (Opsional)',
                      hintText: 'Contoh: groceries, food, transport',
                      prefixIcon: Icon(Icons.label_outline_rounded),
                    ),
                  ),
                  const SizedBox(height: 14),
                  InkWell(
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: _expDate,
                        firstDate: DateTime(2020),
                        lastDate: DateTime.now().add(const Duration(days: 30)),
                      );
                      if (picked != null) setState(() => _expDate = picked);
                    },
                    child: InputDecorator(
                      decoration: const InputDecoration(
                        labelText: 'Tanggal Transaksi',
                        prefixIcon: Icon(Icons.calendar_today_rounded),
                      ),
                      child: Text(AppFormatters.fullDate(_expDate)),
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    height: 50,
                    child: ElevatedButton.icon(
                      onPressed: _expSubmitting ? null : _submitExpense,
                      icon: _expSubmitting
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(Icons.check_rounded),
                      label: const Text('Simpan Pengeluaran'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIncomeTab(List accounts) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: SadarCard(
        child: Form(
          key: _incFormKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Catat Pemasukan Dana',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimaryOf(context),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Pemasukan akan otomatis menambah saldo akun tujuan yang dipilih.',
                style: TextStyle(
                  fontSize: 12.5,
                  color: AppColors.textSecondaryOf(context),
                ),
              ),
              const SizedBox(height: 16),
              if (accounts.isNotEmpty) ...[
                DropdownButtonFormField<String>(
                  initialValue: accounts.any((a) => a.id == _incAccountId)
                      ? _incAccountId
                      : accounts.first.id,
                  decoration: const InputDecoration(
                    labelText: 'Akun Tujuan Dana',
                    prefixIcon: Icon(Icons.account_balance_outlined),
                  ),
                  items: accounts
                      .map<DropdownMenuItem<String>>(
                        (a) => DropdownMenuItem<String>(
                          value: a.id,
                          child: Text(
                            '${a.name} (${AppFormatters.compactRupiah(a.balance)})',
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      )
                      .toList(),
                  onChanged: (v) => setState(() => _incAccountId = v),
                ),
                const SizedBox(height: 14),
              ],
              TextFormField(
                controller: _incAmountCtrl,
                keyboardType: TextInputType.number,
                inputFormatters: const [CurrencyInputFormatter()],
                decoration: const InputDecoration(
                  labelText: 'Nominal Pemasukan',
                  prefixText: 'Rp ',
                  hintText: '5.000.000',
                ),
                validator: (v) => AppFormatters.parseAmount(v ?? '') <= 0
                    ? 'Masukkan nominal valid'
                    : null,
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _incSourceCtrl,
                decoration: const InputDecoration(
                  labelText: 'Sumber Pemasukan',
                  hintText: 'Gaji, Freelance, Bonus',
                  prefixIcon: Icon(Icons.work_outline_rounded),
                ),
                validator: (v) => (v == null || v.trim().isEmpty)
                    ? 'Sumber pemasukan wajib diisi'
                    : null,
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 6,
                children: CategoryHelpers.incomeSources
                    .map(
                      (src) => ActionChip(
                        label: Text(src),
                        onPressed: () =>
                            setState(() => _incSourceCtrl.text = src),
                      ),
                    )
                    .toList(),
              ),
              const SizedBox(height: 14),
              InkWell(
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _incDate,
                    firstDate: DateTime(2020),
                    lastDate: DateTime.now().add(const Duration(days: 30)),
                  );
                  if (picked != null) setState(() => _incDate = picked);
                },
                child: InputDecorator(
                  decoration: const InputDecoration(
                    labelText: 'Tanggal Pemasukan',
                    prefixIcon: Icon(Icons.calendar_today_rounded),
                  ),
                  child: Text(AppFormatters.fullDate(_incDate)),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                height: 50,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.success,
                  ),
                  onPressed: _incSubmitting ? null : _submitIncome,
                  icon: _incSubmitting
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.add_rounded),
                  label: const Text('Simpan Pemasukan'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTransferTab(List accounts) {
    if (accounts.length < 2) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: SadarCard(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.swap_horiz_rounded,
                  size: 46,
                  color: AppColors.primaryOf(context),
                ),
                const SizedBox(height: 12),
                Text(
                  'Butuh Minimal 2 Akun Keuangan',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimaryOf(context),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Tambahkan minimal dua rekening, e-wallet, atau dompet di menu Profil untuk memindahkan saldo antar akun.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondaryOf(context),
                    height: 1.45,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final validFrom = accounts.any((a) => a.id == _trfFromAccountId)
        ? _trfFromAccountId
        : accounts.first.id;
    final validTo = accounts.any((a) => a.id == _trfToAccountId)
        ? _trfToAccountId
        : accounts.firstWhere((a) => a.id != validFrom, orElse: () => accounts.last).id;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: SadarCard(
        child: Form(
          key: _trfFormKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Transfer Saldo Antar Akun',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimaryOf(context),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Pindahkan dana antar bank, e-wallet, atau dompet tunai tanpa menambah pengeluaran atau pemasukan bulanan.',
                style: TextStyle(
                  fontSize: 12.5,
                  color: AppColors.textSecondaryOf(context),
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                initialValue: validFrom,
                decoration: const InputDecoration(
                  labelText: 'Dari Akun (Sumber)',
                  prefixIcon: Icon(Icons.call_made_rounded),
                ),
                items: accounts
                    .map<DropdownMenuItem<String>>(
                      (a) => DropdownMenuItem<String>(
                        value: a.id,
                        child: Text(
                          '${a.name} (${AppFormatters.compactRupiah(a.balance)})',
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    )
                    .toList(),
                onChanged: (v) => setState(() => _trfFromAccountId = v),
              ),
              const SizedBox(height: 6),
              Center(
                child: TextButton.icon(
                  onPressed: () {
                    setState(() {
                      final tmp = _trfFromAccountId;
                      _trfFromAccountId = _trfToAccountId;
                      _trfToAccountId = tmp;
                    });
                  },
                  icon: const Icon(Icons.swap_vert_rounded, size: 18),
                  label: const Text('Tukar Arah Akun'),
                ),
              ),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                initialValue: validTo,
                decoration: const InputDecoration(
                  labelText: 'Ke Akun (Tujuan)',
                  prefixIcon: Icon(Icons.call_received_rounded),
                ),
                items: accounts
                    .map<DropdownMenuItem<String>>(
                      (a) => DropdownMenuItem<String>(
                        value: a.id,
                        child: Text(
                          '${a.name} (${AppFormatters.compactRupiah(a.balance)})',
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    )
                    .toList(),
                onChanged: (v) => setState(() => _trfToAccountId = v),
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _trfAmountCtrl,
                keyboardType: TextInputType.number,
                inputFormatters: const [CurrencyInputFormatter()],
                decoration: const InputDecoration(
                  labelText: 'Nominal Transfer',
                  prefixText: 'Rp ',
                  hintText: '200.000',
                ),
                validator: (v) => AppFormatters.parseAmount(v ?? '') <= 0
                    ? 'Masukkan nominal valid'
                    : null,
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: [50000, 100000, 250000, 500000, 1000000].map((val) {
                  return ActionChip(
                    label: Text(AppFormatters.compactRupiah(val.toDouble())),
                    onPressed: () => setState(
                      () => _trfAmountCtrl.text =
                          AppFormatters.number(val.toDouble()),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _trfNoteCtrl,
                decoration: const InputDecoration(
                  labelText: 'Catatan Transfer (Opsional)',
                  hintText: 'Contoh: Top up GoPay, Pindah ke Tabungan',
                  prefixIcon: Icon(Icons.notes_rounded),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                height: 50,
                child: ElevatedButton.icon(
                  onPressed: _trfSubmitting ? null : _submitTransfer,
                  icon: _trfSubmitting
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.swap_horiz_rounded),
                  label: const Text('Proses Transfer Saldo'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
