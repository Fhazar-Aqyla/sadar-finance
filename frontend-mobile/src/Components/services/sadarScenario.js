export const SADAR_DATA_SCENARIOS = {
  MOCK_WITH_BACKEND_AUTH: "mock-with-backend-auth",
  BACKEND_WITH_BACKEND_AUTH: "backend-with-backend-auth",
  BACKEND_ONLY: "backend-only",
};

const normalizeScenario = (value) => {
  const scenario = String(value || "").trim().toLowerCase();

  if (["mock", "mock-data", "demo", "demo-auth", SADAR_DATA_SCENARIOS.MOCK_WITH_BACKEND_AUTH].includes(scenario)) {
    return SADAR_DATA_SCENARIOS.MOCK_WITH_BACKEND_AUTH;
  }

  if (["backend", "backend-auth", "api", SADAR_DATA_SCENARIOS.BACKEND_WITH_BACKEND_AUTH].includes(scenario)) {
    return SADAR_DATA_SCENARIOS.BACKEND_WITH_BACKEND_AUTH;
  }

  if (["backend-only", "production", "prod", "strict"].includes(scenario)) {
    return SADAR_DATA_SCENARIOS.BACKEND_ONLY;
  }

  return SADAR_DATA_SCENARIOS.BACKEND_ONLY;
};

export const sadarDataScenario = normalizeScenario(import.meta.env.VITE_SADAR_DATA_SCENARIO);

export const isSadarMockDataScenario =
  sadarDataScenario === SADAR_DATA_SCENARIOS.MOCK_WITH_BACKEND_AUTH;

export const isSadarBackendDataScenario =
  sadarDataScenario === SADAR_DATA_SCENARIOS.BACKEND_WITH_BACKEND_AUTH ||
  sadarDataScenario === SADAR_DATA_SCENARIOS.BACKEND_ONLY;

export const isSadarBackendOnlyScenario =
  sadarDataScenario === SADAR_DATA_SCENARIOS.BACKEND_ONLY;

export const getSadarScenarioLabel = () => {
  if (isSadarMockDataScenario) return "Mock data + login backend";
  if (sadarDataScenario === SADAR_DATA_SCENARIOS.BACKEND_WITH_BACKEND_AUTH) {
    return "Data backend + login backend";
  }
  return "Pure backend";
};
