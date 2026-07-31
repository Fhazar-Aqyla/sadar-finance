import { INSTITUTION_TYPES, inferAccountType } from "../constants/bankData";

/**
 * Validates Account Form Inputs
 * Returns an errors object { bank, accountNumber, balance }
 */
export const validateAccountForm = (values = {}, mode = "add") => {
  const errors = {};

  const bankName = String(values.bank || values.name || "").trim();
  const accountNumber = String(values.accountNumber || "").trim();
  const balanceRaw = values.balance;

  // 1. Bank / E-Wallet validation
  if (!bankName) {
    errors.bank = "Silakan pilih bank atau e-wallet.";
  }

  // Determine account type
  const inferredType = values.type || inferAccountType(bankName);
  const isBank = inferredType === INSTITUTION_TYPES.BANK;

  // 2. Account Number validation
  if (accountNumber) {
    if (!/^\d+$/.test(accountNumber)) {
      errors.accountNumber = "Nomor akun hanya boleh berisi angka.";
    }
  } else if (isBank && bankName) {
    // Required if account type is Bank
    errors.accountNumber = "Nomor akun wajib diisi.";
  }

  // 3. Balance validation
  const cleanBalanceDigits = String(balanceRaw || "").replace(/\D/g, "");
  if (balanceRaw !== undefined && balanceRaw !== null && balanceRaw !== "") {
    const numBalance = Number(cleanBalanceDigits);
    if (isNaN(numBalance) || numBalance < 0) {
      errors.balance = mode === "edit"
        ? "Saldo berjalan tidak boleh negatif."
        : "Saldo awal tidak boleh negatif.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Helper to sanitize account number to digits only
 */
export const sanitizeDigitsOnly = (value) => String(value || "").replace(/\D/g, "");

/**
 * Helper to format Rupiah input display (e.g. 500000 -> 500.000)
 */
export const formatRupiahInput = (value) => {
  const digits = sanitizeDigitsOnly(value);
  if (!digits) return "";
  return new Intl.NumberFormat("id-ID").format(Number(digits));
};
