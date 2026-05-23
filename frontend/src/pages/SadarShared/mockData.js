export const currentUserId = "user_001";

export const userProfile = {
  id: currentUserId,
  name: "Aqyla",
  email: "aqyla@example.com",
  avatar: "",
};

export const accounts = [
  { id: "acc_001", user_id: currentUserId, name: "Cash", type: "Cash", balance: 650000 },
  { id: "acc_002", user_id: currentUserId, name: "BCA Everyday", type: "Bank", balance: 12600000 },
  { id: "acc_003", user_id: currentUserId, name: "GoPay", type: "E-wallet", balance: 1250000 },
];

export const incomes = [
  { id: "inc_001", user_id: currentUserId, account_id: "acc_002", source: "Gaji", amount: 8200000, date: "2026-05-01" },
  { id: "inc_002", user_id: currentUserId, account_id: "acc_002", source: "Freelance", amount: 1350000, date: "2026-05-12" },
];

export const budgets = [
  { id: "bdg_001", user_id: currentUserId, category: "Needs", label: "Needs", limit: 4775000, used: 3025000 },
  { id: "bdg_002", user_id: currentUserId, category: "Wants", label: "Wants", limit: 2865000, used: 2245000 },
  { id: "bdg_003", user_id: currentUserId, category: "Savings", label: "Savings", limit: 1910000, used: 1150000 },
];

export const transactions = [
  { id: "trx_001", user_id: currentUserId, account_id: "acc_002", name: "Belanja bulanan", category: "Makanan", budget_group: "Needs", amount: 425000, date: "2026-05-16", status: "Tercatat" },
  { id: "trx_002", user_id: currentUserId, account_id: "acc_003", name: "Transport online", category: "Transportasi", budget_group: "Needs", amount: 54000, date: "2026-05-15", status: "Tercatat" },
  { id: "trx_003", user_id: currentUserId, account_id: "acc_003", name: "Kopi dan makan siang", category: "Makanan", budget_group: "Needs", amount: 87000, date: "2026-05-14", status: "Tercatat" },
  { id: "trx_004", user_id: currentUserId, account_id: "acc_002", name: "Langganan musik", category: "Hiburan", budget_group: "Wants", amount: 59000, date: "2026-05-13", status: "Tercatat" },
  { id: "trx_005", user_id: currentUserId, account_id: "acc_003", name: "Makan weekend", category: "Makanan", budget_group: "Needs", amount: 238000, date: "2026-05-11", status: "Tercatat" },
  { id: "trx_006", user_id: currentUserId, account_id: "acc_002", name: "Belanja fashion", category: "Belanja", budget_group: "Wants", amount: 620000, date: "2026-05-10", status: "Tercatat" },
  { id: "trx_007", user_id: currentUserId, account_id: "acc_003", name: "Bioskop", category: "Hiburan", budget_group: "Wants", amount: 165000, date: "2026-05-10", status: "Tercatat" },
  { id: "trx_008", user_id: currentUserId, account_id: "acc_001", name: "Parkir", category: "Transportasi", budget_group: "Needs", amount: 15000, date: "2026-05-09", status: "Tercatat" },
  { id: "trx_009", user_id: currentUserId, account_id: "acc_002", name: "Tagihan listrik", category: "Tagihan", budget_group: "Needs", amount: 365000, date: "2026-05-08", status: "Tercatat" },
  { id: "trx_010", user_id: currentUserId, account_id: "acc_003", name: "Snack sore", category: "Makanan", budget_group: "Needs", amount: 42000, date: "2026-05-07", status: "Tercatat" },
  { id: "trx_011", user_id: currentUserId, account_id: "acc_002", name: "Top up tabungan", category: "Tabungan", budget_group: "Savings", amount: 650000, date: "2026-05-06", status: "Tercatat" },
  { id: "trx_012", user_id: currentUserId, account_id: "acc_002", name: "Obat dan vitamin", category: "Kesehatan", budget_group: "Needs", amount: 128000, date: "2026-05-05", status: "Tercatat" },
  { id: "trx_013", user_id: currentUserId, account_id: "acc_003", name: "Makan malam", category: "Makanan", budget_group: "Needs", amount: 96000, date: "2026-05-04", status: "Tercatat" },
  { id: "trx_014", user_id: currentUserId, account_id: "acc_002", name: "Marketplace", category: "Belanja", budget_group: "Wants", amount: 475000, date: "2026-05-03", status: "Tercatat" },
  { id: "trx_015", user_id: currentUserId, account_id: "acc_001", name: "Sarapan", category: "Makanan", budget_group: "Needs", amount: 33000, date: "2026-05-02", status: "Tercatat" },
  { id: "trx_016", user_id: currentUserId, account_id: "acc_002", name: "Dana darurat", category: "Tabungan", budget_group: "Savings", amount: 500000, date: "2026-05-01", status: "Tercatat" },
];

export const alerts = [
  { id: "alt_001", user_id: currentUserId, title: "Budget mendekati batas", message: "Kategori Wants sudah memakai 78% dari alokasi bulan ini.", level: "warning" },
];

export const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export const getUserRows = (rows, userId = currentUserId) => rows.filter((row) => row.user_id === userId);

export const sumBy = (rows, getValue) => rows.reduce((total, row) => total + getValue(row), 0);

export const groupSumBy = (rows, key) =>
  rows.reduce((result, row) => {
    const groupKey = row[key];
    result[groupKey] = (result[groupKey] || 0) + row.amount;
    return result;
  }, {});

export const getAccountName = (accountId) => accounts.find((account) => account.id === accountId)?.name || "-";

export const getDayName = (date) =>
  new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(new Date(`${date}T00:00:00`));

export const isWeekend = (date) => {
  const day = new Date(`${date}T00:00:00`).getDay();
  return day === 0 || day === 6;
};

export const formatShortDate = (date) =>
  new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(`${date}T00:00:00`));

