import { INSTITUTION_TYPES, inferAccountType } from "../constants/bankData";

export const GENERIC_BANK_RULE = {
  minLength: 6,
  maxLength: 20,
  exactLength: false,
  errorMsg: "Nomor rekening bank harus terdiri dari 6-20 digit.",
};

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
  const digitsOnly = accountNumber.replace(/\D/g, "");

  if (digitsOnly) {
    if (inferredType === INSTITUTION_TYPES.E_WALLET || String(inferredType).toLowerCase() === "e-wallet") {
      // E-Wallet validation:
      const startsWith08 = digitsOnly.startsWith("08");
      const startsWith628 = digitsOnly.startsWith("628");
      const requiredMin = startsWith628 ? 11 : 10;
      const requiredMax = startsWith628 ? 14 : 13;

      if (!startsWith08 && !startsWith628) {
        errors.accountNumber = "Nomor HP e-wallet harus dimulai dengan 08 atau 628.";
      } else if (digitsOnly.length < requiredMin || digitsOnly.length > requiredMax) {
        errors.accountNumber = `Nomor HP e-wallet harus terdiri dari ${requiredMin}-${requiredMax} digit.`;
      }
    } else {
      // Generic bank validation (applies to all banks)
      if (digitsOnly.length < GENERIC_BANK_RULE.minLength || digitsOnly.length > GENERIC_BANK_RULE.maxLength) {
        errors.accountNumber = GENERIC_BANK_RULE.errorMsg;
      }
    }
  } else if (isBank && bankName) {
    // Required if account type is Bank
    errors.accountNumber = "Nomor rekening wajib diisi.";
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

/**
 * Helper to format Bank Account Number or E-Wallet Phone Number
 */
export const formatAccountNumberInput = (value, type) => {
  const digits = sanitizeDigitsOnly(value);
  if (!digits) return "";

  // If E-Wallet or phone number type
  if (type === INSTITUTION_TYPES.E_WALLET || String(type).toLowerCase() === "e-wallet") {
    if (digits.startsWith("62")) {
      // 6281234567890 -> 62-812-3456-7890
      let formatted = "62";
      if (digits.length > 2) formatted += "-" + digits.slice(2, 5);
      if (digits.length > 5) formatted += "-" + digits.slice(5, 9);
      if (digits.length > 9) formatted += "-" + digits.slice(9, 14);
      return formatted;
    } else {
      // 081234567890 -> 0812-3456-7890
      let formatted = digits.slice(0, 4);
      if (digits.length > 4) formatted += "-" + digits.slice(4, 8);
      if (digits.length > 8) formatted += "-" + digits.slice(8, 13);
      return formatted;
    }
  }

  // Bank account numbers: generic grouping by 4s
  return digits.replace(/(\d{4})(?=\d)/g, "$1-");
};
