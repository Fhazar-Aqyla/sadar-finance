import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  FormFeedback,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Nav,
  NavItem,
  NavLink,
  Row,
  Progress,
} from "reactstrap";
import { useDispatch } from "react-redux";
import { profileSuccess } from "../../slices/auth/profile/reducer";
import { authApi } from "../../Components/services/api";
import "../SadarShared/sadar-pages.css";

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

const defaultProfile = {
  firstName: "",
  lastName: "",
  name: "Pengguna SADAR",
  email: "",
  avatar: "",
  phoneNumber: "",
  dateOfBirth: "",
  address: "",
  occupation: "",
  gender: "",
};

const resolveAvatarUrl = (url) => {
  if (!url) return "";
  if (/^(https?:|data:)/i.test(url)) return url;
  const serverUrl = "http://localhost:3000";
  return `${serverUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

const normalizeProfile = (user) => {
  const firstName = user?.first_name || user?.firstName || "";
  const lastName = user?.last_name || user?.lastName || "";
  const cleanLastName = (lastName === "User" || lastName === "user") ? "" : lastName;
  const rawAvatar = user?.profile_picture || user?.profilePicture || "";
  
  return {
    firstName: firstName,
    lastName: cleanLastName,
    name: `${firstName} ${cleanLastName}`.trim() || user?.email || "Pengguna SADAR",
    email: user?.email || "",
    avatar: resolveAvatarUrl(rawAvatar),
    phoneNumber: user?.phone_number || user?.phoneNumber || "",
    dateOfBirth: user?.date_of_birth ? String(user.date_of_birth || "").slice(0, 10) : "",
    address: user?.address || "",
    occupation: user?.occupation || "",
    gender: user?.gender || "",
  };
};

const ProfileEdit = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    document.title = "Edit Profil | SADAR Finance";
  }, []);

  const [profile, setProfile] = useState({
    firstName: defaultProfile.firstName,
    lastName: defaultProfile.lastName,
    name: defaultProfile.name,
    email: defaultProfile.email,
    avatar: defaultProfile.avatar,
    phoneNumber: defaultProfile.phoneNumber,
    dateOfBirth: defaultProfile.dateOfBirth,
    address: defaultProfile.address,
    occupation: defaultProfile.occupation,
    gender: defaultProfile.gender,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [activeTab, setActiveTab] = useState("details");

  const [avatarFile, setAvatarFile] = useState(null);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [avatarNotice, setAvatarNotice] = useState(null);

  const [isSavingIdentity, setIsSavingIdentity] = useState(false);
  const [identityNotice, setIdentityNotice] = useState(null);

  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [securityNotice, setSecurityNotice] = useState(null);

  const [fieldErrors, setFieldErrors] = useState({});
  const [visiblePasswords, setVisiblePasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const user = await authApi.me();
        if (!isMounted) return;
        setProfile((current) => ({
          ...current,
          ...normalizeProfile(user),
        }));
      } catch {
        if (isMounted) {
          setIdentityNotice({ color: "warning", message: "Profil server belum bisa dimuat. Data lokal ditampilkan sementara." });
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field, value) => {
    setFieldErrors((current) => ({ ...current, [field]: "" }));
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarNotice(null);
    setProfile((current) => ({ ...current, avatar: URL.createObjectURL(file) }));
  };

  const togglePasswordVisibility = (field) => {
    setVisiblePasswords((current) => ({ ...current, [field]: !current[field] }));
  };

  const passwordHasMinimumLength = profile.newPassword.length >= 8;
  const passwordHasLetterAndNumber = /[A-Za-z]/.test(profile.newPassword) && /\d/.test(profile.newPassword);

  const calculateCompleteness = () => {
    let score = 0;
    if (profile.firstName && profile.firstName.trim()) score += 15;
    if (profile.lastName && profile.lastName.trim()) score += 15;
    if (profile.email && profile.email.trim()) score += 15;
    if (profile.phoneNumber && profile.phoneNumber.trim()) score += 15;
    if (profile.occupation && profile.occupation.trim()) score += 15;
    if (profile.address && profile.address.trim()) score += 15;
    if (profile.dateOfBirth) score += 10;
    return Math.min(100, score);
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile) {
      setAvatarNotice({ color: "warning", message: "Pilih file foto profil terlebih dahulu." });
      return;
    }
    setIsSavingAvatar(true);
    setAvatarNotice(null);

    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const updatedUser = await authApi.updateAvatar(formData);
      setProfile((current) => ({ ...current, ...normalizeProfile(updatedUser) }));
      setAvatarNotice({ color: "success", message: "Foto profil berhasil diperbarui." });
      setAvatarFile(null);
      
      // Update sessionStorage and Redux state to sync header avatar instantly
      updateSessionUser(updatedUser);
      dispatch(profileSuccess({ data: updatedUser, status: "success" }));
    } catch (error) {
      setAvatarNotice({ color: "danger", message: error?.message || "Foto profil gagal disimpan." });
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleSaveIdentity = async () => {
    const nextErrors = {};

    if (!profile.firstName.trim()) {
      nextErrors.firstName = "Nama depan tidak boleh kosong.";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      setIdentityNotice({ color: "warning", message: "Periksa kembali isian formulir Anda." });
      return;
    }

    setIsSavingIdentity(true);
    setIdentityNotice(null);

    try {
      const updatedUser = await authApi.updateMe({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber || null,
        dateOfBirth: profile.dateOfBirth || null,
        address: profile.address || null,
        occupation: profile.occupation || null,
        gender: profile.gender || null,
      });
      setProfile((current) => ({ ...current, ...normalizeProfile(updatedUser) }));
      setIdentityNotice({ color: "success", message: "Identitas pribadi berhasil disimpan." });
      
      // Update sessionStorage and Redux state to sync header user details instantly
      updateSessionUser(updatedUser);
      dispatch(profileSuccess({ data: updatedUser, status: "success" }));
    } catch (error) {
      setIdentityNotice({ color: "danger", message: error?.message || "Identitas pribadi gagal disimpan." });
    } finally {
      setIsSavingIdentity(false);
    }
  };

  const handleSaveSecurity = async () => {
    const nextErrors = {};

    if (!profile.currentPassword) {
      nextErrors.currentPassword = "Isi password saat ini.";
    }

    if (!profile.newPassword) {
      nextErrors.newPassword = "Isi password baru.";
    } else if (!passwordHasMinimumLength) {
      nextErrors.newPassword = "Password baru minimal 8 karakter.";
    } else if (!passwordHasLetterAndNumber) {
      nextErrors.newPassword = "Gunakan kombinasi huruf dan angka.";
    }

    if (!profile.confirmPassword) {
      nextErrors.confirmPassword = "Konfirmasi password baru.";
    } else if (profile.newPassword !== profile.confirmPassword) {
      nextErrors.confirmPassword = "Konfirmasi password baru belum sama.";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      setSecurityNotice({ color: "warning", message: "Periksa kembali aturan password sebelum menyimpan." });
      return;
    }

    setIsSavingSecurity(true);
    setSecurityNotice(null);

    try {
      await authApi.updateMe({
        currentPassword: profile.currentPassword,
        newPassword: profile.newPassword,
      });
      setSecurityNotice({ color: "success", message: "Sandi akun berhasil diperbarui secara aman." });
      setProfile((current) => ({
        ...current,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      if (error.details && error.details.length) {
        const fieldMap = {};
        error.details.forEach((d) => {
          fieldMap[d.field] = d.message;
        });
        setFieldErrors(fieldMap);
        setSecurityNotice({ color: "danger", message: "Validasi gagal. Periksa kembali input Anda." });
      } else {
        setSecurityNotice({ color: "danger", message: error?.message || "Gagal memperbarui sandi." });
      }
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const renderPasswordField = ({ id, label, field, placeholder }) => (
    <div className="mb-3">
      <Label htmlFor={id} className="form-label">{label}</Label>
      <InputGroup className={fieldErrors[field] ? "is-invalid" : ""}>
        <Input
          id={id}
          type={visiblePasswords[field] ? "text" : "password"}
          value={profile[field]}
          onChange={(event) => handleChange(field, event.target.value)}
          placeholder={placeholder}
          invalid={Boolean(fieldErrors[field])}
        />
        <InputGroupText
          tag="button"
          type="button"
          className="sadar-password-toggle btn btn-light"
          onClick={() => togglePasswordVisibility(field)}
          aria-label={visiblePasswords[field] ? "Sembunyikan password" : "Tampilkan password"}
        >
          <i className={visiblePasswords[field] ? "ri-eye-off-line" : "ri-eye-line"}></i>
        </InputGroupText>
      </InputGroup>
      {fieldErrors[field] && <FormFeedback className="d-block">{fieldErrors[field]}</FormFeedback>}
    </div>
  );

  const profileProgress = calculateCompleteness();

  return (
    <div className="page-content sadar-page">
      <Container fluid>
        <div className="sadar-page-header sadar-edit-profile-header mb-4">
          <div className="d-flex align-items-center gap-3">
            <Button tag={Link} to="/profile-account" color="light" className="sadar-table-action btn-icon rounded-circle" aria-label="Kembali">
              <i className="ri-arrow-left-line"></i>
            </Button>
            <div>
              <h1 className="h3 mb-1">Pengaturan Profil</h1>
              <p className="text-muted mb-0">Kelola identitas diri, foto profil, dan kata sandi akun Anda.</p>
            </div>
          </div>
        </div>

        <Row className="g-4 align-items-stretch">
          {/* Kolom Kiri: Profil Overview */}
          <Col xl={4} lg={4}>
            <Card className="sadar-panel shadow-sm border-0 mb-4 h-100">
              <CardBody className="text-center py-4 d-flex flex-column justify-content-between h-100">
                <div>
                  <div className="position-relative d-inline-block mb-3">
                    <div 
                      className="sadar-profile-avatar mx-auto d-flex align-items-center justify-content-center bg-primary text-white rounded-circle shadow" 
                      style={{ width: "120px", height: "120px", fontSize: "36px", overflow: "hidden" }}
                    >
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="Foto profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        profile.name.slice(0, 1).toUpperCase()
                      )}
                    </div>
                    <Input id="edit-profile-photo" type="file" accept="image/png,image/jpeg,image/webp" className="d-none" onChange={handleAvatarChange} />
                    <Label 
                      htmlFor="edit-profile-photo" 
                      className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow mb-0" 
                      style={{ width: "34px", height: "34px", cursor: "pointer", border: "3px solid #fff" }}
                    >
                      <i className="ri-camera-line fs-14"></i>
                    </Label>
                  </div>

                  <h4 className="fw-bold mb-1 text-dark">{profile.name}</h4>
                  <p className="text-muted mb-0 fs-14">{profile.occupation || "Pengguna SADAR Finance"}</p>

                  {avatarFile && (
                    <div className="mt-3 px-3 mb-3">
                      {avatarNotice && <Alert color={avatarNotice.color} className="py-2 mb-2 fs-12">{avatarNotice.message}</Alert>}
                      <Button color="success" size="sm" className="w-100" onClick={handleSaveAvatar} disabled={isSavingAvatar}>
                        {isSavingAvatar ? "Menyimpan..." : "Terapkan Foto Baru"}
                      </Button>
                    </div>
                  )}

                  {/* Ringkasan Profil Real-time Preview */}
                  <div className="text-start mt-4 pt-3 border-top border-light">
                    <h6 className="fs-11 text-uppercase fw-bold text-muted mb-3">Ringkasan Akun</h6>
                    
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="avatar-xs flex-shrink-0">
                        <span className="avatar-title bg-light rounded text-muted fs-16">
                          <i className="ri-mail-line"></i>
                        </span>
                      </div>
                      <div className="flex-grow-1 min-width-0">
                        <small className="text-muted d-block fs-11 lh-1">Email</small>
                        <span className="fs-13 text-dark fw-medium text-truncate d-block mt-1">{profile.email || "-"}</span>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="avatar-xs flex-shrink-0">
                        <span className="avatar-title bg-light rounded text-muted fs-16">
                          <i className="ri-phone-line"></i>
                        </span>
                      </div>
                      <div className="flex-grow-1">
                        <small className="text-muted d-block fs-11 lh-1">Nomor Telepon</small>
                        <span className="fs-13 text-dark fw-medium d-block mt-1">{profile.phoneNumber || "-"}</span>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <div className="avatar-xs flex-shrink-0">
                        <span className="avatar-title bg-light rounded text-muted fs-16">
                          <i className="ri-map-pin-line"></i>
                        </span>
                      </div>
                      <div className="flex-grow-1">
                        <small className="text-muted d-block fs-11 lh-1">Kota / Alamat</small>
                        <span className="fs-13 text-dark fw-medium d-block mt-1">{profile.address || "-"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-top border-light pt-3 mt-4 text-start">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fs-13 fw-semibold text-dark">Lengkapi Profil Anda</span>
                    <span className="badge bg-primary-subtle text-primary">{profileProgress}%</span>
                  </div>
                  <Progress value={profileProgress} color="primary" className="animated-progess progress-sm mb-2" style={{ height: "6px" }} />
                  <p className="text-muted fs-11 mb-0">Isi seluruh kolom identitas pribadi untuk menyempurnakan visualisasi data finansial Anda.</p>
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Kolom Kanan: Detail Formulir */}
          <Col xl={8} lg={8}>
            <Card className="sadar-panel shadow-sm border-0 h-100">
              <CardHeader className="p-0 border-bottom border-light">
                <Nav tabs className="nav-tabs-custom rounded card-header-tabs border-bottom-0 mx-3 mt-3">
                  <NavItem>
                    <NavLink
                      className={`fs-14 py-3 fw-semibold ${activeTab === "details" ? "active text-primary" : "text-muted"}`}
                      onClick={() => setActiveTab("details")}
                      style={{ cursor: "pointer", border: "none" }}
                    >
                      <i className="ri-user-line align-middle me-1"></i> Detail Pribadi
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={`fs-14 py-3 fw-semibold ${activeTab === "security" ? "active text-primary" : "text-muted"}`}
                      onClick={() => setActiveTab("security")}
                      style={{ cursor: "pointer", border: "none" }}
                    >
                      <i className="ri-lock-password-line align-middle me-1"></i> Keamanan Akun
                    </NavLink>
                  </NavItem>
                </Nav>
              </CardHeader>
              <CardBody className="p-4">
                {activeTab === "details" && (
                  <div>
                    {identityNotice && (
                      <Alert color={identityNotice.color} className="sadar-notice py-2 mb-4">
                        {identityNotice.message}
                      </Alert>
                    )}

                    <Row className="g-3">
                      <Col md={6}>
                        <Label htmlFor="profile-firstName" className="form-label">Nama Depan</Label>
                        <Input
                          id="profile-firstName"
                          value={profile.firstName}
                          onChange={(e) => handleChange("firstName", e.target.value)}
                          invalid={Boolean(fieldErrors.firstName)}
                        />
                        {fieldErrors.firstName && <FormFeedback>{fieldErrors.firstName}</FormFeedback>}
                      </Col>

                      <Col md={6}>
                        <Label htmlFor="profile-lastName" className="form-label">Nama Belakang</Label>
                        <Input
                          id="profile-lastName"
                          value={profile.lastName}
                          onChange={(e) => handleChange("lastName", e.target.value)}
                        />
                      </Col>

                      <Col md={6}>
                        <Label htmlFor="profile-phoneNumber" className="form-label">Nomor Telepon</Label>
                        <Input
                          id="profile-phoneNumber"
                          value={profile.phoneNumber}
                          onChange={(e) => handleChange("phoneNumber", e.target.value)}
                          placeholder="+628123456789"
                        />
                      </Col>

                      <Col md={6}>
                        <Label htmlFor="profile-email" className="form-label">Alamat Email</Label>
                        <Input
                          id="profile-email"
                          type="email"
                          value={profile.email}
                          disabled
                          className="bg-light"
                        />
                        <small className="text-muted d-block mt-1">Alamat email utama terdaftar tidak dapat diubah.</small>
                      </Col>

                      <Col md={6}>
                        <Label htmlFor="profile-dateOfBirth" className="form-label">Tanggal Lahir</Label>
                        <Input
                          id="profile-dateOfBirth"
                          type="date"
                          value={profile.dateOfBirth}
                          onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                        />
                      </Col>

                      <Col md={6}>
                        <Label htmlFor="profile-gender" className="form-label">Jenis Kelamin</Label>
                        <Input
                          id="profile-gender"
                          type="select"
                          value={profile.gender}
                          onChange={(e) => handleChange("gender", e.target.value)}
                        >
                          <option value="">Pilih Jenis Kelamin</option>
                          <option value="male">Laki-laki</option>
                          <option value="female">Perempuan</option>
                          <option value="other">Lainnya</option>
                        </Input>
                      </Col>

                      <Col md={6}>
                        <Label htmlFor="profile-occupation" className="form-label">Pekerjaan / Jabatan</Label>
                        <Input
                          id="profile-occupation"
                          value={profile.occupation}
                          onChange={(e) => handleChange("occupation", e.target.value)}
                          placeholder="Contoh: Lead Designer / Developer"
                        />
                      </Col>

                      <Col md={6}>
                        <Label htmlFor="profile-address" className="form-label">Kota / Alamat</Label>
                        <Input
                          id="profile-address"
                          value={profile.address}
                          onChange={(e) => handleChange("address", e.target.value)}
                          placeholder="Contoh: Jakarta, Indonesia"
                        />
                      </Col>
                    </Row>

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-light">
                      <Button tag={Link} to="/profile-account" color="light">Batal</Button>
                      <Button color="primary" onClick={handleSaveIdentity} disabled={isSavingIdentity}>
                        {isSavingIdentity ? "Menyimpan..." : "Simpan Detail Pribadi"}
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <div>
                    {securityNotice && (
                      <Alert color={securityNotice.color} className="sadar-notice py-2 mb-4">
                        {securityNotice.message}
                      </Alert>
                    )}

                    <Row className="g-3">
                      <Col md={12}>
                        {renderPasswordField({
                          id: "profile-current-password",
                          label: "Password Saat Ini",
                          field: "currentPassword",
                          placeholder: "Masukkan kata sandi lama Anda"
                        })}
                      </Col>

                      <Col md={12}>
                        {renderPasswordField({
                          id: "profile-new-password",
                          label: "Password Baru",
                          field: "newPassword",
                          placeholder: "Masukkan kata sandi baru (min. 8 karakter)"
                        })}
                      </Col>

                      <Col md={12}>
                        {renderPasswordField({
                          id: "profile-confirm-password",
                          label: "Konfirmasi Password Baru",
                          field: "confirmPassword",
                          placeholder: "Ketik ulang kata sandi baru Anda"
                        })}
                      </Col>
                    </Row>

                    <div className="sadar-password-rules mt-3 mb-4 p-3 bg-light rounded">
                      <strong className="d-block mb-2 text-dark fs-13">Aturan Sandi yang Aman:</strong>
                      <div className="d-flex flex-wrap gap-3">
                        <span className={`d-flex align-items-center gap-1 fs-12 ${passwordHasMinimumLength ? "text-success fw-medium" : "text-muted"}`}>
                          <i className={passwordHasMinimumLength ? "ri-checkbox-circle-fill text-success" : "ri-circle-line text-muted"}></i>
                          Minimal 8 karakter
                        </span>
                        <span className={`d-flex align-items-center gap-1 fs-12 ${passwordHasLetterAndNumber ? "text-success fw-medium" : "text-muted"}`}>
                          <i className={passwordHasLetterAndNumber ? "ri-checkbox-circle-fill text-success" : "ri-circle-line text-muted"}></i>
                          Kombinasi huruf & angka
                        </span>
                        <span className={`d-flex align-items-center gap-1 fs-12 ${(profile.confirmPassword && profile.newPassword === profile.confirmPassword) ? "text-success fw-medium" : "text-muted"}`}>
                          <i className={(profile.confirmPassword && profile.newPassword === profile.confirmPassword) ? "ri-checkbox-circle-fill text-success" : "ri-circle-line text-muted"}></i>
                          Konfirmasi sesuai
                        </span>
                      </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2 pt-3 border-top border-light">
                      <Button tag={Link} to="/profile-account" color="light">Batal</Button>
                      <Button color="primary" onClick={handleSaveSecurity} disabled={isSavingSecurity}>
                        {isSavingSecurity ? "Memproses..." : "Simpan Password Baru"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProfileEdit;
