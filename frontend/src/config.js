const config = {
  google: {
    API_KEY: "",
    CLIENT_ID: "",
    SECRET: "",
  },
  facebook: {
    APP_ID: "",
  },
  api: {
    API_URL: import.meta.env.VITE_API_URL || "https://sadar-finance.up.railway.app/api/v1",
  }
};

export const { google, facebook, api } = config;
export default config;
