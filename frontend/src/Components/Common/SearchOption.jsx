import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "reactstrap";
import {
  accounts,
  getAccountName,
  incomes,
  transactions,
} from "../../pages/SadarShared/mockData";

const quickActions = [
  {
    title: "Tambah Pengeluaran",
    description: "Catat transaksi keluar",
    icon: "ri-add-circle-line",
    color: "primary",
    link: "/catat-keuangan",
    keywords: "tambah pengeluaran catat transaksi keluar expense",
  },
  {
    title: "Tambah Pemasukan",
    description: "Catat gaji, bonus, atau freelance",
    icon: "ri-bank-card-line",
    color: "success",
    link: "/catat-keuangan?type=income",
    keywords: "tambah pemasukan income gaji bonus freelance",
  },
  {
    title: "Dashboard",
    description: "Ringkasan keuangan",
    icon: "ri-dashboard-3-line",
    color: "primary",
    link: "/dashboard",
    keywords: "dashboard dasbor ringkasan saldo arus kas cashflow",
  },
  {
    title: "Insight Perilaku",
    description: "Analisis pola pengeluaran",
    icon: "ri-lightbulb-flash-line",
    color: "info",
    link: "/behavior-insight",
    keywords: "insight analisis perilaku behavior pengeluaran",
  },
  {
    title: "Skor Finansial",
    description: "Skor kesehatan keuangan",
    icon: "ri-speed-up-line",
    color: "warning",
    link: "/financial-score",
    keywords: "financial score skor kesehatan keuangan",
  },
  {
    title: "Profil & Akun",
    description: "Akun, anggaran, dan riwayat",
    icon: "ri-user-settings-line",
    color: "secondary",
    link: "/profile-account",
    keywords: "profile account akun budget riwayat transaksi",
  },
];

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (date) =>
  new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(`${date}T00:00:00`));

const normalize = (value) => value.toString().toLowerCase();

const formatAccountType = (type) => {
  if (type === "Cash") return "Tunai";
  if (type === "E-wallet") return "Dompet digital";
  return type || "Akun";
};

const buildSearchItems = () => {
  const transactionItems = transactions.map((transaction) => ({
    type: "Transaksi",
    title: transaction.name,
    description: `${transaction.category} - ${getAccountName(transaction.account_id)} - ${rupiah(transaction.amount)}`,
    meta: formatDate(transaction.date),
    icon: "ri-arrow-up-circle-line",
    color: "danger",
    link: "/profile-account#riwayat-transaksi",
    keywords: `${transaction.name} ${transaction.category} ${transaction.budget_group} ${getAccountName(transaction.account_id)} ${transaction.status}`,
  }));

  const incomeItems = incomes.map((income) => ({
    type: "Pemasukan",
    title: income.source,
    description: `${getAccountName(income.account_id)} - ${rupiah(income.amount)}`,
    meta: formatDate(income.date),
    icon: "ri-arrow-down-circle-line",
    color: "success",
    link: "/profile-account#riwayat-transaksi",
    keywords: `${income.source} pemasukan income ${getAccountName(income.account_id)}`,
  }));

  const accountItems = accounts.map((account) => ({
    type: "Akun",
    title: account.name,
    description: `${formatAccountType(account.type)} - saldo ${rupiah(account.balance)}`,
    meta: "Akun",
    icon: "ri-wallet-3-line",
    color: "primary",
    link: "/profile-account",
    keywords: `${account.name} ${account.type} account akun saldo`,
  }));

  const categories = [...new Set(transactions.map((transaction) => transaction.category))];
  const categoryItems = categories.map((category) => ({
    type: "Kategori",
    title: category,
    description: "Lihat pola dan distribusi pengeluaran",
    meta: "Insight",
    icon: "ri-price-tag-3-line",
    color: "info",
    link: "/behavior-insight",
    keywords: `${category} kategori pengeluaran insight`,
  }));

  return [
    ...quickActions.map((item) => ({ ...item, type: "Fitur", meta: "Akses cepat" })),
    ...transactionItems,
    ...incomeItems,
    ...accountItems,
    ...categoryItems,
  ];
};

const SearchOption = ({ className = "d-none d-md-block", autoFocus = false, onNavigate }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchItems = useMemo(() => buildSearchItems(), []);
  const trimmedQuery = query.trim();

  const results = useMemo(() => {
    if (!trimmedQuery) {
      return quickActions.slice(0, 5).map((item) => ({ ...item, type: "Fitur", meta: "Akses cepat" }));
    }

    const terms = normalize(trimmedQuery).split(/\s+/).filter(Boolean);

    return searchItems
      .map((item) => {
        const haystack = normalize(`${item.title} ${item.description} ${item.type} ${item.meta} ${item.keywords}`);
        const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
        return { ...item, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [searchItems, trimmedQuery]);

  const closeSearch = () => {
    setIsOpen(false);
    setQuery("");
    if (onNavigate) onNavigate();
  };

  const goToResult = (link) => {
    navigate(link);
    closeSearch();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const firstResult = results[0];
    if (firstResult) {
      goToResult(firstResult.link);
    }
  };

  return (
    <form className={`app-search sadar-app-search ${className}`} onSubmit={handleSubmit}>
      <div className="position-relative">
        <Input
          type="text"
          className="form-control"
          placeholder="Cari transaksi, kategori, atau account..."
          id="search-options"
          autoFocus={autoFocus}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setIsOpen(false), 140);
          }}
          autoComplete="off"
        />
        <span className="mdi mdi-magnify search-widget-icon"></span>
      </div>
      <div className={`dropdown-menu dropdown-menu-lg sadar-search-menu ${isOpen ? "show" : ""}`} id="search-dropdown">
        <div className="p-3">
          <h6 className="text-muted text-uppercase fs-12 mb-3">
            {trimmedQuery ? "Hasil Pencarian" : "Akses Cepat"}
          </h6>
          {results.length > 0 ? (
            results.map((item) => (
              <button
                type="button"
                className="dropdown-item rounded-2 sadar-search-result"
                key={`${item.type}-${item.title}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => goToResult(item.link)}
              >
                <span className={`sadar-search-icon bg-${item.color}-subtle text-${item.color}`}>
                  <i className={item.icon}></i>
                </span>
                <span className="sadar-search-copy">
                  <span className="sadar-search-title">{item.title}</span>
                  <span className="sadar-search-desc">{item.description}</span>
                </span>
                <span className="sadar-search-meta">{item.meta}</span>
              </button>
            ))
          ) : (
            <div className="text-muted fs-13 px-2 py-3">Tidak ada hasil untuk "{trimmedQuery}".</div>
          )}
        </div>
      </div>
    </form>
  );
};

export default SearchOption;
