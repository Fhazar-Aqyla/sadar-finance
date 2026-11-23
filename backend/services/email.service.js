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

  _buildOtpHtml({ name, otp, purpose }) {
    const title =
      purpose === 'reset'
        ? 'Kode Pemulihan Kata Sandi SADAR Finance'
        : 'Kode Verifikasi Email SADAR Finance';
    const subtitle =
      purpose === 'reset'
        ? 'Gunakan kode OTP 6 digit berikut di aplikasi SADAR Finance untuk mengatur ulang kata sandi Anda.'
        : 'Gunakan kode OTP 6 digit berikut di aplikasi SADAR Finance untuk memverifikasi alamat email akun Anda.';

    return `
      <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:28px;background:#f8fafc;border-radius:16px;border:1px solid #e2e8f0;color:#0f172a;">
        <div style="font-size:20px;font-weight:800;color:#1e3a8a;letter-spacing:1px;margin-bottom:16px;">SADAR FINANCE</div>
        <h2 style="margin:0 0 8px 0;font-size:18px;color:#0f172a;">Halo, ${name || 'Pengguna SADAR'}!</h2>
        <p style="margin:0 0 20px 0;font-size:14px;line-height:1.5;color:#475569;">${subtitle}</p>
        <div style="background:#ffffff;border:2px dashed #14b8a6;border-radius:14px;padding:18px;text-align:center;margin-bottom:20px;">
          <div style="font-size:11px;font-weight:700;color:#64748b;letter-spacing:1.5px;margin-bottom:6px;">${title.toUpperCase()}</div>
          <div style="font-size:32px;font-weight:800;letter-spacing:8px;color:#0f172a;">${otp}</div>
        </div>
        <p style="margin:0;font-size:12px;color:#64748b;">Kode ini berlaku selama <strong>10 menit</strong>. Jangan bagikan kode ini kepada siapa pun.</p>
      </div>
    `;
  }

  async sendOtpEmail({ toEmail, name, otp, purpose = 'verify' }) {
    const subject =
      purpose === 'reset'
        ? `[SADAR Finance] Kode OTP Reset Password: ${otp}`
        : `[SADAR Finance] Kode OTP Verifikasi Email: ${otp}`;
    const html = this._buildOtpHtml({ name, otp, purpose });

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
