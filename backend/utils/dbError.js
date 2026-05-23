const getDatabaseErrorResponse = (err) => {
  if (!err) return null;

  const message = String(err.message || '');
  const code = err.code;

  if (code === '28P01' || /password authentication failed/i.test(message)) {
    return {
      statusCode: 503,
      errorCode: 'DB_AUTH_FAILED',
      message: 'Koneksi PostgreSQL gagal: DB_USER atau DB_PASSWORD di backend/.env tidak valid.',
    };
  }

  if (/SASL.*password.*string/i.test(message)) {
    return {
      statusCode: 503,
      errorCode: 'DB_PASSWORD_INVALID',
      message: 'Koneksi PostgreSQL gagal: DB_PASSWORD di backend/.env harus berupa teks. Isi password atau kosongkan nilainya.',
    };
  }

  if (code === '3D000' || /database .* does not exist/i.test(message)) {
    return {
      statusCode: 503,
      errorCode: 'DB_NOT_FOUND',
      message: 'Database PostgreSQL tidak ditemukan. Buat database sadar_finance atau sesuaikan DB_NAME di backend/.env.',
    };
  }

  if (
    ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'EAI_AGAIN'].includes(code) ||
    /connect ECONNREFUSED|getaddrinfo|timeout/i.test(message)
  ) {
    return {
      statusCode: 503,
      errorCode: 'DB_CONNECTION_FAILED',
      message: 'Backend tidak bisa terhubung ke PostgreSQL. Pastikan service PostgreSQL aktif dan DB_HOST/DB_PORT benar.',
    };
  }

  return null;
};

module.exports = { getDatabaseErrorResponse };
