import 'package:flutter/material.dart';
import '../../core/constants/bank_data.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../data/models/account_model.dart';

class AccountSelectorField extends StatelessWidget {
  final String label;
  final String? selectedAccountId;
  final List<AccountModel> accounts;
  final ValueChanged<String> onChanged;
  final IconData? leadingIcon;
  final String? helperText;

  const AccountSelectorField({
    super.key,
    required this.label,
    required this.selectedAccountId,
    required this.accounts,
    required this.onChanged,
    this.leadingIcon,
    this.helperText,
  });

  AccountModel? get _selectedAccount {
    if (accounts.isEmpty) return null;
    for (final a in accounts) {
      if (a.id == selectedAccountId) return a;
    }
    return accounts.first;
  }

  Color _accentForType(BuildContext context, String type, String name) {
    final lower = '$type $name'.toLowerCase();
    if (lower.contains('wallet') ||
        lower.contains('gopay') ||
        lower.contains('dana') ||
        lower.contains('ovo') ||
        lower.contains('shopee')) {
      return AppColors.accent;
    }
    if (lower.contains('cash') || lower.contains('tunai')) {
      return AppColors.success;
    }
    return AppColors.primaryOf(context);
  }

  String _typeBadgeLabel(String type, String name) {
    final lower = '$type $name'.toLowerCase();
    if (lower.contains('wallet') ||
        lower.contains('gopay') ||
        lower.contains('dana') ||
        lower.contains('ovo') ||
        lower.contains('shopee')) {
      return 'E-Wallet';
    }
    if (lower.contains('cash') || lower.contains('tunai')) {
      return 'Tunai';
    }
    return 'Bank';
  }

  Future<void> _openPickerSheet(BuildContext context) async {
    if (accounts.isEmpty) return;
    final current = _selectedAccount;
    final picked = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surfaceOf(context),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        final textPrimary = AppColors.textPrimaryOf(ctx);
        final textSecondary = AppColors.textSecondaryOf(ctx);
        final borderColor = AppColors.borderOf(ctx);
        final subtleBg = AppColors.subtleOf(ctx);

        return SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 22),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: borderColor,
                      borderRadius: BorderRadius.circular(99),
                    ),
                  ),
                ),
                Row(
                  children: [
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: AppColors.primaryOf(ctx).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(11),
                      ),
                      child: Icon(
                        leadingIcon ?? Icons.account_balance_wallet_rounded,
                        size: 20,
                        color: AppColors.primaryOf(ctx),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            label,
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                              color: textPrimary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            helperText ??
                                'Pilih rekening bank, e-wallet, atau dompet tunai',
                            style: TextStyle(
                              fontSize: 12,
                              color: textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(ctx),
                      icon: Icon(Icons.close_rounded, color: textSecondary),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                ConstrainedBox(
                  constraints: BoxConstraints(
                    maxHeight: MediaQuery.of(ctx).size.height * 0.52,
                  ),
                  child: ListView.separated(
                    shrinkWrap: true,
                    itemCount: accounts.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 10),
                    itemBuilder: (_, idx) {
                      final acc = accounts[idx];
                      final isSelected = acc.id == current?.id;
                      final tone = _accentForType(ctx, acc.type, acc.name);
                      final badge = _typeBadgeLabel(acc.type, acc.name);

                      return InkWell(
                        borderRadius: BorderRadius.circular(16),
                        onTap: () => Navigator.pop(ctx, acc.id),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 160),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 13,
                          ),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? tone.withValues(alpha: 0.09)
                                : subtleBg,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected
                                  ? tone.withValues(alpha: 0.65)
                                  : borderColor,
                              width: isSelected ? 1.6 : 1,
                            ),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 42,
                                height: 42,
                                decoration: BoxDecoration(
                                  color: tone.withValues(alpha: 0.14),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Icon(
                                  BankData.iconForAccount(acc.name, acc.type),
                                  color: tone,
                                  size: 21,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Flexible(
                                          child: Text(
                                            acc.name,
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                            style: TextStyle(
                                              fontSize: 14.5,
                                              fontWeight: FontWeight.w800,
                                              color: textPrimary,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 7,
                                            vertical: 2,
                                          ),
                                          decoration: BoxDecoration(
                                            color: tone.withValues(alpha: 0.14),
                                            borderRadius:
                                                BorderRadius.circular(6),
                                          ),
                                          child: Text(
                                            badge,
                                            style: TextStyle(
                                              fontSize: 10,
                                              fontWeight: FontWeight.w700,
                                              color: tone,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 3),
                                    Text(
                                      acc.accountNumber.trim().isNotEmpty
                                          ? '${acc.accountNumber} - Saldo: ${AppFormatters.rupiah(acc.balance)}'
                                          : 'Saldo tersedia: ${AppFormatters.rupiah(acc.balance)}',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: textSecondary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Icon(
                                isSelected
                                    ? Icons.check_circle_rounded
                                    : Icons.radio_button_unchecked_rounded,
                                color: isSelected ? tone : borderColor,
                                size: 22,
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );

    if (picked != null && picked.isNotEmpty) {
      onChanged(picked);
    }
  }

  @override
  Widget build(BuildContext context) {
    final selected = _selectedAccount;
    if (selected == null) return const SizedBox.shrink();

    final textPrimary = AppColors.textPrimaryOf(context);
    final textSecondary = AppColors.textSecondaryOf(context);
    final borderColor = AppColors.borderOf(context);
    final subtleBg = AppColors.subtleOf(context);
    final tone = _accentForType(context, selected.type, selected.name);
    final badge = _typeBadgeLabel(selected.type, selected.name);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 2, bottom: 6),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w700,
              color: textSecondary,
            ),
          ),
        ),
        InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => _openPickerSheet(context),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: subtleBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: borderColor),
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: tone.withValues(alpha: 0.14),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    BankData.iconForAccount(selected.name, selected.type),
                    color: tone,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              selected.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 14.5,
                                fontWeight: FontWeight.w800,
                                color: textPrimary,
                              ),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 7,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: tone.withValues(alpha: 0.14),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              badge,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: tone,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Saldo: ${AppFormatters.rupiah(selected.balance)}',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: tone.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Pilih',
                        style: TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w700,
                          color: tone,
                        ),
                      ),
                      const SizedBox(width: 2),
                      Icon(
                        Icons.keyboard_arrow_down_rounded,
                        size: 17,
                        color: tone,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
