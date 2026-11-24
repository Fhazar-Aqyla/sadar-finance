/**
 * Email Service — Sends 6-digit OTP codes for Email Verification & Password Reset.
 * Supports:
 * 1) Direct SMTPS (Port 465, e.g. Gmail Free SMTP with App Password: smtp.gmail.com)
 * 2) Brevo Free HTTP API (BREVO_API_KEY — 300 free emails/day)
 * 3) Resend Free HTTP API (RESEND_API_KEY — 100 free emails/day)
 * 4) Sandbox fallback (when no SMTP/API credentials are configured yet) so OTP flows
 *    remain 100% functional and testable immediately.
 */

const tls = require('tls');

class EmailService {
  get isSmtpConfigured() {
    return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
  }

  get isBrevoConfigured() {
    return Boolean(process.env.BREVO_API_KEY);
  }

  get isResendConfigured() {
    return Boolean(process.env.RESEND_API_KEY);
  }

  get isLiveEmailConfigured() {
    return this.isSmtpConfigured || this.isBrevoConfigured || this.isResendConfigured;
  }

  _buildOtpHtml({ name, toEmail, otp, purpose }) {
    const isReset = purpose === 'reset';
    const docTitle = isReset
      ? 'Otentikasi Pemulihan Kata Sandi'
      : 'Otentikasi Verifikasi Alamat Email';
    const serviceLabel = isReset
      ? 'Pengaturan Ulang Kata Sandi Akun'
      : 'Verifikasi Keamanan Alamat Email';
    const introText = isReset
      ? 'Kami menerima permintaan untuk mengatur ulang kata sandi akun SADAR Finance Anda. Gunakan Kode Otentikasi Satu Kali (OTP) resmi di bawah ini untuk melanjutkan proses pemulihan akun.'
      : 'Terima kasih telah menggunakan SADAR Finance. Untuk memastikan keamanan dan keabsahan akun Anda, silakan masukkan Kode Otentikasi Satu Kali (OTP) resmi berikut pada aplikasi SADAR Finance.';

    const formattedOtp = String(otp || '')
      .trim()
      .split('')
      .join(' ');
    const nowWib = new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'Asia/Jakarta',
    }).format(new Date());
    const logoUrl =
      process.env.APP_EMAIL_LOGO_URL ||
      'https://sadar-finance.web.id/api/v1/app/logo-light.png';
    const greetingName = (name || 'Pengguna SADAR Finance').trim();
    const recipientEmail = (toEmail || '-').trim();

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${docTitle} - SADAR Finance</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #cbd5e1;box-shadow:0 10px 25px rgba(15,23,42,0.06);">
          <!-- Official Brand Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0a1e36 0%,#102a4c 55%,#1e3a8a 100%);background-color:#0a1e36;padding:26px 32px;border-bottom:3px solid #14b8a6;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" valign="middle">
                    <img src="${logoUrl}" alt="SADAR Finance" height="26" style="display:block;height:26px;border:0;outline:none;text-decoration:none;color:#ffffff;font-size:20px;font-weight:900;letter-spacing:3px;" />
                    <div style="margin-top:6px;font-size:11px;font-weight:600;letter-spacing:1.2px;color:#94a3b8;text-transform:uppercase;">
                      Official Security Notification
                    </div>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display:inline-block;padding:6px 12px;background-color:rgba(20,184,166,0.16);border:1px solid rgba(94,234,212,0.35);border-radius:999px;font-size:11px;font-weight:700;color:#5eead4;letter-spacing:0.5px;">
                      RESMI - TERENKRIPSI
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding:32px;">
              <div style="font-size:12px;font-weight:700;color:#1e3a8a;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
                ${docTitle}
              </div>
              <h1 style="margin:0 0 14px 0;font-size:20px;font-weight:800;color:#0f172a;line-height:1.35;">
                Yth. ${greetingName},
              </h1>
              <p style="margin:0 0 24px 0;font-size:14px;line-height:1.65;color:#334155;text-align:justify;">
                ${introText}
              </p>

              <!-- Official OTP Verification Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #cbd5e1;border-left:4px solid #1e3a8a;border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:22px 24px;text-align:center;">
                    <div style="font-size:11px;font-weight:700;color:#475569;letter-spacing:1.4px;text-transform:uppercase;margin-bottom:10px;">
                      KODE OTENTIKASI SATU KALI (OTP)
                    </div>
                    <div style="display:inline-block;padding:12px 24px;background-color:#0a1e36;border-radius:10px;font-family:'Courier New',Courier,monospace;font-size:30px;font-weight:800;letter-spacing:8px;color:#ffffff;">
                      ${formattedOtp}
                    </div>
                    <div style="margin-top:10px;font-size:12px;color:#64748b;">
                      Masa berlaku kode: <strong style="color:#0f172a;">10 menit</strong> sejak email ini diterbitkan
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Request Details Table -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;font-size:13px;">
                <tr>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;width:38%;">Akun Email</td>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:600;">${recipientEmail}</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;">Jenis Layanan</td>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:600;">${serviceLabel}</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;">Waktu Permintaan</td>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:600;">${nowWib} WIB</td>
                </tr>
              </table>

              <!-- Security Warning Notice -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:10px;">
                <tr>
                  <td style="padding:14px 16px;font-size:12.5px;line-height:1.55;color:#92400e;text-align:justify;">
                    <strong>Peringatan Keamanan Resmi:</strong> Pihak SADAR Finance tidak pernah meminta kode OTP atau kata sandi Anda melalui telepon, pesan singkat, maupun media sosial. Jangan berikan kode ini kepada siapa pun. Apabila Anda tidak merasa melakukan permintaan ini, abaikan pesan ini dan akun Anda tetap aman.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Official Corporate Footer -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:22px 32px;text-align:center;">
              <div style="font-size:12.5px;font-weight:700;color:#0f172a;margin-bottom:4px;">
                SADAR Finance - Official Security &amp; Identity Service
              </div>
              <div style="font-size:11.5px;color:#64748b;line-height:1.5;margin-bottom:10px;">
                Pesan ini dikirim secara otomatis oleh sistem keamanan resmi SADAR Finance.<br />
                Website Resmi: <a href="https://sadar-finance.web.id" style="color:#1e3a8a;text-decoration:none;font-weight:600;">https://sadar-finance.web.id</a>
              </div>
              <div style="font-size:11px;color:#94a3b8;">
                &copy; ${new Date().getFullYear()} SADAR Finance. Seluruh hak cipta dilindungi undang-undang.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  async sendOtpEmail({ toEmail, name, otp, purpose = 'verify' }) {
    const subject =
      purpose === 'reset'
        ? `[SADAR Finance] Kode Otentikasi Pemulihan Kata Sandi Anda`
        : `[SADAR Finance] Kode Otentikasi Verifikasi Email Akun Anda`;
    const html = this._buildOtpHtml({ name, toEmail, otp, purpose });

    try {
      if (this.isBrevoConfigured) {
        await this._sendViaBrevo({ toEmail, name, subject, html });
        return { sent: true, provider: 'brevo' };
      }
      if (this.isResendConfigured) {
        await this._sendViaResend({ toEmail, subject, html });
        return { sent: true, provider: 'resend' };
      }
      if (this.isSmtpConfigured) {
        await this._sendViaSmtps({ toEmail, subject, html });
        return { sent: true, provider: 'smtp' };
      }
    } catch (err) {
      console.error('[EmailService] Delivery error, falling back to sandbox preview:', err.message);
      return { sent: false, provider: 'sandbox-fallback', error: err.message };
    }

    return { sent: false, provider: 'sandbox' };
  }

  buildFinancialStatementHtml({
    user,
    periodLabel,
    totalBalance,
    totalIncome,
    totalExpense,
    netCashflow,
    healthScore,
    accounts = [],
    budget,
    transactions = [],
    incomes = [],
    savingsGoals = [],
    debts = [],
  }) {
    const fmtRp = (v) =>
      `Rp ${Math.round(Number(v || 0)).toLocaleString('id-ID')}`;
    const logoUrl =
      process.env.APP_EMAIL_LOGO_URL ||
      'https://sadar-finance.web.id/api/v1/app/logo-light.png';
    const greetingName = (
      user?.middle_name ||
      user?.middleName ||
      user?.first_name ||
      user?.firstName ||
      'Pengguna SADAR Finance'
    ).trim();
    const fullName = [
      user?.first_name || user?.firstName,
      user?.middle_name || user?.middleName,
      user?.last_name || user?.lastName,
    ]
      .filter((p) => p && String(p).toLowerCase() !== 'user')
      .join(' ') || greetingName;
    const nowWib = new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'Asia/Jakarta',
    }).format(new Date());

    const scoreVal = Number(healthScore?.overallScore ?? 0);
    const scoreStatus = healthScore?.status || 'Cukup Sehat';
    const needsPct = ((Number(healthScore?.needsRatio || 0)) * 100).toFixed(1);
    const wantsPct = ((Number(healthScore?.wantsRatio || 0)) * 100).toFixed(1);
    const savingsPct = ((Number(healthScore?.savingsRatio || 0)) * 100).toFixed(1);

    const accountRowsHtml =
      accounts.length === 0
        ? `<tr><td colspan="3" style="padding:10px 12px;color:#64748b;text-align:center;">Belum ada akun tercatat</td></tr>`
        : accounts
            .map(
              (acc) => `<tr>
                <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#0f172a;">${acc.account_name || acc.name || 'Akun'}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;">${acc.account_number || acc.accountNumber || '-'}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:700;color:#0f172a;text-align:right;">${fmtRp(acc.balance)}</td>
              </tr>`
            )
            .join('');

    const combinedMutations = [
      ...incomes.map((i) => ({
        date: String(i.income_date || i.incomeDate || '').slice(0, 10),
        desc: i.source || 'Pemasukan',
        cat: 'Pemasukan',
        amount: Number(i.amount || 0),
        isIncome: true,
      })),
      ...transactions.map((t) => ({
        date: String(t.transaction_date || t.transactionDate || '').slice(0, 10),
        desc: t.description || 'Pengeluaran',
        cat: t.category_group || t.categoryGroup || 'Needs',
        amount: Number(t.amount || 0),
        isIncome: false,
      })),
    ]
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, 20);

    const mutationRowsHtml =
      combinedMutations.length === 0
        ? `<tr><td colspan="4" style="padding:12px;color:#64748b;text-align:center;">Belum ada mutasi transaksi pada periode ini</td></tr>`
        : combinedMutations
            .map(
              (m) => `<tr>
                <td style="padding:9px 10px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:12px;">${m.date}</td>
                <td style="padding:9px 10px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:600;font-size:12.5px;">${m.desc}</td>
                <td style="padding:9px 10px;border-bottom:1px solid #e2e8f0;color:#475569;font-size:12px;">${m.cat}</td>
                <td style="padding:9px 10px;border-bottom:1px solid #e2e8f0;font-weight:700;font-size:12.5px;text-align:right;color:${m.isIncome ? '#16a34a' : '#dc2626'};">${m.isIncome ? '+' : '-'}${fmtRp(m.amount)}</td>
              </tr>`
            )
            .join('');

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>e-Statement Resmi ${periodLabel} - SADAR Finance</title>
  <style>
    @media print {
      .no-print { display: none !important; }
      body { background: #ffffff !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <div class="no-print" style="max-width:680px;margin:18px auto 0 auto;padding:0 16px;text-align:right;">
    <button onclick="window.print()" style="background-color:#0a1e36;color:#ffffff;border:none;border-radius:8px;padding:10px 18px;font-weight:700;font-size:13px;cursor:pointer;">
      Cetak / Simpan sebagai PDF
    </button>
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #cbd5e1;box-shadow:0 10px 25px rgba(15,23,42,0.06);">
          <!-- Official Brand Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0a1e36 0%,#102a4c 55%,#1e3a8a 100%);background-color:#0a1e36;padding:26px 32px;border-bottom:3px solid #14b8a6;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" valign="middle">
                    <img src="${logoUrl}" alt="SADAR Finance" height="28" style="display:block;height:28px;border:0;color:#ffffff;font-size:20px;font-weight:900;" />
                    <div style="margin-top:6px;font-size:11px;font-weight:600;letter-spacing:1.2px;color:#94a3b8;text-transform:uppercase;">
                      Official Financial e-Statement - ${periodLabel}
                    </div>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display:inline-block;padding:6px 12px;background-color:rgba(20,184,166,0.16);border:1px solid rgba(94,234,212,0.35);border-radius:999px;font-size:11px;font-weight:700;color:#5eead4;">
                      E-STATEMENT RESMI
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:30px 32px;">
              <h1 style="margin:0 0 8px 0;font-size:19px;font-weight:800;color:#0f172a;">
                Yth. ${greetingName},
              </h1>
              <p style="margin:0 0 20px 0;font-size:13.5px;line-height:1.65;color:#334155;text-align:justify;">
                Berikut adalah Laporan Ringkasan Keuangan Resmi (<em>e-Statement</em>) akun SADAR Finance atas nama <strong>${fullName}</strong> (${user?.email || '-'}) untuk periode <strong>${periodLabel}</strong> yang diterbitkan pada ${nowWib} WIB.
              </p>

              <!-- Summary Metrics Grid -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #cbd5e1;border-radius:12px;margin-bottom:22px;">
                <tr>
                  <td style="padding:16px;border-right:1px solid #e2e8f0;width:33%;">
                    <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;">Total Saldo Aktif</div>
                    <div style="font-size:16px;font-weight:800;color:#0a1e36;margin-top:4px;">${fmtRp(totalBalance)}</div>
                  </td>
                  <td style="padding:16px;border-right:1px solid #e2e8f0;width:33%;">
                    <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;">Pemasukan Bulan Ini</div>
                    <div style="font-size:16px;font-weight:800;color:#16a34a;margin-top:4px;">${fmtRp(totalIncome)}</div>
                  </td>
                  <td style="padding:16px;width:34%;">
                    <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;">Pengeluaran Bulan Ini</div>
                    <div style="font-size:16px;font-weight:800;color:#dc2626;margin-top:4px;">${fmtRp(totalExpense)}</div>
                  </td>
                </tr>
              </table>

              <!-- 50/30/20 & Health Score -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:22px;font-size:13px;">
                <tr>
                  <td style="padding:10px 12px;background-color:#0a1e36;color:#ffffff;font-weight:700;border-radius:8px 0 0 0;">Indikator Kesehatan &amp; Alokasi 50/30/20</td>
                  <td style="padding:10px 12px;background-color:#0a1e36;color:#ffffff;font-weight:700;text-align:right;border-radius:0 8px 0 0;">Nilai Evaluasi</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#475569;">Skor Kesehatan Finansial</td>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:800;color:#0f172a;text-align:right;">${scoreVal} / 100 (${scoreStatus})</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#475569;">Arus Kas Bersih (Net Cashflow)</td>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:700;color:${netCashflow >= 0 ? '#16a34a' : '#dc2626'};text-align:right;">${fmtRp(netCashflow)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#475569;">Rasio 50/30/20 (Kebutuhan / Keinginan / Tabungan)</td>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:700;color:#0f172a;text-align:right;">${needsPct}% / ${wantsPct}% / ${savingsPct}%</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#475569;">Target Tabungan &amp; Catatan Piutang Aktif</td>
                  <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:700;color:#0f172a;text-align:right;">${savingsGoals.length} Target Tabungan - ${debts.filter((d) => !d.isSettled).length} Piutang/Utang</td>
                </tr>
              </table>

              <!-- Accounts Table -->
              <div style="font-size:13px;font-weight:800;color:#0a1e36;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px;">
                Daftar Rekening &amp; Dompet Aktif
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:22px;font-size:13px;border:1px solid #e2e8f0;">
                <tr style="background-color:#f8fafc;">
                  <th align="left" style="padding:9px 12px;border-bottom:1px solid #cbd5e1;color:#475569;">Nama Akun</th>
                  <th align="left" style="padding:9px 12px;border-bottom:1px solid #cbd5e1;color:#475569;">No. Rekening / ID</th>
                  <th align="right" style="padding:9px 12px;border-bottom:1px solid #cbd5e1;color:#475569;">Saldo</th>
                </tr>
                ${accountRowsHtml}
              </table>

              <!-- Recent Mutations Table -->
              <div style="font-size:13px;font-weight:800;color:#0a1e36;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px;">
                20 Mutasi Keuangan Terbaru
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:18px;border:1px solid #e2e8f0;">
                <tr style="background-color:#f8fafc;font-size:12px;">
                  <th align="left" style="padding:9px 10px;border-bottom:1px solid #cbd5e1;color:#475569;">Tanggal</th>
                  <th align="left" style="padding:9px 10px;border-bottom:1px solid #cbd5e1;color:#475569;">Deskripsi</th>
                  <th align="left" style="padding:9px 10px;border-bottom:1px solid #cbd5e1;color:#475569;">Kategori</th>
                  <th align="right" style="padding:9px 10px;border-bottom:1px solid #cbd5e1;color:#475569;">Nominal</th>
                </tr>
                ${mutationRowsHtml}
              </table>
            </td>
          </tr>

          <!-- Official Footer -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
              <div style="font-size:12.5px;font-weight:700;color:#0f172a;margin-bottom:4px;">
                SADAR Finance - Official Monthly Financial e-Statement
              </div>
              <div style="font-size:11.5px;color:#64748b;line-height:1.5;">
                Dokumen ini diterbitkan secara elektronik oleh sistem resmi SADAR Finance (<a href="https://sadar-finance.web.id" style="color:#1e3a8a;text-decoration:none;font-weight:600;">https://sadar-finance.web.id</a>).
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  async sendFinancialStatementEmail({ toEmail, name, periodLabel, html }) {
    const subject = `[SADAR Finance] Laporan e-Statement Keuangan Resmi - ${periodLabel}`;
    try {
      if (this.isBrevoConfigured) {
        await this._sendViaBrevo({ toEmail, name, subject, html });
        return { sent: true, provider: 'brevo' };
      }
      if (this.isResendConfigured) {
        await this._sendViaResend({ toEmail, subject, html });
        return { sent: true, provider: 'resend' };
      }
      if (this.isSmtpConfigured) {
        await this._sendViaSmtps({ toEmail, subject, html });
        return { sent: true, provider: 'smtp' };
      }
    } catch (err) {
      console.error('[EmailService] e-Statement delivery error:', err.message);
      return { sent: false, provider: 'sandbox-fallback', error: err.message };
    }
    return { sent: false, provider: 'sandbox' };
  }

  async _sendViaBrevo({ toEmail, name, subject, html }) {
    const senderEmail = process.env.SMTP_FROM || 'noreply@sadar-finance.web.id';
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'SADAR Finance', email: senderEmail },
        to: [{ email: toEmail, name: name || toEmail }],
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) {
      throw new Error(`Brevo HTTP ${res.status}`);
    }
  }

  async _sendViaResend({ toEmail, subject, html }) {
    const primaryFrom =
      process.env.SMTP_FROM || 'SADAR Finance <noreply@sadar-finance.web.id>';
    const fallbackFrom = 'SADAR Finance <onboarding@resend.dev>';

    const trySend = async (fromAddr) => {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: fromAddr, to: [toEmail], subject, html }),
      });
      const bodyText = await res.text().catch(() => '');
      return { ok: res.ok, status: res.status, bodyText };
    };

    let attempt = await trySend(primaryFrom);
    if (!attempt.ok && primaryFrom !== fallbackFrom) {
      attempt = await trySend(fallbackFrom);
    }
    if (!attempt.ok) {
      throw new Error(`Resend HTTP ${attempt.status}: ${attempt.bodyText}`);
    }
  }

  /**
   * Native TLS SMTPS client (Port 465 — Gmail Free SMTP `smtp.gmail.com` with 16-char App Password)
   */
  _sendViaSmtps({ toEmail, subject, html }) {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT || 465);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || user;

    return new Promise((resolve, reject) => {
      const socket = tls.connect({ host, port, rejectUnauthorized: false });
      let step = 0;
      let buffer = '';

      const timeout = setTimeout(() => {
        socket.destroy();
        reject(new Error('SMTP connection timeout'));
      }, 12000);

      const sendLine = (line) => socket.write(`${line}\r\n`);

      socket.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      socket.on('data', (chunk) => {
        buffer += chunk.toString('utf8');
        const lines = buffer.split('\r\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line || line[3] === '-') continue;
          const code = Number(line.slice(0, 3));
          if (code >= 400) {
            clearTimeout(timeout);
            socket.end();
            return reject(new Error(`SMTP ${line}`));
          }

          if (step === 0 && code === 220) {
            step = 1;
            sendLine(`EHLO sadar-finance.web.id`);
          } else if (step === 1 && code === 250) {
            step = 2;
            sendLine('AUTH LOGIN');
          } else if (step === 2 && code === 334) {
            step = 3;
            sendLine(Buffer.from(user, 'utf8').toString('base64'));
          } else if (step === 3 && code === 334) {
            step = 4;
            sendLine(Buffer.from(pass, 'utf8').toString('base64'));
          } else if (step === 4 && code === 235) {
            step = 5;
            sendLine(`MAIL FROM:<${from}>`);
          } else if (step === 5 && code === 250) {
            step = 6;
            sendLine(`RCPT TO:<${toEmail}>`);
          } else if (step === 6 && code === 250) {
            step = 7;
            sendLine('DATA');
          } else if (step === 7 && code === 354) {
            step = 8;
            const msg = [
              `From: "SADAR Finance" <${from}>`,
              `To: <${toEmail}>`,
              `Subject: =?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`,
              'MIME-Version: 1.0',
              'Content-Type: text/html; charset=UTF-8',
              '',
              html,
              '.',
            ].join('\r\n');
            sendLine(msg);
          } else if (step === 8 && code === 250) {
            step = 9;
            sendLine('QUIT');
            clearTimeout(timeout);
            socket.end();
            resolve(true);
          }
        }
      });
    });
  }
}

module.exports = new EmailService();
