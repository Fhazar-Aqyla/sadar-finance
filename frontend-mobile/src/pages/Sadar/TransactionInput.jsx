import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
import { accountApi, incomeApi, ocrApi, transactionApi } from "../../Components/services/api";
import "../SadarShared/sadar-pages.css";
import "./transaction-input.css";

const categories = [
  { value: "needs", label: "Kebutuhan" },
  { value: "wants", label: "Keinginan" },
  { value: "savings", label: "Tabungan" },
];

const normalizeCategoryGroup = (value) => {
  const text = String(value || "").trim().toLowerCase();
  if (/keinginan|wants|want|hiburan|entertainment|belanja|shopping|game|nonton|bioskop|liburan|travel/.test(text)) return "wants";
  if (/tabungan|savings|saving|invest|dana darurat/.test(text)) return "savings";
  if (/kebutuhan|needs|need/.test(text)) return "needs";
  if (/makan|food|beverage|minum|groceries|sembako|transport|tagihan|utilit|kesehatan|health|pendidikan|education|bills/.test(text)) return "needs";
  return "needs";
};

const initialForm = {
  accountId: "",
  merchant: "",
  transactionDate: new Date().toISOString().slice(0, 10),
  categoryGroup: "needs",
  categoryDetail: "",
  amount: "",
  description: "",
  source: "manual",
};

const initialIncomeForm = {
  accountId: "",
  source: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  note: "",
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const normalizeBackendAccount = (account) => ({
  id: account.account_id || account.id,
  name: account.account_name || account.accountName || account.name || "Akun",
  number: account.account_number || account.accountNumber || "",
});

const findAccountForHint = (accounts, hint) => {
  const key = String(hint || "").toLowerCase();
  if (!key) return "";
  const hintDigits = key.replace(/\D/g, "");
  const aliases = key.includes("btn") || key.includes("bale") ? ["btn", "bale"]
    : key.includes("dana") ? ["dana"]
      : key.includes("jago") ? ["jago"]
        : /cash|tunai|kas/.test(key) ? ["cash", "tunai", "kas"] : [key];
  const matches = accounts.filter((account) => {
    const label = `${account.name} ${account.number}`.toLowerCase();
    const numberDigits = String(account.number || "").replace(/\D/g, "");
    return aliases.some((alias) => label.includes(alias)) || (hintDigits.length >= 4 && numberDigits.endsWith(hintDigits.slice(-4)));
  });
  return matches.length === 1 ? matches[0].id : "";
};

const onlyDigits = (value) => String(value || "").replace(/\D/g, "");

const formatNumberInput = (value) => {
  const digits = onlyDigits(value);
  return digits ? new Intl.NumberFormat("id-ID").format(Number(digits)) : "";
};

const getErrorMessage = (error, fallbackMessage) => {
  return error?.message || fallbackMessage;
};

const parseAmountValue = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const text = String(value || "").trim();
  if (!text) return 0;

  const normalizedText = text
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  const amount = Number(normalizedText);

  return Number.isFinite(amount) ? amount : Number(onlyDigits(text) || 0);
};

