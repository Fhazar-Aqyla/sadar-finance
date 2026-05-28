import React, { useMemo, useState } from "react";
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

import {
  accounts as mockAccounts,
  budgets,
  currentUserId,
  getAccountName,
  getUserRows,
  incomes,
  rupiah,
  shouldShowSadarNewUserMode,
  sumBy,
  transactions,
  userProfile,
} from "../SadarShared/mockData";
import "../SadarShared/sadar-pages.css";

const onlyDigits = (value) => String(value || "").replace(/\D/g, "");

const formatNumberInput = (value) => {
  const digits = onlyDigits(value);
  return digits ? new Intl.NumberFormat("id-ID").format(Number(digits)) : "";
};

const EmptyProfileAccount = () => {
  document.title = "Profile & Account | SADAR Finance";
  const profile = userProfile;
  const accountTypes = ["Cash", "Bank", "E-wallet"];
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
        user_id: currentUserId,
        name: "Account Baru",
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

  const deleteAccount = (id) => {
    if (accounts.length <= 1) {
      setAccountNotice("Minimal satu account diperlukan untuk mencatat income dan transaksi.");
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
      setBudgetNotice("Isi nominal budget untuk kebutuhan, keinginan, dan tabungan terlebih dahulu.");
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
                    <Badge color="primary" className="bg-primary-subtle text-primary mb-2">Personal Finance</Badge>
                    <h5>{profile.name}</h5>
                    <p>{profile.email}</p>
                  </div>
                </div>
                <div className="sadar-profile-summary-grid">
                  <div className="sadar-profile-summary-item">
                    <span>Account</span>
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
                  <h4 className="card-title mb-1">Kelola Account</h4>
                  <p className="text-muted mb-0">Cash, bank, dan e-wallet yang kamu pakai</p>
                </div>
                {accounts.length > 0 && (
                  <Button color="primary" size="sm" onClick={addAccount}>
                    <i className="ri-add-line align-bottom me-1"></i>
                    Tambah Account
                  </Button>
                )}
              </CardHeader>
              <CardBody className="sadar-account-body">
                {accountNotice && <div className="alert alert-warning py-2 mb-3">{accountNotice}</div>}
                {accounts.length === 0 ? (
                  <div className="sadar-empty-state sadar-empty-state-center">
                    <span className="sadar-empty-state-icon"><i className="ri-wallet-3-line"></i></span>
                    <h4>Belum ada account yang ditambahkan.</h4>
                    <p>Tambahkan sumber uang pertama agar income dan transaksi bisa tercatat dengan benar.</p>
                    <Button color="primary" onClick={addAccount}>Tambah Account</Button>
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
                              <Label>Nama Account</Label>
                              <Input value={account.name} onChange={(event) => updateAccount(account.id, "name", event.target.value)} />
                            </div>
                            <div>
                              <Label>Tipe</Label>
                              <Input type="select" value={account.type} onChange={(event) => updateAccount(account.id, "type", event.target.value)}>
                                {accountTypes.map((type) => <option key={type}>{type}</option>)}
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
                  <h4 className="card-title mb-1">Atur Budget</h4>
                  <p className="text-muted mb-0">Alokasi berdasarkan prinsip 50/30/20 dari pemasukan bulan ini.</p>
                </div>
              </CardHeader>
              <CardBody>
                {!isBudgetOpen ? (
                  <div className="sadar-empty-state sadar-empty-state-center">
                    <span className="sadar-empty-state-icon"><i className="ri-pie-chart-2-line"></i></span>
                    <h4>Budget belum diatur.</h4>
                    <p>Prinsip 50/30/20 membantu membagi pemasukan menjadi 50% kebutuhan, 30% keinginan, dan 20% tabungan.</p>
                    <Button color="primary" onClick={() => setIsBudgetOpen(true)}>Atur Budget 50/30/20</Button>
                  </div>
                ) : (
                  <>
                    <div className="sadar-budget-helper mb-3">
                      <strong>Atur alokasi awal</strong>
                      <span>Gunakan prinsip 50/30/20 sebagai patokan, lalu isi nominal budget sesuai rencana bulan ini.</span>
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
                            <Label>Batas Budget</Label>
                            <Input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9.]*"
                              value={formatNumberInput(budget.limit)}
                              onChange={(event) => updateBudget(budget.category, onlyDigits(event.target.value))}
                              placeholder="Contoh: 2.500.000"
                            />
                            <p className="text-muted mt-2 mb-0">Isi nominal budget sesuai rencana bulananmu.</p>
                          </div>
                        );
                      })}
                    </div>
                    <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
                      <Button color="primary" onClick={saveBudget}>Simpan Budget</Button>
                      {isBudgetSaved && <span className="text-success fw-semibold">Budget berhasil disimpan.</span>}
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
          <h4>Hapus account ini?</h4>
          <p>
            Account <strong>{pendingDeleteAccount?.name || "ini"}</strong> akan dihapus dari daftar setup kamu.
            Tindakan ini tidak bisa dibatalkan.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setPendingDeleteAccount(null)}>
            Batal
          </Button>
          <Button color="danger" onClick={confirmDeleteAccount}>
            Hapus Account
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

const ProfileAccountWithData = () => {
  document.title = "Profile & Account | SADAR Finance";

  const [accounts, setAccounts] = useState(getUserRows(mockAccounts, currentUserId));
  const [accountNotice, setAccountNotice] = useState("");
  const [pendingDeleteAccount, setPendingDeleteAccount] = useState(null);
  const [budgetRows, setBudgetRows] = useState(getUserRows(budgets, currentUserId));
  const [budgetNotice, setBudgetNotice] = useState("");
  const [isBudgetSaved, setIsBudgetSaved] = useState(false);

  const profile = userProfile;
  const totalBalance = useMemo(() => sumBy(accounts, (account) => account.balance), [accounts]);
  const totalIncome = useMemo(() => sumBy(getUserRows(incomes, currentUserId), (item) => item.amount), []);

  const budgetTargets = [
    { category: "Needs", label: "Kebutuhan", helper: "Kebutuhan utama", percent: 50 },
    { category: "Wants", label: "Keinginan", helper: "Keinginan dan hiburan", percent: 30 },
    { category: "Savings", label: "Tabungan", helper: "Tabungan dan dana darurat", percent: 20 },
  ];

  const accountTypes = ["Cash", "Bank", "E-wallet"];

  const userTransactions = useMemo(() => {
    const expenseRows = getUserRows(transactions, currentUserId).map((transaction) => ({
      id: transaction.id,
      type: "expense",
      name: transaction.name,
      category: transaction.category,
      account_id: transaction.account_id,
      date: transaction.date,
      amount: transaction.amount,
      status: transaction.status,
    }));

    const incomeRows = getUserRows(incomes, currentUserId).map((income) => ({
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
  }, []);

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

  const addAccount = () => {
    setAccountNotice("");
    setAccounts((items) => [
      ...items,
      {
        id: `acc_temp_${items.length + 1}`,
        user_id: currentUserId,
        name: "Account Baru",
        type: "Cash",
        balance: 0,
      },
    ]);
  };

  const deleteAccount = (id) => {
    if (accounts.length <= 1) {
      setAccountNotice("Minimal satu account diperlukan untuk mencatat income dan transaksi.");
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

  const saveBudget = () => {
    const hasEmptyBudget = budgetRows.some((budget) => Number(budget.limit) <= 0);

    if (hasEmptyBudget) {
      setIsBudgetSaved(false);
      setBudgetNotice("Isi nominal budget untuk kebutuhan, keinginan, dan tabungan terlebih dahulu.");
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
                    <Badge color="primary" className="bg-primary-subtle text-primary mb-2">Personal Finance</Badge>
                    <h5>{profile.name}</h5>
                    <p>{profile.email}</p>
                  </div>
                </div>

                <div className="sadar-profile-summary-grid">
                  <div className="sadar-profile-summary-item">
                    <span>Account</span>
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
                  <h4 className="card-title mb-1">Kelola Account</h4>
                  <p className="text-muted mb-0">Cash, bank, dan e-wallet yang kamu pakai</p>
                </div>
                <Button color="primary" size="sm" onClick={addAccount}>
                  <i className="ri-add-line align-bottom me-1"></i>
                  Tambah Account
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
                            <Label>Nama Account</Label>
                            <Input value={account.name} onChange={(event) => updateAccount(account.id, "name", event.target.value)} />
                          </div>
                          <div>
                            <Label>Tipe</Label>
                            <Input type="select" value={account.type} onChange={(event) => updateAccount(account.id, "type", event.target.value)}>
                              {accountTypes.map((type) => <option key={type}>{type}</option>)}
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
                  <h4 className="card-title mb-1">Atur Budget</h4>
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
                        <Label>Batas Budget</Label>
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
                        <Progress value={Math.min(usage, 100)} color={usage >= 100 ? "danger" : usage >= 80 ? "warning" : "primary"} className="sadar-progress mt-2" />
                        <p className="text-muted mt-2 mb-0">{usage.toFixed(1)}% dari {rupiah(budget.limit)}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
                  <Button color="primary" onClick={saveBudget}>Simpan Budget</Button>
                  {isBudgetSaved && <span className="text-success fw-semibold">Budget berhasil disimpan.</span>}
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
                <div className="table-responsive sadar-table-wrap">
                  <Table className="sadar-table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Nama Catatan</th>
                        <th>Kategori</th>
                        <th>Account</th>
                        <th>Tanggal</th>
                        <th className="text-end">Nominal</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userTransactions.map((transaction) => {
                        const isIncome = transaction.type === "income";
                        return (
                          <tr key={transaction.id}>
                            <td><div className="fw-semibold text-dark">{transaction.name}</div></td>
                            <td>{transaction.category}</td>
                            <td>{getAccountName(transaction.account_id)}</td>
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
          <h4>Hapus account ini?</h4>
          <p>
            Account <strong>{pendingDeleteAccount?.name || "ini"}</strong> akan dihapus dari daftar account kamu.
            Tindakan ini tidak bisa dibatalkan.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setPendingDeleteAccount(null)}>
            Batal
          </Button>
          <Button color="danger" onClick={confirmDeleteAccount}>
            Hapus Account
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

const ProfileAccount = () => (
  shouldShowSadarNewUserMode ? <EmptyProfileAccount /> : <ProfileAccountWithData />
);

export default ProfileAccount;
