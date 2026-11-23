import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../widgets/sadar_card.dart';

class LegalScreen extends StatelessWidget {
  final String title;
  final bool isPrivacy;

  const LegalScreen({
    super.key,
    required this.title,
    required this.isPrivacy,
  });

  @override
  Widget build(BuildContext context) {
    final sections = isPrivacy
        ? const [
            (
              '1. Data yang Kami Kumpulkan',
              'SADAR Finance mengumpulkan data profil dasar, catatan transaksi, pemasukan, akun keuangan, dan gambar struk belanja yang Anda unggah untuk keperluan pencatatan serta analitik finansial pribadi.',
            ),
            (
              '2. Penggunaan Pemrosesan AI & OCR',
              'Gambar struk diproses melalui layanan OCR untuk mengekstrak nama merchant, tanggal, dan nominal transaksi. Data transaksi digunakan untuk menghitung skor kesehatan finansial serta prediksi pola pengeluaran.',
            ),
            (
              '3. Keamanan & Penyimpanan',
              'Kata sandi dienkripsi dengan bcrypt, komunikasi API dilindungi token JWT, dan kredensial perangkat disimpan menggunakan Secure Storage (Keychain iOS / Keystore Android).',
            ),
          ]
        : const [
            (
              '1. Penggunaan Layanan',
              'SADAR Finance merupakan alat bantu manajemen keuangan pribadi (personal finance) dan bukan penasihat investasi resmi. Segala keputusan finansial tetap menjadi tanggung jawab pengguna.',
            ),
            (
              '2. Akurasi Hasil Scan Struk',
              'Hasil ekstraksi otomatis dari fitur scan struk wajib ditinjau kembali oleh pengguna sebelum disimpan ke catatan transaksi.',
            ),
            (
              '3. Penghentian Akun',
              'Pengguna dapat menghapus akun dan data terkait kapan saja melalui menu pengaturan aplikasi.',
            ),
          ];

    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: sections
            .map(
              (s) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: SadarCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        s.$1,
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 15,
                          color: AppColors.textPrimaryOf(context),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        s.$2,
                        textAlign: TextAlign.justify,
                        style: TextStyle(
                          fontSize: 13.5,
                          color: AppColors.textSecondaryOf(context),
                          height: 1.45,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            )
            .toList(),
      ),
    );
  }
}
