import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Input,
  Label,
  Row,
} from "reactstrap";

import { userProfile } from "../SadarShared/mockData";
import "../SadarShared/sadar-pages.css";

const ProfileEdit = () => {
  document.title = "Edit Profil | SADAR Finance";

  const [profile, setProfile] = useState({
    name: userProfile.name,
    email: userProfile.email,
    phone: "",
    birthDate: "",
    occupation: "",
    monthlyIncomeRange: "5-10 juta",
    financeGoal: "Bangun dana darurat",
    language: "Indonesia",
    timezone: "Asia/Jakarta",
    avatar: userProfile.avatar,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleChange("avatar", URL.createObjectURL(file));
  };

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
              <p>Kelola identitas, keamanan, dan preferensi personal akun SADAR.</p>
            </div>
          </div>
        </div>

        <Row className="g-3 sadar-edit-top-row">
          <Col xl={4}>
            <Card className="sadar-panel h-100">
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
            <Card className="sadar-panel h-100">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Identitas Pribadi</h4>
                  <p className="text-muted mb-0">Data dasar untuk personalisasi pengalaman</p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="sadar-form-grid sadar-edit-profile-grid">
                  <div>
                    <Label htmlFor="profile-edit-name">Nama Lengkap</Label>
                    <Input id="profile-edit-name" value={profile.name} onChange={(event) => handleChange("name", event.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="profile-edit-email">Email</Label>
                    <Input id="profile-edit-email" type="email" value={profile.email} onChange={(event) => handleChange("email", event.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="profile-edit-phone">Nomor HP</Label>
                    <Input id="profile-edit-phone" placeholder="Contoh: 081234567890" value={profile.phone} onChange={(event) => handleChange("phone", event.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="profile-edit-birth">Tanggal Lahir</Label>
                    <Input id="profile-edit-birth" type="date" value={profile.birthDate} onChange={(event) => handleChange("birthDate", event.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="profile-edit-occupation">Pekerjaan</Label>
                    <Input id="profile-edit-occupation" placeholder="Contoh: Mahasiswa, Freelancer" value={profile.occupation} onChange={(event) => handleChange("occupation", event.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="profile-edit-income">Rentang Pemasukan Bulanan</Label>
                    <Input id="profile-edit-income" type="select" value={profile.monthlyIncomeRange} onChange={(event) => handleChange("monthlyIncomeRange", event.target.value)}>
                      <option>Di bawah 3 juta</option>
                      <option>3-5 juta</option>
                      <option>5-10 juta</option>
                      <option>10-20 juta</option>
                      <option>Di atas 20 juta</option>
                    </Input>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="g-3 mt-1 sadar-edit-detail-row">
          <Col xl={6}>
            <Card className="sadar-panel h-100">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Keamanan</h4>
                  <p className="text-muted mb-0">Ubah password akun</p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="sadar-edit-stack">
                  <div>
                    <Label htmlFor="profile-current-password">Password Saat Ini</Label>
                    <Input id="profile-current-password" type="password" value={profile.currentPassword} onChange={(event) => handleChange("currentPassword", event.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="profile-new-password">Password Baru</Label>
                    <Input id="profile-new-password" type="password" value={profile.newPassword} onChange={(event) => handleChange("newPassword", event.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="profile-confirm-password">Konfirmasi Password Baru</Label>
                    <Input id="profile-confirm-password" type="password" value={profile.confirmPassword} onChange={(event) => handleChange("confirmPassword", event.target.value)} />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col xl={6}>
            <Card className="sadar-panel h-100">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">Preferensi</h4>
                  <p className="text-muted mb-0">Atur konteks keuangan pribadi</p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="sadar-edit-stack">
                  <div>
                    <Label htmlFor="profile-goal">Tujuan Keuangan Utama</Label>
                    <Input id="profile-goal" type="select" value={profile.financeGoal} onChange={(event) => handleChange("financeGoal", event.target.value)}>
                      <option>Bangun dana darurat</option>
                      <option>Kurangi pengeluaran</option>
                      <option>Menabung untuk tujuan besar</option>
                      <option>Rapikan cashflow bulanan</option>
                    </Input>
                  </div>
                  <div>
                    <Label htmlFor="profile-language">Bahasa</Label>
                    <Input id="profile-language" type="select" value={profile.language} onChange={(event) => handleChange("language", event.target.value)}>
                      <option>Indonesia</option>
                      <option>English</option>
                    </Input>
                  </div>
                  <div>
                    <Label htmlFor="profile-timezone">Zona Waktu</Label>
                    <Input id="profile-timezone" type="select" value={profile.timezone} onChange={(event) => handleChange("timezone", event.target.value)}>
                      <option>Asia/Jakarta</option>
                      <option>Asia/Makassar</option>
                      <option>Asia/Jayapura</option>
                    </Input>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <div className="sadar-edit-actions">
          <Button tag={Link} to="/profile-account" color="light" className="sadar-table-action">Batal</Button>
          <Button color="primary">
            <i className="ri-save-3-line align-bottom me-1"></i>
            Simpan Profil
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default ProfileEdit;
