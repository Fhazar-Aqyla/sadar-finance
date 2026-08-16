import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, CardBody } from 'reactstrap';
import BreadCrumb from '../../../Components/Common/BreadCrumb';

const TermAndConditions = () => {
    return (
        <React.Fragment>
            <div className='page-content'>
                <Container fluid>
                    <BreadCrumb title="Syarat & Ketentuan" pageTitle="Halaman" />
                </Container>

                <Row className="justify-content-center">
                    <Col lg={10}>
                        <Card className="rounded-4 border-0 shadow-sm overflow-hidden">
                            <div className="bg-primary-subtle p-4 p-md-5 text-center border-bottom border-primary-subtle">
                                <h3 className="fw-bold text-primary mb-1">Syarat & Ketentuan</h3>
                                <p className="mb-0 text-muted">Terakhir diperbarui: Januari 2025</p>
                            </div>

                            <CardBody className='p-4 p-md-5'>
                                <div className="mb-4">
                                    <h5 className="fw-semibold text-primary">1. Ketentuan Umum</h5>
                                    <p className="text-muted">Selamat datang di <strong>SADAR Finance</strong>. Dengan mengakses dan menggunakan platform SADAR Finance (situs web maupun aplikasi seluler), Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak menyetujui salah satu ketentuan, mohon untuk tidak melanjutkan penggunaan layanan kami.</p>
                                    <p className="text-muted">SADAR Finance menyediakan fitur pencatatan, pemantauan, simulasi anggaran (50/30/20), dan analisis keuangan berbasis AI untuk membantu pengguna mengelola keuangan pribadi secara lebih terarah.</p>
                                </div>

                                <div className="mb-4">
                                    <h5 className="fw-semibold text-primary">2. Akun dan Keamanan</h5>
                                    <p className="text-muted">Pengguna bertanggung jawab penuh atas kerahasiaan informasi akun, termasuk kata sandi dan kredensial akses. Anda setuju untuk segera memberitahukan kepada tim SADAR Finance jika mengetahui adanya penggunaan akun tanpa izin.</p>
                                    <p className="text-muted">Anda tidak diperkenankan untuk:</p>
                                    <ul className="text-muted vstack gap-2">
                                        <li>Menggunakan akun pihak lain tanpa izin yang sah.</li>
                                        <li>Menyalahgunakan API atau mengganggu integritas sistem dan infrastruktur SADAR Finance.</li>
                                        <li>Melakukan rekayasa balik (*reverse engineering*) terhadap platform kami.</li>
                                    </ul>
                                </div>

                                <div className="mb-4">
                                    <h5 className="fw-semibold text-primary">3. Privasi & Data Finansial</h5>
                                    <p className="text-muted">Kami sangat menghormati privasi data finansial Anda. Seluruh catatan transaksi dan data pribadi disimpan dengan enkripsi standar industri dan tidak akan diperjualbelikan kepada pihak ketiga tanpa persetujuan Anda.</p>
                                    <p className="text-muted">Ketentuan lengkap mengenai pengelolaan data pengguna dapat dibaca pada halaman <Link to="/privancy-policy" className="text-primary text-decoration-underline">Kebijakan Privasi</Link>.</p>
                                </div>

                                <div className="mb-4">
                                    <h5 className="fw-semibold text-primary">4. Batasan Tanggung Jawab</h5>
                                    <p className="text-muted">Analisis, grafik, dan simulasi anggaran yang disediakan oleh SADAR Finance bersifat informatif dan edukatif untuk membantu perencanaan finansial Anda. SADAR Finance bukan merupakan lembaga penasihat investasi berlisensi, dan keputusan finansial akhir tetap berada di tangan pengguna.</p>
                                </div>

                                <div className="text-end pt-3 border-top">
                                    <Link to="/dashboard" className="btn btn-primary px-4 me-2">Saya Setuju</Link>
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

export default TermAndConditions;