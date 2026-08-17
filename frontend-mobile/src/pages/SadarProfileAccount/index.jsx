import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { Wallet, PieChart } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Progress,
  Row,
} from "reactstrap";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { profileSuccess } from "../../slices/auth/profile/reducer";
import {
  accountApi,
  analyticsApi,
  authApi,
  incomeApi,
} from "../../Components/services/api";
import AccountFormModal from "../../Components/AccountModal/AccountFormModal";
import { getStoredAuthUser, updateStoredAuthUser } from "../../helpers/auth-storage";
import { findInstitutionByName, inferAccountType } from "../../constants/bankData";
import { formatAccountNumberInput } from "../../utils/accountValidation";

import "../SadarShared/sadar-pages.css";

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

const sumBy = (rows, getValue) =>
  rows.reduce((total, row) => total + getValue(row), 0);

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

const showAccountAlert = ({ icon, title, text }) =>
  Swal.fire({
    icon,
    title,
    text,
    confirmButtonText: "Mengerti",
    buttonsStyling: false,
    customClass: {
      popup: "sadar-swal-popup",
      title: "sadar-swal-title",
      htmlContainer: "sadar-swal-text",
      confirmButton: "btn btn-primary",
    },
  });

const getStoredUserProfile = () => {
  try {
    const authUser = getStoredAuthUser();
    const user = authUser?.user || authUser?.data?.user || {};
    const firstName = user.first_name || user.firstName || "";
    const lastName = user.last_name || user.lastName || "";
    const cleanLastName =
      lastName === "User" || lastName === "user" ? "" : lastName;
    const name =
      `${firstName} ${cleanLastName}`.trim() ||
      user.name ||
      user.username ||
      user.email ||
      defaultProfile.name;

    return {
      id: user.users_id || user.id || defaultProfile.id,
      name,
      email: user.email || defaultProfile.email,
      avatar: user.profile_picture || user.profilePicture || "",
    };
  } catch {
    return defaultProfile;
  }
};

const normalizeProfile = (user) => {
  const firstName = user?.first_name || user?.firstName || "";
  const lastName = user?.last_name || user?.lastName || "";
  const cleanLastName =
    lastName === "User" || lastName === "user" ? "" : lastName;
  return {
    id: user?.users_id || user?.id || defaultProfile.id,
    name:
      `${firstName} ${cleanLastName}`.trim() ||
      user?.email ||
      defaultProfile.name,
    email: user?.email || defaultProfile.email,
    avatar: user?.profile_picture || user?.profilePicture || "",
  };
};

const updateSessionUser = (updatedUser) => {
  try {
    updateStoredAuthUser((authData) => {
      if (authData.user) {
        authData.user = { ...authData.user, ...updatedUser };
      } else if (authData.data && authData.data.user) {
        authData.data.user = { ...authData.data.user, ...updatedUser };
      } else if (authData.data) {
        authData.data = { ...authData.data, ...updatedUser };
      } else {
        Object.assign(authData, updatedUser);
      }
      return authData;
    });
  } catch (e) {
    console.error("Failed to update stored user session", e);
  }
};

