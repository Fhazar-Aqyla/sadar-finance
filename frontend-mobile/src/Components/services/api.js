import axios from "axios";
import { api } from "../../config";
import {
  accounts as mockAccounts,
  budgets as mockBudgets,
  incomes as mockIncomes,
  transactions as mockTransactions,
} from "../../pages/SadarShared/mockData";
import { isSadarMockDataScenario } from "./sadarScenario";
import { compressOcrFormData } from "./receiptImage";

const apiClient = axios.create({
  baseURL: api.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const getAuthUser = () => {
  try {
    return JSON.parse(localStorage.getItem("authUser") || "null");
  } catch {
    return null;
  }
};

export const getAuthToken = () => getAuthUser()?.token || null;

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const apiError = error?.response?.data?.error;
    const message =
      apiError?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Terjadi kesalahan saat menghubungi server.";

    const customError = new Error(message);
    if (apiError) {
      customError.code = apiError.code;
      customError.details = apiError.details;
    }

    return Promise.reject(customError);
  },
);

export const unwrapData = (response) => response?.data ?? response;

const clone = (value) => JSON.parse(JSON.stringify(value));

const asBudgetResponse = () => {
  const needs = mockBudgets.find((budget) => budget.category === "Needs");
  const wants = mockBudgets.find((budget) => budget.category === "Wants");
  const savings = mockBudgets.find((budget) => budget.category === "Savings");

  return {
    budget_id: "mock_budget",
    needs_amount: needs?.limit || 0,
    needs_used: needs?.used || 0,
    wants_amount: wants?.limit || 0,
    wants_used: wants?.used || 0,
    savings_amount: savings?.limit || 0,
    savings_used: savings?.used || 0,
    limit_amount: mockBudgets.reduce((total, budget) => total + Number(budget.limit || 0), 0),
  };
};

const getBudgetGroupAmount = (group) =>
  mockTransactions
    .filter((transaction) => transaction.budget_group === group)
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);

const buildMockHealthScore = () => {
  const totalIncome = mockIncomes.reduce((total, income) => total + Number(income.amount || 0), 0);
  const totalExpense = mockTransactions
    .filter((transaction) => transaction.budget_group !== "Savings")
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
  const budgetLimit = mockBudgets.reduce((total, budget) => total + Number(budget.limit || 0), 0);
  const budgetUsed = mockBudgets.reduce((total, budget) => total + Number(budget.used || 0), 0);
  const savingsAmount = getBudgetGroupAmount("Savings");
  const needsAmount = getBudgetGroupAmount("Needs");
  const wantsAmount = getBudgetGroupAmount("Wants");
  const expenseRatio = totalIncome ? totalExpense / totalIncome : 0;
  const budgetUsage = budgetLimit ? budgetUsed / budgetLimit : 0;
  const savingsRate = totalIncome ? savingsAmount / totalIncome : 0;
  const needsRatio = totalIncome ? needsAmount / totalIncome : 0;
  const wantsRatio = totalIncome ? wantsAmount / totalIncome : 0;
  const savingsRatio = totalIncome ? savingsAmount / totalIncome : 0;
  const expenseScore = Math.max(0, Math.round(100 - Math.max(expenseRatio - 0.7, 0) * 160));
  const budgetScore = Math.max(0, Math.round(100 - Math.max(budgetUsage - 0.8, 0) * 200));
  const savingsScore = Math.min(100, Math.round((savingsRate / 0.2) * 100));
  const consistencyScore = 82;
  const allocationScore = Math.max(
    0,
    Math.round(100 - Math.abs(0.5 - needsRatio) * 100 - Math.abs(0.3 - wantsRatio) * 100 - Math.abs(0.2 - savingsRatio) * 100),
  );
  const overallScore = Math.round((expenseScore + budgetScore + savingsScore + consistencyScore + allocationScore) / 5);

  return {
    score: { score: overallScore },
    status: overallScore > 70 ? "Sehat" : overallScore > 40 ? "Cukup Sehat" : "Perlu Perhatian",
    financials: { totalIncome, totalExpense },
    ratios: { expenseRatio, budgetUsage, savingsRate, needsRatio, wantsRatio, savingsRatio },
    breakdown: { overallScore, expenseScore, budgetScore, savingsScore, consistencyScore },
    insights: [
      "Mock data aktif untuk melihat tampilan tanpa mengisi data transaksi backend.",
      "Login tetap menggunakan backend, jadi token dan profil user tetap asli.",
      budgetUsage >= 0.8
        ? "Penggunaan anggaran mock sudah mendekati batas."
        : "Penggunaan anggaran mock masih berada di area aman.",
    ],
    recommendations: [
      "Gunakan skenario ini untuk demo UI, validasi layout, atau presentasi fitur.",
      "Pindah ke skenario backend untuk menguji data milik user yang login.",
    ],
  };
};

