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

const ProfileAccount = () => {
  document.title = "Profile & Account | SADAR Finance";

  const [accounts, setAccounts] = useState(getUserRows(mockAccounts, currentUserId));
  const [budgetRows, setBudgetRows] = useState(getUserRows(budgets, currentUserId));

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
    setAccounts((items) =>
      items.map((account) =>
        account.id === id
          ? { ...account, [field]: field === "balance" ? Number(value || 0) : value }
          : account,
      ),
    );
  };

  const addAccount = () => {
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
    setAccounts((items) => items.filter((account) => account.id !== id));
  };

  const updateBudget = (category, value) => {
    setBudgetRows((items) =>
      items.map((budget) =>
        budget.category === category ? { ...budget, limit: Number(value || 0) } : budget,
      ),
    );
  };

  const applyBudgetTarget = () => {
    setBudgetRows((items) =>
      items.map((budget) => {
        const target = budgetTargets.find((item) => item.category === budget.category);
        return { ...budget, limit: target ? Math.round((totalIncome * target.percent) / 100) : budget.limit };
      }),
    );
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
                <Button color="primary" className="mt-4">Simpan Budget</Button>
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
    </div>
  );
};

export default ProfileAccount;
