import 'dart:convert';
import 'dart:typed_data';

/// Pure-Dart PDF 1.4 generator using built-in Type1 Helvetica & Helvetica-Bold fonts.
/// Produces 100% valid, lightweight `.pdf` documents without native plugin bloat.
class PdfReportGenerator {
  static String _sanitizePdfText(String input) {
    return input
        .replaceAll('•', '-')
        .replaceAll('—', '-')
        .replaceAll('–', '-')
        .replaceAll('≥', '>=')
        .replaceAll('≤', '<=')
        .replaceAll(RegExp(r'[^\x20-\x7E]'), '')
        .replaceAll(r'\', r'\\')
        .replaceAll('(', r'\(')
        .replaceAll(')', r'\)');
  }

  static Uint8List buildFinancialReportPdf({
    required String title,
    required String subtitle,
    required String userName,
    required String userEmail,
    required String periodLabel,
    required String totalIncome,
    required String totalExpense,
    required String netCashflow,
    required String healthScoreLabel,
    required List<(String, String)> allocationRows,
    required List<(String, String)> accountRows,
    required List<(String, String, String)> transactionRows,
  }) {
    final content = StringBuffer();

    // Header Banner (Navy rectangle #1E3A8A -> 0.118 0.227 0.541)
    content.writeln('0.118 0.227 0.541 rg');
    content.writeln('40 735 515 68 re f');

    // Header Title (White text)
    content.writeln('BT');
    content.writeln('1 1 1 rg');
    content.writeln('/F2 16 Tf');
    content.writeln('56 776 Td');
    content.writeln('(${_sanitizePdfText(title)}) Tj');
    content.writeln('/F1 10 Tf');
    content.writeln('0 -18 Td');
    content.writeln('(${_sanitizePdfText(subtitle)}) Tj');
    content.writeln('ET');

    // User Identity & Period Box
    content.writeln('0.945 0.961 0.976 rg');
    content.writeln('40 675 515 48 re f');
    content.writeln('BT');
    content.writeln('0.059 0.090 0.165 rg');
    content.writeln('/F2 11 Tf');
    content.writeln('54 704 Td');
    content.writeln('(${_sanitizePdfText("Pemilik Akun: $userName ($userEmail)")}) Tj');
    content.writeln('/F1 10 Tf');
    content.writeln('0 -16 Td');
    content.writeln('(${_sanitizePdfText("Periode Laporan: $periodLabel  |  SADAR Finance V 2.0.0 Resmi")}) Tj');
    content.writeln('ET');

    // 4 KPI Summary Section
    double y = 648;
    content.writeln('BT');
    content.writeln('0.059 0.090 0.165 rg');
    content.writeln('/F2 12 Tf');
    content.writeln('40 $y Td');
    content.writeln('(1. RINGKASAN EKSEKUTIF ARUS KAS & SKOR) Tj');
    content.writeln('ET');

    y -= 20;
    final kpis = [
      ('Total Pemasukan', totalIncome),
      ('Total Pengeluaran', totalExpense),
      ('Arus Kas Bersih', netCashflow),
      ('Skor Kesehatan Finansial', healthScoreLabel),
    ];
    for (final kpi in kpis) {
      content.writeln('BT');
      content.writeln('0.20 0.25 0.33 rg');
      content.writeln('/F1 10 Tf');
      content.writeln('52 $y Td');
      content.writeln('(${_sanitizePdfText("- ${kpi.$1}:")}) Tj');
      content.writeln('/F2 10 Tf');
      content.writeln('170 0 Td');
      content.writeln('(${_sanitizePdfText(kpi.$2)}) Tj');
      content.writeln('ET');
      y -= 16;
    }

    // Allocation 50/30/20 Section
    y -= 10;
    content.writeln('BT');
    content.writeln('0.059 0.090 0.165 rg');
    content.writeln('/F2 12 Tf');
    content.writeln('40 $y Td');
    content.writeln('(2. EVALUASI ALOKASI 50 / 30 / 20) Tj');
    content.writeln('ET');
    y -= 18;
    for (final row in allocationRows) {
      content.writeln('BT');
      content.writeln('0.20 0.25 0.33 rg');
      content.writeln('/F1 10 Tf');
      content.writeln('52 $y Td');
      content.writeln('(${_sanitizePdfText("- ${row.$1}")}) Tj');
      content.writeln('/F2 10 Tf');
      content.writeln('210 0 Td');
      content.writeln('(${_sanitizePdfText(row.$2)}) Tj');
      content.writeln('ET');
      y -= 15;
    }

    // Accounts Section
    y -= 10;
    content.writeln('BT');
    content.writeln('0.059 0.090 0.165 rg');
    content.writeln('/F2 12 Tf');
    content.writeln('40 $y Td');
    content.writeln('(3. POSISI SALDO REKENING & DOMpet AKTIF) Tj');
    content.writeln('ET');
    y -= 18;
    if (accountRows.isEmpty) {
      content.writeln('BT /F1 10 Tf 52 $y Td (- Belum ada akun tercatat) Tj ET');
      y -= 15;
    } else {
      for (final acc in accountRows.take(8)) {
        content.writeln('BT');
        content.writeln('0.20 0.25 0.33 rg');
        content.writeln('/F1 10 Tf');
        content.writeln('52 $y Td');
        content.writeln('(${_sanitizePdfText("- ${acc.$1}")}) Tj');
        content.writeln('/F2 10 Tf');
        content.writeln('240 0 Td');
        content.writeln('(${_sanitizePdfText(acc.$2)}) Tj');
        content.writeln('ET');
        y -= 15;
      }
    }

    // Transactions Section
    y -= 10;
    content.writeln('BT');
    content.writeln('0.059 0.090 0.165 rg');
    content.writeln('/F2 12 Tf');
    content.writeln('40 $y Td');
    content.writeln('(4. RINCIAN CATATAN TRANSAKSI TERBARU / TERBESAR) Tj');
    content.writeln('ET');
    y -= 18;

    if (transactionRows.isEmpty) {
      content.writeln(
        'BT /F1 10 Tf 52 $y Td (- Belum ada catatan transaksi pada periode ini) Tj ET',
      );
      y -= 15;
    } else {
      for (final tx in transactionRows.take(16)) {
        if (y < 70) break;
        final label = tx.$2.length > 38 ? '${tx.$2.substring(0, 38)}...' : tx.$2;
        content.writeln('BT');
        content.writeln('0.20 0.25 0.33 rg');
        content.writeln('/F1 9.5 Tf');
        content.writeln('52 $y Td');
        content.writeln('(${_sanitizePdfText("[${tx.$1}] $label")}) Tj');
        content.writeln('/F2 9.5 Tf');
        content.writeln('310 0 Td');
        content.writeln('(${_sanitizePdfText(tx.$3)}) Tj');
        content.writeln('ET');
        y -= 14;
      }
    }

    // Footer line
    content.writeln('0.82 0.85 0.90 RG');
    content.writeln('40 48 m 555 48 l S');
    content.writeln('BT');
    content.writeln('0.45 0.50 0.58 rg');
    content.writeln('/F1 8.5 Tf');
    content.writeln('40 34 Td');
    content.writeln(
      '(Dokumen e-Statement Resmi SADAR Finance V 2.0.0 - https://sadar-finance.web.id) Tj',
    );
    content.writeln('ET');

    final streamStr = content.toString();
    final streamBytes = latin1.encode(streamStr);

    final objects = <String>[
      '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
      '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
      '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n',
      '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
      '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n',
      '6 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n$streamStr\nendstream\nendobj\n',
    ];

    final pdfBuf = StringBuffer('%PDF-1.4\n');
    final offsets = <int>[0];
    for (final obj in objects) {
      offsets.add(latin1.encode(pdfBuf.toString()).length);
      pdfBuf.write(obj);
    }
    final xrefStart = latin1.encode(pdfBuf.toString()).length;
    pdfBuf.writeln('xref');
    pdfBuf.writeln('0 ${objects.length + 1}');
    pdfBuf.writeln('0000000000 65535 f ');
    for (int i = 1; i < offsets.length; i++) {
      pdfBuf.writeln('${offsets[i].toString().padLeft(10, '0')} 00000 n ');
    }
    pdfBuf.writeln('trailer');
    pdfBuf.writeln('<< /Size ${objects.length + 1} /Root 1 0 R >>');
    pdfBuf.writeln('startxref');
    pdfBuf.writeln('$xrefStart');
    pdfBuf.write('%%EOF');

    return Uint8List.fromList(latin1.encode(pdfBuf.toString()));
  }
}
