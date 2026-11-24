import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Progress,
  Row,
} from "reactstrap";
import {
  accountApi,
  incomeApi,
  plansApi,
  transactionApi,
} from "../../Components/services/api";
import "../SadarShared/sadar-pages.css";

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const onlyDigits = (value) => String(value || "").replace(/\D/g, "");

const formatNumberInput = (value) => {
  const digits = onlyDigits(value);
  return digits ? new Intl.NumberFormat("id-ID").format(Number(digits)) : "";
};

const currentPeriodKey = () => new Date().toISOString().slice(0, 7);

const SadarFinancialPlans = () => {
  useEffect(() => {
    document.title = "Rencana & Piutang | SADAR Finance";
  }, []);

  const [activeTab, setActiveTab] = useState("goals");
  const [accounts, setAccounts] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [recurringItems, setRecurringItems] = useState([]);
  const [debts, setDebts] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [notice, setNotice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    category: "Dana Darurat",
    targetAmount: "",
    currentAmount: "",
  });

  const [contribModalGoal, setContribModalGoal] = useState(null);
  const [contribAmount, setContribAmount] = useState("");
  const [contribAccountId, setContribAccountId] = useState("");
  const [deductAccount, setDeductAccount] = useState(true);

  const [recModalOpen, setRecModalOpen] = useState(false);
  const [newRec, setNewRec] = useState({
    title: "",
    amount: "",
    dayOfMonth: "1",
    isIncome: false,
    categoryGroup: "Needs",
    accountId: "",
  });

  const [debtModalOpen, setDebtModalOpen] = useState(false);
  const [newDebt, setNewDebt] = useState({
    personName: "",
    phone: "",
    amount: "",
    isReceivable: true,
    note: "",
  });

  // Split Bill Calculator state
  const [splitBill, setSplitBill] = useState({
    title: "Makan Bersama",
    amount: "300000",
    taxPct: "10",
    peopleCount: 4,
  });

  // Emergency Fund Calculator state
  const [efMonthlyExpense, setEfMonthlyExpense] = useState("3000000");
  const [efMultiplier, setEfMultiplier] = useState(6);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const [accRows, plansRes] = await Promise.all([
          accountApi.list().catch(() => []),
          plansApi.get().catch(() => ({})),
        ]);
        if (!mounted) return;
        const normAccounts = (accRows || []).map((a) => ({
          id: a.account_id || a.id,
          name: a.account_name || a.name || "Akun",
          balance: Number(a.balance || 0),
        }));
        setAccounts(normAccounts);
        if (normAccounts.length > 0) {
          setContribAccountId(normAccounts[0].id);
          setNewRec((prev) => ({ ...prev, accountId: normAccounts[0].id }));
        }
        setSavingsGoals(
          Array.isArray(plansRes?.savingsGoals) ? plansRes.savingsGoals : []
        );
        setRecurringItems(
          Array.isArray(plansRes?.recurringItems) ? plansRes.recurringItems : []
        );
        setDebts(Array.isArray(plansRes?.debts) ? plansRes.debts : []);
        setTransfers(
          Array.isArray(plansRes?.transfers) ? plansRes.transfers : []
        );
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const persistPlans = async (nextGoals, nextRec, nextDebts, nextTrf) => {
    setSavingsGoals(nextGoals);
    setRecurringItems(nextRec);
    setDebts(nextDebts);
    setTransfers(nextTrf);
    try {
      await plansApi.save({
        savingsGoals: nextGoals,
        recurringItems: nextRec,
        debts: nextDebts,
        transfers: nextTrf,
      });
    } catch (e) {
      setNotice({
        color: "danger",
        message: e?.message || "Gagal menyinkronkan rencana ke cloud.",
      });
    }
  };

  const handleAddGoal = async () => {
    const target = Number(onlyDigits(newGoal.targetAmount) || 0);
    const current = Number(onlyDigits(newGoal.currentAmount) || 0);
    if (!newGoal.title.trim() || target <= 0) return;
    const item = {
      id: `goal_${Date.now()}`,
      title: newGoal.title.trim(),
      category: newGoal.category,
      targetAmount: target,
      currentAmount: current,
      createdAt: new Date().toISOString(),
    };
    await persistPlans(
      [item, ...savingsGoals],
      recurringItems,
      debts,
      transfers
    );
    setGoalModalOpen(false);
    setNewGoal({
      title: "",
      category: "Dana Darurat",
      targetAmount: "",
      currentAmount: "",
    });
    setNotice({
      color: "success",
      message: `Target tabungan "${item.title}" berhasil disimpan ke cloud.`,
    });
  };

  const handleContributeGoal = async () => {
    if (!contribModalGoal) return;
    const amt = Number(onlyDigits(contribAmount) || 0);
    if (amt <= 0) return;
    if (deductAccount && contribAccountId) {
      await transactionApi.create({
        accountId: contribAccountId,
        categoryGroup: "Savings",
        categoryDetail: contribModalGoal.category || "Tabungan",
        transactionDate: new Date().toISOString(),
        description: `Tabungan: ${contribModalGoal.title}`,
        source: "manual",
        amount: amt,
      });
    }
    const nextGoals = savingsGoals.map((g) =>
      g.id === contribModalGoal.id
        ? { ...g, currentAmount: Number(g.currentAmount || 0) + amt }
        : g
    );
    await persistPlans(nextGoals, recurringItems, debts, transfers);
    setContribModalGoal(null);
    setContribAmount("");
    setNotice({
      color: "success",
      message: "Setoran tabungan berhasil ditambahkan & disinkronkan.",
    });
  };

  const handleAddRecurring = async () => {
    const amt = Number(onlyDigits(newRec.amount) || 0);
    if (!newRec.title.trim() || amt <= 0) return;
    const item = {
      id: `rec_${Date.now()}`,
      title: newRec.title.trim(),
      amount: amt,
      isIncome: Boolean(newRec.isIncome),
      categoryGroup: newRec.isIncome ? "Income" : newRec.categoryGroup,
      accountId: newRec.accountId || (accounts[0]?.id ?? ""),
      dayOfMonth: Math.max(1, Math.min(31, Number(newRec.dayOfMonth) || 1)),
      lastPaidPeriod: null,
      createdAt: new Date().toISOString(),
    };
    await persistPlans(
      savingsGoals,
      [item, ...recurringItems],
      debts,
      transfers
    );
    setRecModalOpen(false);
    setNewRec({
      title: "",
      amount: "",
      dayOfMonth: "1",
      isIncome: false,
      categoryGroup: "Needs",
      accountId: accounts[0]?.id ?? "",
    });
    setNotice({
      color: "success",
      message: `Jadwal rutin "${item.title}" berhasil ditambahkan.`,
    });
  };

  const handleExecuteRecurring = async (item) => {
    const accId = item.accountId || accounts[0]?.id;
    try {
      if (item.isIncome) {
        await incomeApi.create({
          accountId: accId,
          amount: Number(item.amount || 0),
          incomeDate: new Date().toISOString(),
          source: item.title,
        });
      } else {
        await transactionApi.create({
          accountId: accId,
          categoryGroup: item.categoryGroup || "Needs",
          categoryDetail: "Rutin Bulanan",
          transactionDate: new Date().toISOString(),
          description: item.title,
          source: "manual",
          amount: Number(item.amount || 0),
        });
      }
      const period = currentPeriodKey();
      const nextRec = recurringItems.map((r) =>
        r.id === item.id ? { ...r, lastPaidPeriod: period } : r
      );
      await persistPlans(savingsGoals, nextRec, debts, transfers);
      setNotice({
        color: "success",
        message: `"${item.title}" berhasil dicatat untuk periode bulan ini!`,
      });
    } catch (e) {
      setNotice({
        color: "danger",
        message: e?.message || "Gagal mencatat jadwal rutin.",
      });
    }
  };

  const handleAddDebt = async () => {
    const amt = Number(onlyDigits(newDebt.amount) || 0);
    if (!newDebt.personName.trim() || amt <= 0) return;
    const item = {
      id: `debt_${Date.now()}`,
      personName: newDebt.personName.trim(),
      phone: newDebt.phone.trim(),
      amount: amt,
      isReceivable: Boolean(newDebt.isReceivable),
      note: newDebt.note.trim(),
      isSettled: false,
      createdAt: new Date().toISOString(),
    };
    await persistPlans(
      savingsGoals,
      recurringItems,
      [item, ...debts],
      transfers
    );
    setDebtModalOpen(false);
    setNewDebt({
      personName: "",
      phone: "",
      amount: "",
      isReceivable: true,
      note: "",
    });
    setNotice({
      color: "success",
      message: `Catatan ${item.isReceivable ? "piutang" : "utang"} "${item.personName}" berhasil disimpan.`,
    });
  };

  const handleSettleDebt = async (item) => {
    const nextDebts = debts.map((d) =>
      d.id === item.id ? { ...d, isSettled: true } : d
    );
    await persistPlans(savingsGoals, recurringItems, nextDebts, transfers);
    setNotice({
      color: "success",
      message: `Catatan ${item.personName} ditandai lunas.`,
    });
  };

  const splitResult = useMemo(() => {
    const base = Number(onlyDigits(splitBill.amount) || 0);
    const tax = Number(splitBill.taxPct || 0);
    const count = Math.max(1, Number(splitBill.peopleCount) || 1);
    const totalWithTax = Math.round(base * (1 + tax / 100));
    const perPerson = Math.ceil(totalWithTax / count);
    return { base, tax, count, totalWithTax, perPerson };
  }, [splitBill]);

  const totalAccountBalance = useMemo(
    () => accounts.reduce((s, a) => s + Number(a.balance || 0), 0),
    [accounts]
  );

  const efTarget = useMemo(
    () => Number(onlyDigits(efMonthlyExpense) || 0) * efMultiplier,
    [efMonthlyExpense, efMultiplier]
  );

  return (
    <div className="page-content sadar-page">
      <Container fluid>
        <div className="sadar-page-header">
          <div>
            <h1>Rencana Keuangan, Piutang &amp; Simulasi</h1>
            <p>
              Seluruh target tabungan, jadwal rutin, dan catatan piutang
              tersinkronisasi otomatis dengan aplikasi Android SADAR Finance.
            </p>
          </div>
          <span className="sadar-header-icon">
            <i className="ri-safe-2-line"></i>
          </span>
        </div>

        {notice && (
          <Alert
            color={notice.color}
            toggle={() => setNotice(null)}
            className="mb-3"
          >
            {notice.message}
          </Alert>
        )}

        <Card className="sadar-panel mb-3">
          <CardHeader className="border-bottom pb-0">
            <Nav tabs className="border-bottom-0 gap-2">
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={`fw-semibold ${activeTab === "goals" ? "active text-primary" : "text-muted"}`}
                  onClick={() => setActiveTab("goals")}
                >
                  <i className="ri-flag-2-line me-1"></i>
                  Target Tabungan ({savingsGoals.length})
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={`fw-semibold ${activeTab === "recurring" ? "active text-primary" : "text-muted"}`}
                  onClick={() => setActiveTab("recurring")}
                >
                  <i className="ri-calendar-Check-line me-1"></i>
                  Jadwal Rutin ({recurringItems.length})
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={`fw-semibold ${activeTab === "debts" ? "active text-primary" : "text-muted"}`}
                  onClick={() => setActiveTab("debts")}
                >
                  <i className="ri-team-line me-1"></i>
                  Piutang &amp; Split Bill ({debts.filter((d) => !d.isSettled).length})
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={`fw-semibold ${activeTab === "emergency" ? "active text-primary" : "text-muted"}`}
                  onClick={() => setActiveTab("emergency")}
                >
                  <i className="ri-shield-check-line me-1"></i>
                  Simulasi Dana Darurat
                </NavLink>
              </NavItem>
            </Nav>
          </CardHeader>

          <CardBody>
            {isLoading ? (
              <div className="py-4 text-center text-muted">
                Memuat data rencana keuangan dari cloud...
              </div>
            ) : activeTab === "goals" ? (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <div>
                    <h5 className="mb-1 fw-bold">Target Tabungan Impian</h5>
                    <p className="text-muted mb-0 small">
                      Pantau progres dana darurat, investasi, dan pembelian
                      impian Anda.
                    </p>
                  </div>
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => setGoalModalOpen(true)}
                  >
                    <i className="ri-add-line me-1"></i>
                    Tambah Target Tabungan
                  </Button>
                </div>

                {savingsGoals.length === 0 ? (
                  <div className="sadar-empty-state sadar-empty-state-center py-4">
                    <h5>Belum ada target tabungan aktif</h5>
                    <p className="text-muted">
                      Buat target tabungan pertama Anda agar alokasi 20%
                      tabungan bulanan lebih terarah.
                    </p>
                  </div>
                ) : (
                  <Row className="g-3">
                    {savingsGoals.map((g) => {
                      const target = Number(g.targetAmount || 0);
                      const current = Number(g.currentAmount || 0);
                      const pct =
                        target > 0
                          ? Math.min(100, Math.round((current / target) * 100))
                          : 0;
                      return (
                        <Col md={6} xl={4} key={g.id}>
                          <div className="sadar-insight-item d-block h-100">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <span className="sadar-source-badge ai mb-1">
                                  {g.category || "Tabungan"}
                                </span>
                                <strong className="fs-15">{g.title}</strong>
                              </div>
                              <Badge
                                color={pct >= 100 ? "success" : "primary"}
                                className={`bg-${pct >= 100 ? "success" : "primary"}-subtle text-${pct >= 100 ? "success" : "primary"}`}
                              >
                                {pct}%
                              </Badge>
                            </div>
                            <div className="small text-muted mb-2">
                              Terkumpul:{" "}
                              <strong className="text-dark">
                                {rupiah(current)}
                              </strong>{" "}
                              dari {rupiah(target)}
                            </div>
                            <Progress
                              value={pct}
                              color={pct >= 100 ? "success" : "primary"}
                              style={{ height: "8px" }}
                              className="mb-3"
                            />
                            <div className="d-flex justify-content-between align-items-center gap-2">
                              <Button
                                color="primary"
                                size="sm"
                                onClick={() => setContribModalGoal(g)}
                              >
                                <i className="ri-add-circle-line me-1"></i>
                                Setor Tabungan
                              </Button>
                              <Button
                                color="light"
                                size="sm"
                                className="text-danger"
                                onClick={() =>
                                  persistPlans(
                                    savingsGoals.filter((x) => x.id !== g.id),
                                    recurringItems,
                                    debts,
                                    transfers
                                  )
                                }
                              >
                                <i className="ri-delete-bin-line"></i>
                              </Button>
                            </div>
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                )}
              </div>
            ) : activeTab === "recurring" ? (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <div>
                    <h5 className="mb-1 fw-bold">
                      Jadwal Tagihan &amp; Pemasukan Rutin
                    </h5>
                    <p className="text-muted mb-0 small">
                      Catat tagihan bulanan (Listrik, WiFi, Kos) atau gaji rutin
                      hanya dengan 1 klik.
                    </p>
                  </div>
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => setRecModalOpen(true)}
                  >
                    <i className="ri-add-line me-1"></i>
                    Tambah Jadwal Rutin
                  </Button>
                </div>

                {recurringItems.length === 0 ? (
                  <div className="sadar-empty-state sadar-empty-state-center py-4">
                    <h5>Belum ada jadwal rutin</h5>
                    <p className="text-muted">
                      Tambahkan tagihan atau pemasukan bulanan agar tidak
                      terlewat setiap bulan.
                    </p>
                  </div>
                ) : (
                  <div className="sadar-insight-list">
                    {recurringItems.map((r) => {
                      const isPaid = r.lastPaidPeriod === currentPeriodKey();
                      return (
                        <div
                          key={r.id}
                          className="sadar-insight-item d-flex justify-content-between align-items-center flex-wrap gap-3"
                        >
                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <strong>{r.title}</strong>
                              <Badge
                                color={r.isIncome ? "success" : "primary"}
                                className={`bg-${r.isIncome ? "success" : "primary"}-subtle text-${r.isIncome ? "success" : "primary"}`}
                              >
                                {r.isIncome ? "Pemasukan Rutin" : r.categoryGroup}
                              </Badge>
                              {isPaid && (
                                <Badge
                                  color="success"
                                  className="bg-success-subtle text-success"
                                >
                                  Sudah Dicatat Bulan Ini
                                </Badge>
                              )}
                            </div>
                            <p className="small text-muted mb-0 mt-1">
                              Setiap Tanggal {r.dayOfMonth || 1} - Nominal:{" "}
                              <strong>{rupiah(r.amount)}</strong>
                            </p>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <Button
                              color={isPaid ? "light" : "success"}
                              size="sm"
                              onClick={() => handleExecuteRecurring(r)}
                            >
                              <i className="ri-check-double-line me-1"></i>
                              {isPaid ? "Catat Lagi" : "Catat Sekarang"}
                            </Button>
                            <Button
                              color="light"
                              size="sm"
                              className="text-danger"
                              onClick={() =>
                                persistPlans(
                                  savingsGoals,
                                  recurringItems.filter((x) => x.id !== r.id),
                                  debts,
                                  transfers
                                )
                              }
                            >
                              <i className="ri-delete-bin-line"></i>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : activeTab === "debts" ? (
              <Row className="g-4">
                <Col lg={7}>
                  <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <div>
                      <h5 className="mb-1 fw-bold">Catatan Piutang &amp; Utang</h5>
                      <p className="text-muted mb-0 small">
                        Kelola pinjaman teman dan kirim pengingat WhatsApp
                        otomatis.
                      </p>
                    </div>
                    <Button
                      color="primary"
                      size="sm"
                      onClick={() => setDebtModalOpen(true)}
                    >
                      <i className="ri-add-line me-1"></i>
                      Catat Piutang / Utang
                    </Button>
                  </div>

                  {debts.length === 0 ? (
                    <div className="sadar-empty-state sadar-empty-state-center py-4">
                      <h5>Belum ada catatan piutang atau utang</h5>
                      <p className="text-muted">
                        Catat pinjaman teman atau hasil patungan agar mudah
                        dipantau pelunasannya.
                      </p>
                    </div>
                  ) : (
                    <div className="sadar-insight-list">
                      {debts.map((d) => {
                        const waText = encodeURIComponent(
                          `Halo ${d.personName}, sekadar mengingatkan catatan ${
                            d.isReceivable ? "patungan/pinjaman" : "pembayaran"
                          } sebesar ${rupiah(d.amount)}${
                            d.note ? ` (${d.note})` : ""
                          } di SADAR Finance. Terima kasih!`
                        );
                        const cleanPhone = String(d.phone || "")
                          .replace(/\D/g, "")
                          .replace(/^0/, "62");
                        return (
                          <div
                            key={d.id}
                            className="sadar-insight-item d-flex justify-content-between align-items-center flex-wrap gap-3"
                          >
                            <div>
                              <div className="d-flex align-items-center gap-2">
                                <strong>{d.personName}</strong>
                                <Badge
                                  color={d.isReceivable ? "success" : "warning"}
                                  className={`bg-${d.isReceivable ? "success" : "warning"}-subtle text-${d.isReceivable ? "success" : "warning"}`}
                                >
                                  {d.isReceivable
                                    ? "Piutang (Teman Pinjam)"
                                    : "Utang (Saya Pinjam)"}
                                </Badge>
                                {d.isSettled && (
                                  <Badge
                                    color="secondary"
                                    className="bg-secondary-subtle text-secondary"
                                  >
                                    Lunas
                                  </Badge>
                                )}
                              </div>
                              <p className="small text-muted mb-0 mt-1">
                                Nominal: <strong>{rupiah(d.amount)}</strong>
                                {d.note ? ` - ${d.note}` : ""}
                              </p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              {!d.isSettled && (
                                <>
                                  <Button
                                    color="light"
                                    size="sm"
                                    tag="a"
                                    href={`https://wa.me/${cleanPhone}?text=${waText}`}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <i className="ri-whatsapp-line text-success me-1"></i>
                                    WA
                                  </Button>
                                  <Button
                                    color="success"
                                    size="sm"
                                    onClick={() => handleSettleDebt(d)}
                                  >
                                    Tandai Lunas
                                  </Button>
                                </>
                              )}
                              <Button
                                color="light"
                                size="sm"
                                className="text-danger"
                                onClick={() =>
                                  persistPlans(
                                    savingsGoals,
                                    recurringItems,
                                    debts.filter((x) => x.id !== d.id),
                                    transfers
                                  )
                                }
                              >
                                <i className="ri-delete-bin-line"></i>
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Col>

                <Col lg={5}>
                  <div className="sadar-insight-item d-block">
                    <h5 className="fw-bold mb-1">
                      Kalkulator Patungan (Split Bill)
                    </h5>
                    <p className="text-muted small mb-3">
                      Hitung pembagian tagihan makan atau acara bersama lengkap
                      dengan pajak/service.
                    </p>
                    <div className="mb-2">
                      <Label className="form-label small">Judul Acara</Label>
                      <Input
                        value={splitBill.title}
                        onChange={(e) =>
                          setSplitBill((s) => ({ ...s, title: e.target.value }))
                        }
                      />
                    </div>
                    <Row className="g-2 mb-2">
                      <Col sm={7}>
                        <Label className="form-label small">
                          Total Tagihan (Rp)
                        </Label>
                        <Input
                          value={formatNumberInput(splitBill.amount)}
                          onChange={(e) =>
                            setSplitBill((s) => ({
                              ...s,
                              amount: onlyDigits(e.target.value),
                            }))
                          }
                        />
                      </Col>
                      <Col sm={5}>
                        <Label className="form-label small">
                          Pajak / Service (%)
                        </Label>
                        <Input
                          type="number"
                          value={splitBill.taxPct}
                          onChange={(e) =>
                            setSplitBill((s) => ({
                              ...s,
                              taxPct: e.target.value,
                            }))
                          }
                        />
                      </Col>
                    </Row>
                    <div className="mb-3">
                      <Label className="form-label small">
                        Jumlah Orang ({splitBill.peopleCount} Orang)
                      </Label>
                      <Input
                        type="range"
                        min={2}
                        max={20}
                        value={splitBill.peopleCount}
                        onChange={(e) =>
                          setSplitBill((s) => ({
                            ...s,
                            peopleCount: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div className="p-3 rounded-3 border bg-light-subtle mb-3">
                      <div className="d-flex justify-content-between small mb-1">
                        <span>Total + Pajak ({splitResult.tax}%):</span>
                        <strong>{rupiah(splitResult.totalWithTax)}</strong>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold">Patungan per Orang:</span>
                        <span className="fs-18 fw-bold text-primary">
                          {rupiah(splitResult.perPerson)}
                        </span>
                      </div>
                    </div>
                    <Button
                      color="success"
                      className="w-100"
                      tag="a"
                      target="_blank"
                      rel="noreferrer"
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Rincian Patungan *${splitBill.title}* (SADAR Finance):\n- Total + Pajak: ${rupiah(
                          splitResult.totalWithTax
                        )}\n- Jumlah Orang: ${
                          splitResult.count
                        } orang\n- *Patungan per Orang: ${rupiah(
                          splitResult.perPerson
                        )}*`
                      )}`}
                    >
                      <i className="ri-whatsapp-line me-1"></i>
                      Bagikan Rincian Patungan ke WhatsApp
                    </Button>
                  </div>
                </Col>
              </Row>
            ) : (
              <Row className="g-4">
                <Col lg={6}>
                  <h5 className="fw-bold mb-1">
                    Simulator Dana Darurat Ideal
                  </h5>
                  <p className="text-muted small mb-3">
                    Hitung kebutuhan dana darurat berdasarkan pengeluaran pokok
                    bulanan dan status tanggungan Anda.
                  </p>
                  <div className="mb-3">
                    <Label className="form-label">
                      Pengeluaran Pokok Bulanan (Rp)
                    </Label>
                    <InputGroup>
                      <InputGroupText>Rp</InputGroupText>
                      <Input
                        value={formatNumberInput(efMonthlyExpense)}
                        onChange={(e) =>
                          setEfMonthlyExpense(onlyDigits(e.target.value))
                        }
                      />
                    </InputGroup>
                  </div>
                  <div className="mb-3">
                    <Label className="form-label">
                      Profil Tanggungan &amp; Pengali Ideal
                    </Label>
                    <div className="d-flex flex-wrap gap-2">
                      {[
                        { m: 3, label: "3x (Lajang / Pemula)" },
                        { m: 6, label: "6x (Menikah / Standar)" },
                        { m: 9, label: "9x (Menikah + Anak)" },
                        { m: 12, label: "12x (Freelancer / Bisnis)" },
                      ].map((opt) => (
                        <Button
                          key={opt.m}
                          size="sm"
                          color={efMultiplier === opt.m ? "primary" : "light"}
                          onClick={() => setEfMultiplier(opt.m)}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </Col>
                <Col lg={6}>
                  <div className="sadar-insight-item d-block">
                    <span className="sadar-source-badge ai mb-2">
                      Rekomendasi {efMultiplier}x Pengeluaran Bulanan
                    </span>
                    <h4 className="fw-bold text-primary mb-1">
                      {rupiah(efTarget)}
                    </h4>
                    <p className="small text-muted mb-3">
                      Saldo Kas &amp; Rekening Aktif Anda saat ini:{" "}
                      <strong>{rupiah(totalAccountBalance)}</strong> (
                      {efTarget > 0
                        ? Math.min(
                            100,
                            Math.round((totalAccountBalance / efTarget) * 100)
                          )
                        : 0}
                      % terpenuhi)
                    </p>
                    <Button
                      color="primary"
                      size="sm"
                      onClick={async () => {
                        const item = {
                          id: `goal_${Date.now()}`,
                          title: `Dana Darurat Ideal (${efMultiplier}x)`,
                          category: "Dana Darurat",
                          targetAmount: efTarget,
                          currentAmount: totalAccountBalance,
                          createdAt: new Date().toISOString(),
                        };
                        await persistPlans(
                          [item, ...savingsGoals],
                          recurringItems,
                          debts,
                          transfers
                        );
                        setActiveTab("goals");
                        setNotice({
                          color: "success",
                          message:
                            "Target Dana Darurat berhasil disimpan ke daftar Target Tabungan!",
                        });
                      }}
                    >
                      <i className="ri-add-circle-line me-1"></i>
                      Simpan sebagai Target Tabungan
                    </Button>
                  </div>
                </Col>
              </Row>
            )}
          </CardBody>
        </Card>
      </Container>

      {/* Add Goal Modal */}
      <Modal
        isOpen={goalModalOpen}
        toggle={() => setGoalModalOpen(false)}
        centered
      >
        <ModalHeader toggle={() => setGoalModalOpen(false)}>
          Tambah Target Tabungan
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <Label>Nama Target Impian</Label>
            <Input
              value={newGoal.title}
              onChange={(e) =>
                setNewGoal((g) => ({ ...g, title: e.target.value }))
              }
              placeholder="Contoh: Dana Darurat, Laptop Kerja, Umroh"
            />
          </div>
          <div className="mb-3">
            <Label>Kategori Target</Label>
            <Input
              type="select"
              value={newGoal.category}
              onChange={(e) =>
                setNewGoal((g) => ({ ...g, category: e.target.value }))
              }
            >
              <option value="Dana Darurat">Dana Darurat</option>
              <option value="Tabungan & Investasi">Tabungan &amp; Investasi</option>
              <option value="Gadget & Barang">Gadget &amp; Barang</option>
              <option value="Liburan">Liburan</option>
              <option value="Pendidikan">Pendidikan</option>
            </Input>
          </div>
          <div className="mb-3">
            <Label>Target Nominal (Rp)</Label>
            <Input
              value={formatNumberInput(newGoal.targetAmount)}
              onChange={(e) =>
                setNewGoal((g) => ({
                  ...g,
                  targetAmount: onlyDigits(e.target.value),
                }))
              }
              placeholder="10.000.000"
            />
          </div>
          <div>
            <Label>Saldo Awal Terkumpul (Opsional)</Label>
            <Input
              value={formatNumberInput(newGoal.currentAmount)}
              onChange={(e) =>
                setNewGoal((g) => ({
                  ...g,
                  currentAmount: onlyDigits(e.target.value),
                }))
              }
              placeholder="0"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setGoalModalOpen(false)}>
            Batal
          </Button>
          <Button color="primary" onClick={handleAddGoal}>
            Simpan Target
          </Button>
        </ModalFooter>
      </Modal>

      {/* Contribute Goal Modal */}
      <Modal
        isOpen={Boolean(contribModalGoal)}
        toggle={() => setContribModalGoal(null)}
        centered
      >
        <ModalHeader toggle={() => setContribModalGoal(null)}>
          Setor Tabungan: {contribModalGoal?.title}
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <Label>Nominal Setoran (Rp)</Label>
            <Input
              value={formatNumberInput(contribAmount)}
              onChange={(e) => setContribAmount(onlyDigits(e.target.value))}
              placeholder="250.000"
            />
          </div>
          {accounts.length > 0 && (
            <>
              <div className="form-check mb-2">
                <input
                  id="deduct-acc-check"
                  type="checkbox"
                  className="form-check-input"
                  checked={deductAccount}
                  onChange={(e) => setDeductAccount(e.target.checked)}
                />
                <label
                  htmlFor="deduct-acc-check"
                  className="form-check-label small"
                >
                  Potong dari saldo rekening &amp; catat ke alokasi Tabungan (20%)
                </label>
              </div>
              {deductAccount && (
                <div>
                  <Label>Pilih Rekening Sumber</Label>
                  <Input
                    type="select"
                    value={contribAccountId}
                    onChange={(e) => setContribAccountId(e.target.value)}
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({rupiah(a.balance)})
                      </option>
                    ))}
                  </Input>
                </div>
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setContribModalGoal(null)}>
            Batal
          </Button>
          <Button color="success" onClick={handleContributeGoal}>
            Simpan Setoran
          </Button>
        </ModalFooter>
      </Modal>

      {/* Add Recurring Modal */}
      <Modal
        isOpen={recModalOpen}
        toggle={() => setRecModalOpen(false)}
        centered
      >
        <ModalHeader toggle={() => setRecModalOpen(false)}>
          Tambah Jadwal Tagihan / Gaji Rutin
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <Label>Tipe Jadwal Rutin</Label>
            <Input
              type="select"
              value={newRec.isIncome ? "income" : "expense"}
              onChange={(e) =>
                setNewRec((r) => ({
                  ...r,
                  isIncome: e.target.value === "income",
                }))
              }
            >
              <option value="expense">Tagihan / Pengeluaran Bulanan</option>
              <option value="income">Gaji / Pemasukan Bulanan</option>
            </Input>
          </div>
          <div className="mb-3">
            <Label>Nama Jadwal</Label>
            <Input
              value={newRec.title}
              onChange={(e) =>
                setNewRec((r) => ({ ...r, title: e.target.value }))
              }
              placeholder="Contoh: Listrik PLN, WiFi Rumah, Gaji Pokok"
            />
          </div>
          <Row className="g-2 mb-3">
            <Col sm={8}>
              <Label>Nominal (Rp)</Label>
              <Input
                value={formatNumberInput(newRec.amount)}
                onChange={(e) =>
                  setNewRec((r) => ({
                    ...r,
                    amount: onlyDigits(e.target.value),
                  }))
                }
              />
            </Col>
            <Col sm={4}>
              <Label>Tanggal (1-31)</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={newRec.dayOfMonth}
                onChange={(e) =>
                  setNewRec((r) => ({ ...r, dayOfMonth: e.target.value }))
                }
              />
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setRecModalOpen(false)}>
            Batal
          </Button>
          <Button color="primary" onClick={handleAddRecurring}>
            Simpan Jadwal
          </Button>
        </ModalFooter>
      </Modal>

      {/* Add Debt Modal */}
      <Modal
        isOpen={debtModalOpen}
        toggle={() => setDebtModalOpen(false)}
        centered
      >
        <ModalHeader toggle={() => setDebtModalOpen(false)}>
          Catat Piutang / Utang Baru
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <Label>Jenis Catatan</Label>
            <Input
              type="select"
              value={newDebt.isReceivable ? "receivable" : "payable"}
              onChange={(e) =>
                setNewDebt((d) => ({
                  ...d,
                  isReceivable: e.target.value === "receivable",
                }))
              }
            >
              <option value="receivable">Piutang (Teman Pinjam ke Saya)</option>
              <option value="payable">Utang (Saya Pinjam)</option>
            </Input>
          </div>
          <div className="mb-3">
            <Label>Nama Teman / Pihak Terkait</Label>
            <Input
              value={newDebt.personName}
              onChange={(e) =>
                setNewDebt((d) => ({ ...d, personName: e.target.value }))
              }
              placeholder="Contoh: Budi, Andi"
            />
          </div>
          <div className="mb-3">
            <Label>No. WhatsApp (Opsional)</Label>
            <Input
              value={newDebt.phone}
              onChange={(e) =>
                setNewDebt((d) => ({ ...d, phone: e.target.value }))
              }
              placeholder="0812xxxxxxxx"
            />
          </div>
          <div className="mb-3">
            <Label>Nominal (Rp)</Label>
            <Input
              value={formatNumberInput(newDebt.amount)}
              onChange={(e) =>
                setNewDebt((d) => ({
                  ...d,
                  amount: onlyDigits(e.target.value),
                }))
              }
            />
          </div>
          <div>
            <Label>Catatan (Opsional)</Label>
            <Input
              value={newDebt.note}
              onChange={(e) =>
                setNewDebt((d) => ({ ...d, note: e.target.value }))
              }
              placeholder="Contoh: Patungan makan malam"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setDebtModalOpen(false)}>
            Batal
          </Button>
          <Button color="primary" onClick={handleAddDebt}>
            Simpan Catatan
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default SadarFinancialPlans;