const normalizeAccount = (account) => {
  const name = account.account_name || account.accountName || account.name || "Akun";
  const inferredType = account.account_type || account.type || inferAccountType(name);
  return {
    id: account.account_id || account.id,
    name,
    type: inferredType,
    balance: Number(account.balance || 0),
    accountNumber: account.account_number || account.accountNumber || "",
    isPersisted: Boolean(account.account_id || account.id),
  };
};

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
    {
      category: "Needs",
      label: "Kebutuhan",
      helper: "Kebutuhan utama",
      percent: 50,
    },
    {
      category: "Wants",
      label: "Keinginan",
      helper: "Keinginan dan hiburan",
      percent: 30,
    },
    {
      category: "Savings",
      label: "Tabungan",
      helper: "Tabungan dan dana darurat",
      percent: 20,
    },
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
          ? {
              ...account,
              [field]: field === "balance" ? Number(value || 0) : value,
            }
          : account,
      ),
    );
  };

  const deleteAccount = (id) => {
    if (accounts.length <= 1) {
      setAccountNotice(
        "Minimal satu akun diperlukan untuk mencatat pemasukan dan transaksi.",
      );
      return;
    }

    const selectedAccount = accounts.find((account) => account.id === id);
    setPendingDeleteAccount(selectedAccount || null);
  };

  const confirmDeleteAccount = () => {
    if (!pendingDeleteAccount) return;

    setAccounts((items) =>
      items.filter((account) => account.id !== pendingDeleteAccount.id),
    );
    setAccountNotice("");
    setPendingDeleteAccount(null);
  };

  const updateBudget = (category, value) => {
    setIsBudgetSaved(false);
    setBudgetNotice("");
    setBudgetRows((items) =>
      items.map((budget) =>
        budget.category === category
          ? { ...budget, limit: Number(value || 0) }
          : budget,
      ),
    );
  };

  const saveBudget = () => {
    const hasEmptyBudget = budgetRows.some(
      (budget) => Number(budget.limit) <= 0,
    );

    if (hasEmptyBudget) {
      setIsBudgetSaved(false);
      setBudgetNotice(
        "Isi nominal anggaran untuk kebutuhan, keinginan, dan tabungan terlebih dahulu.",
      );
      return;
    }

    setBudgetNotice("");
    setIsBudgetSaved(true);
  };

  return (
    <div className="page-content sadar-page sadar-profile-page">
      <Container fluid>
        <Row className="g-3">
          <Col xl={5}>
            <Card className="sadar-panel sadar-profile-panel h-100">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Data Profil</h4>
                  <p className="text-muted mb-0">
                    Ringkasan identitas akun SADAR kamu
                  </p>
                </div>
              </CardHeader>
              <CardBody className="sadar-profile-body">
                <div className="sadar-profile-photo-row">
                  <div className="sadar-profile-avatar">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Foto profil" />
                    ) : (
                      profile.name.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div className="sadar-profile-photo-copy">
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
                    <strong>
                      {rupiah(sumBy(accounts, (account) => account.balance))}
                    </strong>
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
                  <p className="text-muted mb-0">
                    Tunai, bank, dan dompet digital yang kamu pakai
                  </p>
                </div>
                {accounts.length > 0 && (
                  <Button color="primary" size="sm" onClick={addAccount}>
                    <i className="ri-add-line align-bottom me-1"></i>
                    Tambah Akun
                  </Button>
                )}
              </CardHeader>
              <CardBody className="sadar-account-body">
                {accountNotice && (
                  <div className="alert alert-warning py-2 mb-3">
                    {accountNotice}
                  </div>
                )}
                {accounts.length === 0 ? (
                  <div className="sadar-empty-state sadar-empty-state-center">
                    <span className="sadar-empty-state-icon">
                      <Wallet className="h-5 w-5" />
                    </span>
                    <h4>Belum ada akun yang ditambahkan.</h4>
                    <p>
                      Tambahkan sumber uang pertama agar pemasukan dan transaksi
                      bisa tercatat dengan benar.
                    </p>
                    <Button color="primary" onClick={addAccount}>
                      Tambah Akun
                    </Button>
                  </div>
                ) : (
                  <div className="sadar-insight-list sadar-account-list">
                    {accounts.map((account) => (
                      <div
                        className="sadar-insight-item sadar-account-item"
                        key={account.id}
                      >
                        <span className="sadar-card-icon">
                          <i
                            className={
                              account.type === "Bank"
                                ? "ri-bank-line"
                                : account.type === "E-wallet"
                                  ? "ri-wallet-3-line"
                                  : "ri-cash-line"
                            }
                          ></i>
                        </span>
                        <div className="sadar-account-fields">
                          <div className="sadar-form-grid sadar-account-form-grid">
                            <div>
                              <Label>Nama Akun</Label>
                              <Input
                                value={account.name}
                                onChange={(event) =>
                                  updateAccount(
                                    account.id,
                                    "name",
                                    event.target.value,
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label>Tipe</Label>
                              <Input
                                type="select"
                                value={account.type}
                                onChange={(event) =>
                                  updateAccount(
                                    account.id,
                                    "type",
                                    event.target.value,
                                  )
                                }
                              >
                                {accountTypes.map((type) => (
                                  <option key={type.value} value={type.value}>
                                    {type.label}
                                  </option>
                                ))}
                              </Input>
                            </div>
                            <div>
                              <Label>Saldo Berjalan</Label>
                              <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9.]*"
                                value={formatNumberInput(account.balance)}
                                onChange={(event) =>
                                  updateAccount(
                                    account.id,
                                    "balance",
                                    onlyDigits(event.target.value),
                                  )
                                }
                                placeholder="Contoh: 500.000"
                              />
                            </div>
                            <div className="d-flex align-items-end justify-content-end gap-2">
                              <Button
                                color="light"
                                className="text-danger"
                                onClick={() => deleteAccount(account.id)}
                              >
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
                  <p className="text-muted mb-0">
                    Alokasi berdasarkan prinsip 50/30/20 dari pemasukan bulan
                    ini.
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                {!isBudgetOpen ? (
                  <div className="sadar-empty-state sadar-empty-state-center">
                    <span className="sadar-empty-state-icon">
                      <PieChart className="h-5 w-5" />
                    </span>
                    <h4>Anggaran belum diatur.</h4>
                    <p>
                      Prinsip 50/30/20 membantu membagi pemasukan menjadi 50%
                      kebutuhan, 30% keinginan, dan 20% tabungan.
                    </p>
                    <Button
                      color="primary"
                      onClick={() => setIsBudgetOpen(true)}
                    >
                      Atur Anggaran 50/30/20
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="sadar-budget-helper mb-3">
                      <strong>Atur alokasi awal</strong>
                      <span>
                        Gunakan prinsip 50/30/20 sebagai patokan, lalu isi
                        nominal anggaran sesuai rencana bulan ini.
                      </span>
                    </div>
                    {budgetNotice && (
                      <div className="alert alert-warning py-2 mb-3">
                        {budgetNotice}
                      </div>
                    )}
                    <div className="sadar-budget-grid">
                      {budgetRows.map((budget) => {
                        const target = budgetTargets.find(
                          (item) => item.category === budget.category,
                        );
                        return (
                          <div
                            className="sadar-insight-item d-block"
                            key={budget.id}
                          >
                            <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                              <div>
                                <strong>{target?.label}</strong>
                                <p>{target?.helper}</p>
                              </div>
                              <span className="sadar-score-status">
                                {target?.percent}%
                              </span>
                            </div>
                            <Label>Batas Anggaran</Label>
                            <Input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9.]*"
                              value={formatNumberInput(budget.limit)}
                              onChange={(event) =>
                                updateBudget(
                                  budget.category,
                                  onlyDigits(event.target.value),
                                )
                              }
                              placeholder="Contoh: 2.500.000"
                            />
                            <p className="text-muted mt-2 mb-0">
                              Isi nominal anggaran sesuai rencana bulananmu.
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
                      <Button color="primary" onClick={saveBudget}>
                        Simpan Anggaran
                      </Button>
                      {isBudgetSaved && (
                        <span className="text-success fw-semibold">
                          Anggaran berhasil disimpan.
                        </span>
                      )}
                    </div>
                  </>
                )}
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
            Akun <strong>{pendingDeleteAccount?.name || "ini"}</strong> akan
            dihapus dari daftar pengaturan awal kamu. Tindakan ini tidak bisa
            dibatalkan.
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

const budgetTargets = [
  {
    category: "Needs",
    label: "Kebutuhan (Needs)",
    shortLabel: "Kebutuhan",
    helper: "Kebutuhan esensial & wajib hidup",
    percent: 50,
    icon: "ri-shopping-basket-2-line",
    theme: "primary",
    color: "#0284c7",
    examples: "Makanan pokok, sewa rumah/kos, listrik, air, transportasi, kesehatan",
    description: "Alokasikan maksimal 50% dari pemasukan untuk kebutuhan pokok yang wajib dipenuhi.",
  },
  {
    category: "Wants",
    label: "Keinginan (Wants)",
    shortLabel: "Keinginan",
    helper: "Gaya hidup, hiburan & hobi",
    percent: 30,
    icon: "ri-cup-line",
    theme: "purple",
    color: "#8b5cf6",
    examples: "Nongkrong/kafe, belanja fashion, langganan streaming, liburan & hobi",
    description: "Batasi pengeluaran gaya hidup maksimal 30% agar kamu bisa menikmati hidup tanpa boros.",
  },
  {
    category: "Savings",
    label: "Tabungan & Investasi (Savings)",
    shortLabel: "Tabungan",
    helper: "Proteksi & aset masa depan",
    percent: 20,
    icon: "ri-safe-2-line",
    theme: "success",
    color: "#10b981",
    examples: "Dana darurat (3-6x pengeluaran), tabungan berjangka, reksadana, saham",
    description: "Sisihkan minimal 20% sejak awal untuk membangun dana darurat dan investasi masa depan.",
  },
];

const SadarLoadingScreen = () => {
  return (
    <div className="page-content sadar-page sadar-loading-screen d-flex align-items-center justify-content-center">
      <div className="text-center">
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: "2.5rem", height: "2.5rem" }}
        >
          <span className="visually-hidden">Memuat...</span>
        </div>
        <p className="mt-3 text-muted fw-semibold">Memuat profil dan akun...</p>
      </div>
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
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [openActionAccountId, setOpenActionAccountId] = useState("");
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isEditAccountOpen, setIsEditAccountOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [budgetRows, setBudgetRows] = useState([]);
  const [budgetNotice, setBudgetNotice] = useState("");
  const [isBudgetSaved, setIsBudgetSaved] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [showEduGuide, setShowEduGuide] = useState(true);

  const dispatch = useDispatch();
  const [profile, setProfile] = useState(getStoredUserProfile);
  const totalBalance = useMemo(
    () => sumBy(accounts, (account) => account.balance),
    [accounts],
  );
  const selectedActionAccount = useMemo(
    () => accounts.find((account) => account.id === openActionAccountId) || null,
    [accounts, openActionAccountId],
  );
  const totalIncome = useMemo(
    () => sumBy(budgetRows, (budget) => budget.limit),
    [budgetRows],
  );

  useEffect(() => {
    let isMounted = true;

    const loadProfileAccount = async () => {
      try {
        const [profileResponse, accountRows, budgetResponse, incomeList] =
          await Promise.all([
            authApi.me(),
            accountApi.list(),
            analyticsApi.latestBudget().catch(() => null),
            incomeApi.list({ limit: 100 }).catch(() => []),
          ]);

        if (isMounted) {
          const normalizedAccounts = (accountRows || []).map(normalizeAccount);
          const apiBudgetRows = buildBudgetRows(budgetResponse);

          const nowMonth = new Date().toISOString().slice(0, 7);
          const currentMonthIncomes = (incomeList || []).filter((inc) => {
            const incDate = String(inc.income_date || inc.incomeDate || inc.date || "").slice(0, 7);
            return incDate === nowMonth;
          });
          const totalMonthlyInc = currentMonthIncomes.length
            ? sumBy(currentMonthIncomes, (item) => Number(item.amount || 0))
            : (incomeList && incomeList.length ? sumBy(incomeList.slice(0, 5), (item) => Number(item.amount || 0)) : 0);
          setMonthlyIncome(totalMonthlyInc);

          setProfile(normalizeProfile(profileResponse));
          updateSessionUser(profileResponse);
          dispatch(
            profileSuccess({ data: profileResponse, status: "success" }),
          );
          setAccounts(normalizedAccounts);
          setBudgetRows(
            apiBudgetRows.length
              ? apiBudgetRows
              : budgetTargets.map((item) => {
                  return {
                    id: `budget_${item.category}`,
                    category: item.category,
                    label: item.label,
                    limit: 0,
                    used: 0,
                  };
                }),
          );
        }
      } catch {
        if (isMounted) {
          setAccounts([]);
          setBudgetRows([]);
          setAccountNotice("Data dari backend belum bisa dimuat.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfileAccount();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!selectedActionAccount) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpenActionAccountId("");
    };

    document.body.classList.add("sadar-account-actions-open");
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.classList.remove("sadar-account-actions-open");
      document.removeEventListener("keydown", handleEscape);
    };
  }, [selectedActionAccount]);

  const openAddAccountModal = () => {
    setAccountNotice("");
    setIsAddAccountOpen(true);
  };

  const closeAddAccountModal = () => {
    if (isSavingAccount) return;
    setIsAddAccountOpen(false);
  };

  const handleSaveAddAccount = async (formData) => {
    const { name, accountNumber, balance, type } = formData;
    setIsSavingAccount(true);
    setAccountNotice("");

    try {
      const account = await accountApi.create({
        accountName: name,
        accountNumber,
        balance,
      });

      setAccounts((items) => [
        ...items,
        {
          ...normalizeAccount(account),
          name,
          type,
          balance,
          accountNumber,
        },
      ]);
      setIsAddAccountOpen(false);
      await showAccountAlert({
        icon: "success",
        title: "Akun berhasil ditambahkan",
        text: `${name} sudah masuk ke daftar akun kamu.`,
      });
    } catch (error) {
      const message = error?.message || "Akun gagal dibuat.";
      setAccountNotice(message);
      await showAccountAlert({
        icon: "error",
        title: "Akun gagal disimpan",
        text: message,
      });
    } finally {
      setIsSavingAccount(false);
    }
  };

  const openEditAccountModal = (account) => {
    setAccountNotice("");
    setOpenActionAccountId("");
    setEditingAccount(account);
    setIsEditAccountOpen(true);
  };

  const closeEditAccountModal = () => {
    if (isSavingAccount) return;
    setIsEditAccountOpen(false);
    setEditingAccount(null);
  };

  const handleSaveEditAccount = async (formData) => {
    if (!editingAccount) return;
    const { name, accountNumber, balance, type } = formData;
    setIsSavingAccount(true);
    setAccountNotice("");

    try {
      await accountApi.update(editingAccount.id, {
        accountName: name,
        accountNumber,
        balance,
      });

      setAccounts((items) =>
        items.map((acc) =>
          acc.id === editingAccount.id
            ? {
                ...acc,
                name,
                type,
                balance,
                accountNumber,
              }
            : acc,
        ),
      );
      setIsEditAccountOpen(false);
      setEditingAccount(null);
      await showAccountAlert({
        icon: "success",
        title: "Akun berhasil diperbarui",
        text: `${name} sudah diperbarui.`,
      });
    } catch (error) {
      const message = error?.message || "Akun gagal diperbarui.";
      setAccountNotice(message);
      await showAccountAlert({
        icon: "error",
        title: "Akun gagal disimpan",
        text: message,
      });
    } finally {
      setIsSavingAccount(false);
    }
  };

  const deleteAccount = (id) => {
    setOpenActionAccountId("");
    if (accounts.length <= 1) {
      setAccountNotice(
        "Minimal satu akun diperlukan untuk mencatat pemasukan dan transaksi.",
      );
      return;
    }

    const selectedAccount = accounts.find((account) => account.id === id);
    setDeleteConfirmText("");
    setPendingDeleteAccount(selectedAccount || null);
  };

  const confirmDeleteAccount = async () => {
    if (!pendingDeleteAccount) return;

    try {
      await accountApi.remove(pendingDeleteAccount.id);
      setAccounts((items) =>
        items.filter((account) => account.id !== pendingDeleteAccount.id),
      );
      setAccountNotice("");
      setPendingDeleteAccount(null);
      setDeleteConfirmText("");
    } catch (error) {
      setAccountNotice(error?.message || "Akun gagal dihapus.");
      setPendingDeleteAccount(null);
      setDeleteConfirmText("");
    }
  };

  const updateBudget = (category, value) => {
    setBudgetNotice("");
    setIsBudgetSaved(false);
    setBudgetRows((items) =>
      items.map((budget) =>
        budget.category === category
          ? { ...budget, limit: Number(value || 0) }
          : budget,
      ),
    );
  };

  const applyBudgetTarget = () => {
    setBudgetNotice("");
    setIsBudgetSaved(false);
    const baseIncome = monthlyIncome > 0 ? monthlyIncome : (totalIncome > 0 ? totalIncome : 10000000);
    setBudgetRows((items) =>
      items.map((budget) => {
        const target = budgetTargets.find(
          (item) => item.category === budget.category,
        );
        return {
          ...budget,
          limit: target
            ? Math.round((baseIncome * target.percent) / 100)
            : budget.limit,
        };
      }),
    );
  };

  const saveBudget = async () => {
    const hasEmptyBudget = budgetRows.some(
      (budget) => Number(budget.limit) <= 0,
    );

    if (hasEmptyBudget) {
      setIsBudgetSaved(false);
      setBudgetNotice(
        "Isi nominal anggaran untuk kebutuhan, keinginan, dan tabungan terlebih dahulu.",
      );
      return;
    }

    try {
      const needsAmount = Number(
        budgetRows.find((budget) => budget.category === "Needs")?.limit || 0,
      );
      const wantsAmount = Number(
        budgetRows.find((budget) => budget.category === "Wants")?.limit || 0,
      );
      const savingsAmount = Number(
        budgetRows.find((budget) => budget.category === "Savings")?.limit || 0,
      );

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

  if (isLoading) {
    return <SadarLoadingScreen />;
  }

  return (
    <div className="page-content sadar-page sadar-profile-page">
      <Container fluid>
        <Row className="g-3">
          <Col xl={5}>
            <Card className="sadar-panel sadar-profile-panel h-100">
              <CardHeader className="d-flex align-items-center justify-content-between">
                <div>
                  <h4 className="card-title mb-1">Data Profil</h4>
                  <p className="text-muted mb-0">
                    Ringkasan identitas akun SADAR kamu
                  </p>
                </div>
                <Button
                  tag={Link}
                  to="/profile-account/edit"
                  color="light"
                  size="sm"
                  className="sadar-table-action sadar-profile-edit-button"
                  aria-label="Edit profil"
                >
                  <i className="ri-pencil-line" aria-hidden="true"></i>
                </Button>
              </CardHeader>
              <CardBody className="sadar-profile-body">
                <div className="sadar-profile-photo-row">
                  <div className="sadar-profile-avatar">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Foto profil" />
                    ) : (
                      profile.name.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div className="sadar-profile-photo-copy">
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
                  <p className="text-muted mb-0">
                    Tunai, bank, dan dompet digital yang kamu pakai
                  </p>
                </div>
                <Button
                  color="primary"
                  size="sm"
                  className="sadar-add-account-btn"
                  onClick={openAddAccountModal}
                >
                  <i className="ri-add-line align-bottom me-1"></i>
                  Tambah Akun
                </Button>
              </CardHeader>
              <CardBody className="sadar-account-body">
                {accountNotice && (
                  <div className="alert alert-warning py-2 mb-3">
                    {accountNotice}
                  </div>
                )}
                <div className="sadar-insight-list sadar-account-list">
                  {accounts.map((account) => {
                    const inst = findInstitutionByName(account.name);
                    const icon = inst
                      ? inst.icon
                      : account.type === "Bank"
                        ? "ri-bank-line"
                        : account.type === "E-wallet"
                          ? "ri-wallet-3-line"
                          : "ri-cash-line";
                    return (
                      <div
                        className="sadar-insight-item sadar-account-item d-flex align-items-center justify-content-between gap-3 p-3 mb-2 rounded-3 border"
                        key={account.id}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <span className="sadar-card-icon fs-20 d-flex align-items-center justify-content-center">
                            <i className={icon} aria-hidden="true"></i>
                          </span>
                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <h6 className="mb-0 fw-semibold text-dark">{account.name}</h6>
                              <span className="sadar-account-type-badge">
                                {account.type}
                              </span>
                            </div>
                            <p className="text-muted fs-12 mb-0 mt-1">
                              {account.accountNumber
                                ? `${account.type === "Bank" ? "No. Rekening" : "No. Akun"}: ${formatAccountNumberInput(account.accountNumber, account.type)}`
                                : "Tanpa nomor akun"}
                            </p>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-3">
                          <div className="text-end">
                            <span className="text-muted fs-11 d-block">Saldo Berjalan</span>
                            <strong className="fs-14 text-dark">{rupiah(account.balance)}</strong>
                          </div>
                          <Button
                            type="button"
                            className="sadar-row-action-toggle btn-sm"
                            color="light"
                            aria-label={`Aksi untuk ${account.name}`}
                            aria-expanded={openActionAccountId === account.id}
                            onClick={() =>
                              setOpenActionAccountId(
                                openActionAccountId === account.id ? "" : account.id,
                              )
                            }
                          >
                            <i className="ri-more-fill" aria-hidden="true"></i>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="g-3 mt-1">
          <Col xl={12}>
            <Card className="sadar-panel sadar-budget-panel" id="atur-budget">
              <CardHeader className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                  <div>
                    <h4 className="card-title mb-1">Atur Anggaran Bulanan</h4>
                    <p className="text-muted mb-0">
                      Alokasi terencana berdasarkan metode finansial 50/30/20 dari pemasukanmu.
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <Button
                    color="primary"
                    className="sadar-apply-rule-btn d-flex align-items-center gap-1"
                    onClick={applyBudgetTarget}
                  >
                    <i className="ri-magic-line"></i>
                    <span>Terapkan 50/30/20</span>
                  </Button>
                  <Button
                    color="light"
                    className="sadar-toggle-edu-btn d-flex align-items-center gap-1"
                    onClick={() => setShowEduGuide(!showEduGuide)}
                  >
                    <i className={showEduGuide ? "ri-eye-off-line" : "ri-book-open-line"}></i>
                    <span>{showEduGuide ? "Tutup Edukasi" : "Pelajari 50/30/20"}</span>
                  </Button>
                </div>
              </CardHeader>

              <CardBody>
                {budgetNotice && (
                  <div className="alert alert-warning py-2 mb-3 d-flex align-items-center gap-2">
                    <i className="ri-alert-line fs-18"></i>
                    <span>{budgetNotice}</span>
                  </div>
                )}

                {/* Educational 50/30/20 Breakdown Banner */}
                {showEduGuide && (
                  <div className="sadar-edu-guide-banner mb-4 p-3 p-md-4 rounded-3 border">
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom flex-wrap gap-2">
                      <div className="d-flex align-items-center gap-2">
                        <span className="sadar-edu-badge">
                          <i className="ri-lightbulb-flash-line text-warning me-1"></i>
                          Edukasi Finansial
                        </span>
                        <h5 className="mb-0 fw-bold sadar-edu-title">
                          Mengenal Formula Budgeting 50/30/20
                        </h5>
                      </div>
                      <span className="text-muted fs-12">
                        {monthlyIncome > 0 ? (
                          <>Pemasukan Acuan: <strong className="text-primary fs-13">{rupiah(monthlyIncome)}</strong></>
                        ) : (
                          <>Prinsip Pembagian Ideal dari Total Pemasukan Bersih</>
                        )}
                      </span>
                    </div>

                    <Row className="g-3">
                      <Col md={4}>
                        <div className="sadar-edu-pillar-card p-3 rounded-3 h-100 border-needs">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="fw-bold fs-14 text-primary d-flex align-items-center gap-1">
                              <i className="ri-shopping-basket-2-line"></i> 50% Kebutuhan (Needs)
                            </span>
                            <span className="badge bg-primary-subtle text-primary fw-bold">Wajib</span>
                          </div>
                          <p className="fs-12 text-muted mb-2">
                            Kebutuhan pokok dan tagihan rutin yang mutlak dipenuhi untuk bertahan hidup & bekerja.
                          </p>
                          <div className="sadar-edu-examples fs-11 text-muted">
                            <span className="fw-semibold text-dark">Contoh:</span> Makanan pokok, sewa tempat tinggal, listrik & air, transport, kesehatan.
                          </div>
                        </div>
                      </Col>

                      <Col md={4}>
                        <div className="sadar-edu-pillar-card p-3 rounded-3 h-100 border-wants">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="fw-bold fs-14 text-purple d-flex align-items-center gap-1">
                              <i className="ri-cup-line"></i> 30% Keinginan (Wants)
                            </span>
                            <span className="badge bg-purple-subtle text-purple fw-bold">Fleksibel</span>
                          </div>
                          <p className="fs-12 text-muted mb-2">
                            Pengeluaran gaya hidup, kenyamanan, dan hiburan yang memperkaya kualitas hidup.
                          </p>
                          <div className="sadar-edu-examples fs-11 text-muted">
                            <span className="fw-semibold text-dark">Contoh:</span> Kulineran/kafe, belanja fashion, streaming film/musik, hobi & liburan.
                          </div>
                        </div>
                      </Col>

                      <Col md={4}>
                        <div className="sadar-edu-pillar-card p-3 rounded-3 h-100 border-savings">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="fw-bold fs-14 text-success d-flex align-items-center gap-1">
                              <i className="ri-safe-2-line"></i> 20% Tabungan (Savings)
                            </span>
                            <span className="badge bg-success-subtle text-success fw-bold">Masa Depan</span>
                          </div>
                          <p className="fs-12 text-muted mb-2">
                            Pos paling penting yang disisihkan pertama kali untuk keamanan & pertumbuhan aset masa depan.
                          </p>
                          <div className="sadar-edu-examples fs-11 text-muted">
                            <span className="fw-semibold text-dark">Contoh:</span> Dana darurat (3-6x bulanan), tabungan berjangka, investasi reksadana/saham.
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}

                {/* 3 Budget Bucket Cards */}
                <div className="sadar-budget-grid">
                  {budgetRows.map((budget) => {
                    const target = budgetTargets.find(
                      (item) => item.category === budget.category,
                    ) || {
                      label: budget.label,
                      shortLabel: budget.label,
                      percent: 0,
                      icon: "ri-wallet-3-line",
                      helper: "",
                      examples: "",
                      theme: "primary",
                    };
                    const usage = budget.limit
                      ? (budget.used / budget.limit) * 100
                      : 0;
                    const remaining = Math.max(0, budget.limit - budget.used);

                    return (
                      <div
                        className={`sadar-budget-card sadar-budget-card-${target.theme || "primary"}`}
                        key={budget.id}
                      >
                        <div className="sadar-budget-card-header mb-3">
                          <div className="d-flex align-items-start gap-2 mb-1">
                            <span className={`sadar-budget-category-icon bg-${target.theme || "primary"}-subtle text-${target.theme || "primary"}`}>
                              <i className={target.icon}></i>
                            </span>
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center justify-content-between">
                                <h5 className="mb-0 fw-bold fs-15 sadar-budget-title">
                                  {target.shortLabel || target.label}
                                </h5>
                                <span className={`sadar-budget-target-badge badge bg-${target.theme || "primary"}-subtle text-${target.theme || "primary"}`}>
                                  Target {target.percent}%
                                </span>
                              </div>
                              <p className="text-muted fs-12 mb-0 mt-1">{target.helper}</p>
                            </div>
                          </div>
                          {target.examples && (
                            <div className="sadar-budget-examples-pill text-muted fs-11 mt-2">
                              <i className="ri-information-line me-1 opacity-75"></i>
                              {target.examples}
                            </div>
                          )}
                        </div>

                        <div className="sadar-budget-input-group-container mb-3">
                          <Label className="sadar-budget-input-label">
                            Batas Anggaran Bulanan
                          </Label>
                          <div className="sadar-budget-input-group">
                            <span className="sadar-budget-input-prefix">Rp</span>
                            <Input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9.]*"
                              className="sadar-budget-custom-input"
                              value={formatNumberInput(budget.limit)}
                              onChange={(event) =>
                                updateBudget(
                                  budget.category,
                                  onlyDigits(event.target.value),
                                )
                              }
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div className="sadar-budget-usage-section">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="text-muted fs-12">Terpakai</span>
                            <strong className="fs-13 text-dark sadar-budget-used-text">{rupiah(budget.used)}</strong>
                          </div>
                          <Progress
                            value={Math.min(usage, 100)}
                            color={getBudgetProgressColor(usage)}
                            className="sadar-progress"
                          />
                          <div className="d-flex justify-content-between align-items-center mt-2 fs-11 text-muted">
                            <span>
                              <strong>{usage.toFixed(1)}%</strong> terpakai
                            </span>
                            <span>
                              Sisa: <strong className={remaining === 0 && budget.limit > 0 ? "text-danger" : "text-success"}>{rupiah(remaining)}</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-4 pt-3 border-top">
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted fs-13">Total Alokasi Anggaran:</span>
                    <strong className="fs-15 text-primary">
                      {rupiah(sumBy(budgetRows, (b) => Number(b.limit || 0)))}
                    </strong>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    {isBudgetSaved && (
                      <span className="text-success fw-semibold fs-13 d-flex align-items-center gap-1">
                        <i className="ri-checkbox-circle-fill"></i>
                        Anggaran berhasil disimpan.
                      </span>
                    )}
                    <Button color="primary" className="px-4 py-2 fw-semibold" onClick={saveBudget}>
                      <i className="ri-save-line me-1"></i>
                      Simpan Anggaran
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {selectedActionAccount && createPortal(
        <div className="sadar-account-action-layer">
          <button
            type="button"
            className="sadar-account-action-backdrop"
            onClick={() => setOpenActionAccountId("")}
            aria-label="Tutup menu aksi akun"
          />
          <section
            className="sadar-account-action-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sadar-account-action-title"
          >
            <div className="sadar-account-action-handle" aria-hidden="true" />
            <div className="sadar-account-action-heading">
              <div>
                <span>Kelola akun</span>
                <strong id="sadar-account-action-title">{selectedActionAccount.name}</strong>
              </div>
              <button
                type="button"
                className="sadar-account-action-close"
                onClick={() => setOpenActionAccountId("")}
                aria-label="Tutup menu aksi akun"
              >
                <i className="ri-close-line" aria-hidden="true"></i>
              </button>
            </div>
            <div className="sadar-account-action-buttons">
              <button
                type="button"
                className="sadar-account-action-button is-edit"
                onClick={() => openEditAccountModal(selectedActionAccount)}
              >
                <span aria-hidden="true"><i className="ri-pencil-line"></i></span>
                <span><strong>Ubah akun</strong><small>Perbarui bank, nomor akun, atau saldo</small></span>
                <i className="ri-arrow-right-s-line" aria-hidden="true"></i>
              </button>
              <button
                type="button"
                className="sadar-account-action-button is-delete"
                onClick={() => deleteAccount(selectedActionAccount.id)}
              >
                <span aria-hidden="true"><i className="ri-delete-bin-line"></i></span>
                <span><strong>Hapus akun</strong><small>Hapus akun dari daftar keuangan</small></span>
                <i className="ri-arrow-right-s-line" aria-hidden="true"></i>
              </button>
            </div>
          </section>
        </div>,
        document.body,
      )}

      <AccountFormModal
        isOpen={isAddAccountOpen}
        toggle={closeAddAccountModal}
        mode="add"
        onSave={handleSaveAddAccount}
        isSaving={isSavingAccount}
      />

      <AccountFormModal
        isOpen={isEditAccountOpen}
        toggle={closeEditAccountModal}
        mode="edit"
        initialData={editingAccount}
        onSave={handleSaveEditAccount}
        isSaving={isSavingAccount}
      />

      <Modal
        isOpen={Boolean(pendingDeleteAccount)}
        toggle={() => {
          setPendingDeleteAccount(null);
          setDeleteConfirmText("");
        }}
        centered
        className="sadar-confirm-modal"
      >
        <ModalBody>
          <div className="sadar-confirm-icon danger">
            <i className="ri-delete-bin-line"></i>
          </div>
          <h4>Hapus akun ini?</h4>
          <p>
            Akun <strong>{pendingDeleteAccount?.name || "ini"}</strong> akan
            dihapus dari daftar akun kamu. Tindakan ini tidak bisa dibatalkan.
          </p>
          <div className="mt-3 text-start">
            <Label
              htmlFor="delete-confirm-input"
              className="form-label text-muted fs-13"
            >
              Ketik nama akun <strong>{pendingDeleteAccount?.name}</strong> di
              bawah untuk konfirmasi:
            </Label>
            <Input
              id="delete-confirm-input"
              type="text"
              value={deleteConfirmText}
              onChange={(event) => setDeleteConfirmText(event.target.value)}
              placeholder="Masukkan nama akun"
              autoComplete="off"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="light"
            onClick={() => {
              setPendingDeleteAccount(null);
              setDeleteConfirmText("");
            }}
          >
            Batal
          </Button>
          <Button
            color="danger"
            onClick={confirmDeleteAccount}
            disabled={deleteConfirmText !== pendingDeleteAccount?.name}
          >
            Hapus Akun
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

const ProfileAccount = () => <ProfileAccountWithData />;

export default ProfileAccount;
