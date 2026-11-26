import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "reactstrap";
import { accountApi, incomeApi, transactionApi } from "../services/api";

const quickActions = [
  {
    title: "Tambah Pengeluaran",
    description: "Catat transaksi keluar atau scan struk OCR AI",
    icon: "ri-add-circle-line",
    color: "primary",
    link: "/catat-keuangan",
    keywords: "tambah pengeluaran catat transaksi keluar expense ocr struk",
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
    description: "Ringkasan keuangan & batas aman belanja harian",
    icon: "ri-dashboard-3-line",
    color: "primary",
    link: "/dashboard",
    keywords: "dashboard dasbor ringkasan saldo arus kas cashflow",
  },
  {
    title: "Insight Perilaku",
    description: "Analisis pola pengeluaran & risiko lonjakan AI",
    icon: "ri-lightbulb-flash-line",
    color: "info",
    link: "/behavior-insight",
    keywords: "insight analisis perilaku behavior pengeluaran ai",
  },
  {
    title: "Skor Finansial",
    description: "Skor kesehatan keuangan & unduh kartu PNG",
    icon: "ri-speed-up-line",
    color: "warning",
    link: "/financial-score",
    keywords: "financial score skor kesehatan keuangan kartu png",
  },
  {
    title: "Rencana & Piutang",
    description: "Target tabungan, jadwal rutin, piutang & split bill",
    icon: "ri-safe-2-line",
    color: "primary",
    link: "/financial-plans",
    keywords: "rencana piutang utang split bill dana darurat tabungan",
  },
  {
    title: "Riwayat & Kalender Arus Kas",
    description: "Mutasi lengkap, kalender harian & cetak e-Statement PDF",
    icon: "ri-calendar-check-line",
    color: "info",
    link: "/financial-history",
    keywords: "riwayat mutasi kalender arus kas estatement pdf laporan",
  },
  {
    title: "Profil & Akun",
    description: "Rekening, anggaran 50/30/20, dan posisi kekayaan bersih",
    icon: "ri-user-settings-line",
    color: "secondary",
    link: "/profile-account",
    keywords: "profile account akun budget kekayaan bersih net worth",
  },
];

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (raw) => {
  if (!raw) return "";
  const d = new Date(`${String(raw).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
  }).format(d);
};

const normalize = (value) => String(value || "").toLowerCase();

const SearchOption = ({
  className = "d-none d-md-block",
  autoFocus = false,
  inputId = "search-options",
  onNavigate,
  placeholder = "Cari transaksi, kategori, atau rekening...",
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [liveItems, setLiveItems] = useState([]);
  const [loadedOnce, setLoadedOnce] = useState(false);

  const loadLiveSearchIndex = useCallback(async () => {
    try {
      const [txRes, incRes, accRes] = await Promise.all([
        transactionApi.list({ limit: 40 }).catch(() => []),
        incomeApi.list({ limit: 30 }).catch(() => []),
        accountApi.list().catch(() => []),
      ]);

      const txRows = Array.isArray(txRes?.transactions)
        ? txRes.transactions
        : Array.isArray(txRes)
          ? txRes
          : [];
      const incRows = Array.isArray(incRes?.incomes)
        ? incRes.incomes
        : Array.isArray(incRes)
          ? incRes
          : [];
      const accRows = Array.isArray(accRes?.accounts)
        ? accRes.accounts
        : Array.isArray(accRes)
          ? accRes
          : [];

      const accMap = {};
      accRows.forEach((a) => {
        const id = a.account_id || a.id;
        if (id) accMap[id] = a.account_name || a.name || "Rekening";
      });

      const txItems = txRows.map((t) => {
        const title = t.description || t.merchant_name || t.title || t.category_detail || "Transaksi";
        const cat = t.category_detail || t.category_group || t.category || "Pengeluaran";
        const accName = accMap[t.account_id || t.accountId] || "Rekening";
        const dateStr = t.transaction_date || t.transactionDate || t.date || "";
        return {
          id: `tx-${t.transaction_id || t.id || Math.random()}`,
          type: "Pengeluaran",
          title,
          description: `${cat} • ${accName} • ${rupiah(t.amount)}`,
          meta: formatDate(dateStr) || "Mutasi",
          icon: "ri-arrow-up-circle-line",
          color: "danger",
          link: "/financial-history",
          keywords: `${title} ${cat} ${accName} pengeluaran transaksi`,
        };
      });

      const incItems = incRows.map((inc) => {
        const title = inc.source_name || inc.source || inc.description || "Pemasukan";
        const accName = accMap[inc.account_id || inc.accountId] || "Rekening";
        const dateStr = inc.income_date || inc.incomeDate || inc.date || "";
        return {
          id: `inc-${inc.income_id || inc.id || Math.random()}`,
          type: "Pemasukan",
          title,
          description: `${accName} • ${rupiah(inc.amount)}`,
          meta: formatDate(dateStr) || "Pemasukan",
          icon: "ri-arrow-down-circle-line",
          color: "success",
          link: "/financial-history",
          keywords: `${title} ${accName} pemasukan income`,
        };
      });

      const accItems = accRows.map((a) => {
        const name = a.account_name || a.name || "Rekening";
        const type = a.account_type || a.type || "Bank";
        return {
          id: `acc-${a.account_id || a.id || name}`,
          type: "Rekening",
          title: name,
          description: `${type} • Saldo ${rupiah(a.balance)}`,
          meta: "Akun",
          icon: "ri-wallet-3-line",
          color: "primary",
          link: "/profile-account",
          keywords: `${name} ${type} rekening dompet saldo akun`,
        };
      });

      setLiveItems([...accItems, ...txItems, ...incItems]);
      setLoadedOnce(true);
    } catch (_) {
      setLoadedOnce(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !loadedOnce) {
      loadLiveSearchIndex();
    }
  }, [isOpen, loadedOnce, loadLiveSearchIndex]);

  const searchItems = useMemo(() => {
    return [
      ...quickActions.map((item, idx) => ({
        ...item,
        id: `qa-${idx}`,
        type: "Fitur",
        meta: "Akses cepat",
      })),
      ...liveItems,
    ];
  }, [liveItems]);

  const trimmedQuery = query.trim();

  const results = useMemo(() => {
    if (!trimmedQuery) {
      return [
        ...quickActions.slice(0, 5).map((item, idx) => ({
          ...item,
          id: `qa-top-${idx}`,
          type: "Fitur",
          meta: "Akses cepat",
        })),
        ...liveItems.slice(0, 3),
      ];
    }

    const terms = normalize(trimmedQuery).split(/\s+/).filter(Boolean);

    return searchItems
      .map((item) => {
        const haystack = normalize(
          `${item.title} ${item.description} ${item.type} ${item.meta} ${item.keywords}`
        );
        const score = terms.reduce(
          (total, term) => total + (haystack.includes(term) ? 1 : 0),
          0
        );
        return { ...item, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [searchItems, liveItems, trimmedQuery]);

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
    <form
      className={`app-search sadar-app-search ${className}`}
      onSubmit={handleSubmit}
    >
      <div className="position-relative">
        <Input
          type="text"
          className="form-control"
          placeholder={placeholder}
          id={inputId}
          aria-label={placeholder}
          aria-expanded={isOpen}
          aria-controls={`${inputId}-dropdown`}
          autoFocus={autoFocus}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            loadLiveSearchIndex();
          }}
          onBlur={() => {
            window.setTimeout(() => setIsOpen(false), 160);
          }}
          autoComplete="off"
        />
        <span className="mdi mdi-magnify search-widget-icon"></span>
      </div>
      <div
        className={`dropdown-menu dropdown-menu-lg sadar-search-menu ${
          isOpen ? "show" : ""
        }`}
        id={`${inputId}-dropdown`}
      >
        <div className="p-3">
          <h6 className="text-muted text-uppercase fs-12 mb-3">
            {trimmedQuery ? "Hasil Pencarian Real-Time" : "Akses Cepat & Data Terbaru"}
          </h6>
          {results.length > 0 ? (
            results.map((item) => (
              <button
                type="button"
                className="dropdown-item rounded-2 sadar-search-result"
                key={item.id || `${item.type}-${item.title}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => goToResult(item.link)}
              >
                <span
                  className={`sadar-search-icon bg-${item.color}-subtle text-${item.color}`}
                >
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
            <div className="text-muted fs-13 px-2 py-3">
              Tidak ada hasil untuk "{trimmedQuery}".
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default SearchOption;
