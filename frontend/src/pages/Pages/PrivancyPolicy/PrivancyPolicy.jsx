import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import BreadCrumb from '../../../Components/Common/BreadCrumb';
import FeatherIcon from 'feather-icons-react';

const PrivancyPolicy = () => {
    return (
        <React.Fragment>
            <div className='page-content'>
                <Container fluid>
                    <BreadCrumb title="Kebijakan Privasi" pageTitle="Halaman" />
                </Container>
                <Row className="justify-content-center">
                    <Col lg={10}>
                        <Card className="rounded-4 border-0 shadow-sm overflow-hidden">
                            <div className="bg-primary-subtle p-4 p-md-5 text-center border-bottom border-primary-subtle">
                                <h3 className="fw-bold text-primary mb-1">Kebijakan Privasi</h3>
                                <p className="mb-0 text-muted">Terakhir diperbarui: Januari 2025</p>
                            </div>
                            <CardBody className="p-4 p-md-5">
                                <div className="d-flex mb-4">
                                    <div className="flex-shrink-0 me-3">
                                        <FeatherIcon icon="shield" className="text-primary icon-dual-primary icon-sm" />
                                    </div>
                                    <div className="flex-grow-1">
                                        <h5 className="fw-semibold text-primary">Komitmen Privasi SADAR Finance</h5>
                                        <p className="text-muted">Di <strong>SADAR Finance</strong> (dapat diakses di platform web dan mobile), privasi dan keamanan data finansial pengguna adalah prioritas tertinggi kami. Dokumen Kebijakan Privasi ini menjelaskan jenis informasi yang kami kumpulkan dan bagaimana kami menggunakannya secara bertanggung jawab.</p>
                                        <p className="text-muted">Jika Anda memiliki pertanyaan lebih lanjut mengenai Kebijakan Privasi ini, silakan hubungi tim kami melalui email di <a href="mailto:support@sadarfinance.id" className="text-primary fw-semibold">support@sadarfinance.id</a>.</p>
                                    </div>
                                </div>

                                <div className="d-flex mb-4">
                                    <div className="flex-shrink-0 me-3">
                                        <FeatherIcon icon="database" className="text-primary icon-dual-primary icon-sm" />
                                    </div>
                                    <div className="flex-grow-1">
                                        <h5 className="fw-semibold text-primary">Informasi yang Kami Kumpulkan</h5>
                                        <p className="text-muted">Kami hanya mengumpulkan informasi yang diperlukan untuk memberikan layanan pencatatan dan analisis keuangan terbaik bagi Anda:</p>
                                        <ul className="text-muted vstack gap-2">
                                            <li><strong>Informasi Akun:</strong> Nama, alamat email, dan kredensial autentikasi terenkripsi saat mendaftar.</li>
                                            <li><strong>Data Keuangan Pengguna:</strong> Riwayat pemasukan, pengeluaran, kategori transaksi, dan preferensi anggaran yang Anda masukkan secara mandiri.</li>
                                            <li><strong>Log Penggunaan & Analitik:</strong> Informasi teknis perangkat dan sesi untuk meningkatkan performa dan keandalan sistem.</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="d-flex mb-4">
                                    <div className="flex-shrink-0 me-3">
                                        <FeatherIcon icon="lock" className="text-primary icon-dual-primary icon-sm" />
                                    </div>
                                    <div className="flex-grow-1">
                                        <h5 className="fw-semibold text-primary">Keamanan Data</h5>
                                        <p className="text-muted">Seluruh komunikasi data di SADAR Finance dilindungi dengan enkripsi SSL/TLS (HTTPS). Data sensitif Anda disimpan dalam database terisolasi dengan akses yang diawasi ketat. Kami <strong>tidak pernah</strong> menjual data keuangan pribadi Anda kepada pengiklan atau pihak ketiga manapun.</p>
                                    </div>
                                </div>

                                <div className="text-end pt-3 border-top">
                                    <Link to="/dashboard" className="btn btn-primary px-4 me-2">Mengerti</Link>
                                    <Link to="/" className="btn btn-outline-secondary px-4">Kembali ke Beranda</Link>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        </React.Fragment>
    );
};

export default PrivancyPolicy;