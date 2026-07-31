import { INSTITUTION_TYPES, inferAccountType, findInstitutionByName } from "../constants/bankData";

export const INSTITUTION_RULES = {
  bca: {
    name: "Bank Central Asia (BCA)",
    minLength: 10,
    maxLength: 10,
    exactLength: true,
    mask: "xxx-xxx-xxxx",
    errorMsg: "Nomor rekening BCA harus terdiri dari 10 digit angka.",
  },
  mandiri: {
    name: "Bank Mandiri",
    minLength: 13,
    maxLength: 13,
    exactLength: true,
    mask: "xxx-xx-xxxxxxx-x",
    errorMsg: "Nomor rekening Mandiri harus terdiri dari 13 digit angka.",
  },
  bri: {
    name: "Bank Rakyat Indonesia (BRI)",
    minLength: 15,
    maxLength: 15,
    exactLength: true,
    mask: "xxxx-xxxx-xxxx-xxx",
    errorMsg: "Nomor rekening BRI harus terdiri dari 15 digit angka.",
  },
  bni: {
    name: "Bank Negara Indonesia (BNI)",
    minLength: 10,
    maxLength: 10,
    exactLength: true,
    mask: "xxx-xxx-xxxx",
    errorMsg: "Nomor rekening BNI harus terdiri dari 10 digit angka.",
  },
  bsi: {
    name: "Bank Syariah Indonesia (BSI)",
    minLength: 10,
    maxLength: 10,
    exactLength: true,
    mask: "xxx-xxx-xxxx",
    errorMsg: "Nomor rekening BSI harus terdiri dari 10 digit angka.",
  },
  cimb: {
    name: "CIMB Niaga",
    minLength: 12,
    maxLength: 13,
    exactLength: false,
    mask: "xxxx-xxxx-xxxx",
    errorMsg: "Nomor rekening CIMB Niaga harus terdiri dari 12–13 digit angka.",
  },
  btn: {
    name: "Bank Tabungan Negara (BTN)",
    minLength: 16,
    maxLength: 16,
    exactLength: true,
    mask: "xxxx-xxxx-xxxx-xxxx",
    errorMsg: "Nomor rekening BTN harus terdiri dari 16 digit angka.",
  },
  danamon: {
    name: "Bank Danamon",
    minLength: 10,
    maxLength: 10,
    exactLength: true,
    mask: "xxx-xxx-xxxx",
    errorMsg: "Nomor rekening Danamon harus terdiri dari 10 digit angka.",
  },
  ocbc: {
    name: "OCBC",
    minLength: 12,
    maxLength: 12,
    exactLength: true,
    mask: "xxxx-xxxx-xxxx",
    errorMsg: "Nomor rekening OCBC harus terdiri dari 12 digit angka.",
  },
  permata: {
    name: "PermataBank",
    minLength: 8,
    maxLength: 16,
    exactLength: false,
    errorMsg: "Masukkan nomor rekening PermataBank yang valid.",
  },
  jago: {
    name: "Bank Jago",
    minLength: 8,
    maxLength: 16,
    exactLength: false,
    errorMsg: "Masukkan nomor rekening Bank Jago yang valid.",
  },
  seabank: {
    name: "SeaBank",
    minLength: 8,
    maxLength: 16,
    exactLength: false,
    errorMsg: "Masukkan nomor rekening SeaBank yang valid.",
  },
  neobank: {
    name: "Bank Neo Commerce",
    minLength: 8,
    maxLength: 16,
    exactLength: false,
    errorMsg: "Masukkan nomor rekening Bank Neo Commerce yang valid.",
  },
  maybank: {
    name: "Maybank Indonesia",
    minLength: 8,
    maxLength: 16,
    exactLength: false,
    errorMsg: "Masukkan nomor rekening Maybank yang valid.",
  },
};

export const applyFormatMask = (digits, mask) => {
  if (!digits) return "";
  let formatted = "";
  let digitIndex = 0;
  for (let i = 0; i < mask.length; i++) {
    if (digitIndex >= digits.length) break;
    if (mask[i] === "x") {
      formatted += digits[digitIndex];
      digitIndex++;
    } else {
      formatted += mask[i];
    }
  }
  return formatted;
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
  const foundInst = findInstitutionByName(bankName);
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
    } else if (foundInst && INSTITUTION_RULES[foundInst.id]) {
      // Bank validation:
      const rule = INSTITUTION_RULES[foundInst.id];
      if (rule.exactLength) {
        if (digitsOnly.length !== rule.maxLength) {
          errors.accountNumber = rule.errorMsg;
        }
      } else {
        if (digitsOnly.length < rule.minLength || digitsOnly.length > rule.maxLength) {
          errors.accountNumber = rule.errorMsg;
        }
      }
    } else {
      // Generic bank validation:
      if (digitsOnly.length < 10 || digitsOnly.length > 18) {
        errors.accountNumber = "Nomor rekening bank harus terdiri dari 10-18 digit.";
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
export const formatAccountNumberInput = (value, type, bankName = "") => {
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

  // If Bank, resolve the specific mask
  const inst = findInstitutionByName(bankName || type);
  if (inst && INSTITUTION_RULES[inst.id] && INSTITUTION_RULES[inst.id].mask) {
    return applyFormatMask(digits, INSTITUTION_RULES[inst.id].mask);
  }

  // Fallback default grouping by 4s
  return digits.replace(/(\d{4})(?=\d)/g, "$1-");
};