const mockApi = {
  accounts: {
    list: () => Promise.resolve(clone(mockAccounts)),
    create: (payload) =>
      Promise.resolve({
        id: `mock_acc_${Date.now()}`,
        name: payload.accountName || "Akun Baru",
        type: payload.accountType || "Bank",
        balance: Number(payload.balance || 0),
        accountNumber: payload.accountNumber || "",
      }),
    update: (id, payload) =>
      Promise.resolve({
        id,
        name: payload.accountName || "Akun",
        type: payload.accountType || "Bank",
        balance: Number(payload.balance || 0),
        accountNumber: payload.accountNumber || "",
      }),
    remove: () => Promise.resolve({ success: true }),
  },
  transactions: {
    list: () => Promise.resolve(clone(mockTransactions)),
    create: (payload) => Promise.resolve({ id: `mock_trx_${Date.now()}`, ...payload }),
    update: (id, payload) => Promise.resolve({ id, ...payload }),
    remove: () => Promise.resolve({ success: true }),
    summary: () => Promise.resolve({}),
    monthlyTrend: () => Promise.resolve([]),
  },
  incomes: {
    list: () => Promise.resolve(clone(mockIncomes)),
    create: (payload) => Promise.resolve({ id: `mock_inc_${Date.now()}`, ...payload }),
    update: (id, payload) => Promise.resolve({ id, ...payload }),
    remove: () => Promise.resolve({ success: true }),
    monthlyTrend: () => Promise.resolve([]),
  },
  analytics: {
    latestBudget: () => Promise.resolve(asBudgetResponse()),
    createBudget: (payload) => Promise.resolve({ id: `mock_budget_${Date.now()}`, ...payload }),
    healthScore: () => Promise.resolve(buildMockHealthScore()),
    latestScore: () => Promise.resolve(buildMockHealthScore()),
    scoreHistory: () => Promise.resolve([]),
    behaviorPredict: () =>
      Promise.resolve({
        risk_level: "medium",
        message: "Prediksi memakai mock data. Gunakan backend scenario untuk hasil model asli.",
      }),
    categorize: (payload) => Promise.resolve(payload),
    behavior: (payload) => Promise.resolve(payload),
    overspending: (payload) => Promise.resolve(payload),
    insights: () => Promise.resolve([]),
    alerts: () => Promise.resolve([]),
  },
  auth: {
    login: (payload) =>
      Promise.resolve({
        token: "mock-jwt-token-demo-sadar-finance",
        user: {
          id: "user_demo_01",
          users_id: "user_demo_01",
          first_name: "Demo",
          last_name: "User",
          name: "Demo User",
          email: payload?.email || "demo@sadarfinance.com",
          gender: "male",
          occupation: "Software Engineer",
          avatar: "",
        },
      }),
    me: () =>
      Promise.resolve({
        id: "user_demo_01",
        users_id: "user_demo_01",
        first_name: "Demo",
        last_name: "User",
        name: "Demo User",
        email: "demo@sadarfinance.com",
        gender: "male",
        occupation: "Software Engineer",
        avatar: "",
      }),
    updateMe: (payload) =>
      Promise.resolve({
        id: "user_demo_01",
        users_id: "user_demo_01",
        first_name: payload?.first_name || "Demo",
        last_name: payload?.last_name || "User",
        email: payload?.email || "demo@sadarfinance.com",
      }),
    register: (payload) =>
      Promise.resolve({
        token: "mock-jwt-token-demo-sadar-finance",
        user: {
          id: "user_demo_01",
          first_name: payload?.first_name || "Demo",
          email: payload?.email || "demo@sadarfinance.com",
        },
      }),
    forgotPassword: () =>
      Promise.resolve({ message: "Reset password link dikirim (Mock)" }),
  },
};

