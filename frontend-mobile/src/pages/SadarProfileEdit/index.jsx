import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import { useDispatch } from "react-redux";
import { profileSuccess } from "../../slices/auth/profile/reducer";
import { authApi } from "../../Components/services/api";
import { api } from "../../config";
import "../SadarShared/sadar-pages.css";

const updateSessionUser = (updatedUser) => {
  try {
    const rawAuth = localStorage.getItem("authUser");
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

    localStorage.setItem("authUser", JSON.stringify(authData));
  } catch (e) {
    console.error("Failed to update localStorage user", e);
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
  const baseUrl = (api?.API_URL || "").replace(/\/api\/v1\/?$/, "");
  return baseUrl ? `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}` : url;
};

const normalizeProfile = (user) => {
  const firstName = user?.first_name || user?.firstName || "";
  const lastName = user?.last_name || user?.lastName || "";
  const cleanLastName =
    lastName === "User" || lastName === "user" ? "" : lastName;
  const rawAvatar = user?.profile_picture || user?.profilePicture || "";

  return {
    firstName: firstName,
    lastName: cleanLastName,
    name:
      `${firstName} ${cleanLastName}`.trim() || user?.email || "Pengguna SADAR",
    email: user?.email || "",
    avatar: resolveAvatarUrl(rawAvatar),
    phoneNumber: user?.phone_number || user?.phoneNumber || "",
    dateOfBirth: user?.date_of_birth
      ? String(user.date_of_birth || "").slice(0, 10)
      : "",
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

  // States for interactive profile photo actions
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isWebcamModalOpen, setIsWebcamModalOpen] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isSavingWebcam, setIsSavingWebcam] = useState(false);

  // Keep the profile photo action sheet isolated from card stacking contexts.
  useEffect(() => {
    if (!showPhotoMenu) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setShowPhotoMenu(false);
    };

    document.body.classList.add("sadar-photo-actions-open");
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.classList.remove("sadar-photo-actions-open");
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [showPhotoMenu]);

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
        updateSessionUser(user);
        dispatch(profileSuccess({ data: user, status: "success" }));
      } catch {
        if (isMounted) {
          setIdentityNotice({
            color: "warning",
            message:
              "Profil server belum bisa dimuat. Data lokal ditampilkan sementara.",
          });
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const handleChange = (field, value) => {
    setFieldErrors((current) => ({ ...current, [field]: "" }));
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarNotice(null);
    setProfile((current) => ({
      ...current,
      avatar: URL.createObjectURL(file),
    }));
  };

  const togglePasswordVisibility = (field) => {
    setVisiblePasswords((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  const passwordHasMinimumLength = profile.newPassword.length >= 8;
  const passwordHasLetterAndNumber =
    /[A-Za-z]/.test(profile.newPassword) && /\d/.test(profile.newPassword);

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
      setAvatarNotice({
        color: "warning",
        message: "Pilih file foto profil terlebih dahulu.",
      });
      return;
    }
    setIsSavingAvatar(true);
    setAvatarNotice(null);

    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const updatedUser = await authApi.updateAvatar(formData);
      setProfile((current) => ({
        ...current,
        ...normalizeProfile(updatedUser),
      }));
      setAvatarNotice({
        color: "success",
        message: "Foto profil berhasil diperbarui.",
      });
      setAvatarFile(null);

      // Update localStorage and Redux state to sync header avatar instantly
      updateSessionUser(updatedUser);
      dispatch(profileSuccess({ data: updatedUser, status: "success" }));
    } catch (error) {
      setAvatarNotice({
        color: "danger",
        message: error?.message || "Foto profil gagal disimpan.",
      });
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setIsSavingAvatar(true);
    setAvatarNotice(null);

    try {
      const updatedUser = await authApi.updateMe({ profilePicture: null });
      setProfile((current) => ({
        ...current,
        ...normalizeProfile(updatedUser),
      }));
      setAvatarNotice({
        color: "success",
        message: "Foto profil berhasil dihapus.",
      });
      setAvatarFile(null);

      // Update localStorage and Redux state to sync header avatar instantly
      updateSessionUser(updatedUser);
      dispatch(profileSuccess({ data: updatedUser, status: "success" }));
    } catch (error) {
      setAvatarNotice({
        color: "danger",
        message: error?.message || "Gagal menghapus foto profil.",
      });
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleViewPhoto = () => {
    setShowPhotoMenu(false);
    if (profile.avatar) {
      setIsLightboxOpen(true);
    } else {
      setAvatarNotice({
        color: "warning",
        message: "Anda belum memiliki foto profil untuk dilihat.",
      });
    }
  };

  const handleOpenCamera = async () => {
    setShowPhotoMenu(false);
    setIsWebcamModalOpen(true);
    setCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      setWebcamStream(stream);
      // Wait a tick for the video tag to be rendered in the DOM
      setTimeout(() => {
        const videoElement = document.getElementById("sadar-webcam-element");
        if (videoElement) {
          videoElement.srcObject = stream;
        }
      }, 300);
    } catch (err) {
      console.error("Gagal mengakses kamera:", err);
      setAvatarNotice({
        color: "danger",
        message:
          "Gagal mengakses kamera. Silakan periksa izin kamera perangkat Anda.",
      });
      setIsWebcamModalOpen(false);
    }
  };

  const handleCapturePhoto = () => {
    const videoElement = document.getElementById("sadar-webcam-element");
    if (!videoElement) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth || 640;
    canvas.height = videoElement.videoHeight || 480;
    const ctx = canvas.getContext("2d");

    // Mirror horizontally so it feels natural like a camera mirror
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    setCapturedImage(dataUrl);
  };

  const handleRetakePhoto = () => {
    setCapturedImage(null);
    // Restart the video feed just in case, or make sure it plays
    setTimeout(() => {
      const videoElement = document.getElementById("sadar-webcam-element");
      if (videoElement && webcamStream) {
        videoElement.srcObject = webcamStream;
      }
    }, 100);
  };

  const handleCloseWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      setWebcamStream(null);
    }
    setIsWebcamModalOpen(false);
    setCapturedImage(null);
  };

  const handleSaveWebcamPhoto = async () => {
    if (!capturedImage) return;
    setIsSavingWebcam(true);
    setAvatarNotice(null);

    try {
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], `avatar-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      const formData = new FormData();
      formData.append("avatar", file);

      const updatedUser = await authApi.updateAvatar(formData);
      setProfile((current) => ({
        ...current,
        ...normalizeProfile(updatedUser),
      }));
      setAvatarNotice({
        color: "success",
        message: "Foto profil berhasil diperbarui dari kamera.",
      });
      setAvatarFile(null);

      updateSessionUser(updatedUser);
      dispatch(profileSuccess({ data: updatedUser, status: "success" }));
      handleCloseWebcam();
    } catch (error) {
      setAvatarNotice({
        color: "danger",
        message: error?.message || "Gagal menyimpan foto dari kamera.",
      });
    } finally {
      setIsSavingWebcam(false);
    }
  };

  const handleSaveIdentity = async () => {
    const nextErrors = {};

    if (!profile.firstName.trim()) {
      nextErrors.firstName = "Nama depan tidak boleh kosong.";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      setIdentityNotice({
        color: "warning",
        message: "Periksa kembali isian formulir Anda.",
      });
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
      setProfile((current) => ({
        ...current,
        ...normalizeProfile(updatedUser),
      }));
      setIdentityNotice({
        color: "success",
        message: "Identitas pribadi berhasil disimpan.",
      });

      // Update localStorage and Redux state to sync header user details instantly
      updateSessionUser(updatedUser);
      dispatch(profileSuccess({ data: updatedUser, status: "success" }));
    } catch (error) {
      setIdentityNotice({
        color: "danger",
        message: error?.message || "Identitas pribadi gagal disimpan.",
      });
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
      setSecurityNotice({
        color: "warning",
        message: "Periksa kembali aturan password sebelum menyimpan.",
      });
      return;
    }

    setIsSavingSecurity(true);
    setSecurityNotice(null);

    try {
      await authApi.updateMe({
        currentPassword: profile.currentPassword,
        newPassword: profile.newPassword,
      });
      setSecurityNotice({
        color: "success",
        message: "Sandi akun berhasil diperbarui secara aman.",
      });
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
        setSecurityNotice({
          color: "danger",
          message: "Validasi gagal. Periksa kembali input Anda.",
        });
      } else {
        setSecurityNotice({
          color: "danger",
          message: error?.message || "Gagal memperbarui sandi.",
        });
      }
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const renderPasswordField = ({ id, label, field, placeholder }) => (
    <div className="mb-3">
      <Label htmlFor={id} className="form-label">
        {label}
      </Label>
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
          aria-label={
            visiblePasswords[field]
              ? "Sembunyikan password"
              : "Tampilkan password"
          }
        >
          <i
            className={
              visiblePasswords[field] ? "ri-eye-off-line" : "ri-eye-line"
            }
          ></i>
        </InputGroupText>
      </InputGroup>
      {fieldErrors[field] && (
        <FormFeedback className="d-block">{fieldErrors[field]}</FormFeedback>
      )}
    </div>
  );

  const profileProgress = calculateCompleteness();

  return (
    <div className="page-content sadar-page">
      <Container fluid>
        <div className="sadar-page-header sadar-edit-profile-header mb-4">
          <div className="d-flex align-items-center gap-3">
            <Button
              tag={Link}
              to="/profile-account"
              color="light"
              className="sadar-table-action btn-icon rounded-circle"
              aria-label="Kembali"
            >
              <i className="ri-arrow-left-line"></i>
            </Button>
            <div>
              <h1 className="h3 mb-1">Pengaturan Profil</h1>
              <p className="text-muted mb-0">
                Kelola identitas diri, foto profil, dan kata sandi akun Anda.
              </p>
            </div>
          </div>
        </div>

        <Row className="g-4 align-items-stretch">
          {/* Kolom Kiri: Profil Overview */}
          <Col xl={4} lg={4}>
            <Card className="sadar-panel shadow-sm border-0 mb-4 h-100">
              <CardBody className="text-center py-4 d-flex flex-column justify-content-between h-100">
                <div>
                  <div className="sadar-profile-avatar-shell position-relative d-inline-block mb-3">
                    <div
                      className="sadar-profile-avatar sadar-profile-edit-avatar mx-auto d-flex align-items-center justify-content-center bg-primary text-white rounded-circle"
                    >
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt="Foto profil"
                          className="sadar-profile-edit-avatar-image"
                        />
                      ) : (
                        profile.name.slice(0, 1).toUpperCase()
                      )}
                    </div>
                    <Input
                      id="edit-profile-photo"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="d-none"
                      onChange={handleAvatarChange}
                    />
                    <button
                      id="profile-camera-trigger"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPhotoMenu(!showPhotoMenu);
                      }}
                      className="sadar-profile-camera-button position-absolute bottom-0 end-0 d-flex align-items-center justify-content-center mb-0"
                      aria-label="Ubah foto profil"
                      aria-expanded={showPhotoMenu}
                      aria-controls="sadar-profile-photo-actions"
                    >
                      <i className="ri-image-edit-line" aria-hidden="true"></i>
                    </button>
                  </div>

                  <h4 className="fw-bold mb-1 text-dark">{profile.name}</h4>
                  <p className="text-muted mb-0 fs-14">
                    {profile.occupation || "Pengguna SADAR Finance"}
                  </p>

                  {avatarNotice && (
                    <div className="mt-3 px-3">
                      <Alert
                        color={avatarNotice.color}
                        className="py-2 mb-2 fs-12"
                      >
                        {avatarNotice.message}
                      </Alert>
                    </div>
                  )}

                  {avatarFile && (
                    <div className="mt-3 px-3">
                      <Button
                        color="success"
                        size="sm"
                        className="w-100"
                        onClick={handleSaveAvatar}
                        disabled={isSavingAvatar}
                      >
                        {isSavingAvatar ? "Menyimpan..." : "Terapkan Foto Baru"}
                      </Button>
                    </div>
                  )}

                  {/* Ringkasan Profil Real-time Preview */}
                  <div className="text-start mt-4 pt-3 border-top border-light">
                    <h6 className="fs-11 text-uppercase fw-bold text-muted mb-3">
                      Ringkasan Akun
                    </h6>

                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="avatar-xs flex-shrink-0">
                        <span className="avatar-title bg-light rounded text-muted fs-16">
                          <i className="ri-mail-line"></i>
                        </span>
                      </div>
                      <div className="flex-grow-1 min-width-0">
                        <small className="text-muted d-block fs-11 lh-1">
                          Email
                        </small>
                        <span className="fs-13 text-dark fw-medium text-truncate d-block mt-1">
                          {profile.email || "-"}
                        </span>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="avatar-xs flex-shrink-0">
                        <span className="avatar-title bg-light rounded text-muted fs-16">
                          <i className="ri-phone-line"></i>
                        </span>
                      </div>
                      <div className="flex-grow-1">
                        <small className="text-muted d-block fs-11 lh-1">
                          Nomor Telepon
                        </small>
                        <span className="fs-13 text-dark fw-medium d-block mt-1">
                          {profile.phoneNumber || "-"}
                        </span>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <div className="avatar-xs flex-shrink-0">
                        <span className="avatar-title bg-light rounded text-muted fs-16">
                          <i className="ri-map-pin-line"></i>
                        </span>
                      </div>
                      <div className="flex-grow-1">
                        <small className="text-muted d-block fs-11 lh-1">
                          Kota / Alamat
                        </small>
                        <span className="fs-13 text-dark fw-medium d-block mt-1">
                          {profile.address || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-top border-light pt-3 mt-4 text-start">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fs-13 fw-semibold text-dark">
                      Lengkapi Profil Anda
                    </span>
                    <span className="badge bg-primary-subtle text-primary">
                      {profileProgress}%
                    </span>
                  </div>
                  <Progress
                    value={profileProgress}
                    color="primary"
                    className="animated-progess progress-sm mb-2"
                    style={{ height: "6px" }}
                  />
                  <p className="text-muted fs-11 mb-0">
                    Isi seluruh kolom identitas pribadi untuk menyempurnakan
                    visualisasi data finansial Anda.
                  </p>
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Kolom Kanan: Detail Formulir */}
          <Col xl={8} lg={8}>
            <Card className="sadar-panel shadow-sm border-0 h-100">
              <CardHeader className="p-0 border-bottom border-light">
                <Nav
                  tabs
                  className="nav-tabs-custom rounded card-header-tabs border-bottom-0 mx-3 mt-3"
                >
                  <NavItem>
                    <NavLink
                      className={`fs-14 py-3 fw-semibold ${activeTab === "details" ? "active text-primary" : "text-muted"}`}
                      onClick={() => setActiveTab("details")}
                      style={{ cursor: "pointer", border: "none" }}
                    >
                      <i className="ri-user-line align-middle me-1"></i> Detail
                      Pribadi
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={`fs-14 py-3 fw-semibold ${activeTab === "security" ? "active text-primary" : "text-muted"}`}
                      onClick={() => setActiveTab("security")}
                      style={{ cursor: "pointer", border: "none" }}
                    >
                      <i className="ri-lock-password-line align-middle me-1"></i>{" "}
                      Keamanan Akun
                    </NavLink>
                  </NavItem>
                </Nav>
              </CardHeader>
              <CardBody className="p-4">
                {activeTab === "details" && (
                  <div>
                    {identityNotice && (
                      <Alert
                        color={identityNotice.color}
                        className="sadar-notice py-2 mb-4"
                      >
                        {identityNotice.message}
                      </Alert>
                    )}

                    <Row className="g-3">
                      <Col md={6}>
                        <Label
                          htmlFor="profile-firstName"
                          className="form-label"
                        >
                          Nama Depan
                        </Label>
                        <Input
                          id="profile-firstName"
                          value={profile.firstName}
                          onChange={(e) =>
                            handleChange("firstName", e.target.value)
                          }
                          invalid={Boolean(fieldErrors.firstName)}
                        />
                        {fieldErrors.firstName && (
                          <FormFeedback>{fieldErrors.firstName}</FormFeedback>
                        )}
                      </Col>

                      <Col md={6}>
                        <Label
                          htmlFor="profile-lastName"
                          className="form-label"
                        >
                          Nama Belakang
                        </Label>
                        <Input
                          id="profile-lastName"
                          value={profile.lastName}
                          onChange={(e) =>
                            handleChange("lastName", e.target.value)
                          }
                        />
                      </Col>

                      <Col md={6}>
                        <Label
                          htmlFor="profile-phoneNumber"
                          className="form-label"
                        >
                          Nomor Telepon
                        </Label>
                        <Input
                          id="profile-phoneNumber"
                          value={profile.phoneNumber}
                          onChange={(e) =>
                            handleChange("phoneNumber", e.target.value)
                          }
                          placeholder="+628123456789"
                        />
                      </Col>

                      <Col md={6}>
                        <Label htmlFor="profile-email" className="form-label">
                          Alamat Email
                        </Label>
                        <Input
                          id="profile-email"
                          type="email"
                          value={profile.email}
                          disabled
                          className="bg-light"
                        />
                        <small className="text-muted d-block mt-1">
                          Alamat email utama terdaftar tidak dapat diubah.
                        </small>
                      </Col>

                      <Col md={6}>
                        <Label
                          htmlFor="profile-dateOfBirth"
                          className="form-label"
                        >
                          Tanggal Lahir
                        </Label>
                        <Input
                          id="profile-dateOfBirth"
                          type="date"
                          value={profile.dateOfBirth}
                          onChange={(e) =>
                            handleChange("dateOfBirth", e.target.value)
                          }
                        />
                      </Col>

                      <Col md={6}>
                        <Label htmlFor="profile-gender" className="form-label">
                          Jenis Kelamin
                        </Label>
                        <Input
                          id="profile-gender"
                          type="select"
                          value={profile.gender}
                          onChange={(e) =>
                            handleChange("gender", e.target.value)
                          }
                        >
                          <option value="">Pilih Jenis Kelamin</option>
                          <option value="male">Laki-laki</option>
                          <option value="female">Perempuan</option>
                          <option value="other">Lainnya</option>
                        </Input>
                      </Col>

                      <Col md={6}>
                        <Label
                          htmlFor="profile-occupation"
                          className="form-label"
                        >
                          Pekerjaan / Jabatan
                        </Label>
                        <Input
                          id="profile-occupation"
                          value={profile.occupation}
                          onChange={(e) =>
                            handleChange("occupation", e.target.value)
                          }
                          placeholder="Contoh: Lead Designer / Developer"
                        />
                      </Col>

                      <Col md={6}>
                        <Label htmlFor="profile-address" className="form-label">
                          Kota / Alamat
                        </Label>
                        <Input
                          id="profile-address"
                          value={profile.address}
                          onChange={(e) =>
                            handleChange("address", e.target.value)
                          }
                          placeholder="Contoh: Jakarta, Indonesia"
                        />
                      </Col>
                    </Row>

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-light">
                      <Button tag={Link} to="/profile-account" color="light">
                        Batal
                      </Button>
                      <Button
                        color="primary"
                        onClick={handleSaveIdentity}
                        disabled={isSavingIdentity}
                      >
                        {isSavingIdentity
                          ? "Menyimpan..."
                          : "Simpan Detail Pribadi"}
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <div>
                    {securityNotice && (
                      <Alert
                        color={securityNotice.color}
                        className="sadar-notice py-2 mb-4"
                      >
                        {securityNotice.message}
                      </Alert>
                    )}

                    <Row className="g-3">
                      <Col md={12}>
                        {renderPasswordField({
                          id: "profile-current-password",
                          label: "Password Saat Ini",
                          field: "currentPassword",
                          placeholder: "Masukkan kata sandi lama Anda",
                        })}
                      </Col>

                      <Col md={12}>
                        {renderPasswordField({
                          id: "profile-new-password",
                          label: "Password Baru",
                          field: "newPassword",
                          placeholder:
                            "Masukkan kata sandi baru (min. 8 karakter)",
                        })}
                      </Col>

                      <Col md={12}>
                        {renderPasswordField({
                          id: "profile-confirm-password",
                          label: "Konfirmasi Password Baru",
                          field: "confirmPassword",
                          placeholder: "Ketik ulang kata sandi baru Anda",
                        })}
                      </Col>
                    </Row>

                    <div className="sadar-password-rules mt-3 mb-4 p-3 bg-light rounded">
                      <strong className="d-block mb-2 text-dark fs-13">
                        Aturan Sandi yang Aman:
                      </strong>
                      <div className="d-flex flex-wrap gap-3">
                        <span
                          className={`d-flex align-items-center gap-1 fs-12 ${passwordHasMinimumLength ? "text-success fw-medium" : "text-muted"}`}
                        >
                          <i
                            className={
                              passwordHasMinimumLength
                                ? "ri-checkbox-circle-fill text-success"
                                : "ri-circle-line text-muted"
                            }
                          ></i>
                          Minimal 8 karakter
                        </span>
                        <span
                          className={`d-flex align-items-center gap-1 fs-12 ${passwordHasLetterAndNumber ? "text-success fw-medium" : "text-muted"}`}
                        >
                          <i
                            className={
                              passwordHasLetterAndNumber
                                ? "ri-checkbox-circle-fill text-success"
                                : "ri-circle-line text-muted"
                            }
                          ></i>
                          Kombinasi huruf & angka
                        </span>
                        <span
                          className={`d-flex align-items-center gap-1 fs-12 ${profile.confirmPassword && profile.newPassword === profile.confirmPassword ? "text-success fw-medium" : "text-muted"}`}
                        >
                          <i
                            className={
                              profile.confirmPassword &&
                              profile.newPassword === profile.confirmPassword
                                ? "ri-checkbox-circle-fill text-success"
                                : "ri-circle-line text-muted"
                            }
                          ></i>
                          Konfirmasi sesuai
                        </span>
                      </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2 pt-3 border-top border-light">
                      <Button tag={Link} to="/profile-account" color="light">
                        Batal
                      </Button>
                      <Button
                        color="primary"
                        onClick={handleSaveSecurity}
                        disabled={isSavingSecurity}
                      >
                        {isSavingSecurity
                          ? "Memproses..."
                          : "Simpan Password Baru"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {showPhotoMenu && createPortal(
        <div className="sadar-photo-action-layer">
          <button
            type="button"
            className="sadar-photo-action-backdrop"
            onClick={() => setShowPhotoMenu(false)}
            aria-label="Tutup pilihan foto profil"
          />
          <section
            id="sadar-profile-photo-actions"
            className="sadar-photo-action-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sadar-profile-photo-actions-title"
          >
            <div className="sadar-photo-action-handle" aria-hidden="true" />
            <div className="sadar-photo-action-heading">
              <div>
                <span>Foto profil</span>
                <strong id="sadar-profile-photo-actions-title">Pilih cara memperbarui foto</strong>
              </div>
              <button type="button" onClick={() => setShowPhotoMenu(false)} aria-label="Tutup pilihan foto profil">
                <i className="ri-close-line" aria-hidden="true"></i>
              </button>
            </div>
            <div className="sadar-photo-action-list">
              {profile.avatar && (
                <button type="button" className="sadar-photo-action-item" onClick={handleViewPhoto}>
                  <span className="sadar-photo-action-icon"><i className="ri-eye-line" aria-hidden="true"></i></span>
                  <span><strong>Lihat Foto</strong><small>Buka foto profil dalam ukuran penuh</small></span>
                  <i className="ri-arrow-right-s-line" aria-hidden="true"></i>
                </button>
              )}
              <button type="button" className="sadar-photo-action-item" onClick={handleOpenCamera}>
                <span className="sadar-photo-action-icon"><i className="ri-camera-line" aria-hidden="true"></i></span>
                <span><strong>Ambil Foto</strong><small>Gunakan kamera perangkat Anda</small></span>
                <i className="ri-arrow-right-s-line" aria-hidden="true"></i>
              </button>
              <button
                type="button"
                className="sadar-photo-action-item"
                onClick={() => {
                  document.getElementById("edit-profile-photo")?.click();
                  setShowPhotoMenu(false);
                }}
              >
                <span className="sadar-photo-action-icon"><i className="ri-folder-image-line" aria-hidden="true"></i></span>
                <span><strong>Pilih dari Galeri</strong><small>PNG, JPG, atau WebP dari perangkat</small></span>
                <i className="ri-arrow-right-s-line" aria-hidden="true"></i>
              </button>
              {profile.avatar && (
                <button
                  type="button"
                  className="sadar-photo-action-item is-danger"
                  onClick={() => {
                    handleDeleteAvatar();
                    setShowPhotoMenu(false);
                  }}
                >
                  <span className="sadar-photo-action-icon"><i className="ri-delete-bin-line" aria-hidden="true"></i></span>
                  <span><strong>Hapus Foto</strong><small>Kembali menggunakan inisial akun</small></span>
                  <i className="ri-arrow-right-s-line" aria-hidden="true"></i>
                </button>
              )}
            </div>
          </section>
        </div>,
        document.body,
      )}

      {/* Lightbox Modal */}
      <Modal
        isOpen={isLightboxOpen}
        toggle={() => setIsLightboxOpen(false)}
        centered
        className="sadar-photo-lightbox-modal"
      >
        <ModalBody className="sadar-photo-lightbox-body">
          <button
            type="button"
            className="btn-close btn-close-white position-absolute top-0 end-0 m-3 shadow"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Tutup"
            style={{ zIndex: 1060 }}
          ></button>
          <img
            src={profile.avatar}
            alt="Foto profil ukuran penuh"
            className="sadar-photo-lightbox-img"
          />
        </ModalBody>
      </Modal>

      {/* Webcam Capture Modal */}
      <Modal
        isOpen={isWebcamModalOpen}
        toggle={handleCloseWebcam}
        centered
        backdrop="static"
        keyboard={false}
        className="sadar-webcam-modal"
      >
        <ModalHeader
          toggle={handleCloseWebcam}
          className="border-bottom border-light"
        >
          <span className="fw-semibold fs-16">
            <i className="ri-camera-line me-2 text-primary"></i>Ambil Foto
            Profil
          </span>
        </ModalHeader>
        <ModalBody className="p-4">
          {!capturedImage ? (
            <div>
              <div className="sadar-webcam-preview-wrapper mb-3 shadow-inner">
                <video
                  id="sadar-webcam-element"
                  autoPlay
                  playsInline
                  className="sadar-webcam-video"
                  style={{ transform: "scaleX(-1)" }} // Mirror effect
                ></video>
              </div>
              <div className="d-flex justify-content-center">
                <Button
                  color="primary"
                  onClick={handleCapturePhoto}
                  className="px-4 py-2 d-flex align-items-center gap-2 rounded-pill"
                >
                  <i className="ri-camera-lens-line fs-18"></i>
                  <span>Tangkap Foto</span>
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="sadar-webcam-preview-wrapper mb-3 shadow">
                <img
                  src={capturedImage}
                  alt="Hasil tangkapan kamera"
                  className="sadar-webcam-captured"
                />
              </div>
              <div className="d-flex justify-content-center gap-3">
                <Button
                  color="light"
                  onClick={handleRetakePhoto}
                  className="px-3 rounded-pill"
                  disabled={isSavingWebcam}
                >
                  <i className="ri-refresh-line me-1"></i> Ulangi
                </Button>
                <Button
                  color="success"
                  onClick={handleSaveWebcamPhoto}
                  className="px-4 rounded-pill"
                  disabled={isSavingWebcam}
                >
                  {isSavingWebcam ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <i className="ri-checkbox-circle-line me-1"></i> Gunakan
                      Foto
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default ProfileEdit;
