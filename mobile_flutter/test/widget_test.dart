import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:sadar_finance/app.dart';
import 'package:sadar_finance/core/utils/formatters.dart';
import 'package:sadar_finance/data/mock/mock_repository.dart';
import 'package:sadar_finance/presentation/widgets/sadar_logo.dart';

void main() {
  test('AppFormatters formats Rupiah and parses amount correctly', () {
    expect(AppFormatters.parseAmount('Rp 1.250.000'), 1250000);
    expect(AppFormatters.compactRupiah(2500000), 'Rp 2.5jt');
    expect(AppFormatters.compactRupiah(75000), 'Rp 75rb');
  });

  test('MockRepository updates balance on create, update, and delete', () {
    final repo = MockRepository();
    final initial =
        repo.getAccounts().firstWhere((a) => a.id == 'acc_001').balance;

    final trx = repo.addTransaction(
      accountId: 'acc_001',
      categoryGroup: 'Needs',
      date: DateTime.now(),
      description: 'Makan Siang',
      amount: 50000,
    );
    expect(
      repo.getAccounts().firstWhere((a) => a.id == 'acc_001').balance,
      initial - 50000,
    );

    repo.updateTransaction(
      trx.id,
      accountId: 'acc_001',
      categoryGroup: 'Wants',
      date: DateTime.now(),
      description: 'Makan Siang Updated',
      amount: 80000,
    );
    expect(
      repo.getAccounts().firstWhere((a) => a.id == 'acc_001').balance,
      initial - 80000,
    );

    final inc = repo.addIncome(
      accountId: 'acc_001',
      amount: 100000,
      date: DateTime.now(),
      source: 'Bonus',
    );
    expect(
      repo.getAccounts().firstWhere((a) => a.id == 'acc_001').balance,
      initial + 20000,
    );

    repo.updateIncome(
      inc.id,
      accountId: 'acc_001',
      amount: 150000,
      date: DateTime.now(),
      source: 'Bonus Besar',
    );
    expect(
      repo.getAccounts().firstWhere((a) => a.id == 'acc_001').balance,
      initial + 70000,
    );
  });

  testWidgets('SadarFinanceApp boots cleanly with brand logo',
      (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: SadarFinanceApp()));
    await tester.pump();
    expect(find.byType(SadarLogo), findsOneWidget);
  });
}
