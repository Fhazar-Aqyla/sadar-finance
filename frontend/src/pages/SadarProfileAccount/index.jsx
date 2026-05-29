import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  Progress,
  Row,
  Table,
} from "reactstrap";
import { accountApi, analyticsApi, authApi, incomeApi, transactionApi } from "../../Components/services/api";

import "../SadarShared/sadar-pages.css";

const TRANSACTION_PAGE_SIZE = 10;

const defaultProfile = {
  id: "",
  name: "SADAR",
  email: "",
  avatar: "",
};

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const sumBy = (rows, getValue) => rows.reduce((total, row) => total + getValue(row), 0);

const onlyDigits = (value) => String(value || "").replace(/\D/g, "");

const getBudgetProgressColor = (usage) => {
  if (usage >= 100) return "danger";
  if (usage >= 80) return "warning";
  return "success";
};

const formatNumberInput = (value) => {
  const digits = onlyDigits(value);
  return digits ? new Intl.NumberFormat("id-ID").format(Number(digits)) : "";
};

const getStoredUserProfile = () => {
  try {
    const authUser = JSON.parse(sessionStorage.getItem("authUser") || "null");
    const user = authUser?.user || authUser?.data?.user || {};
    const firstName = user.first_name || user.firstName || "";
    const lastName = user.last_name || user.lastName || "";
    const name = `${firstName} ${lastName}`.trim() || user.name || user.username || user.email || defaultProfile.name;

    return {
      id: user.users_id || user.id || defaultProfile.id,
      name,
      email: user.email || defaultProfile.email,
      avatar: user.profile_picture || user.profilePicture || "",
    };
  } catch (_error) {
    return defaultProfile;
  }
};

const normalizeProfile = (user) => {
  const firstName = user?.first_name || user?.firstName || "";
  const lastName = user?.last_name || user?.lastName || "";
  return {
    id: user?.users_id || user?.id || defaultProfile.id,
    name: `${firstName} ${lastName}`.trim() || user?.email || defaultProfile.name,
    email: user?.email || defaultProfile.email,
    avatar: user?.profile_picture || user?.profilePicture || "",
  };
};

const normalizeAccount = (account) => ({
  id: account.account_id || account.id,
  name: account.account_name || account.accountName || account.name || "Akun",
  type: account.account_type || account.type || "Bank",
  balance: Number(account.balance || 0),
  accountNumber: account.account_number || account.accountNumber || "",
  isPersisted: Boolean(account.account_id || account.id),
});

const normalizeIncome = (income) => ({
  id: income.income_id || income.id,
  account_id: income.account_id || income.accountId,
  source: income.source || "Pemasukan",
  amount: Number(income.amount || 0),
  date: String(income.income_date || income.incomeDate || income.date || "").slice(0, 10),
});

const toBudgetGroup = (category) => {
  const text = String(category || "").toLowerCase();
  if (/tabungan|invest|saving|dana darurat/.test(text)) return "Savings";
  if (/makan|food|transport|tagihan|utilit|kesehatan|pendidikan|groceries|utilities|health|education/.test(text)) return "Needs";
  return "Wants";
};

const normalizeTransaction = (transaction) => ({
  id: transaction.transaction_id || transaction.id,
  account_id: transaction.account_id || transaction.accountId,
  name: transaction.description || transaction.merchant || "Pengeluaran",
  category: transaction.category_group || transaction.categoryGroup || "Lainnya",
  amount: Number(transaction.amount || 0),
  date: String(transaction.transaction_date || transaction.transactionDate || transaction.date || "").slice(0, 10),
  status: "Tercatat",
});

const buildBudgetRows = (budget) => {
  if (!budget) return [];

  return [
    {
      id: `${budget.budget_id || "budget"}_needs`,
      category: "Needs",
      label: "Kebutuhan",
      limit: Number(budget.needs_amount || budget.needsAmount || 0),
      used: Number(budget.needs_used || budget.needsUsed || 0),
    },
    {
      id: `${budget.budget_id || "budget"}_wants`,
      category: "Wants",
      label: "Keinginan",
      limit: Number(budget.wants_amount || budget.wantsAmount || 0),
      used: Number(budget.wants_used || budget.wantsUsed || 0),
    },
    {
      id: `${budget.budget_id || "budget"}_savings`,
      category: "Savings",
      label: "Tabungan",
      limit: Number(budget.savings_amount || budget.savingsAmount || 0),
      used: Number(budget.savings_used || budget.savingsUsed || 0),
    },
  ];
};

