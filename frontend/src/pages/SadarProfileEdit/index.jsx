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

const normalizeProfile = (user) => {
  const firstName = user?.first_name || user?.firstName || "";
  const lastName = user?.last_name || user?.lastName || "";
  const cleanLastName = (lastName === "User" || lastName === "user") ? "" : lastName;
  return {
    name: `${firstName} ${cleanLastName}`.trim() || user?.email || defaultProfile.name,
    email: user?.email || defaultProfile.email,
    avatar: user?.profile_picture || user?.profilePicture || defaultProfile.avatar,
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
  const [notice, setNotice] = useState(null);
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
          setNotice({ color: "warning", message: "Profil server belum bisa dimuat. Data lokal ditampilkan sementara." });
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field, value) => {
    setNotice(null);
    setFieldErrors((current) => ({ ...current, [field]: "" }));
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleChange("avatar", URL.createObjectURL(file));
  };

  const togglePasswordVisibility = (field) => {
    setVisiblePasswords((current) => ({ ...current, [field]: !current[field] }));
  };

  const passwordHasMinimumLength = profile.newPassword.length >= 8;
  const passwordHasLetterAndNumber = /[A-Za-z]/.test(profile.newPassword) && /\d/.test(profile.newPassword);
  const isChangingPassword = profile.currentPassword || profile.newPassword || profile.confirmPassword;

  const handleSave = async () => {
    const nextErrors = {};

    if (!profile.name.trim()) {
      nextErrors.name = "Nama lengkap tidak boleh kosong.";
    }

    if (!profile.email.trim()) {
      nextErrors.email = "Email tidak boleh kosong.";
    } else if (!/^\S+@\S+\.\S+$/.test(profile.email)) {
      nextErrors.email = "Format email belum valid.";
    }

    if (isChangingPassword && !profile.currentPassword) {
      nextErrors.currentPassword = "Isi password saat ini.";
    }

    if (isChangingPassword && !profile.newPassword) {
      nextErrors.newPassword = "Isi password baru.";
    } else if (isChangingPassword && !passwordHasMinimumLength) {
      nextErrors.newPassword = "Password baru minimal 8 karakter.";
    } else if (isChangingPassword && !passwordHasLetterAndNumber) {
      nextErrors.newPassword = "Gunakan kombinasi huruf dan angka.";
    }

    if (isChangingPassword && !profile.confirmPassword) {
      nextErrors.confirmPassword = "Konfirmasi password baru.";
    } else if (isChangingPassword && profile.newPassword !== profile.confirmPassword) {
      nextErrors.confirmPassword = "Konfirmasi password baru belum sama.";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      setNotice({ color: "warning", message: "Periksa lagi data yang ditandai sebelum menyimpan profil." });
      return;
    }

    if (isChangingPassword) {
      setNotice({ color: "warning", message: "Perubahan password belum tersedia di API backend." });
      return;
    }

    try {
      const { firstName, lastName } = splitFullName(profile.name);
      const updatedUser = await authApi.updateMe({
        firstName,
        lastName,
      });
      setProfile((current) => ({ ...current, ...normalizeProfile(updatedUser) }));
      setNotice({ color: "success", message: "Profil berhasil disimpan." });
    } catch (error) {
      setNotice({ color: "danger", message: error?.message || "Profil gagal disimpan." });
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
              <p>Kelola nama, email, foto profil, dan password akun SADAR.</p>
            </div>
          </div>
        </div>

        <Row className="g-3 sadar-edit-top-row">
          <Col xl={4}>
            <Card className="sadar-panel sadar-edit-photo-panel">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Foto Profil</h4>
                  <p className="text-muted mb-0">Gambar utama akun kamu</p>
                </div>
              </CardHeader>
              <CardBody className="sadar-edit-avatar-body">
                <div className="sadar-edit-avatar-card">
                  <div className="sadar-profile-avatar sadar-edit-avatar">
                    {profile.avatar ? <img src={profile.avatar} alt="Foto profil" /> : profile.name.slice(0, 1).toUpperCase()}
                  </div>
                  <h5>{profile.name}</h5>
                  <p>{profile.email}</p>
                  <Input id="edit-profile-photo" type="file" accept="image/png,image/jpeg,image/webp" className="d-none" onChange={handleAvatarChange} />
                  <Button tag={Label} htmlFor="edit-profile-photo" color="light" className="sadar-table-action mb-0">
                    <i className="ri-camera-line align-bottom me-1"></i>
                    Ganti Foto
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col xl={8}>
            <Card className="sadar-panel sadar-edit-identity-panel">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Identitas Pribadi</h4>
                  <p className="text-muted mb-0">Data dasar untuk personalisasi pengalaman</p>
                </div>
              </CardHeader>
              <CardBody>
                {notice && <Alert color={notice.color} className="sadar-notice">{notice.message}</Alert>}
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
                    <Label htmlFor="profile-edit-email">Email</Label>
                    <Input
                      id="profile-edit-email"
                      type="email"
                      value={profile.email}
                      onChange={(event) => handleChange("email", event.target.value)}
                      invalid={Boolean(fieldErrors.email)}
                    />
                    {fieldErrors.email && <FormFeedback>{fieldErrors.email}</FormFeedback>}
                  </div>
                </div>
                <div className="sadar-edit-inline-note">
                  <span className="sadar-card-icon teal">
                    <i className="ri-shield-user-line"></i>
                  </span>
                  <div>
                    <strong>Data utama akun</strong>
                    <p>Nama dan email ini dipakai untuk identitas akun SADAR dan tampilan profil.</p>
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
                  <p className="text-muted mb-0">Kosongkan jika tidak ingin mengubah password.</p>
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
              </CardBody>
            </Card>
          </Col>
        </Row>

        <div className="sadar-edit-actions">
          <Button tag={Link} to="/profile-account" color="light" className="sadar-table-action">Batal</Button>
          <Button color="primary" onClick={handleSave}>
            <i className="ri-save-3-line align-bottom me-1"></i>
            Simpan Profil
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default ProfileEdit;
