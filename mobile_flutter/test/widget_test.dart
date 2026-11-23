import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:sadar_finance/app.dart';
import 'package:sadar_finance/core/storage/local_finance_store.dart';
import 'package:sadar_finance/core/utils/formatters.dart';
import 'package:sadar_finance/data/models/account_model.dart';
import 'package:sadar_finance/data/models/budget_model.dart';
import 'package:sadar_finance/data/models/income_model.dart';
import 'package:sadar_finance/data/models/transaction_model.dart';
import 'package:sadar_finance/presentation/widgets/sadar_logo.dart';
import 'package:sadar_finance/providers/finance_provider.dart';

void main() {
  test('AppFormatters formats Rupiah and parses amount correctly', () {
    expect(AppFormatters.parseAmount('Rp 1.250.000'), 1250000);
    expect(AppFormatters.compactRupiah(2500000), 'Rp 2.5jt');
    expect(AppFormatters.compactRupiah(75000), 'Rp 75rb');
  });

  test('FinanceState computes balances, outflow, and remaining budget accurately', () {
    final now = DateTime.now();
    final state = FinanceState(
      accounts: const [
        AccountModel(
          id: 'a1',
          name: 'BCA',
          accountNumber: '123',
          balance: 5000000,
          type: 'bank',
        ),
        AccountModel(
          id: 'a2',
          name: 'GoPay',
          accountNumber: '456',
          balance: 500000,
          type: 'ewallet',
        ),
      ],
      incomes: [
        IncomeModel(
          id: 'i1',
          accountId: 'a1',
          amount: 6000000,
          incomeDate: now,
          source: 'Gaji',
        ),
      ],
      transactions: [
        TransactionModel(
          id: 't1',
          accountId: 'a1',
          categoryGroup: 'Needs',
          transactionDate: now,
          description: 'Groceries',
          source: 'manual',
          amount: 400000,
        ),
        TransactionModel(
          id: 't2',
          accountId: 'a2',
          categoryGroup: 'Savings',
          transactionDate: now,
          description: 'Dana Darurat',
          source: 'manual',
          amount: 300000,
        ),
      ],
      budget: const BudgetModel(
        id: 'b1',
        needsAmount: 3000000,
        wantsAmount: 1500000,
        savingsAmount: 1500000,
        needsUsed: 400000,
        wantsUsed: 0,
        savingsUsed: 300000,
        limitAmount: 6000000,
      ),
    );

    expect(state.totalBalance, 5500000);
    expect(state.currentMonthIncome, 6000000);
    expect(state.currentMonthExpense, 400000);
    expect(state.currentMonthTotalOutflow, 700000);
    expect(state.remainingBudget, 5300000);
  });

  test('PendingSyncOp serializes and deserializes transfer_accounts cleanly', () {
    final op = PendingSyncOp(
      id: 'op_1',
      type: 'transfer_accounts',
      payload: const {
        'fromAccountId': 'a1',
        'toAccountId': 'a2',
        'amount': 250000,
        'note': 'Top up GoPay',
      },
      createdAt: DateTime.utc(2026, 11, 23),
    );
    final restored = PendingSyncOp.fromJson(op.toJson());
    expect(restored.type, 'transfer_accounts');
    expect(restored.payload['fromAccountId'], 'a1');
    expect(restored.payload['toAccountId'], 'a2');
    expect(restored.payload['amount'], 250000);
  });

  testWidgets('SadarFinanceApp boots cleanly with brand logo',
      (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: SadarFinanceApp()));
    await tester.pump();
    expect(find.byType(SadarLogo), findsOneWidget);
  });
}
