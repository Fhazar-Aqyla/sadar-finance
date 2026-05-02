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
    API_URL: import.meta.env.DEV ? "/api" : "https://api-node.themesbrand.website",
  }
};

export const { google, facebook, api } = config;
export default config;
