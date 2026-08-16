import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  Label,
  Input,
  Button,
} from "reactstrap";
import SearchableSelect from "../SearchableSelect";
import {
  validateAccountForm,
  sanitizeDigitsOnly,
  formatRupiahInput,
  formatAccountNumberInput,
  INSTITUTION_RULES,
} from "../../utils/accountValidation";
import { findInstitutionByName, inferAccountType, INSTITUTION_TYPES } from "../../constants/bankData";

const defaultFormState = {
  bank: null, // Institution object or string name
  accountNumber: "",
  balance: "",
  type: INSTITUTION_TYPES.BANK,
};

const AccountFormModal = ({
  isOpen,
  toggle,
  mode = "add", // "add" | "edit"
  initialData = null,
  onSave,
  isSaving = false,
}) => {
  const [formState, setFormState] = useState(defaultFormState);
  const [errors, setErrors] = useState({});

  const isEdit = mode === "edit";

  const handleOpened = () => {
    if (isEdit && initialData) {
      const foundInst = findInstitutionByName(initialData.name);
      const resolvedType = initialData.type || (foundInst ? foundInst.type : inferAccountType(initialData.name));
      setFormState({
        bank: foundInst ? foundInst.name : (initialData.name || ""),
        accountNumber: sanitizeDigitsOnly(initialData.accountNumber || ""),
        balance: sanitizeDigitsOnly(initialData.balance || 0),
        type: resolvedType,
      });
    } else {
      setFormState(defaultFormState);
    }
    setErrors({});
  };

  // Handle bank select change
  const handleBankChange = (selectedItem) => {
    const bankName = typeof selectedItem === "object" ? selectedItem.name : selectedItem;
    const inferredType = typeof selectedItem === "object" ? selectedItem.type : inferAccountType(bankName);
    const selectedInst = typeof selectedItem === "object" ? selectedItem : findInstitutionByName(bankName);

    setFormState((prev) => {
      let cleanNum = prev.accountNumber;

      if (inferredType === INSTITUTION_TYPES.E_WALLET || String(inferredType).toLowerCase() === "e-wallet") {
        if (cleanNum.length > 0) {
          if (!/^(0|08|6|62|628)/.test(cleanNum)) {
            cleanNum = "";
          } else {
            const maxDigits = cleanNum.startsWith("62") ? 14 : 13;
            if (cleanNum.length > maxDigits) {
              cleanNum = cleanNum.slice(0, maxDigits);
            }
          }
        }
      } else if (selectedInst && INSTITUTION_RULES[selectedInst.id]) {
        const rule = INSTITUTION_RULES[selectedInst.id];
        if (cleanNum.length > rule.maxLength) {
          cleanNum = cleanNum.slice(0, rule.maxLength);
        }
      }

      return {
        ...prev,
        bank: bankName,
        type: inferredType,
        accountNumber: cleanNum,
      };
    });

    if (errors.bank) {
      setErrors((prev) => ({ ...prev, bank: "" }));
    }
    // Re-validate account number requirement if bank type changed
    if (errors.accountNumber && inferredType !== INSTITUTION_TYPES.BANK) {
      setErrors((prev) => ({ ...prev, accountNumber: "" }));
    }
  };

  // Handle Account Number change (Strict numbers only)
  const handleAccountNumberChange = (e) => {
    const rawVal = e.target.value;
    const digitsOnly = sanitizeDigitsOnly(rawVal);

    // Resolve rules for current bank/e-wallet
    const currentInst = findInstitutionByName(formState.bank);
    const resolvedType = formState.type;

    if (resolvedType === INSTITUTION_TYPES.E_WALLET || String(resolvedType).toLowerCase() === "e-wallet") {
      // E-Wallet validation rules during typing:
      // Must match prefix pattern (starts with 0, 08, 6, 62, 628)
      if (digitsOnly.length > 0) {
        const isValidPrefix = /^(0|08|6|62|628)\d*$/.test(digitsOnly);
        if (!isValidPrefix) {
          return;
        }
      }
      
      // Check maximum digit count
      const maxDigits = digitsOnly.startsWith("62") ? 14 : 13;
      if (digitsOnly.length > maxDigits) {
        return;
      }
    } else if (currentInst && INSTITUTION_RULES[currentInst.id]) {
      // Bank validation rules during typing:
      const rule = INSTITUTION_RULES[currentInst.id];
      if (digitsOnly.length > rule.maxLength) {
        return;
      }
    } else {
      // Fallback maximum length
      if (digitsOnly.length > 18) {
        return;
      }
    }

    setFormState((prev) => ({ ...prev, accountNumber: digitsOnly }));

    // Show feedback if non-digit characters (other than separators) are entered
    const rawWithoutFormat = rawVal.replace(/[- ]/g, "");
    if (/[^\d]/.test(rawWithoutFormat)) {
      setErrors((prev) => ({
        ...prev,
        accountNumber: "Nomor akun hanya boleh berisi angka.",
      }));
    } else if (errors.accountNumber) {
      setErrors((prev) => ({ ...prev, accountNumber: "" }));
    }
  };

  // Handle Balance change (Rupiah formatting)
  const handleBalanceChange = (e) => {
    const digitsOnly = sanitizeDigitsOnly(e.target.value);
    setFormState((prev) => ({ ...prev, balance: digitsOnly }));

    if (errors.balance) {
      setErrors((prev) => ({ ...prev, balance: "" }));
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, errors: validationErrors } = validateAccountForm(
      {
        bank: formState.bank,
        accountNumber: formState.accountNumber,
        balance: formState.balance,
        type: formState.type,
      },
      mode
    );

    // Rekening lama yang nomornya tidak diubah tetap boleh disimpan
    const accountNumberUnchanged =
      isEdit &&
      initialData &&
      sanitizeDigitsOnly(formState.accountNumber) ===
        sanitizeDigitsOnly(String(initialData.accountNumber || ""));

    const finalErrors = accountNumberUnchanged
      ? { ...validationErrors, accountNumber: "" }
      : validationErrors;
    const finalValid = accountNumberUnchanged
      ? Object.keys(finalErrors).every((key) => !finalErrors[key])
      : isValid;

    if (!finalValid) {
      setErrors(finalErrors);
      return;
    }

    // Submit sanitized payload to parent callback
    const payload = {
      name: String(formState.bank).trim(),
      accountName: String(formState.bank).trim(),
      accountNumber: formState.accountNumber.trim(),
      balance: Number(formState.balance || 0),
      type: formState.type,
    };

    await onSave(payload);
  };

  const isBankSelected = formState.type === INSTITUTION_TYPES.BANK;

  return (
    <Modal
      isOpen={isOpen}
      onOpened={handleOpened}
      toggle={toggle}
      centered
      className="sadar-history-modal sadar-account-modal"
    >
      <div className="sadar-account-sheet-handle" aria-hidden="true" />
      <ModalHeader toggle={toggle}>
        <div className="sadar-account-modal-heading">
          <span className="sadar-account-modal-icon" aria-hidden="true">
            <i className={isEdit ? "ri-edit-2-line" : "ri-wallet-3-line"}></i>
          </span>
          <div>
            <span>{isEdit ? "Perbarui rekening" : "Sumber dana baru"}</span>
            <strong>{isEdit ? "Edit Akun" : "Tambah Akun"}</strong>
          </div>
        </div>
      </ModalHeader>
      <Form className="sadar-account-modal-form" onSubmit={handleSubmit} noValidate>
        <ModalBody>
          <div className="sadar-account-form-grid">
            {/* Field 1: Bank / E-Wallet Searchable Select */}
            <div className="sadar-form-field full-width">
              <Label htmlFor="account-bank-select" className="form-label">
                Bank / E-Wallet <span className="text-danger">*</span>
              </Label>
              <SearchableSelect
                id="account-bank-select"
                name="bank"
                value={formState.bank}
                onChange={handleBankChange}
                placeholder="Pilih Bank atau E-Wallet"
                invalid={Boolean(errors.bank)}
                error={errors.bank}
              />
            </div>

            {/* Field 2: Nomor Rekening / Nomor Akun */}
            <div className="sadar-form-field">
              <Label htmlFor="account-number-input" className="form-label">
                {isBankSelected ? "Nomor Rekening" : "Nomor Akun"}{" "}
                {isBankSelected && <span className="text-danger">*</span>}
              </Label>
              <Input
                id="account-number-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formatAccountNumberInput(formState.accountNumber, formState.type, formState.bank)}
                onChange={handleAccountNumberChange}
                placeholder={
                  isBankSelected
                    ? "Masukkan nomor rekening"
                    : "Masukkan nomor HP / akun"
                }
                className={errors.accountNumber ? "is-invalid" : ""}
                autoComplete="off"
              />
              {errors.accountNumber && (
                <div className="invalid-feedback d-block mt-1 fs-12">
                  {errors.accountNumber}
                </div>
              )}
            </div>

            {/* Field 3: Saldo Awal / Saldo Berjalan */}
            <div className="sadar-form-field">
              <Label htmlFor="account-balance-input" className="form-label">
                {isEdit ? "Saldo Berjalan" : "Saldo Awal"}
              </Label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  Rp
                </span>
                <Input
                  id="account-balance-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formatRupiahInput(formState.balance)}
                  onChange={handleBalanceChange}
                  placeholder="Contoh: 500.000"
                  className={`border-start-0 ${errors.balance ? "is-invalid" : ""}`}
                  autoComplete="off"
                />
              </div>
              {errors.balance && (
                <div className="invalid-feedback d-block mt-1 fs-12">
                  {errors.balance}
                </div>
              )}
            </div>
          </div>

          <p className="sadar-account-form-note text-muted mb-0 mt-3 fs-13">
            <i className="ri-information-line" aria-hidden="true"></i>
            {isEdit
              ? "Perubahan akun akan disimpan setelah kamu menekan tombol simpan."
              : "Akun baru akan disimpan setelah kamu menekan tombol simpan."}
          </p>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            color="light"
            onClick={toggle}
            disabled={isSaving}
          >
            <i className="ri-close-line" aria-hidden="true"></i>
            Batal
          </Button>
          <Button type="submit" color="primary" disabled={isSaving}>
            <i className={isSaving ? "ri-loader-4-line sadar-spin" : "ri-check-line"} aria-hidden="true"></i>
            {isSaving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Akun"}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default AccountFormModal;
