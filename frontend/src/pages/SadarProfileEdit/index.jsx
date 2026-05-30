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
  Row,
} from "reactstrap";

import { authApi } from "../../Components/services/api";
import "../SadarShared/sadar-pages.css";

const defaultProfile = {
  name: "SADAR",
  email: "",
  avatar: "",
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
  const rawAvatar = user?.profile_picture || user?.profilePicture || defaultProfile.avatar;
  return {
    name: `${firstName} ${cleanLastName}`.trim() || user?.email || defaultProfile.name,
    email: user?.email || defaultProfile.email,
    avatar: resolveAvatarUrl(rawAvatar),
  };
};

const splitFullName = (fullName = "") => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "SADAR",
    lastName: parts.slice(1).join(" ") || "User",
  };
};

const ProfileEdit = () => {
  useEffect(() => {
    document.title = "Edit Profil | SADAR Finance";
  }, []);

  const [profile, setProfile] = useState({
    name: defaultProfile.name,
    email: defaultProfile.email,
    avatar: defaultProfile.avatar,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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
    } catch (error) {
      setAvatarNotice({ color: "danger", message: error?.message || "Foto profil gagal disimpan." });
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleSaveIdentity = async () => {
    const nextErrors = {};

    if (!profile.name.trim()) {
      nextErrors.name = "Nama lengkap tidak boleh kosong.";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      setIdentityNotice({ color: "warning", message: "Periksa kembali nama lengkap Anda." });
      return;
    }

    setIsSavingIdentity(true);
    setIdentityNotice(null);

    try {
      const { firstName, lastName } = splitFullName(profile.name);
      const updatedUser = await authApi.updateMe({
        firstName,
        lastName,
      });
      setProfile((current) => ({ ...current, ...normalizeProfile(updatedUser) }));
      setIdentityNotice({ color: "success", message: "Identitas pribadi berhasil disimpan." });
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
      setSecurityNotice({ color: "danger", message: error?.message || "Gagal memperbarui sandi." });
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const renderPasswordField = ({ id, label, field, placeholder }) => (
    <div>
      <Label htmlFor={id}>{label}</Label>
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
          className="sadar-password-toggle"
          onClick={() => togglePasswordVisibility(field)}
          aria-label={visiblePasswords[field] ? "Sembunyikan password" : "Tampilkan password"}
        >
          <i className={visiblePasswords[field] ? "ri-eye-off-line" : "ri-eye-line"}></i>
        </InputGroupText>
      </InputGroup>
      {fieldErrors[field] && <FormFeedback className="d-block">{fieldErrors[field]}</FormFeedback>}
    </div>
  );

  return (
    <div className="page-content sadar-page">
      <Container fluid>
        <div className="sadar-page-header sadar-edit-profile-header">
          <div className="d-flex align-items-center gap-3">
            <Button tag={Link} to="/profile-account" color="light" className="sadar-table-action btn-icon" aria-label="Kembali">
              <i className="ri-arrow-left-line"></i>
            </Button>
            <div>
              <h1>Edit Profil</h1>
              <p>Kelola nama, email, foto profil, dan password akun SADAR secara terpisah.</p>
            </div>
          </div>
        </div>

        <Row className="g-3 sadar-edit-top-row">
          <Col xl={4}>
            <Card className="sadar-panel sadar-edit-photo-panel h-100">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Foto Profil</h4>
                  <p className="text-muted mb-0">Gambar utama akun kamu</p>
                </div>
              </CardHeader>
              <CardBody className="sadar-edit-avatar-body d-flex flex-column align-items-center justify-content-between">
                <div className="sadar-edit-avatar-card">
                  <div className="sadar-profile-avatar sadar-edit-avatar">
                    {profile.avatar ? <img src={profile.avatar} alt="Foto profil" /> : profile.name.slice(0, 1).toUpperCase()}
                  </div>
                  <h5>{profile.name}</h5>
                  <p>{profile.email}</p>
                  <Input id="edit-profile-photo" type="file" accept="image/png,image/jpeg,image/webp" className="d-none" onChange={handleAvatarChange} />
                  <Button tag={Label} htmlFor="edit-profile-photo" color="light" className="sadar-table-action mb-0" style={{ cursor: "pointer" }}>
                    <i className="ri-camera-line align-bottom me-1"></i>
                    Pilih Foto
                  </Button>
                </div>
                <div className="w-100 mt-3">
                  {avatarNotice && <Alert color={avatarNotice.color} className="sadar-notice py-2 mb-3">{avatarNotice.message}</Alert>}
                  <Button color="primary" className="w-100" onClick={handleSaveAvatar} disabled={isSavingAvatar || !avatarFile}>
                    {isSavingAvatar ? "Menyimpan..." : "Simpan Foto"}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col xl={8}>
            <Card className="sadar-panel sadar-edit-identity-panel h-100">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Identitas Pribadi</h4>
                  <p className="text-muted mb-0">Data dasar untuk personalisasi pengalaman</p>
                </div>
              </CardHeader>
              <CardBody className="d-flex flex-column justify-content-between">
                <div>
                  <div className="sadar-form-grid sadar-edit-profile-grid">
                    <div>
                      <Label htmlFor="profile-edit-name">Nama Lengkap</Label>
                      <Input
                        id="profile-edit-name"
                        value={profile.name}
                        onChange={(event) => handleChange("name", event.target.value)}
                        invalid={Boolean(fieldErrors.name)}
                      />
                      {fieldErrors.name && <FormFeedback>{fieldErrors.name}</FormFeedback>}
                    </div>
                    <div>
                      <Label htmlFor="profile-edit-email">Email <span className="text-muted fs-11">(Akun Utama)</span></Label>
                      <Input
                        id="profile-edit-email"
                        type="email"
                        value={profile.email}
                        readOnly
                        disabled
                        className="bg-light"
                      />
                      <small className="text-muted d-block mt-1">Alamat email terdaftar tidak dapat diubah.</small>
                    </div>
                  </div>
                  <div className="sadar-edit-inline-note mt-4">
                    <span className="sadar-card-icon teal">
                      <i className="ri-shield-user-line"></i>
                    </span>
                    <div>
                      <strong>Data utama akun</strong>
                      <p>Nama ini dipakai untuk personalisasi laporan keuangan dan visualisasi dashboard.</p>
                    </div>
                  </div>
                </div>
                <div className="w-100 mt-4">
                  {identityNotice && <Alert color={identityNotice.color} className="sadar-notice py-2 mb-3">{identityNotice.message}</Alert>}
                  <div className="d-flex justify-content-end">
                    <Button color="primary" onClick={handleSaveIdentity} disabled={isSavingIdentity}>
                      {isSavingIdentity ? "Menyimpan..." : "Simpan Data Diri"}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="g-3 mt-1 sadar-edit-detail-row">
          <Col xl={12}>
            <Card className="sadar-panel">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Keamanan</h4>
                  <p className="text-muted mb-0">Ubah password akun secara terpisah.</p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="sadar-form-grid sadar-edit-profile-grid">
                  {renderPasswordField({ id: "profile-current-password", label: "Password Saat Ini", field: "currentPassword" })}
                  {renderPasswordField({ id: "profile-new-password", label: "Password Baru", field: "newPassword", placeholder: "Minimal 8 karakter" })}
                  {renderPasswordField({ id: "profile-confirm-password", label: "Konfirmasi Password Baru", field: "confirmPassword" })}
                  <div className="sadar-password-rules">
                    <strong>Aturan password</strong>
                    <span className={passwordHasMinimumLength ? "is-valid" : ""}>
                      <i className={passwordHasMinimumLength ? "ri-checkbox-circle-line" : "ri-circle-line"}></i>
                      Minimal 8 karakter
                    </span>
                    <span className={passwordHasLetterAndNumber ? "is-valid" : ""}>
                      <i className={passwordHasLetterAndNumber ? "ri-checkbox-circle-line" : "ri-circle-line"}></i>
                      Ada huruf dan angka
                    </span>
                    <span className={profile.confirmPassword && profile.newPassword === profile.confirmPassword ? "is-valid" : ""}>
                      <i className={profile.confirmPassword && profile.newPassword === profile.confirmPassword ? "ri-checkbox-circle-line" : "ri-circle-line"}></i>
                      Konfirmasi sesuai
                    </span>
                  </div>
                </div>
                <div className="w-100 mt-4 border-t pt-3">
                  {securityNotice && <Alert color={securityNotice.color} className="sadar-notice py-2 mb-3">{securityNotice.message}</Alert>}
                  <div className="d-flex justify-content-end">
                    <Button color="primary" onClick={handleSaveSecurity} disabled={isSavingSecurity}>
                      {isSavingSecurity ? "Memproses..." : "Simpan Password Baru"}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProfileEdit;
