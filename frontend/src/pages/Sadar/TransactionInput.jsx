import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Alert,
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  Input,
  Label,
  Row,
  Spinner,
} from "reactstrap";

import BreadCrumb from "../../Components/Common/BreadCrumb";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
const AI_BASE_URL = import.meta.env.VITE_AI_URL || "http://localhost:5000";

const categories = [
  { value: "food_and_beverage", label: "Food & Beverage" },
  { value: "groceries", label: "Groceries" },
  { value: "transportation", label: "Transportation" },
  { value: "utilities", label: "Utilities" },
  { value: "shopping", label: "Shopping" },
  { value: "education", label: "Education" },
  { value: "health", label: "Health" },
  { value: "other", label: "Other" },
];

const initialForm = {
  merchant: "",
  transactionDate: new Date().toISOString().slice(0, 10),
  categoryGroup: "other",
  amount: "",
  description: "",
  source: "manual",
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const authHeaders = () => {
  const authUser = JSON.parse(sessionStorage.getItem("authUser") || "null");
  return authUser?.token ? { Authorization: `Bearer ${authUser.token}` } : {};
};

const getErrorMessage = (error, fallbackMessage) => {
  const apiMessage = error?.response?.data?.error?.message || error?.response?.data?.error;
  const aiMessage = error?.response?.data?.error;
  const message = apiMessage || aiMessage || error?.message || fallbackMessage;

  if (String(message).toLowerCase().includes("tesseract")) {
    return "OCR gagal karena Tesseract belum terpasang atau belum masuk PATH. Install Tesseract OCR, lalu set TESSERACT_CMD di ai/.env.";
  }

  if (String(message).toLowerCase().includes("access token")) {
    return "OCR gagal karena kamu belum login ke backend. Login dulu memakai akun backend, lalu coba proses OCR lagi.";
  }

  if (String(message).toLowerCase().includes("client password must be a string")) {
    return "OCR gagal karena koneksi database backend belum benar. Isi backend/.env terutama DB_PASSWORD, lalu restart backend.";
  }

  return message;
};

const normalizeParsedData = (scan) => {
  const parsed = scan?.parsed_data || scan?.parsedData || scan?.data || {};
  if (typeof parsed !== "string") return parsed;

  try {
    return JSON.parse(parsed);
  } catch {
    return {};
  }
};

const buildDescription = (merchant, items) => {
  const itemText = Array.isArray(items) && items.length
    ? items.map((item) => `${item.name} (${currencyFormatter.format(item.amount || 0)})`).join(", ")
    : "";

  if (merchant && itemText) return `${merchant}: ${itemText}`;
  return merchant || itemText || "";
};

const unwrapApiResponse = (response) => response?.data ?? response;

const normalizeAiOcrResult = (response) => {
  const payload = unwrapApiResponse(response);
  const result = payload?.data?.rawText || payload?.data?.confidence || payload?.data?.data
    ? payload.data
    : payload;

  return {
    rawText: result?.rawText || result?.raw_text || "",
    parsedData: result?.data || result?.parsed_data || {},
    confidence: Number(result?.confidence || 0),
  };
};

const TransactionInput = () => {
  document.title = "Input Transaksi | SADAR Finance";

  const [mode, setMode] = useState("ocr");
  const [form, setForm] = useState(initialForm);
  const [receiptFile, setReceiptFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const parsedItems = useMemo(() => {
    const parsed = normalizeParsedData(scanResult);
    return Array.isArray(parsed?.items) ? parsed.items : [];
  }, [scanResult]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setReceiptFile(file || null);
    setScanResult(null);
    setNotice(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(file ? URL.createObjectURL(file) : "");
  };

  const applyScanToForm = (scan) => {
    const parsed = normalizeParsedData(scan);
    const merchant = parsed?.merchant || "";
    const description = buildDescription(merchant, parsed?.items);

    setForm({
      merchant,
      transactionDate: parsed?.date || initialForm.transactionDate,
      categoryGroup: parsed?.category || "other",
      amount: parsed?.total ? String(parsed.total) : "",
      description,
      source: "ocr",
    });
  };

  const pollScanResult = async (scanId) => {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const { data } = await axios.get(`${API_BASE_URL}/ocr/${scanId}`, {
        headers: authHeaders(),
      });
      const scan = data?.data || data;

      if (scan?.status === "completed") {
        return scan;
      }
      if (scan?.status === "failed") {
        throw new Error(scan?.error_message || "OCR gagal memproses gambar.");
      }

      await new Promise((resolve) => setTimeout(resolve, 1200));
    }

    throw new Error("OCR masih diproses. Coba ambil ulang hasil scan beberapa saat lagi.");
  };

  const processWithAiService = async () => {
    const body = new FormData();
    body.append("image", receiptFile);

    const response = await axios.post(`${AI_BASE_URL}/ocr`, body, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const payload = unwrapApiResponse(response);

    if (payload?.success === false) {
      throw new Error(payload.error || "AI service gagal memproses OCR.");
    }

    const result = normalizeAiOcrResult(response);
    const scan = {
      status: "completed",
      confidence: result.confidence,
      parsed_data: result.parsedData,
      raw_text: result.rawText,
    };

    setScanResult(scan);
    applyScanToForm(scan);
    setNotice({ color: "success", message: "Struk berhasil dibaca dari AI service dan form sudah terisi otomatis." });
  };

  const handleScan = async () => {
    if (!receiptFile) {
      setNotice({ color: "warning", message: "Pilih gambar struk terlebih dahulu." });
      return;
    }

    setIsScanning(true);
    setNotice(null);

    try {
      await processWithAiService();
    } catch (aiError) {
      try {
        const body = new FormData();
        body.append("image", receiptFile);

        const uploadResponse = await axios.post(`${API_BASE_URL}/ocr/upload`, body, {
          headers: {
            ...authHeaders(),
            "Content-Type": "multipart/form-data",
          },
        });

        const uploadedScan = uploadResponse?.data?.data || uploadResponse?.data || uploadResponse;
        const scanId = uploadedScan?.ocr_id || uploadedScan?.id;

        if (!scanId) {
          throw new Error("Response OCR tidak menyertakan ID scan.");
        }

        const completedScan = await pollScanResult(scanId);
        setScanResult(completedScan);
        applyScanToForm(completedScan);
        setNotice({ color: "success", message: "Struk berhasil dibaca dan form sudah terisi otomatis." });
      } catch (backendError) {
        setNotice({
          color: "danger",
          message: getErrorMessage(aiError, getErrorMessage(backendError, "OCR gagal memproses struk.")),
        });
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.amount || Number(form.amount) <= 0) {
      setNotice({ color: "warning", message: "Nominal transaksi harus lebih dari 0." });
      return;
    }

    setIsSaving(true);
    setNotice(null);

    try {
      await axios.post(
        `${API_BASE_URL}/transactions`,
        {
          categoryGroup: form.categoryGroup,
          transactionDate: new Date(form.transactionDate).toISOString(),
          description: form.description || form.merchant,
          source: form.source,
          amount: Number(form.amount),
        },
        { headers: authHeaders() }
      );

      setNotice({ color: "success", message: "Transaksi berhasil disimpan." });
      setForm({ ...initialForm, source: mode === "ocr" ? "ocr" : "manual" });
    } catch (error) {
      setNotice({ color: "danger", message: getErrorMessage(error, "Transaksi gagal disimpan.") });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Input Transaksi" pageTitle="SADAR Finance" />

        <Row className="g-3">
          <Col xl={4}>
            <Card>
              <CardHeader className="d-flex align-items-center justify-content-between">
                <h5 className="card-title mb-0">Metode Input</h5>
                <Badge color={mode === "ocr" ? "success" : "primary"} className="text-uppercase">
                  {mode}
                </Badge>
              </CardHeader>
              <CardBody>
                <ButtonGroup className="w-100 mb-3">
                  <Button
                    color={mode === "ocr" ? "success" : "light"}
                    onClick={() => {
                      setMode("ocr");
                      updateForm("source", "ocr");
                    }}
                  >
                    <i className="ri-scan-2-line align-bottom me-1" />
                    Upload OCR
                  </Button>
                  <Button
                    color={mode === "manual" ? "primary" : "light"}
                    onClick={() => {
                      setMode("manual");
                      updateForm("source", "manual");
                    }}
                  >
                    <i className="ri-edit-2-line align-bottom me-1" />
                    Manual
                  </Button>
                </ButtonGroup>

                {mode === "ocr" && (
                  <div>
                    <Label htmlFor="receipt-image" className="form-label">Gambar Struk</Label>
                    <Input
                      id="receipt-image"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/heic"
                      onChange={handleFileChange}
                    />

                    <div className="border rounded mt-3 d-flex align-items-center justify-content-center bg-light" style={{ minHeight: 260 }}>
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Preview struk"
                          className="img-fluid rounded"
                          style={{ maxHeight: 260, objectFit: "contain" }}
                        />
                      ) : (
                        <div className="text-center text-muted">
                          <i className="ri-upload-cloud-2-line display-5 d-block mb-2" />
                          <span>Pilih file struk</span>
                        </div>
                      )}
                    </div>

                    <Button color="success" className="w-100 mt-3" onClick={handleScan} disabled={isScanning}>
                      {isScanning ? <Spinner size="sm" className="me-2" /> : <i className="ri-scan-line align-bottom me-1" />}
                      Proses OCR
                    </Button>
                  </div>
                )}

                {mode === "manual" && (
                  <div className="text-muted">
                    <i className="ri-keyboard-line align-bottom me-1" />
                    Isi detail transaksi langsung pada form.
                  </div>
                )}
              </CardBody>
            </Card>

            {scanResult && (
              <Card>
                <CardHeader>
                  <h5 className="card-title mb-0">Hasil OCR</h5>
                </CardHeader>
                <CardBody>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Confidence</span>
                    <strong>{Math.round(Number(scanResult.confidence || 0) * 100)}%</strong>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-sm table-nowrap align-middle mb-0">
                      <tbody>
                        {parsedItems.map((item, index) => (
                          <tr key={`${item.name}-${index}`}>
                            <td>{item.name}</td>
                            <td className="text-end">{currencyFormatter.format(item.amount || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            )}
          </Col>

          <Col xl={8}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">Detail Transaksi</h5>
              </CardHeader>
              <CardBody>
                {notice && <Alert color={notice.color}>{notice.message}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Row className="g-3">
                    <Col md={6}>
                      <Label htmlFor="merchant" className="form-label">Merchant</Label>
                      <Input
                        id="merchant"
                        value={form.merchant}
                        onChange={(event) => updateForm("merchant", event.target.value)}
                        placeholder="Contoh: Indomaret"
                      />
                    </Col>

                    <Col md={6}>
                      <Label htmlFor="transactionDate" className="form-label">Tanggal</Label>
                      <Input
                        id="transactionDate"
                        type="date"
                        value={form.transactionDate}
                        onChange={(event) => updateForm("transactionDate", event.target.value)}
                      />
                    </Col>

                    <Col md={6}>
                      <Label htmlFor="categoryGroup" className="form-label">Kategori</Label>
                      <Input
                        id="categoryGroup"
                        type="select"
                        value={form.categoryGroup}
                        onChange={(event) => updateForm("categoryGroup", event.target.value)}
                      >
                        {categories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </Input>
                    </Col>

                    <Col md={6}>
                      <Label htmlFor="amount" className="form-label">Nominal</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="0"
                        step="100"
                        value={form.amount}
                        onChange={(event) => updateForm("amount", event.target.value)}
                        placeholder="93000"
                        required
                      />
                    </Col>

                    <Col xs={12}>
                      <Label htmlFor="description" className="form-label">Catatan</Label>
                      <Input
                        id="description"
                        type="textarea"
                        rows={5}
                        value={form.description}
                        onChange={(event) => updateForm("description", event.target.value)}
                        placeholder="Ringkasan transaksi"
                      />
                    </Col>

                    <Col xs={12} className="d-flex flex-wrap gap-2 justify-content-end">
                      <Button
                        type="button"
                        color="light"
                        onClick={() => setForm({ ...initialForm, source: mode === "ocr" ? "ocr" : "manual" })}
                      >
                        <i className="ri-refresh-line align-bottom me-1" />
                        Reset
                      </Button>
                      <Button type="submit" color="primary" disabled={isSaving}>
                        {isSaving ? <Spinner size="sm" className="me-2" /> : <i className="ri-save-3-line align-bottom me-1" />}
                        Simpan Transaksi
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TransactionInput;
