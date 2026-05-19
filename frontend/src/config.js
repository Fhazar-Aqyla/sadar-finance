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
    API_URL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3000/api/v1" : "https://api-node.themesbrand.website"),
  }
};

export const { google, facebook, api } = config;
export default config;
