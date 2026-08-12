import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Receipt, Search, Loader2 } from "lucide-react";
import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Table,
} from "reactstrap";
import { api } from "../../config";
import { accountApi, incomeApi, ocrApi, transactionApi } from "../../Components/services/api";

import "../SadarShared/sadar-pages.css";

const TRANSACTION_PAGE_SIZE = 10;
const RECEIPT_STORAGE_KEY = "sadar-financial-history-receipts";
const DEFAULT_EDIT_FORM = {
  name: "",
  accountId: "",
  category: "Lainnya",
  date: "",
  amount: "",
  receiptFile: null,
  receiptPreview: "",
  receiptName: "",
};

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const normalizeAccount = (account) => ({
  id: account.account_id || account.id,
  name: account.account_name || account.accountName || account.name || "Akun",
});

const normalizeIncome = (income) => ({
  id: income.income_id || income.id,
  account_id: income.account_id || income.accountId,
  source: income.source || "Pemasukan",
  amount: Number(income.amount || 0),
  date: String(income.income_date || income.incomeDate || income.date || "").slice(0, 10),
  receiptUrl: getReceiptUrl(income),
});

const isBudgetBucketCategory = (category) =>
  ["needs", "wants", "savings", "investment"].includes(String(category || "").toLowerCase());

const normalizeCategoryToHistory = (category) => {
  const text = String(category || "").toLowerCase();
  if (/makan|food|dining|beverage|restaurant|warung|cafe|kopi|gacoan|starbucks/.test(text)) return "Makanan";
  if (/transport|ojol|grab|gojek|bensin|fuel|taxi/.test(text)) return "Transportasi";
  if (/belanja|shop|shopping|groceries|minimarket|supermarket|retail|marketplace|mall|uniqlo/.test(text)) return "Belanja";
  if (/hiburan|entertainment|movie|bioskop|netflix|spotify|game|recreation/.test(text)) return "Hiburan";
  return "Lainnya";
};

const inferCategoryFromTransaction = (transaction) =>
  normalizeCategoryToHistory(
    [
      transaction.description || transaction.merchant || "",
      transaction.category,
      transaction.category_name,
      transaction.categoryName,
    ].filter(Boolean).join(" "),
  );

const getTransactionCategory = (transaction) => {
  const explicitCategory =
    transaction.category_detail ||
    transaction.categoryDetail ||
    transaction.category_name ||
    transaction.categoryName ||
    transaction.category_group ||
    transaction.categoryGroup ||
    transaction.category ||
    "";

  if (!explicitCategory || isBudgetBucketCategory(explicitCategory)) {
    return inferCategoryFromTransaction(transaction);
  }

  return explicitCategory;
};

const normalizeTransaction = (transaction) => ({
  id: transaction.transaction_id || transaction.id,
  account_id: transaction.account_id || transaction.accountId,
  name: transaction.description || transaction.merchant || "Pengeluaran",
  category: getTransactionCategory(transaction),
  amount: Number(transaction.amount || 0),
  date: String(transaction.transaction_date || transaction.transactionDate || transaction.date || "").slice(0, 10),
  status: "Tercatat",
  receiptUrl: getReceiptUrl(transaction),
});

const loadStoredReceipts = () => {
  try {
    return JSON.parse(localStorage.getItem(RECEIPT_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const saveStoredReceipts = (receipts) => {
  localStorage.setItem(RECEIPT_STORAGE_KEY, JSON.stringify(receipts));
};

const transactionKey = (transaction) => `${transaction.type}-${transaction.id}`;

const resolveReceiptImageUrl = (url) => {
  if (!url) return "";
  if (/^(https?:|data:)/i.test(url)) return url;

  let apiRoot = api.API_URL.replace(/\/api\/v\d+\/?$/i, "");
  if (!apiRoot || apiRoot.startsWith("/")) {
    apiRoot = "https://sadar-finance.up.railway.app";
  }
  return `${apiRoot}${url.startsWith("/") ? "" : "/"}${url}`;
};

const getReceiptUrl = (row) =>
  resolveReceiptImageUrl(row.receipt_url || row.receiptUrl || row.image_url || row.imageUrl || "");

const getParsedData = (row) => {
  const parsed = row?.parsed_data || row?.parsedData || {};
  if (typeof parsed !== "string") return parsed;

  try {
    return JSON.parse(parsed);
  } catch {
    return {};
  }
};

const normalizeOcrReceipt = (scan) => ({
  name: getParsedData(scan).receiptName || scan.original_name || scan.originalName || "Struk OCR",
  dataUrl: getParsedData(scan).receiptDataUrl || getReceiptUrl(scan),
  updatedAt: scan.updated_at || scan.updatedAt || scan.created_at || scan.createdAt || "",
});

const readFileAsReceipt = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: reader.result,
        updatedAt: new Date().toISOString(),
      });
    reader.onerror = () => reject(new Error("Struk belum bisa dibaca."));
    reader.readAsDataURL(file);
  });

