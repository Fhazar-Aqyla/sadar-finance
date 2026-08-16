/**
 * Financial Institutions Data Constant for SADAR Finance
 * Includes Banks and E-Wallets with their icons, types, and labels.
 */

export const INSTITUTION_TYPES = {
  BANK: "Bank",
  E_WALLET: "E-wallet",
};

export const FINANCIAL_INSTITUTIONS = [
  // Featured Bank (DBS) pinned on top
  { id: "dbs", name: "Bank DBS Indonesia", shortName: "DBS", type: INSTITUTION_TYPES.BANK, icon: "ri-bank-line", featured: true },

  // Bank List (Ordered by popularity)
  { id: "bca", name: "Bank Central Asia (BCA)", shortName: "BCA", type: INSTITUTION_TYPES.BANK, icon: "ri-bank-line" },
  { id: "mandiri", name: "Bank Mandiri", shortName: "Mandiri", type: INSTITUTION_TYPES.BANK, icon: "ri-bank-line" },
  { id: "bri", name: "Bank Rakyat Indonesia (BRI)", shortName: "BRI", type: INSTITUTION_TYPES.BANK, icon: "ri-bank-line" },
  { id: "bni", name: "Bank Negara Indonesia (BNI)", shortName: "BNI", type: INSTITUTION_TYPES.BANK, icon: "ri-bank-line" },
  { id: "bsi", name: "Bank Syariah Indonesia (BSI)", shortName: "BSI", type: INSTITUTION_TYPES.BANK, icon: "ri-bank-line" },
  { id: "cimb", name: "CIMB Niaga", shortName: "CIMB Niaga", type: INSTITUTION_TYPES.BANK, icon: "ri-bank-line" },
  { id: "btn", name: "BTN", shortName: "BTN", type: INSTITUTION_TYPES.BANK, icon: "ri-bank-line" },
  { id: "permata", name: "Permata Bank", shortName: "Permata", type: INSTITUTION_TYPES.BANK, icon: "ri-bank-line" },
  { id: "danamon", name: "Danamon", shortName: "Danamon", type: INSTITUTION_TYPES.BANK, icon: "ri-bank-line" },
  { id: "jago", name: "Bank Jago", shortName: "Jago", type: INSTITUTION_TYPES.BANK, icon: "ri-bank-line" },
  { id: "seabank", name: "SeaBank", shortName: "SeaBank", type: INSTITUTION_TYPES.BANK, icon: "ri-bank-line" },
  { id: "neobank", name: "Neo Bank", shortName: "Neo Bank", type: INSTITUTION_TYPES.BANK, icon: "ri-bank-line" },
  { id: "maybank", name: "Maybank", shortName: "Maybank", type: INSTITUTION_TYPES.BANK, icon: "ri-bank-line" },
  { id: "ocbc", name: "OCBC", shortName: "OCBC", type: INSTITUTION_TYPES.BANK, icon: "ri-bank-line" },

  // E-Wallet List
  { id: "gopay", name: "GoPay", shortName: "GoPay", type: INSTITUTION_TYPES.E_WALLET, icon: "ri-wallet-3-line" },
  { id: "ovo", name: "OVO", shortName: "OVO", type: INSTITUTION_TYPES.E_WALLET, icon: "ri-wallet-3-line" },
  { id: "dana", name: "DANA", shortName: "DANA", type: INSTITUTION_TYPES.E_WALLET, icon: "ri-wallet-3-line" },
  { id: "shopeepay", name: "ShopeePay", shortName: "ShopeePay", type: INSTITUTION_TYPES.E_WALLET, icon: "ri-wallet-3-line" },
  { id: "linkaja", name: "LinkAja", shortName: "LinkAja", type: INSTITUTION_TYPES.E_WALLET, icon: "ri-wallet-3-line" },
];

export const INSTITUTION_GROUPS = [
  {
    type: INSTITUTION_TYPES.BANK,
    label: "Bank",
    icon: "ri-bank-line",
    items: FINANCIAL_INSTITUTIONS.filter((item) => item.type === INSTITUTION_TYPES.BANK),
  },
  {
    type: INSTITUTION_TYPES.E_WALLET,
    label: "E-Wallet",
    icon: "ri-wallet-3-line",
    items: FINANCIAL_INSTITUTIONS.filter((item) => item.type === INSTITUTION_TYPES.E_WALLET),
  },
];

/**
 * Finds an institution by ID or name string.
 * Supports legacy name matching for existing accounts.
 */
export const findInstitutionByName = (nameOrId) => {
  if (!nameOrId) return null;
  const target = String(nameOrId).trim().toLowerCase();

  // Direct match by ID or full name
  const exact = FINANCIAL_INSTITUTIONS.find(
    (inst) =>
      inst.id.toLowerCase() === target ||
      inst.name.toLowerCase() === target ||
      inst.shortName.toLowerCase() === target
  );
  if (exact) return exact;

  // Partial substring match
  const partial = FINANCIAL_INSTITUTIONS.find(
    (inst) =>
      target.includes(inst.shortName.toLowerCase()) ||
      inst.name.toLowerCase().includes(target)
  );
  return partial || null;
};

/**
 * Infers account type ("Bank" or "E-wallet") based on bank/institution name.
 */
export const inferAccountType = (institutionName) => {
  const found = findInstitutionByName(institutionName);
  if (found) return found.type;

  const lower = String(institutionName || "").toLowerCase();
  if (
    lower.includes("gopay") ||
    lower.includes("ovo") ||
    lower.includes("dana") ||
    lower.includes("shopee") ||
    lower.includes("linkaja") ||
    lower.includes("wallet")
  ) {
    return INSTITUTION_TYPES.E_WALLET;
  }
  return INSTITUTION_TYPES.BANK;
};