export const authApi = {
  register: (payload) =>
    isSadarMockDataScenario
      ? mockApi.auth.register(payload)
      : apiClient.post("/auth/register", payload).then(unwrapData),
  login: (payload) =>
    isSadarMockDataScenario
      ? mockApi.auth.login(payload)
      : apiClient.post("/auth/login", payload).then(unwrapData),
  forgotPassword: (payload) =>
    isSadarMockDataScenario
      ? mockApi.auth.forgotPassword(payload)
      : apiClient.post("/auth/forgot-password", payload).then(unwrapData),
  me: () =>
    isSadarMockDataScenario
      ? mockApi.auth.me()
      : apiClient.get("/auth/me").then(unwrapData),
  updateMe: (payload) =>
    isSadarMockDataScenario
      ? mockApi.auth.updateMe(payload)
      : apiClient
          .put("/auth/me", payload)
          .then(unwrapData)
          .catch(() => mockApi.auth.updateMe(payload)),
  updateAvatar: (formData) =>
    isSadarMockDataScenario
      ? Promise.resolve({ profile_picture: "" })
      : apiClient
          .post("/auth/profile-picture", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
          .then(unwrapData),
  deleteAccount: (password) =>
    isSadarMockDataScenario
      ? Promise.resolve({ message: "Account deleted (Mock)" })
      : apiClient.delete("/auth/me", { data: { password } }).then(unwrapData),
};

export const accountApi = {
  list: () => isSadarMockDataScenario ? mockApi.accounts.list() : apiClient.get("/accounts").then(unwrapData),
  create: (payload) => isSadarMockDataScenario ? mockApi.accounts.create(payload) : apiClient.post("/accounts", payload).then(unwrapData),
  update: (id, payload) => isSadarMockDataScenario ? mockApi.accounts.update(id, payload) : apiClient.put(`/accounts/${id}`, payload).then(unwrapData),
  remove: (id) => isSadarMockDataScenario ? mockApi.accounts.remove(id) : apiClient.delete(`/accounts/${id}`),
};

export const transactionApi = {
  list: (params = {}) => isSadarMockDataScenario ? mockApi.transactions.list(params) : apiClient.get("/transactions", { params }).then(unwrapData),
  create: (payload) => isSadarMockDataScenario ? mockApi.transactions.create(payload) : apiClient.post("/transactions", payload).then(unwrapData),
  update: (id, payload) => isSadarMockDataScenario ? mockApi.transactions.update(id, payload) : apiClient.put(`/transactions/${id}`, payload).then(unwrapData),
  remove: (id) => isSadarMockDataScenario ? mockApi.transactions.remove(id) : apiClient.delete(`/transactions/${id}`),
  summary: (params = {}) => isSadarMockDataScenario ? mockApi.transactions.summary(params) : apiClient.get("/transactions/summary", { params }).then(unwrapData),
  monthlyTrend: (params = {}) => isSadarMockDataScenario ? mockApi.transactions.monthlyTrend(params) : apiClient.get("/transactions/trend/monthly", { params }).then(unwrapData),
};

export const incomeApi = {
  list: (params = {}) => isSadarMockDataScenario ? mockApi.incomes.list(params) : apiClient.get("/incomes", { params }).then(unwrapData),
  create: (payload) => isSadarMockDataScenario ? mockApi.incomes.create(payload) : apiClient.post("/incomes", payload).then(unwrapData),
  update: (id, payload) => isSadarMockDataScenario ? mockApi.incomes.update(id, payload) : apiClient.put(`/incomes/${id}`, payload).then(unwrapData),
  remove: (id) => isSadarMockDataScenario ? mockApi.incomes.remove(id) : apiClient.delete(`/incomes/${id}`),
  monthlyTrend: (params = {}) => isSadarMockDataScenario ? mockApi.incomes.monthlyTrend(params) : apiClient.get("/incomes/trend/monthly", { params }).then(unwrapData),
};

export const analyticsApi = {
  categorize: (payload) => isSadarMockDataScenario ? mockApi.analytics.categorize(payload) : apiClient.post("/analytics/categorize", payload).then(unwrapData),
  behavior: (payload) => isSadarMockDataScenario ? mockApi.analytics.behavior(payload) : apiClient.post("/analytics/behavior", payload).then(unwrapData),
  behaviorPredict: (payload) => isSadarMockDataScenario ? mockApi.analytics.behaviorPredict(payload) : apiClient.post("/analytics/behavior/predict", payload).then(unwrapData),
  overspending: (payload) => isSadarMockDataScenario ? mockApi.analytics.overspending(payload) : apiClient.post("/analytics/overspending", payload).then(unwrapData),
  healthScore: (payload) => isSadarMockDataScenario ? mockApi.analytics.healthScore(payload) : apiClient.post("/analytics/health-score", payload).then(unwrapData),
  latestScore: () => isSadarMockDataScenario ? mockApi.analytics.latestScore() : apiClient.get("/analytics/health-score/latest").then(unwrapData),
  scoreHistory: (params = {}) => isSadarMockDataScenario ? mockApi.analytics.scoreHistory(params) : apiClient.get("/analytics/health-score/history", { params }).then(unwrapData),
  createBudget: (payload) => isSadarMockDataScenario ? mockApi.analytics.createBudget(payload) : apiClient.post("/analytics/budget", payload).then(unwrapData),
  latestBudget: () => isSadarMockDataScenario ? mockApi.analytics.latestBudget() : apiClient.get("/analytics/budget").then(unwrapData),
  insights: (params = {}) => isSadarMockDataScenario ? mockApi.analytics.insights(params) : apiClient.get("/analytics/insights", { params }).then(unwrapData),
  alerts: (params = {}) => isSadarMockDataScenario ? mockApi.analytics.alerts(params) : apiClient.get("/analytics/alerts", { params }).then(unwrapData),
};

export const ocrApi = {
  upload: async (formData) =>
    apiClient.post("/ocr/upload", await compressOcrFormData(formData), {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(unwrapData),
  get: (id) => apiClient.get(`/ocr/${id}`).then(unwrapData),
  list: (params = {}) => apiClient.get("/ocr", { params }).then(unwrapData),
  confirmTransaction: (id, payload) => apiClient.post(`/ocr/${id}/confirm-transaction`, payload).then(unwrapData),
};

export default apiClient;
