const config = require('../config');
const { pool } = require('../config/database');
const { getDatabaseErrorResponse } = require('../utils/dbError');

const main = async () => {
  console.log(`[DB] Checking ${config.db.user}@${config.db.host}:${config.db.port}/${config.db.database}`);

  if (!config.db.password) {
    console.log('[DB] DB_PASSWORD is empty. This is OK only if your local PostgreSQL user has no password.');
  }

  let client;

  try {
    client = await pool.connect();
    const result = await client.query('SELECT current_database() AS database, current_user AS user');
    const row = result.rows[0];

    console.log(`[DB] Connected to database "${row.database}" as user "${row.user}".`);
  } catch (err) {
    const dbError = getDatabaseErrorResponse(err);

    console.error('[DB] Check failed.');
    console.error(dbError?.message || err.message);
    console.error('');
    console.error('Checklist:');
    console.error('- Pastikan PostgreSQL sedang berjalan.');
    console.error('- Pastikan backend/.env berisi password postgres lokal yang benar.');
    console.error('- Pastikan database sadar_finance sudah dibuat, lalu jalankan npm run db:migrate dan npm run db:seed.');

    process.exitCode = 1;
  } finally {
    if (client) client.release();
    await pool.end();
  }
};

main();