const toIsoDate = (dateValue) => {
  const rawDate = String(dateValue || "").trim();
  if (!rawDate) return "";
  const cleanDate = rawDate.slice(0, 10);
  const date = new Date(`${cleanDate}T12:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
};

const normalizeParsedData = (scan) => {
  const parsed = scan?.parsed_data || scan?.parsedData || scan?.data || {};
  const parsedObject = typeof parsed === "string"
    ? (() => {
        try {
          return JSON.parse(parsed);
        } catch {
          return {};
        }
      })()
    : parsed;

  return parsedObject?.data && typeof parsedObject.data === "object"
    ? {
        ...parsedObject.data,
        rawText: parsedObject.rawText || parsedObject.raw_text || scan?.raw_text || scan?.rawText || "",
      }
    : parsedObject;
};

const getScanId = (scan) => scan?.ocr_id || scan?.ocrId || scan?.id || "";

const getParsedDate = (dateValue) => {
  const rawDate = String(dateValue || "").trim();
  if (!rawDate) return "";

  const date = new Date(rawDate);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const buildDescription = (merchant, items) => {
  const itemText = Array.isArray(items) && items.length
    ? items.map((item) => `${item.name} (${currencyFormatter.format(item.amount || 0)})`).join(", ")
    : "";

  if (merchant && itemText) return `${merchant}: ${itemText}`;
  return merchant || itemText || "";
};

const TransactionInput = () => {
  const location = useLocation();

  const [entryType, setEntryType] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("type") === "income" ? "income" : "transaction";
  });
  const [mode, setMode] = useState("ocr");
  const [form, setForm] = useState(initialForm);
  const [incomeForm, setIncomeForm] = useState(initialIncomeForm);
  const [accounts, setAccounts] = useState([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  // States for manual receipt upload
  const [manualReceiptFile, setManualReceiptFile] = useState(null);
  const [manualPreviewUrl, setManualPreviewUrl] = useState("");
  const [manualScanId, setManualScanId] = useState(null);
  const [isUploadingManual, setIsUploadingManual] = useState(false);
  const [manualUploadNotice, setManualUploadNotice] = useState(null);

  useEffect(() => {
    document.title = "Catat Keuangan | SADAR Finance";
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (manualPreviewUrl) {
        URL.revokeObjectURL(manualPreviewUrl);
      }
    };
  }, [previewUrl, manualPreviewUrl]);

  const parsedItems = useMemo(() => {
    const parsed = normalizeParsedData(scanResult);
    return Array.isArray(parsed?.items) ? parsed.items : [];
  }, [scanResult]);
  const parsedResult = useMemo(() => normalizeParsedData(scanResult), [scanResult]);
  const confidenceBadge = (field) => {
    const score = Number(parsedResult?.confidence?.[field]);
    if (!scanResult || !Number.isFinite(score) || score >= 0.75) return null;
    return <Badge color="warning" pill className="ms-2">Periksa {Math.round(score * 100)}%</Badge>;
  };

  useEffect(() => {
    let isMounted = true;

    const fetchAccounts = async () => {
      setIsLoadingAccounts(true);

      try {
        const rows = await accountApi.list();
        const normalizedAccounts = rows.map(normalizeBackendAccount);

        if (!isMounted) return;

        setAccounts(normalizedAccounts);

        if (normalizedAccounts.length) {
          const firstAccountId = normalizedAccounts[0].id;
          setForm((current) => ({
            ...current,
            accountId: normalizedAccounts.some((account) => account.id === current.accountId)
              ? current.accountId
              : firstAccountId,
          }));
          setIncomeForm((current) => ({
            ...current,
            accountId: normalizedAccounts.some((account) => account.id === current.accountId)
              ? current.accountId
              : firstAccountId,
          }));
        }
      } catch (error) {
        if (isMounted) {
          setAccounts([]);
          setForm((current) => ({ ...current, accountId: "" }));
          setIncomeForm((current) => ({ ...current, accountId: "" }));
          setNotice({ color: "danger", message: getErrorMessage(error, "Akun dari backend gagal dimuat.") });
        }
      } finally {
        if (isMounted) {
          setIsLoadingAccounts(false);
        }
      }
    };

    fetchAccounts();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateIncomeForm = (field, value) => {
    setIncomeForm((current) => ({ ...current, [field]: value }));
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

  const handleManualFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setManualReceiptFile(file);
    setManualScanId(null);
    setManualUploadNotice(null);

    if (manualPreviewUrl) {
      URL.revokeObjectURL(manualPreviewUrl);
    }
    setManualPreviewUrl(URL.createObjectURL(file));

    // Upload receipt to backend in background
    setIsUploadingManual(true);
    try {
      const body = new FormData();
      body.append("image", file);

      const uploadedScan = await ocrApi.upload(body);
      const scanId = getScanId(uploadedScan);

      if (!scanId) {
        throw new Error("Gagal mengunggah berkas.");
      }

      await pollScanResult(scanId);
      setManualScanId(scanId);
      setManualUploadNotice({ color: "success", message: "Struk siap dilampirkan." });
    } catch (error) {
      setManualUploadNotice({
        color: "danger",
        message: getErrorMessage(error, "Gagal mengunggah struk."),
      });
    } finally {
      setIsUploadingManual(false);
    }
  };

  const handleClearManualFile = () => {
    setManualReceiptFile(null);
    setManualScanId(null);
    setManualUploadNotice(null);
    if (manualPreviewUrl) {
      URL.revokeObjectURL(manualPreviewUrl);
      setManualPreviewUrl("");
    }
  };

  const applyScanToForm = (scan) => {
    const parsed = normalizeParsedData(scan);
    const merchant = parsed?.expenseName || parsed?.merchant || "";
    const description = parsed?.description || buildDescription(merchant, parsed?.items);
    const amount = parseAmountValue(parsed?.total || parsed?.amount || parsed?.grandTotal || parsed?.grand_total);

    setForm({
      accountId: findAccountForHint(accounts, parsed?.accountHint) || form.accountId,
      merchant,
      transactionDate: getParsedDate(parsed?.date || parsed?.transactionDate || parsed?.transaction_date),
      categoryGroup: normalizeCategoryGroup(parsed?.categoryGroup || parsed?.category_group || parsed?.category || "needs"),
      categoryDetail: parsed?.categoryDetail || parsed?.category_detail || "",
      amount: amount ? String(amount) : "",
      description,
      source: "ocr",
    });
  };

  const pollScanResult = async (scanId) => {
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const scan = await ocrApi.get(scanId);

      if (scan?.status === "completed") {
        return scan;
      }
      if (scan?.status === "failed") {
        throw new Error(scan?.error_message || scan?.errorMessage || "OCR gagal.");
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    throw new Error("OCR masih diproses. Tunggu sebentar lalu coba proses OCR lagi.");
  };

  const handleScan = async () => {
    if (!receiptFile) {
      setNotice({ color: "warning", message: "Pilih gambar struk terlebih dahulu." });
      return;
    }

    setIsScanning(true);
    setNotice(null);

    try {
      const body = new FormData();
      body.append("image", receiptFile);

      const uploadedScan = await ocrApi.upload(body);
      const scanId = getScanId(uploadedScan);

      if (!scanId) {
        throw new Error("OCR gagal.");
      }

      const completedScan = await pollScanResult(scanId);
      setScanResult(completedScan);
      applyScanToForm(completedScan);
      setNotice({ color: "success", message: "Struk berhasil dibaca." });
    } catch (error) {
      setNotice({
        color: "danger",
        message: getErrorMessage(error, "OCR gagal."),
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (mode === "ocr" && parsedResult?.isExpense === false) {
      setNotice({ color: "warning", message: "Bukti ini bukan pengeluaran. Beralih ke input manual bila tetap ingin mencatatnya." });
      return;
    }

    if (!form.accountId) {
      setNotice({ color: "warning", message: "Pilih account terlebih dahulu." });
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setNotice({ color: "warning", message: "Nominal pengeluaran harus lebih dari 0." });
      return;
    }

    const transactionDate = toIsoDate(form.transactionDate);
    if (!transactionDate) {
      setNotice({ color: "warning", message: "Tanggal pengeluaran belum valid." });
      return;
    }

    setIsSaving(true);
    setNotice(null);
    try {
      const payload = {
        categoryGroup: form.categoryGroup,
        categoryDetail: form.categoryDetail || null,
        accountId: form.accountId,
        transactionDate,
        description: form.description || form.merchant,
        source: form.source,
        amount: Number(form.amount),
      };

      const scanId = mode === "ocr" ? getScanId(scanResult) : manualScanId;
      if (scanId) {
        await ocrApi.confirmTransaction(scanId, payload);
      } else {
        await transactionApi.create(payload);
      }

      setNotice({
        color: "success",
        message: "Pengeluaran berhasil disimpan.",
      });
      setForm({ ...initialForm, accountId: form.accountId, source: mode === "ocr" ? "ocr" : "manual" });
      setScanResult(null);
      setReceiptFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
      }

      // Reset manual states
      setManualReceiptFile(null);
      setManualScanId(null);
      setManualUploadNotice(null);
      if (manualPreviewUrl) {
        URL.revokeObjectURL(manualPreviewUrl);
        setManualPreviewUrl("");
      }
    } catch (error) {
      setNotice({ color: "danger", message: getErrorMessage(error, "Pengeluaran gagal disimpan.") });
    } finally {
      setIsSaving(false);
    }
  };

  const handleIncomeSubmit = async (event) => {
    event.preventDefault();

    if (!incomeForm.accountId) {
      setNotice({ color: "warning", message: "Pilih account terlebih dahulu." });
      return;
    }

    if (!incomeForm.amount || Number(incomeForm.amount) <= 0) {
      setNotice({ color: "warning", message: "Jumlah pemasukan harus lebih dari 0." });
      return;
    }

    const incomeDate = toIsoDate(incomeForm.date);
    if (!incomeDate) {
      setNotice({ color: "warning", message: "Tanggal pemasukan belum valid." });
      return;
    }

    setIsSaving(true);
    setNotice(null);
    try {
      await incomeApi.create({
        accountId: incomeForm.accountId,
        source: incomeForm.source,
        amount: Number(incomeForm.amount),
        incomeDate,
      });

      setNotice({
        color: "success",
        message: "Pemasukan berhasil dicatat.",
      });
      setIncomeForm({ ...initialIncomeForm, accountId: incomeForm.accountId });
    } catch (error) {
      setNotice({ color: "danger", message: getErrorMessage(error, "Pemasukan gagal disimpan.") });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`page-content sadar-page sadar-transaction-page ${entryType === "income" ? "is-income-flow" : "is-expense-flow"}`}>
      <Container fluid>
        <Row className="g-3">
          <Col xl={4}>
            <div className="sadar-entry-tabs mb-3">
              <Button
                className={`sadar-entry-tab is-expense ${entryType === "transaction" ? "active" : ""}`}
                onClick={() => {
                  setEntryType("transaction");
                  setNotice(null);
                }}
              >
                <i className="ri-arrow-up-circle-line align-bottom me-1" />
                Pengeluaran
              </Button>
              <Button
                className={`sadar-entry-tab is-income ${entryType === "income" ? "active" : ""}`}
                onClick={() => {
                  setEntryType("income");
                  setNotice(null);
                }}
              >
                <i className="ri-arrow-down-circle-line align-bottom me-1" />
                Pemasukan
              </Button>
            </div>
          </Col>
        </Row>

        <Row className="g-3 align-items-stretch sadar-transaction-row">
          {entryType === "transaction" && <Col xl={4} className="d-flex flex-column sadar-method-column">
            <Card className={`sadar-panel sadar-input-card flex-fill ${entryType === "income" ? "is-income" : "is-expense"}`}>
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">{entryType === "income" ? "Catat Pemasukan" : "Metode Input"}</h4>
                  <p className="text-muted mb-0">
                    {entryType === "income" ? "Uang masuk dicatat tanpa OCR" : "Pilih cara mencatat pengeluaran"}
                  </p>
                </div>
                <Badge
                  color={entryType === "income" ? "success" : mode === "ocr" ? "success" : "primary"}
                  className={`sadar-mode-badge ${entryType === "income" ? "income" : ""}`}
                >
                  {entryType === "income" ? "Pemasukan" : mode === "ocr" ? "OCR" : "Manual"}
                </Badge>
              </CardHeader>
              <CardBody>
                {entryType === "transaction" && (
                  <ButtonGroup className="sadar-mode-toggle w-100 mb-3">
                    <Button
                      className={mode === "ocr" ? "active" : ""}
                      onClick={() => {
                        setMode("ocr");
                        updateForm("source", "ocr");
                      }}
                    >
                      <i className="ri-scan-2-line align-bottom me-1" />
                      Unggah OCR
                    </Button>
                    <Button
                      className={mode === "manual" ? "active" : ""}
                      onClick={() => {
                        setMode("manual");
                        updateForm("source", "manual");
                      }}
                    >
                      <i className="ri-edit-2-line align-bottom me-1" />
                      Manual
                    </Button>
                  </ButtonGroup>
                )}

                <div className="sadar-method-content">
                  {entryType === "transaction" && mode === "ocr" && (
                    <div className="sadar-ocr-state">
                      <Label htmlFor="receipt-image" className="form-label">Gambar Struk</Label>
                      <Input
                        id="receipt-image"
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/heic"
                        onChange={handleFileChange}
                        className="d-none"
                      />

                      <Label htmlFor="receipt-image" className={`sadar-receipt-dropzone ${previewUrl ? "has-preview" : ""}`}>
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Pratinjau struk"
                            className="sadar-receipt-preview"
                          />
                        ) : (
                          <div className="sadar-dropzone-empty">
                            <span className="sadar-dropzone-icon">
                              <i className="ri-upload-cloud-2-line" />
                            </span>
                            <strong>Unggah gambar struk</strong>
                            <span>PNG, JPG, WEBP, atau HEIC</span>
                          </div>
                        )}
                      </Label>

                      <div className="sadar-file-meta">
                        <span>{receiptFile?.name || "Belum ada file dipilih"}</span>
                        <small>{receiptFile ? `${Math.ceil(receiptFile.size / 1024)} KB` : "OCR akan mengisi form otomatis jika terbaca"}</small>
                      </div>

                      <Button className="sadar-ocr-button w-100 mt-3" onClick={handleScan} disabled={isScanning}>
                        {isScanning ? <Spinner size="sm" className="me-2" /> : <i className="ri-scan-line align-bottom me-1" />}
                        Proses OCR
                      </Button>
                    </div>
                  )}

                  {entryType === "transaction" && mode === "manual" && (
                    <div className="sadar-ocr-state">
                      <Label htmlFor="manual-receipt-image" className="form-label">Gambar Struk (Opsional)</Label>
                      <Input
                        id="manual-receipt-image"
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/heic"
                        onChange={handleManualFileChange}
                        className="d-none"
                      />

                      <Label htmlFor="manual-receipt-image" className={`sadar-receipt-dropzone ${manualPreviewUrl ? "has-preview" : ""}`}>
                        {manualPreviewUrl ? (
                          <img
                            src={manualPreviewUrl}
                            alt="Pratinjau struk manual"
                            className="sadar-receipt-preview"
                          />
                        ) : (
                          <div className="sadar-dropzone-empty">
                            <span className="sadar-dropzone-icon">
                              <i className="ri-upload-cloud-2-line" />
                            </span>
                            <strong>Unggah gambar struk</strong>
                            <span>PNG, JPG, WEBP, atau HEIC (Opsional)</span>
                          </div>
                        )}
                      </Label>

                      <div className="sadar-file-meta">
                        <div className="d-flex justify-content-between align-items-center w-100">
                          <span className="text-truncate" style={{ maxWidth: "80%" }}>
                            {manualReceiptFile?.name || "Belum ada file dipilih"}
                          </span>
                          {manualReceiptFile && (
                            <Button
                              color="link"
                              className="text-danger p-0 ms-2"
                              onClick={(e) => {
                                e.preventDefault();
                                handleClearManualFile();
                              }}
                              style={{ fontSize: "12px", textDecoration: "none" }}
                            >
                              Hapus
                            </Button>
                          )}
                        </div>
                        <small className="d-block mt-1">
                          {isUploadingManual ? (
                            <span className="text-primary">
                              <Spinner size="sm" className="me-1" style={{ width: "12px", height: "12px" }} />
                              Mengunggah & memproses berkas...
                            </span>
                          ) : manualUploadNotice ? (
                            <span className={manualUploadNotice.color === "success" ? "text-success" : "text-danger"}>
                              {manualUploadNotice.color === "success" ? (
                                <i className="ri-checkbox-circle-line me-1" />
                              ) : (
                                <i className="ri-error-warning-line me-1" />
                              )}
                              {manualUploadNotice.message}
                            </span>
                          ) : (
                            "Struk akan dilampirkan langsung ke transaksi manual"
                          )}
                        </small>
                      </div>
                    </div>
                  )}

                  {entryType === "income" && (
                    <div className="sadar-manual-state">
                      <span className="sadar-dropzone-icon income">
                        <i className="ri-bank-card-line" />
                      </span>
                      <strong>Pemasukan menambah saldo akun</strong>
                      <p>Gunakan formulir di sebelah kanan untuk mencatat gaji, freelance, bonus, atau pemasukan lainnya.</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {scanResult && (
              <Card className="sadar-panel sadar-ocr-result mt-3">
                <CardHeader>
                  <div>
                    <h4 className="card-title mb-1">Hasil OCR</h4>
                    <p className="text-muted mb-0">Item yang terbaca dari struk</p>
                  </div>
                </CardHeader>
                <CardBody>
                  {parsedResult?.needsReview && (
                    <Alert color="warning" className="py-2">
                      <strong>Perlu ditinjau.</strong> Periksa kembali field yang diisi sebelum menyimpan.
                    </Alert>
                  )}
                  {parsedResult?.isExpense === false && (
                    <Alert color="danger" className="py-2">Bukti ini terdeteksi bukan sebagai pengeluaran.</Alert>
                  )}
                  {(parsedResult?.warnings || []).map((warning, index) => (
                    <div className="small text-warning mb-1" key={`${warning}-${index}`}>• {warning}</div>
                  ))}
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Tingkat keyakinan</span>
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
          </Col>}

          <Col xl={entryType === "income" ? 12 : 8} className="d-flex sadar-detail-column">
            <Card className="sadar-panel sadar-detail-card flex-fill">
              <CardHeader>
                <div>
                  <h4 className="card-title mb-1">{entryType === "income" ? "Detail Pemasukan" : "Detail Pengeluaran"}</h4>
                  <p className="text-muted mb-0">
                    {entryType === "income" ? "Pilih akun tujuan dan sumber pemasukan" : "Pilih akun asal dan detail pengeluaran"}
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                {notice && <Alert color={notice.color} className="sadar-notice">{notice.message}</Alert>}

                {entryType === "transaction" ? (
                <Form onSubmit={handleSubmit} className="sadar-transaction-form">
                  <Row className="g-3 sadar-form-row">
                    <Col md={6}>
                      <Label htmlFor="accountId" className="form-label">Akun</Label>
                      <Input
                        id="accountId"
                        type="select"
                        value={form.accountId}
                        onChange={(event) => updateForm("accountId", event.target.value)}
                        disabled={isLoadingAccounts || !accounts.length}
                      >
                        {!accounts.length && (
                          <option value="">
                            {isLoadingAccounts ? "Memuat akun..." : "Belum ada akun"}
                          </option>
                        )}
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name}
                          </option>
                        ))}
                      </Input>
                      {!accounts.length && !isLoadingAccounts && (
                        <div className="mt-2">
                          <Button color="light" size="sm" className="sadar-table-action" tag={Link} to="/profile-account#kelola-account">
                            Tambah Akun Dulu
                          </Button>
                        </div>
                      )}
                    </Col>

                    <Col md={6}>
                      <Label htmlFor="merchant" className="form-label">Nama Pengeluaran {confidenceBadge("merchant")}</Label>
                      <Input
                        id="merchant"
                        value={form.merchant}
                        onChange={(event) => updateForm("merchant", event.target.value)}
                        placeholder="Contoh: Belanja Indomaret"
                      />
                    </Col>

                    <Col md={6}>
                      <Label htmlFor="transactionDate" className="form-label">Tanggal {confidenceBadge("date")}</Label>
                      <Input
                        id="transactionDate"
                        type="date"
                        value={form.transactionDate}
                        onChange={(event) => updateForm("transactionDate", event.target.value)}
                      />
                    </Col>

                    <Col md={6}>
                      <Label htmlFor="categoryGroup" className="form-label">Kategori {confidenceBadge("category")}</Label>
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
                      <Label htmlFor="amount" className="form-label">Nominal {confidenceBadge("total")}</Label>
                      <Input
                        id="amount"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9.]*"
                        value={formatNumberInput(form.amount)}
                        onChange={(event) => updateForm("amount", onlyDigits(event.target.value))}
                        placeholder="Contoh: 93.000"
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
                        placeholder="Tambahkan catatan singkat jika diperlukan"
                      />
                    </Col>

                    <Col xs={12} className="sadar-form-actions">
                      <Button
                        type="button"
                        className="sadar-reset-button"
                        onClick={() => {
                          setForm({ ...initialForm, accountId: form.accountId, source: mode === "ocr" ? "ocr" : "manual" });
                          setScanResult(null);
                          setReceiptFile(null);
                          if (previewUrl) {
                            URL.revokeObjectURL(previewUrl);
                            setPreviewUrl("");
                          }
                          setManualReceiptFile(null);
                          setManualScanId(null);
                          setManualUploadNotice(null);
                          if (manualPreviewUrl) {
                            URL.revokeObjectURL(manualPreviewUrl);
                            setManualPreviewUrl("");
                          }
                        }}
                      >
                        <i className="ri-refresh-line align-bottom me-1" />
                        Atur Ulang
                      </Button>
                      <Button type="submit" className="sadar-save-button" disabled={isSaving || isLoadingAccounts || !accounts.length || isUploadingManual || (mode === "ocr" && parsedResult?.isExpense === false)}>
                        {isSaving ? <Spinner size="sm" className="me-2" /> : <i className="ri-save-3-line align-bottom me-1" />}
                        Simpan Pengeluaran
                      </Button>
                    </Col>
                  </Row>
                </Form>
                ) : (
                <Form onSubmit={handleIncomeSubmit} className="sadar-transaction-form">
                  <Row className="g-3 sadar-form-row">
                    <Col md={6}>
                      <Label htmlFor="income-account" className="form-label">Akun Tujuan</Label>
                      <Input
                        id="income-account"
                        type="select"
                        value={incomeForm.accountId}
                        onChange={(event) => updateIncomeForm("accountId", event.target.value)}
                        disabled={isLoadingAccounts || !accounts.length}
                      >
                        {!accounts.length && (
                          <option value="">
                            {isLoadingAccounts ? "Memuat akun..." : "Belum ada akun"}
                          </option>
                        )}
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name}
                          </option>
                        ))}
                      </Input>
                      {!accounts.length && !isLoadingAccounts && (
                        <div className="mt-2">
                          <Button color="light" size="sm" className="sadar-table-action" tag={Link} to="/profile-account#kelola-account">
                            Tambah Akun Dulu
                          </Button>
                        </div>
                      )}
                    </Col>

                    <Col md={6}>
                      <Label htmlFor="income-date" className="form-label">Tanggal</Label>
                      <Input
                        id="income-date"
                        type="date"
                        value={incomeForm.date}
                        onChange={(event) => updateIncomeForm("date", event.target.value)}
                      />
                    </Col>

                    <Col md={6}>
                      <Label htmlFor="income-source" className="form-label">Sumber Pemasukan</Label>
                      <Input
                        id="income-source"
                        value={incomeForm.source}
                        onChange={(event) => updateIncomeForm("source", event.target.value)}
                        placeholder="Contoh: Gaji bulanan"
                        required
                      />
                    </Col>

                    <Col md={6}>
                      <Label htmlFor="income-amount" className="form-label">Jumlah</Label>
                      <Input
                        id="income-amount"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9.]*"
                        value={formatNumberInput(incomeForm.amount)}
                        onChange={(event) => updateIncomeForm("amount", onlyDigits(event.target.value))}
                        placeholder="Contoh: 8.200.000"
                        required
                      />
                    </Col>

                    <Col xs={12}>
                      <Label htmlFor="income-note" className="form-label">Catatan</Label>
                      <Input
                        id="income-note"
                        type="textarea"
                        rows={5}
                        value={incomeForm.note}
                        onChange={(event) => updateIncomeForm("note", event.target.value)}
                        placeholder="Tambahkan catatan singkat jika diperlukan"
                      />
                    </Col>

                    <Col xs={12} className="sadar-form-actions">
                      <Button
                        type="button"
                        className="sadar-reset-button"
                        onClick={() => setIncomeForm({ ...initialIncomeForm, accountId: incomeForm.accountId })}
                      >
                        <i className="ri-refresh-line align-bottom me-1" />
                        Atur Ulang
                      </Button>
                      <Button type="submit" className="sadar-save-button" disabled={isSaving || isLoadingAccounts || !accounts.length}>
                        {isSaving ? <Spinner size="sm" className="me-2" /> : <i className="ri-save-3-line align-bottom me-1" />}
                        Simpan Pemasukan
                      </Button>
                    </Col>
                  </Row>
                </Form>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TransactionInput;
