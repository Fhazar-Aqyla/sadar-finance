import React, { useEffect, useMemo, useState } from "react";
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
} from "../../Components/services/api";

import "../SadarShared/sadar-pages.css";

const defaultProfile = {
  id: "",
  name: "SADAR",
  email: "",
  avatar: "",
};

const defaultAccountForm = {
  name: "",
  type: "Bank",
  accountNumber: "",
  balance: "",
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
    const authUser = JSON.parse(sessionStorage.getItem("authUser") || "null");
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
    const rawAuth = sessionStorage.getItem("authUser");
    if (!rawAuth) return;
    const authData = JSON.parse(rawAuth);

    if (authData.user) {
      authData.user = { ...authData.user, ...updatedUser };
    } else if (authData.data && authData.data.user) {
      authData.data.user = { ...authData.data.user, ...updatedUser };
    } else if (authData.data) {
      authData.data = { ...authData.data, ...updatedUser };
    } else {
      Object.assign(authData, updatedUser);
    }

    sessionStorage.setItem("authUser", JSON.stringify(authData));
  } catch (e) {
    console.error("Failed to update sessionStorage user", e);
  }
};

const normalizeAccount = (account) => ({
  id: account.account_id || account.id,
  name: account.account_name || account.accountName || account.name || "Akun",
  type: account.account_type || account.type || "Bank",
  balance: Number(account.balance || 0),
  accountNumber: account.account_number || account.accountNumber || "",
  isPersisted: Boolean(account.account_id || account.id),
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
    <div className="page-content sadar-page">
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

const accountTypes = [
  { value: "Cash", label: "Tunai" },
  { value: "Bank", label: "Bank" },
  { value: "E-wallet", label: "Dompet digital" },
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
  const [newAccountForm, setNewAccountForm] = useState(defaultAccountForm);
  const [editAccountForm, setEditAccountForm] = useState(defaultAccountForm);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [budgetRows, setBudgetRows] = useState([]);
  const [budgetNotice, setBudgetNotice] = useState("");
  const [isBudgetSaved, setIsBudgetSaved] = useState(false);

  const dispatch = useDispatch();
  const [profile, setProfile] = useState(getStoredUserProfile);
  const totalBalance = useMemo(
    () => sumBy(accounts, (account) => account.balance),
    [accounts],
  );
  const totalIncome = useMemo(
    () => sumBy(budgetRows, (budget) => budget.limit),
    [budgetRows],
  );

  useEffect(() => {
    let isMounted = true;

    const loadProfileAccount = async () => {
      try {
        const [profileResponse, accountRows, budgetResponse] =
          await Promise.all([
            authApi.me(),
            accountApi.list(),
            analyticsApi.latestBudget().catch(() => null),
          ]);

        if (isMounted) {
          const normalizedAccounts = (accountRows || []).map(normalizeAccount);
          const apiBudgetRows = buildBudgetRows(budgetResponse);

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

  const openAddAccountModal = () => {
    setAccountNotice("");
    setNewAccountForm(defaultAccountForm);
    setIsAddAccountOpen(true);
  };

  const closeAddAccountModal = () => {
    if (isSavingAccount) return;
    setIsAddAccountOpen(false);
    setNewAccountForm(defaultAccountForm);
  };

  const submitNewAccount = async (event) => {
    event.preventDefault();

    const accountName = newAccountForm.name.trim();
    const balance = Number(onlyDigits(newAccountForm.balance));

    if (!accountName) {
      await showAccountAlert({
        icon: "warning",
        title: "Nama akun belum diisi",
        text: "Isi nama akun terlebih dahulu sebelum menyimpan.",
      });
      return;
    }

    setIsSavingAccount(true);
    setAccountNotice("");

    try {
      const account = await accountApi.create({
        accountName,
        accountNumber: newAccountForm.accountNumber.trim(),
        balance,
      });
      setAccounts((items) => [
        ...items,
        {
          ...normalizeAccount(account),
          type: newAccountForm.type,
          balance,
          accountNumber: newAccountForm.accountNumber.trim(),
        },
      ]);
      setIsAddAccountOpen(false);
      setNewAccountForm(defaultAccountForm);
      await showAccountAlert({
        icon: "success",
        title: "Akun berhasil ditambahkan",
        text: `${accountName} sudah masuk ke daftar akun kamu.`,
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
    setEditingAccount(account);
    setEditAccountForm({
      name: account.name,
      type: account.type || "Bank",
      accountNumber: account.accountNumber || "",
      balance: String(account.balance || ""),
    });
    setIsEditAccountOpen(true);
  };

  const closeEditAccountModal = () => {
    if (isSavingAccount) return;
    setIsEditAccountOpen(false);
    setEditingAccount(null);
    setEditAccountForm(defaultAccountForm);
  };

  const submitEditAccount = async (event) => {
    event.preventDefault();

    const accountName = editAccountForm.name.trim();
    const balance = Number(onlyDigits(editAccountForm.balance));

    if (!accountName) {
      await showAccountAlert({
        icon: "warning",
        title: "Nama akun belum diisi",
        text: "Isi nama akun terlebih dahulu sebelum menyimpan.",
      });
      return;
    }

    setIsSavingAccount(true);
    setAccountNotice("");

    try {
      await accountApi.update(editingAccount.id, {
        accountName,
        accountNumber: editAccountForm.accountNumber.trim(),
        balance,
      });

      setAccounts((items) =>
        items.map((acc) =>
          acc.id === editingAccount.id
            ? {
                ...acc,
                name: accountName,
                type: editAccountForm.type,
                balance,
                accountNumber: editAccountForm.accountNumber.trim(),
              }
            : acc,
        ),
      );
      setIsEditAccountOpen(false);
      setEditingAccount(null);
      await showAccountAlert({
        icon: "success",
        title: "Akun berhasil diperbarui",
        text: `${accountName} sudah diperbarui.`,
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
    setBudgetRows((items) =>
      items.map((budget) => {
        const target = budgetTargets.find(
          (item) => item.category === budget.category,
        );
        return {
          ...budget,
          limit: target
            ? Math.round((totalIncome * target.percent) / 100)
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
    <div className="page-content sadar-page">
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
                  className="sadar-table-action"
                  aria-label="Edit profil"
                >
                  <i className="ri-pencil-line align-bottom"></i>
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
                              onBlur={() => persistAccount(account)}
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
                              onBlur={() => persistAccount(account)}
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
                              value={formatNumberInput(account.balance)}
                              readOnly
                            />
                          </div>
                          <div className="d-flex align-items-end justify-content-end">
                            <Dropdown
                              isOpen={openActionAccountId === account.id}
                              toggle={() =>
                                setOpenActionAccountId(
                                  openActionAccountId === account.id
                                    ? ""
                                    : account.id,
                                )
                              }
                            >
                              <DropdownToggle
                                className="sadar-row-action-toggle btn-sm"
                                color="light"
                                aria-label={`Aksi untuk ${account.name}`}
                              >
                                <i className="ri-more-fill align-bottom"></i>
                              </DropdownToggle>
                              <DropdownMenu
                                end
                                className="sadar-row-action-menu"
                              >
                                <DropdownItem
                                  onClick={() => openEditAccountModal(account)}
                                >
                                  <i className="ri-pencil-line align-bottom me-2"></i>
                                  Ubah
                                </DropdownItem>
                                <DropdownItem
                                  className="text-danger"
                                  onClick={() => deleteAccount(account.id)}
                                >
                                  <i className="ri-delete-bin-line align-bottom me-2"></i>
                                  Hapus
                                </DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
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
                  <p className="text-muted mb-0">
                    Alokasi berdasarkan prinsip 50/30/20 dari pemasukan bulan
                    ini.
                  </p>
                </div>
                <Button color="light" onClick={applyBudgetTarget}>
                  Terapkan 50/30/20
                </Button>
              </CardHeader>
              <CardBody>
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
                    const usage = budget.limit
                      ? (budget.used / budget.limit) * 100
                      : 0;
                    return (
                      <div
                        className="sadar-insight-item d-block"
                        key={budget.id}
                      >
                        <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                          <div>
                            <strong>{target?.label || budget.label}</strong>
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
                        />
                        <div className="d-flex justify-content-between mt-3">
                          <span className="text-muted">Terpakai</span>
                          <strong>{rupiah(budget.used)}</strong>
                        </div>
                        <Progress
                          value={Math.min(usage, 100)}
                          color={getBudgetProgressColor(usage)}
                          className="sadar-progress mt-2"
                        />
                        <p className="text-muted mt-2 mb-0">
                          {usage.toFixed(1)}% dari {rupiah(budget.limit)}
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
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal
        isOpen={isAddAccountOpen}
        toggle={closeAddAccountModal}
        centered
        className="sadar-history-modal sadar-account-modal"
      >
        <ModalHeader toggle={closeAddAccountModal}>Tambah Akun</ModalHeader>
        <Form onSubmit={submitNewAccount} noValidate>
          <ModalBody>
            <div className="sadar-history-edit-grid">
              <div>
                <Label htmlFor="new-account-name">Nama Akun</Label>
                <Input
                  id="new-account-name"
                  value={newAccountForm.name}
                  onChange={(event) =>
                    setNewAccountForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Contoh: BCA Utama"
                  autoFocus
                  required
                />
              </div>
              <div>
                <Label htmlFor="new-account-type">Tipe</Label>
                <Input
                  id="new-account-type"
                  type="select"
                  value={newAccountForm.type}
                  onChange={(event) =>
                    setNewAccountForm((current) => ({
                      ...current,
                      type: event.target.value,
                    }))
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
                <Label htmlFor="new-account-number">Nomor Akun</Label>
                <Input
                  id="new-account-number"
                  value={newAccountForm.accountNumber}
                  onChange={(event) =>
                    setNewAccountForm((current) => ({
                      ...current,
                      accountNumber: event.target.value,
                    }))
                  }
                  placeholder="Opsional"
                />
              </div>
              <div>
                <Label htmlFor="new-account-balance">Saldo Awal</Label>
                <Input
                  id="new-account-balance"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9.]*"
                  value={formatNumberInput(newAccountForm.balance)}
                  onChange={(event) =>
                    setNewAccountForm((current) => ({
                      ...current,
                      balance: onlyDigits(event.target.value),
                    }))
                  }
                  placeholder="Contoh: 500.000"
                />
              </div>
            </div>
            <p className="text-muted mb-0 mt-3">
              Akun baru akan disimpan setelah kamu menekan tombol simpan.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              color="light"
              onClick={closeAddAccountModal}
              disabled={isSavingAccount}
            >
              Batal
            </Button>
            <Button type="submit" color="primary" disabled={isSavingAccount}>
              {isSavingAccount ? "Menyimpan..." : "Simpan Akun"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      <Modal
        isOpen={isEditAccountOpen}
        toggle={closeEditAccountModal}
        centered
        className="sadar-history-modal sadar-account-modal"
      >
        <ModalHeader toggle={closeEditAccountModal}>Edit Akun</ModalHeader>
        <Form onSubmit={submitEditAccount} noValidate>
          <ModalBody>
            <div className="sadar-history-edit-grid">
              <div>
                <Label htmlFor="edit-account-name">Nama Akun</Label>
                <Input
                  id="edit-account-name"
                  value={editAccountForm.name}
                  onChange={(event) =>
                    setEditAccountForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Contoh: BCA Utama"
                  autoFocus
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-account-type">Tipe</Label>
                <Input
                  id="edit-account-type"
                  type="select"
                  value={editAccountForm.type}
                  onChange={(event) =>
                    setEditAccountForm((current) => ({
                      ...current,
                      type: event.target.value,
                    }))
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
                <Label htmlFor="edit-account-number">Nomor Akun</Label>
                <Input
                  id="edit-account-number"
                  value={editAccountForm.accountNumber}
                  onChange={(event) =>
                    setEditAccountForm((current) => ({
                      ...current,
                      accountNumber: event.target.value,
                    }))
                  }
                  placeholder="Opsional"
                />
              </div>
              <div>
                <Label htmlFor="edit-account-balance">Saldo Berjalan</Label>
                <Input
                  id="edit-account-balance"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9.]*"
                  value={formatNumberInput(editAccountForm.balance)}
                  onChange={(event) =>
                    setEditAccountForm((current) => ({
                      ...current,
                      balance: onlyDigits(event.target.value),
                    }))
                  }
                  placeholder="Contoh: 500.000"
                />
              </div>
            </div>
            <p className="text-muted mb-0 mt-3">
              Perubahan akun akan disimpan setelah kamu menekan tombol simpan.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              color="light"
              onClick={closeEditAccountModal}
              disabled={isSavingAccount}
            >
              Batal
            </Button>
            <Button type="submit" color="primary" disabled={isSavingAccount}>
              {isSavingAccount ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

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