const SadarLoadingScreen = () => {
  return (
    <div className="page-content sadar-page sadar-loading-screen d-flex align-items-center justify-content-center">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status" style={{ width: "2.5rem", height: "2.5rem" }}>
          <span className="visually-hidden">Memuat...</span>
        </div>
        <p className="mt-3 text-muted fw-semibold">Memuat riwayat keuangan...</p>
      </div>
    </div>
  );
};

const SadarFinancialHistory = () => {
  const [accounts, setAccounts] = useState([]);
  const [incomesRows, setIncomesRows] = useState([]);
  const [transactionRows, setTransactionRows] = useState([]);
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [historyFilter, setHistoryFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const [receiptMap, setReceiptMap] = useState(() => loadStoredReceipts());
  const [ocrReceiptMap, setOcrReceiptMap] = useState({});
  const [openActionKey, setOpenActionKey] = useState("");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [receiptModal, setReceiptModal] = useState({ isOpen: false, transaction: null });
  const [editModal, setEditModal] = useState({ isOpen: false, transaction: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, transaction: null });
  const [editForm, setEditForm] = useState(DEFAULT_EDIT_FORM);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [isReceiptLoading, setIsReceiptLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState("");

  useEffect(() => {
    document.title = "Riwayat Keuangan | SADAR Finance";
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadFinancialHistory = async () => {
      try {
        const [accountRows, incomeRows, expenseRows] = await Promise.all([
          accountApi.list(),
          incomeApi.list({ limit: 100 }),
          transactionApi.list({ limit: 100 }),
        ]);

        if (isMounted) {
          setAccounts((accountRows || []).map(normalizeAccount));
          setIncomesRows((incomeRows || []).map(normalizeIncome));
          setTransactionRows((expenseRows || []).map(normalizeTransaction));
          setNotice("");
        }
      } catch (error) {
        if (isMounted) {
          setAccounts([]);
          setIncomesRows([]);
          setTransactionRows([]);
          setNotice(error?.message || "Riwayat keuangan belum bisa dimuat.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadFinancialHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  const resolveAccountName = useCallback((accountId) => accounts.find((account) => account.id === accountId)?.name || "-", [accounts]);

  const userTransactions = useMemo(() => {
    const expenseRows = transactionRows.map((transaction) => ({
      id: transaction.id,
      type: "expense",
      name: transaction.name,
      category: transaction.category,
      account_id: transaction.account_id,
      date: transaction.date,
      amount: transaction.amount,
      status: transaction.status,
      receiptUrl: transaction.receiptUrl,
    }));

    const incomeRows = incomesRows.map((income) => ({
      id: income.id,
      type: "income",
      name: income.source,
      category: "Pemasukan",
      account_id: income.account_id,
      date: income.date,
      amount: income.amount,
      status: "Masuk",
      receiptUrl: income.receiptUrl,
    }));

    return [...expenseRows, ...incomeRows].map((transaction) => ({
      ...transaction,
      receipt: receiptMap[transactionKey(transaction)] || ocrReceiptMap[transactionKey(transaction)] || null,
    })).sort(
      (a, b) => new Date(`${b.date}T00:00:00`) - new Date(`${a.date}T00:00:00`),
    );
  }, [incomesRows, ocrReceiptMap, receiptMap, transactionRows]);

  const filteredTransactions = useMemo(() => {
    let result = userTransactions;

    // Filter by transaction type
    if (historyFilter === "income") {
      result = result.filter((t) => t.type === "income");
    } else if (historyFilter === "expense") {
      result = result.filter((t) => t.type === "expense");
    }

    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return result;

    return result.filter((transaction) => {
      const isIncome = transaction.type === "income";
      const searchable = [
        transaction.name,
        transaction.category,
        resolveAccountName(transaction.account_id),
        transaction.status,
        isIncome ? "pemasukan masuk" : "pengeluaran tercatat",
        rupiah(transaction.amount),
        String(transaction.amount),
        transaction.date,
        new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(`${transaction.date}T00:00:00`)),
      ].join(" ").toLowerCase();

      return searchable.includes(keyword);
    });
  }, [historyFilter, searchTerm, userTransactions, resolveAccountName]);



  const totalTransactionPages = Math.max(1, Math.ceil(filteredTransactions.length / TRANSACTION_PAGE_SIZE));
  const activePage = Math.min(currentTransactionPage, totalTransactionPages);
  const transactionPageStart = (activePage - 1) * TRANSACTION_PAGE_SIZE;
  const paginatedTransactions = filteredTransactions.slice(
    transactionPageStart,
    transactionPageStart + TRANSACTION_PAGE_SIZE,
  );
  const transactionPageNumbers = Array.from({ length: totalTransactionPages }, (_, index) => index + 1);
  const transactionStartNumber = filteredTransactions.length ? transactionPageStart + 1 : 0;
  const transactionEndNumber = Math.min(transactionPageStart + paginatedTransactions.length, filteredTransactions.length);
  const transactionEmptyRows = Math.max(0, TRANSACTION_PAGE_SIZE - paginatedTransactions.length);

  const goToTransactionPage = (page) => {
    setCurrentTransactionPage(Math.min(Math.max(page, 1), totalTransactionPages));
  };

  const persistReceiptMap = (nextReceipts) => {
    setReceiptMap(nextReceipts);
    saveStoredReceipts(nextReceipts);
  };

  const openReceiptViewer = async (transaction) => {
    setOpenActionKey("");
    setReceiptModal({ isOpen: true, transaction });

    if (transaction.type !== "expense" || transaction.receipt || transaction.receiptUrl || ocrReceiptMap[transactionKey(transaction)]) {
      return;
    }

    setIsReceiptLoading(true);

    try {
      const scans = await ocrApi.list({ limit: 100 });
      const receiptPairs = (scans || [])
        .filter((scan) => scan.transaction_id || scan.transactionId)
        .map((scan) => [
          `expense-${scan.transaction_id || scan.transactionId}`,
          normalizeOcrReceipt(scan),
        ])
        .filter(([, receipt]) => receipt.dataUrl);
      const nextOcrReceipts = {
        ...ocrReceiptMap,
        ...Object.fromEntries(receiptPairs),
      };
      setOcrReceiptMap(nextOcrReceipts);
      setReceiptModal((current) => ({
        ...current,
        transaction: current.transaction
          ? {
              ...current.transaction,
              receipt: nextOcrReceipts[transactionKey(current.transaction)] || current.transaction.receipt,
            }
          : current.transaction,
      }));
    } catch {
      setReceiptModal((current) => current);
    } finally {
      setIsReceiptLoading(false);
    }
  };

  const openEditTransaction = (transaction) => {
    setOpenActionKey("");
    setActionNotice("");
    setEditForm({
      name: transaction.name,
      accountId: transaction.account_id || "",
      category: transaction.category || "Lainnya",
      date: transaction.date,
      amount: String(transaction.amount || ""),
      receiptFile: null,
      receiptPreview: transaction.receipt?.dataUrl || transaction.receiptUrl || "",
      receiptName: transaction.receipt?.name || (transaction.receiptUrl ? "Struk tersimpan" : ""),
    });
    setEditModal({ isOpen: true, transaction });
  };

  const openDeleteTransaction = (transaction) => {
    setOpenActionKey("");
    setActionNotice("");
    setDeleteModal({ isOpen: true, transaction });
  };

  const closeEditModal = () => {
    setEditModal({ isOpen: false, transaction: null });
    setEditForm(DEFAULT_EDIT_FORM);
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, transaction: null });
  };

  const handleReceiptFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setEditForm((current) => ({ ...current, receiptFile: null }));
      return;
    }

    setEditForm((current) => ({
      ...current,
      receiptFile: file,
      receiptPreview: URL.createObjectURL(file),
      receiptName: file.name,
    }));
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!editModal.transaction) return;

    const amount = Number(editForm.amount);
    if (!editForm.name.trim() || !editForm.date || !Number.isFinite(amount) || amount <= 0) {
      setActionNotice("Lengkapi nama, tanggal, dan nominal dengan benar.");
      return;
    }

    setIsSubmittingAction(true);
    setActionNotice("");

    try {
      const basePayload = {
        accountId: editForm.accountId || null,
        amount,
      };

      if (editModal.transaction.type === "income") {
        await incomeApi.update(editModal.transaction.id, {
          ...basePayload,
          incomeDate: editForm.date,
          source: editForm.name.trim(),
        });
        setIncomesRows((rows) =>
          rows.map((income) =>
            income.id === editModal.transaction.id
              ? {
                  ...income,
                  account_id: editForm.accountId || null,
                  source: editForm.name.trim(),
                  amount,
                  date: editForm.date,
                }
              : income,
          ),
        );
      } else {
        await transactionApi.update(editModal.transaction.id, {
          ...basePayload,
          categoryGroup: editForm.category,
          transactionDate: editForm.date,
          description: editForm.name.trim(),
          source: "manual",
        });
        setTransactionRows((rows) =>
          rows.map((transaction) =>
            transaction.id === editModal.transaction.id
              ? {
                  ...transaction,
                  account_id: editForm.accountId || null,
                  name: editForm.name.trim(),
                  category: editForm.category,
                  amount,
                  date: editForm.date,
                }
              : transaction,
          ),
        );
      }

      if (editForm.receiptFile) {
        const receipt = await readFileAsReceipt(editForm.receiptFile);
        persistReceiptMap({
          ...receiptMap,
          [transactionKey(editModal.transaction)]: receipt,
        });
      }

      closeEditModal();
      setNotice("");
    } catch (error) {
      setActionNotice(error?.message || "Transaksi belum bisa diperbarui.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deleteModal.transaction) return;

    setIsSubmittingAction(true);
    setActionNotice("");

    try {
      if (deleteModal.transaction.type === "income") {
        await incomeApi.remove(deleteModal.transaction.id);
        setIncomesRows((rows) => rows.filter((income) => income.id !== deleteModal.transaction.id));
      } else {
        await transactionApi.remove(deleteModal.transaction.id);
        setTransactionRows((rows) => rows.filter((transaction) => transaction.id !== deleteModal.transaction.id));
      }

      const nextReceipts = { ...receiptMap };
      delete nextReceipts[transactionKey(deleteModal.transaction)];
      persistReceiptMap(nextReceipts);
      closeDeleteModal();
      setNotice("");
    } catch (error) {
      setActionNotice(error?.message || "Transaksi belum bisa dihapus.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  if (isLoading) {
    return <SadarLoadingScreen />;
  }

  return (
    <div className="page-content sadar-page sadar-history-page">
      <Container fluid>
        <Row className="g-3">
          <Col xl={12}>
            <Card className="sadar-panel">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Riwayat Keuangan</h4>
                  <p className="text-muted mb-0">Gabungan pemasukan dan pengeluaran pribadi kamu.</p>
                </div>
                {userTransactions.length > 0 && (
                  <div className="sadar-table-search">
                    <i className="ri-search-line"></i>
                    <Input
                      type="search"
                      value={searchTerm}
                      onChange={(event) => {
                        setSearchTerm(event.target.value);
                        setCurrentTransactionPage(1);
                      }}
                      placeholder="Cari catatan, kategori, akun..."
                      aria-label="Cari riwayat keuangan"
                    />
                  </div>
                )}
              </CardHeader>
              <CardBody className={userTransactions.length ? "pt-0" : ""}>
                {notice && <div className="sadar-empty-state mb-3">{notice}</div>}
                {!notice && userTransactions.length === 0 ? (
                  <div className="sadar-empty-state sadar-empty-state-center">
                    <span className="sadar-empty-state-icon"><Receipt className="h-5 w-5" /></span>
                    <h4>Belum ada transaksi.</h4>
                    <p>Catat transaksi pertama agar riwayat keuangan mulai tersusun.</p>
                    <Button color="primary" tag={Link} to="/catat-keuangan">Catat Transaksi Pertama</Button>
                  </div>
                ) : (
                  <>
                    <div className="sadar-table-pagination">
                      <div className="d-flex align-items-center gap-3">
                        <span>
                          {searchTerm.trim()
                            ? `Ditemukan ${filteredTransactions.length} dari ${userTransactions.length} catatan`
                            : `Menampilkan ${transactionStartNumber}-${transactionEndNumber} dari ${filteredTransactions.length} catatan`}
                        </span>

                        <Dropdown
                          isOpen={isFilterDropdownOpen}
                          toggle={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                        >
                          <DropdownToggle
                            color="light"
                            className="sadar-table-filter-btn d-flex align-items-center gap-2"
                          >
                            <i className="ri-filter-3-line text-primary fs-13"></i>
                            <span>Tipe: <strong>{historyFilter === "all" ? "Semua" : historyFilter === "income" ? "Pemasukan" : "Pengeluaran"}</strong></span>
                            <i className="ri-arrow-down-s-line fs-12 text-muted"></i>
                          </DropdownToggle>
                          <DropdownMenu end className="sadar-row-action-menu">
                            <DropdownItem
                              active={historyFilter === "all"}
                              onClick={() => {
                                setHistoryFilter("all");
                                setCurrentTransactionPage(1);
                              }}
                              className="d-flex align-items-center justify-content-between py-2 fs-12"
                            >
                              <span>Semua Catatan</span>
                              {historyFilter === "all" && <i className="ri-check-line text-primary"></i>}
                            </DropdownItem>
                            <DropdownItem
                              active={historyFilter === "income"}
                              onClick={() => {
                                setHistoryFilter("income");
                                setCurrentTransactionPage(1);
                              }}
                              className="d-flex align-items-center justify-content-between py-2 fs-12"
                            >
                              <span>Pemasukan</span>
                              {historyFilter === "income" && <i className="ri-check-line text-primary"></i>}
                            </DropdownItem>
                            <DropdownItem
                              active={historyFilter === "expense"}
                              onClick={() => {
                                setHistoryFilter("expense");
                                setCurrentTransactionPage(1);
                              }}
                              className="d-flex align-items-center justify-content-between py-2 fs-12"
                            >
                              <span>Pengeluaran</span>
                              {historyFilter === "expense" && <i className="ri-check-line text-primary"></i>}
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                      {filteredTransactions.length > 0 && (
                        <ul className="pagination pagination-separated pagination-sm mb-0">
                          <li className={`page-item sadar-page-nav ${currentTransactionPage === 1 ? "disabled" : ""}`}>
                            <button
                              type="button"
                              className="page-link"
                              onClick={() => goToTransactionPage(currentTransactionPage - 1)}
                              disabled={currentTransactionPage === 1}
                              aria-label="Halaman sebelumnya"
                            >
                              <i className="mdi mdi-chevron-left"></i>
                            </button>
                          </li>
                          <li className="sadar-pagination-status" aria-live="polite">
                            Halaman {activePage} dari {totalTransactionPages}
                          </li>
                          {transactionPageNumbers.map((page) => (
                            <li className={`page-item ${page === currentTransactionPage ? "active" : ""}`} key={page}>
                              <button
                                type="button"
                                className="page-link"
                                onClick={() => goToTransactionPage(page)}
                                aria-current={page === currentTransactionPage ? "page" : undefined}
                              >
                                {page}
                              </button>
                            </li>
                          ))}
                          <li className={`page-item sadar-page-nav ${currentTransactionPage === totalTransactionPages ? "disabled" : ""}`}>
                            <button
                              type="button"
                              className="page-link"
                              onClick={() => goToTransactionPage(currentTransactionPage + 1)}
                              disabled={currentTransactionPage === totalTransactionPages}
                              aria-label="Halaman berikutnya"
                            >
                              <i className="mdi mdi-chevron-right"></i>
                            </button>
                          </li>
                        </ul>
                      )}
                    </div>
                    {filteredTransactions.length === 0 ? (
                      <div className="sadar-empty-state sadar-empty-state-center">
                        <span className="sadar-empty-state-icon"><Search className="h-5 w-5" /></span>
                        <h4>Tidak ada hasil.</h4>
                        <p>Coba kata kunci lain untuk mencari riwayat keuanganmu.</p>
                      </div>
                    ) : (
                      <div className="table-responsive sadar-table-wrap">
                        <Table className="sadar-table align-middle mb-0">
                          <thead>
                            <tr>
                              <th>Nama Catatan</th>
                              <th>Kategori</th>
                              <th>Akun</th>
                              <th>Tanggal</th>
                              <th className="text-end">Nominal</th>
                              <th>Status</th>
                              <th className="text-end">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedTransactions.map((transaction) => {
                              const isIncome = transaction.type === "income";
                              const rowKey = transactionKey(transaction);
                              return (
                                <tr key={rowKey}>
                                  <td data-label="Catatan"><div className="fw-semibold text-dark">{transaction.name}</div></td>
                                  <td data-label="Kategori">{transaction.category}</td>
                                  <td data-label="Akun">{resolveAccountName(transaction.account_id)}</td>
                                  <td data-label="Tanggal">{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(`${transaction.date}T00:00:00`))}</td>
                                  <td data-label="Nominal" className={`text-end fw-semibold ${isIncome ? "text-success" : "text-danger"}`}>
                                    {isIncome ? "+" : "-"}{rupiah(transaction.amount)}
                                  </td>
                                  <td data-label="Status">
                                    <Badge color={isIncome ? "success" : "secondary"} className={`bg-${isIncome ? "success" : "secondary"}-subtle text-${isIncome ? "success" : "secondary"}`}>
                                      {transaction.status}
                                    </Badge>
                                  </td>
                                  <td data-label="Aksi" className="text-end">
                                    <Dropdown
                                      isOpen={openActionKey === rowKey}
                                      toggle={() => setOpenActionKey(openActionKey === rowKey ? "" : rowKey)}
                                    >
                                      <DropdownToggle
                                        className="sadar-row-action-toggle"
                                        color="light"
                                        size="sm"
                                        aria-label={`Aksi untuk ${transaction.name}`}
                                      >
                                        <i className="ri-more-fill"></i>
                                      </DropdownToggle>
                                      <DropdownMenu end className="sadar-row-action-menu">
                                        {!isIncome && (
                                          <DropdownItem onClick={() => openReceiptViewer(transaction)}>
                                            <i className="ri-image-line"></i>
                                            Lihat Struk
                                          </DropdownItem>
                                        )}
                                        <DropdownItem onClick={() => openEditTransaction(transaction)}>
                                          <i className="ri-pencil-line"></i>
                                          Edit
                                        </DropdownItem>
                                        <DropdownItem className="text-danger" onClick={() => openDeleteTransaction(transaction)}>
                                          <i className="ri-delete-bin-line"></i>
                                          Hapus
                                        </DropdownItem>
                                      </DropdownMenu>
                                    </Dropdown>
                                  </td>
                                </tr>
                              );
                            })}
                            {Array.from({ length: transactionEmptyRows }, (_, index) => (
                              <tr className="sadar-table-empty-row" key={`empty-${index}`}>
                                <td colSpan={7} aria-hidden="true">&nbsp;</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal
        isOpen={receiptModal.isOpen}
        toggle={() => setReceiptModal({ isOpen: false, transaction: null })}
        centered
        className="sadar-confirm-modal sadar-history-modal"
      >
        <ModalHeader toggle={() => setReceiptModal({ isOpen: false, transaction: null })}>
          Struk Pembelian
        </ModalHeader>
        <ModalBody>
          {isReceiptLoading ? (
            <div className="sadar-empty-state sadar-empty-state-center sadar-receipt-empty">
              <span className="sadar-empty-state-icon"><Loader2 className="h-5 w-5 animate-spin" /></span>
              <h4>Mencari struk...</h4>
              <p>Sedang mengecek lampiran struk yang pernah diunggah.</p>
            </div>
          ) : receiptModal.transaction?.receipt?.dataUrl || receiptModal.transaction?.receiptUrl ? (
            <div className="sadar-receipt-viewer">
              <img
                src={receiptModal.transaction?.receipt?.dataUrl || receiptModal.transaction?.receiptUrl}
                alt={`Struk ${receiptModal.transaction?.name || "transaksi"}`}
              />
              <div>
                <strong>{receiptModal.transaction?.receipt?.name || "Struk transaksi"}</strong>
                <span>{receiptModal.transaction?.name}</span>
                <span className="mt-2 d-block text-muted text-break" style={{ fontSize: '10px' }}>
                  DEBUG URL: {receiptModal.transaction?.receipt?.dataUrl || receiptModal.transaction?.receiptUrl}
                </span>
              </div>
            </div>
          ) : (
            <div className="sadar-empty-state sadar-empty-state-center sadar-receipt-empty">
              <span className="sadar-empty-state-icon"><Receipt className="h-5 w-5" /></span>
              <h4>No receipt</h4>
              <p>Belum ada struk yang tersimpan untuk catatan ini.</p>
            </div>
          )}
        </ModalBody>
      </Modal>

      <Modal isOpen={editModal.isOpen} toggle={closeEditModal} centered size="lg" className="sadar-history-modal sadar-history-edit-modal">
        <ModalHeader toggle={closeEditModal}>
          Edit {editModal.transaction?.type === "income" ? "Pemasukan" : "Transaksi"}
        </ModalHeader>
        <Form onSubmit={handleEditSubmit}>
          <ModalBody>
            {actionNotice && <div className="sadar-empty-state mb-3">{actionNotice}</div>}
            <div className="sadar-history-edit-grid">
              <div>
                <Label htmlFor="history-name">
                  {editModal.transaction?.type === "income" ? "Sumber Pemasukan" : "Nama Pengeluaran"}
                </Label>
                <Input
                  id="history-name"
                  value={editForm.name}
                  onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder={editModal.transaction?.type === "income" ? "Contoh: Gaji bulanan" : "Contoh: Belanja harian"}
                  required
                />
              </div>
              <div>
                <Label htmlFor="history-account">Akun</Label>
                <Input
                  id="history-account"
                  type="select"
                  value={editForm.accountId}
                  onChange={(event) => setEditForm((current) => ({ ...current, accountId: event.target.value }))}
                >
                  <option value="">Tanpa akun</option>
                  {accounts.map((account) => (
                    <option value={account.id} key={account.id}>{account.name}</option>
                  ))}
                </Input>
              </div>
              {editModal.transaction?.type !== "income" && (
                <div>
                  <Label htmlFor="history-category">Kategori</Label>
                  <Input
                    id="history-category"
                    value={editForm.category}
                    onChange={(event) => setEditForm((current) => ({ ...current, category: event.target.value }))}
                    placeholder="Contoh: Makanan"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="history-date">Tanggal</Label>
                <Input
                  id="history-date"
                  type="date"
                  value={editForm.date}
                  onChange={(event) => setEditForm((current) => ({ ...current, date: event.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="history-amount">Nominal</Label>
                <Input
                  id="history-amount"
                  type="number"
                  min="1"
                  value={editForm.amount}
                  onChange={(event) => setEditForm((current) => ({ ...current, amount: event.target.value }))}
                  placeholder="Contoh: 93000"
                  required
                />
              </div>
              {editModal.transaction?.type !== "income" && (
                <div>
                  <Label htmlFor="history-receipt">Upload Struk</Label>
                  <Input
                    id="history-receipt"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/heic"
                    onChange={handleReceiptFileChange}
                  />
                  <small className="text-muted d-block mt-2">Upload manual saja. OCR dan NLP tidak aktif di edit ini.</small>
                </div>
              )}
            </div>
            {editModal.transaction?.type !== "income" && editForm.receiptPreview && (
              <div className="sadar-receipt-preview mt-3">
                <img src={editForm.receiptPreview} alt="Preview struk" />
                <span>{editForm.receiptName || "Preview struk"}</span>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button type="button" color="light" onClick={closeEditModal} disabled={isSubmittingAction}>
              Batal
            </Button>
            <Button type="submit" color="primary" disabled={isSubmittingAction}>
              {isSubmittingAction ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      <Modal isOpen={deleteModal.isOpen} toggle={closeDeleteModal} centered className="sadar-confirm-modal">
        <ModalBody>
          <span className="sadar-confirm-icon danger"><i className="ri-delete-bin-line"></i></span>
          <h4>Hapus catatan ini?</h4>
          <p>
            {deleteModal.transaction?.name} akan dihapus dari riwayat keuangan. Aksi ini tidak bisa dibatalkan.
          </p>
          {actionNotice && <div className="sadar-empty-state mt-3">{actionNotice}</div>}
        </ModalBody>
        <ModalFooter>
          <Button type="button" color="light" onClick={closeDeleteModal} disabled={isSubmittingAction}>
            Batal
          </Button>
          <Button type="button" color="danger" onClick={handleDeleteTransaction} disabled={isSubmittingAction}>
            {isSubmittingAction ? "Menghapus..." : "Hapus"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default SadarFinancialHistory;