const EmptyProfileAccount = () => {
  useEffect(() => {
    document.title = "Profil & Akun | SADAR Finance";
  }, []);
  const profile = getStoredUserProfile();
  const accountTypes = [
    { value: "Cash", label: "Tunai" },
    { value: "Bank", label: "Bank" },
    { value: "E-wallet", label: "Dompet digital" },
  ];
  const budgetTargets = [
    { category: "Needs", label: "Kebutuhan", helper: "Kebutuhan utama", percent: 50 },
    { category: "Wants", label: "Keinginan", helper: "Keinginan dan hiburan", percent: 30 },
    { category: "Savings", label: "Tabungan", helper: "Tabungan dan dana darurat", percent: 20 },
  ];
  const [accounts, setAccounts] = useState([]);
  const [accountNotice, setAccountNotice] = useState("");
  const [pendingDeleteAccount, setPendingDeleteAccount] = useState(null);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isBudgetSaved, setIsBudgetSaved] = useState(false);
  const [budgetNotice, setBudgetNotice] = useState("");
  const [budgetRows, setBudgetRows] = useState(
    budgetTargets.map((item) => ({
      id: `budget_empty_${item.category}`,
      category: item.category,
      limit: 0,
      used: 0,
    })),
  );

  const addAccount = () => {
    setAccountNotice("");
    setAccounts((items) => [
      ...items,
      {
        id: `acc_new_${items.length + 1}`,
        name: "Akun Baru",
        type: "Cash",
        balance: 0,
      },
    ]);
  };

  const updateAccount = (id, field, value) => {
    setAccountNotice("");
    setAccounts((items) =>
      items.map((account) =>
        account.id === id
          ? { ...account, [field]: field === "balance" ? Number(value || 0) : value }
          : account,
      ),
    );
  };

  const persistAccount = async (account) => {
    try {
      await accountApi.update(account.id, {
        accountName: account.name,
        accountNumber: account.accountNumber || "",
        balance: Number(account.balance || 0),
      });
    } catch (error) {
      setAccountNotice(error?.message || "Perubahan akun gagal disimpan.");
    }
  };

  const deleteAccount = (id) => {
    if (accounts.length <= 1) {
      setAccountNotice("Minimal satu akun diperlukan untuk mencatat pemasukan dan transaksi.");
      return;
    }

    const selectedAccount = accounts.find((account) => account.id === id);
    setPendingDeleteAccount(selectedAccount || null);
  };

  const confirmDeleteAccount = () => {
    if (!pendingDeleteAccount) return;

    setAccounts((items) => items.filter((account) => account.id !== pendingDeleteAccount.id));
    setAccountNotice("");
    setPendingDeleteAccount(null);
  };

  const updateBudget = (category, value) => {
    setIsBudgetSaved(false);
    setBudgetNotice("");
    setBudgetRows((items) =>
      items.map((budget) =>
        budget.category === category ? { ...budget, limit: Number(value || 0) } : budget,
      ),
    );
  };

  const saveBudget = () => {
    const hasEmptyBudget = budgetRows.some((budget) => Number(budget.limit) <= 0);

    if (hasEmptyBudget) {
      setIsBudgetSaved(false);
      setBudgetNotice("Isi nominal anggaran untuk kebutuhan, keinginan, dan tabungan terlebih dahulu.");
      return;
    }

    setBudgetNotice("");
    setIsBudgetSaved(true);
  };

  return (
    <div className="page-content sadar-page">
      <Container fluid>
        <Row className="g-3">
          <Col xl={5}>
            <Card className="sadar-panel sadar-profile-panel h-100">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Data Profil</h4>
                  <p className="text-muted mb-0">Ringkasan identitas akun SADAR kamu</p>
                </div>
              </CardHeader>
              <CardBody className="sadar-profile-body">
                <div className="sadar-profile-photo-row">
                  <div className="sadar-profile-avatar">
                    {profile.avatar ? <img src={profile.avatar} alt="Foto profil" /> : profile.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="sadar-profile-photo-copy">
                    <Badge color="primary" className="bg-primary-subtle text-primary mb-2">Keuangan Pribadi</Badge>
                    <h5>{profile.name}</h5>
                    <p>{profile.email}</p>
                  </div>
                </div>
                <div className="sadar-profile-summary-grid">
                  <div className="sadar-profile-summary-item">
                    <span>Akun</span>
                    <strong>{accounts.length}</strong>
                  </div>
                  <div className="sadar-profile-summary-item">
                    <span>Total Saldo</span>
                    <strong>{rupiah(sumBy(accounts, (account) => account.balance))}</strong>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl={7}>
            <Card className="sadar-panel h-100" id="kelola-account">
              <CardHeader className="d-flex align-items-center justify-content-between">
                <div>
                  <h4 className="card-title mb-1">Kelola Akun</h4>
                  <p className="text-muted mb-0">Tunai, bank, dan dompet digital yang kamu pakai</p>
                </div>
                {accounts.length > 0 && (
                  <Button color="primary" size="sm" onClick={addAccount}>
                    <i className="ri-add-line align-bottom me-1"></i>
                    Tambah Akun
                  </Button>
                )}
              </CardHeader>
              <CardBody className="sadar-account-body">
                {accountNotice && <div className="alert alert-warning py-2 mb-3">{accountNotice}</div>}
                {accounts.length === 0 ? (
                  <div className="sadar-empty-state sadar-empty-state-center">
                    <span className="sadar-empty-state-icon"><i className="ri-wallet-3-line"></i></span>
                    <h4>Belum ada akun yang ditambahkan.</h4>
                    <p>Tambahkan sumber uang pertama agar pemasukan dan transaksi bisa tercatat dengan benar.</p>
                    <Button color="primary" onClick={addAccount}>Tambah Akun</Button>
                  </div>
                ) : (
                  <div className="sadar-insight-list sadar-account-list">
                    {accounts.map((account) => (
                      <div className="sadar-insight-item sadar-account-item" key={account.id}>
                        <span className="sadar-card-icon">
                          <i className={account.type === "Bank" ? "ri-bank-line" : account.type === "E-wallet" ? "ri-wallet-3-line" : "ri-cash-line"}></i>
                        </span>
                        <div className="sadar-account-fields">
                          <div className="sadar-form-grid sadar-account-form-grid">
                            <div>
                              <Label>Nama Akun</Label>
                              <Input value={account.name} onChange={(event) => updateAccount(account.id, "name", event.target.value)} />
                            </div>
                            <div>
                              <Label>Tipe</Label>
                              <Input type="select" value={account.type} onChange={(event) => updateAccount(account.id, "type", event.target.value)}>
                                {accountTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                              </Input>
                            </div>
                            <div>
                              <Label>Saldo Berjalan</Label>
                              <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9.]*"
                                value={formatNumberInput(account.balance)}
                                onChange={(event) => updateAccount(account.id, "balance", onlyDigits(event.target.value))}
                                placeholder="Contoh: 500.000"
                              />
                            </div>
                            <div className="d-flex align-items-end justify-content-end gap-2">
                              <Button color="light" className="text-danger" onClick={() => deleteAccount(account.id)}>
                                <i className="ri-delete-bin-line align-bottom me-1"></i>
                                Hapus
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row className="g-3 mt-1">
          <Col xl={12}>
            <Card className="sadar-panel" id="atur-budget">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Atur Anggaran</h4>
                  <p className="text-muted mb-0">Alokasi berdasarkan prinsip 50/30/20 dari pemasukan bulan ini.</p>
                </div>
              </CardHeader>
              <CardBody>
                {!isBudgetOpen ? (
                  <div className="sadar-empty-state sadar-empty-state-center">
                    <span className="sadar-empty-state-icon"><i className="ri-pie-chart-2-line"></i></span>
                    <h4>Anggaran belum diatur.</h4>
                    <p>Prinsip 50/30/20 membantu membagi pemasukan menjadi 50% kebutuhan, 30% keinginan, dan 20% tabungan.</p>
                    <Button color="primary" onClick={() => setIsBudgetOpen(true)}>Atur Anggaran 50/30/20</Button>
                  </div>
                ) : (
                  <>
                    <div className="sadar-budget-helper mb-3">
                      <strong>Atur alokasi awal</strong>
                      <span>Gunakan prinsip 50/30/20 sebagai patokan, lalu isi nominal anggaran sesuai rencana bulan ini.</span>
                    </div>
                    {budgetNotice && <div className="alert alert-warning py-2 mb-3">{budgetNotice}</div>}
                    <div className="sadar-budget-grid">
                      {budgetRows.map((budget) => {
                        const target = budgetTargets.find((item) => item.category === budget.category);
                        return (
                          <div className="sadar-insight-item d-block" key={budget.id}>
                            <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                              <div>
                                <strong>{target?.label}</strong>
                                <p>{target?.helper}</p>
                              </div>
                              <span className="sadar-score-status">{target?.percent}%</span>
                            </div>
                            <Label>Batas Anggaran</Label>
                            <Input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9.]*"
                              value={formatNumberInput(budget.limit)}
                              onChange={(event) => updateBudget(budget.category, onlyDigits(event.target.value))}
                              placeholder="Contoh: 2.500.000"
                            />
                            <p className="text-muted mt-2 mb-0">Isi nominal anggaran sesuai rencana bulananmu.</p>
                          </div>
                        );
                      })}
                    </div>
                    <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
                      <Button color="primary" onClick={saveBudget}>Simpan Anggaran</Button>
                      {isBudgetSaved && <span className="text-success fw-semibold">Anggaran berhasil disimpan.</span>}
                    </div>
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row className="g-3 mt-1">
          <Col xl={12}>
            <Card className="sadar-panel" id="riwayat-transaksi">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Riwayat Keuangan</h4>
                  <p className="text-muted mb-0">Gabungan pemasukan dan pengeluaran pribadi kamu.</p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="sadar-empty-state sadar-empty-state-center">
                  <span className="sadar-empty-state-icon"><i className="ri-receipt-line"></i></span>
                  <h4>Belum ada transaksi.</h4>
                  <p>Catat transaksi pertama agar riwayat keuangan mulai tersusun.</p>
                  <Button color="primary" tag={Link} to="/catat-keuangan">Catat Transaksi Pertama</Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal
        isOpen={Boolean(pendingDeleteAccount)}
        toggle={() => setPendingDeleteAccount(null)}
        centered
        className="sadar-confirm-modal"
      >
        <ModalBody>
          <div className="sadar-confirm-icon danger">
            <i className="ri-delete-bin-line"></i>
          </div>
          <h4>Hapus akun ini?</h4>
          <p>
            Akun <strong>{pendingDeleteAccount?.name || "ini"}</strong> akan dihapus dari daftar pengaturan awal kamu.
            Tindakan ini tidak bisa dibatalkan.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setPendingDeleteAccount(null)}>
            Batal
          </Button>
          <Button color="danger" onClick={confirmDeleteAccount}>
            Hapus Akun
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

const ProfileAccountWithData = () => {
  useEffect(() => {
    document.title = "Profil & Akun | SADAR Finance";
  }, []);

  const [accounts, setAccounts] = useState([]);
  const [accountNotice, setAccountNotice] = useState("");
  const [pendingDeleteAccount, setPendingDeleteAccount] = useState(null);
  const [budgetRows, setBudgetRows] = useState([]);
  const [budgetNotice, setBudgetNotice] = useState("");
  const [isBudgetSaved, setIsBudgetSaved] = useState(false);
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1);

  const [profile, setProfile] = useState(getStoredUserProfile);
  const [incomesRows, setIncomesRows] = useState([]);
  const [transactionRows, setTransactionRows] = useState([]);
  const totalBalance = useMemo(() => sumBy(accounts, (account) => account.balance), [accounts]);
  const totalIncome = useMemo(() => sumBy(incomesRows, (item) => item.amount), [incomesRows]);
  const resolveAccountName = (accountId) => accounts.find((account) => account.id === accountId)?.name || "-";

  const budgetTargets = [
    { category: "Needs", label: "Kebutuhan", helper: "Kebutuhan utama", percent: 50 },
    { category: "Wants", label: "Keinginan", helper: "Keinginan dan hiburan", percent: 30 },
    { category: "Savings", label: "Tabungan", helper: "Tabungan dan dana darurat", percent: 20 },
  ];

  const accountTypes = [
    { value: "Cash", label: "Tunai" },
    { value: "Bank", label: "Bank" },
    { value: "E-wallet", label: "Dompet digital" },
  ];

  useEffect(() => {
    let isMounted = true;

    const loadProfileAccount = async () => {
      try {
        const [profileResponse, accountRows, incomeRows, expenseRows, budgetResponse] = await Promise.all([
          authApi.me(),
          accountApi.list(),
          incomeApi.list({ limit: 100 }),
          transactionApi.list({ limit: 100 }),
          analyticsApi.latestBudget().catch(() => null),
        ]);

        if (!isMounted) return;

        const normalizedAccounts = (accountRows || []).map(normalizeAccount);
        const normalizedIncomes = (incomeRows || []).map(normalizeIncome);
        const normalizedTransactions = (expenseRows || []).map(normalizeTransaction);

        // Calculate client-side fallback used amounts for current month
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const currentMonthTransactions = normalizedTransactions.filter((t) => {
          const d = new Date(`${t.date}T00:00:00`);
          return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        });

        let needsUsed = 0;
        let wantsUsed = 0;
        let savingsUsed = 0;

        currentMonthTransactions.forEach((t) => {
          const group = toBudgetGroup(t.category);
          if (group === "Needs") needsUsed += t.amount;
          else if (group === "Savings") savingsUsed += t.amount;
          else wantsUsed += t.amount;
        });

        const apiBudgetRows = buildBudgetRows(budgetResponse);
        const mappedBudgetRows = apiBudgetRows.map((row) => {
          let localUsed = row.used || 0;
          if (localUsed === 0) {
            if (row.category === "Needs") localUsed = needsUsed;
            if (row.category === "Wants") localUsed = wantsUsed;
            if (row.category === "Savings") localUsed = savingsUsed;
          }
          return { ...row, used: localUsed };
        });

        setProfile(normalizeProfile(profileResponse));
        setAccounts(normalizedAccounts);
        setIncomesRows(normalizedIncomes);
        setTransactionRows(normalizedTransactions);
        setBudgetRows(mappedBudgetRows.length ? mappedBudgetRows : budgetTargets.map((item) => {
          let localUsed = 0;
          if (item.category === "Needs") localUsed = needsUsed;
          if (item.category === "Wants") localUsed = wantsUsed;
          if (item.category === "Savings") localUsed = savingsUsed;
          return {
            id: `budget_${item.category}`,
            category: item.category,
            label: item.label,
            limit: 0,
            used: localUsed,
          };
        }));
      } catch (_error) {
        if (!isMounted) return;
        setAccounts([]);
        setIncomesRows([]);
        setTransactionRows([]);
        setBudgetRows([]);
        setAccountNotice("Data dari backend belum bisa dimuat.");
      }
    };

    loadProfileAccount();

    return () => {
      isMounted = false;
    };
  }, []);

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
    }));

    return [...expenseRows, ...incomeRows].sort(
      (a, b) => new Date(`${b.date}T00:00:00`) - new Date(`${a.date}T00:00:00`),
    );
  }, [incomesRows, transactionRows]);

  const totalTransactionPages = Math.max(1, Math.ceil(userTransactions.length / TRANSACTION_PAGE_SIZE));
  const transactionPageStart = (currentTransactionPage - 1) * TRANSACTION_PAGE_SIZE;
  const paginatedTransactions = userTransactions.slice(
    transactionPageStart,
    transactionPageStart + TRANSACTION_PAGE_SIZE,
  );
  const transactionPageNumbers = Array.from({ length: totalTransactionPages }, (_, index) => index + 1);
  const transactionStartNumber = userTransactions.length ? transactionPageStart + 1 : 0;
  const transactionEndNumber = Math.min(transactionPageStart + paginatedTransactions.length, userTransactions.length);
  const transactionEmptyRows = Math.max(0, TRANSACTION_PAGE_SIZE - paginatedTransactions.length);

  useEffect(() => {
    if (currentTransactionPage > totalTransactionPages) {
      setCurrentTransactionPage(totalTransactionPages);
    }
  }, [currentTransactionPage, totalTransactionPages]);

  const goToTransactionPage = (page) => {
    setCurrentTransactionPage(Math.min(Math.max(page, 1), totalTransactionPages));
  };

  const updateAccount = (id, field, value) => {
    setAccountNotice("");
    setAccounts((items) =>
      items.map((account) =>
        account.id === id
          ? { ...account, [field]: field === "balance" ? Number(value || 0) : value }
          : account,
      ),
    );
  };

  const persistAccount = async (account) => {
    try {
      await accountApi.update(account.id, {
        accountName: account.name,
        accountNumber: account.accountNumber || "",
        balance: Number(account.balance || 0),
      });
    } catch (error) {
      setAccountNotice(error?.message || "Perubahan akun gagal disimpan.");
    }
  };

  const addAccount = async () => {
    setAccountNotice("");
    try {
      const account = await accountApi.create({
        accountName: `Akun Baru ${accounts.length + 1}`,
        balance: 0,
      });
      setAccounts((items) => [...items, normalizeAccount(account)]);
    } catch (error) {
      setAccountNotice(error?.message || "Akun gagal dibuat.");
    }
  };

  const deleteAccount = (id) => {
    if (accounts.length <= 1) {
      setAccountNotice("Minimal satu akun diperlukan untuk mencatat pemasukan dan transaksi.");
      return;
    }

    const selectedAccount = accounts.find((account) => account.id === id);
    setPendingDeleteAccount(selectedAccount || null);
  };

  const confirmDeleteAccount = async () => {
    if (!pendingDeleteAccount) return;

    try {
      await accountApi.remove(pendingDeleteAccount.id);
      setAccounts((items) => items.filter((account) => account.id !== pendingDeleteAccount.id));
      setAccountNotice("");
      setPendingDeleteAccount(null);
    } catch (error) {
      setAccountNotice(error?.message || "Akun gagal dihapus.");
      setPendingDeleteAccount(null);
    }
  };

  const updateBudget = (category, value) => {
    setBudgetNotice("");
    setIsBudgetSaved(false);
    setBudgetRows((items) =>
      items.map((budget) =>
        budget.category === category ? { ...budget, limit: Number(value || 0) } : budget,
      ),
    );
  };

  const applyBudgetTarget = () => {
    setBudgetNotice("");
    setIsBudgetSaved(false);
    setBudgetRows((items) =>
      items.map((budget) => {
        const target = budgetTargets.find((item) => item.category === budget.category);
        return { ...budget, limit: target ? Math.round((totalIncome * target.percent) / 100) : budget.limit };
      }),
    );
  };

  const saveBudget = async () => {
    const hasEmptyBudget = budgetRows.some((budget) => Number(budget.limit) <= 0);

    if (hasEmptyBudget) {
      setIsBudgetSaved(false);
      setBudgetNotice("Isi nominal anggaran untuk kebutuhan, keinginan, dan tabungan terlebih dahulu.");
      return;
    }

    try {
      const needsAmount = Number(budgetRows.find((budget) => budget.category === "Needs")?.limit || 0);
      const wantsAmount = Number(budgetRows.find((budget) => budget.category === "Wants")?.limit || 0);
      const savingsAmount = Number(budgetRows.find((budget) => budget.category === "Savings")?.limit || 0);

      await analyticsApi.createBudget({
        needsAmount,
        wantsAmount,
        savingsAmount,
        limitAmount: needsAmount + wantsAmount + savingsAmount,
        percentage: 100,
      });
      setBudgetNotice("");
      setIsBudgetSaved(true);
    } catch (error) {
      setIsBudgetSaved(false);
      setBudgetNotice(error?.message || "Anggaran gagal disimpan.");
    }
  };

  return (
    <div className="page-content sadar-page">
      <Container fluid>
        <Row className="g-3">
          <Col xl={5}>
            <Card className="sadar-panel sadar-profile-panel h-100">
              <CardHeader className="d-flex align-items-center justify-content-between">
                <div>
                  <h4 className="card-title mb-1">Data Profil</h4>
                  <p className="text-muted mb-0">Ringkasan identitas akun SADAR kamu</p>
                </div>
                <Button tag={Link} to="/profile-account/edit" color="light" size="sm" className="sadar-table-action" aria-label="Edit profil">
                  <i className="ri-pencil-line align-bottom"></i>
                </Button>
              </CardHeader>
              <CardBody className="sadar-profile-body">
                <div className="sadar-profile-photo-row">
                  <div className="sadar-profile-avatar">
                    {profile.avatar ? <img src={profile.avatar} alt="Foto profil" /> : profile.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="sadar-profile-photo-copy">
                    <Badge color="primary" className="bg-primary-subtle text-primary mb-2">Keuangan Pribadi</Badge>
                    <h5>{profile.name}</h5>
                    <p>{profile.email}</p>
                  </div>
                </div>

                <div className="sadar-profile-summary-grid">
                  <div className="sadar-profile-summary-item">
                    <span>Akun</span>
                    <strong>{accounts.length}</strong>
                  </div>
                  <div className="sadar-profile-summary-item">
                    <span>Total Saldo</span>
                    <strong>{rupiah(totalBalance)}</strong>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col xl={7}>
            <Card className="sadar-panel h-100">
              <CardHeader className="d-flex align-items-center justify-content-between">
                <div>
                  <h4 className="card-title mb-1">Kelola Akun</h4>
                  <p className="text-muted mb-0">Tunai, bank, dan dompet digital yang kamu pakai</p>
                </div>
                <Button color="primary" size="sm" onClick={addAccount}>
                  <i className="ri-add-line align-bottom me-1"></i>
                  Tambah Akun
                </Button>
              </CardHeader>
              <CardBody className="sadar-account-body">
                {accountNotice && <div className="alert alert-warning py-2 mb-3">{accountNotice}</div>}
                <div className="sadar-insight-list sadar-account-list">
                  {accounts.map((account) => (
                    <div className="sadar-insight-item sadar-account-item" key={account.id}>
                      <span className="sadar-card-icon">
                        <i className={account.type === "Bank" ? "ri-bank-line" : account.type === "E-wallet" ? "ri-wallet-3-line" : "ri-cash-line"}></i>
                      </span>
                      <div className="sadar-account-fields">
                        <div className="sadar-form-grid sadar-account-form-grid">
                          <div>
                            <Label>Nama Akun</Label>
                            <Input value={account.name} onChange={(event) => updateAccount(account.id, "name", event.target.value)} onBlur={() => persistAccount(account)} />
                          </div>
                          <div>
                            <Label>Tipe</Label>
                            <Input type="select" value={account.type} onChange={(event) => updateAccount(account.id, "type", event.target.value)} onBlur={() => persistAccount(account)}>
                              {accountTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                            </Input>
                          </div>
                          <div>
                            <Label>Saldo Berjalan</Label>
                            <Input type="text" inputMode="numeric" value={formatNumberInput(account.balance)} readOnly />
                          </div>
                          <div className="d-flex align-items-end justify-content-end">
                            <Button color="light" className="text-danger" onClick={() => deleteAccount(account.id)}>
                              <i className="ri-delete-bin-line align-bottom me-1"></i>
                              Hapus
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="g-3 mt-1">
          <Col xl={12}>
            <Card className="sadar-panel">
              <CardHeader className="d-flex align-items-center justify-content-between">
                <div>
                  <h4 className="card-title mb-1">Atur Anggaran</h4>
                  <p className="text-muted mb-0">Alokasi berdasarkan prinsip 50/30/20 dari pemasukan bulan ini.</p>
                </div>
                <Button color="light" onClick={applyBudgetTarget}>Terapkan 50/30/20</Button>
              </CardHeader>
              <CardBody>
                {budgetNotice && <div className="alert alert-warning py-2 mb-3">{budgetNotice}</div>}
                <div className="sadar-budget-grid">
                  {budgetRows.map((budget) => {
                    const target = budgetTargets.find((item) => item.category === budget.category);
                    const usage = budget.limit ? (budget.used / budget.limit) * 100 : 0;
                    return (
                      <div className="sadar-insight-item d-block" key={budget.id}>
                        <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                          <div>
                            <strong>{target?.label || budget.label}</strong>
                            <p>{target?.helper}</p>
                          </div>
                          <span className="sadar-score-status">{target?.percent}%</span>
                        </div>
                        <Label>Batas Anggaran</Label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9.]*"
                          value={formatNumberInput(budget.limit)}
                          onChange={(event) => updateBudget(budget.category, onlyDigits(event.target.value))}
                        />
                        <div className="d-flex justify-content-between mt-3">
                          <span className="text-muted">Terpakai</span>
                          <strong>{rupiah(budget.used)}</strong>
                        </div>
                        <Progress value={Math.min(usage, 100)} color={getBudgetProgressColor(usage)} className="sadar-progress mt-2" />
                        <p className="text-muted mt-2 mb-0">{usage.toFixed(1)}% dari {rupiah(budget.limit)}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
                  <Button color="primary" onClick={saveBudget}>Simpan Anggaran</Button>
                  {isBudgetSaved && <span className="text-success fw-semibold">Anggaran berhasil disimpan.</span>}
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="g-3 mt-1">
          <Col xl={12}>
            <Card className="sadar-panel" id="riwayat-transaksi">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Riwayat Keuangan</h4>
                  <p className="text-muted mb-0">Gabungan pemasukan dan pengeluaran pribadi kamu.</p>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                {userTransactions.length > TRANSACTION_PAGE_SIZE && (
                  <div className="sadar-table-pagination">
                    <span>
                      Menampilkan {transactionStartNumber}-{transactionEndNumber} dari {userTransactions.length} catatan
                    </span>
                    <ul className="pagination pagination-separated pagination-sm mb-0">
                      <li className={`page-item ${currentTransactionPage === 1 ? "disabled" : ""}`}>
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
                      <li className={`page-item ${currentTransactionPage === totalTransactionPages ? "disabled" : ""}`}>
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
                  </div>
                )}
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
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTransactions.map((transaction) => {
                        const isIncome = transaction.type === "income";
                        return (
                          <tr key={transaction.id}>
                            <td><div className="fw-semibold text-dark">{transaction.name}</div></td>
                            <td>{transaction.category}</td>
                            <td>{resolveAccountName(transaction.account_id)}</td>
                            <td>{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(`${transaction.date}T00:00:00`))}</td>
                            <td className={`text-end fw-semibold ${isIncome ? "text-success" : "text-danger"}`}>
                              {isIncome ? "+" : "-"}{rupiah(transaction.amount)}
                            </td>
                            <td>
                              <Badge color={isIncome ? "success" : "secondary"} className={`bg-${isIncome ? "success" : "secondary"}-subtle text-${isIncome ? "success" : "secondary"}`}>
                                {transaction.status}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                      {Array.from({ length: transactionEmptyRows }, (_, index) => (
                        <tr className="sadar-table-empty-row" key={`empty-${index}`}>
                          <td colSpan={6} aria-hidden="true">&nbsp;</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal
        isOpen={Boolean(pendingDeleteAccount)}
        toggle={() => setPendingDeleteAccount(null)}
        centered
        className="sadar-confirm-modal"
      >
        <ModalBody>
          <div className="sadar-confirm-icon danger">
            <i className="ri-delete-bin-line"></i>
          </div>
          <h4>Hapus akun ini?</h4>
          <p>
            Akun <strong>{pendingDeleteAccount?.name || "ini"}</strong> akan dihapus dari daftar akun kamu.
            Tindakan ini tidak bisa dibatalkan.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setPendingDeleteAccount(null)}>
            Batal
          </Button>
          <Button color="danger" onClick={confirmDeleteAccount}>
            Hapus Akun
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

const ProfileAccount = () => <ProfileAccountWithData />;

export default ProfileAccount;
