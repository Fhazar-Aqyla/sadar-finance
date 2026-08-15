import { createAsyncThunk } from "@reduxjs/toolkit";
//Include Both Helper File with needed methods
import {
  getAllData as getAllDataApi,
  getHalfYearlyData as getHalfYearlyDataApi,
  getMonthlyData as getMonthlyDataApi,
  getAllAudiencesMetricsData as getAllAudiencesMetricsDataApi,
  getMonthlyAudiencesMetricsData as getMonthlyAudiencesMetricsDataApi,
  getHalfYearlyAudiencesMetricsData as getHalfYearlyAudiencesMetricsDataApi,
  getYearlyAudiencesMetricsData as getYearlyAudiencesMetricsDataApi,
  getTodayDeviceData as getTodayDeviceDataApi,
  getLastWeekDeviceData as getLastWeekDeviceDataApi,
  getLastMonthDeviceData as getLastMonthDeviceDataApi,
  getCurrentYearDeviceData as getCurrentYearDeviceDataApi,
  getTodaySessionData as getTodaySessionDataApi,
  getLastWeekSessionData as getLastWeekSessionDataApi,
  getLastMonthSessionData as getLastMonthSessionDataApi,
  getCurrentYearSessionData as getCurrentYearSessionDataApi
} from "../../helpers/fakebackend_helper";

const getErrorPayload = (error) => ({
  error: error?.response?.data?.message || error?.message || "Failed to fetch dashboard analytics data",
});

export const getAllData = createAsyncThunk("dashboardAnalytics/getAllData", async (data, { rejectWithValue }) => {
  try {
    var response;

    if (data === "all") {
      response = getAllDataApi(data);
    }
    if (data === "halfyearly") {
      response = getHalfYearlyDataApi(data);
    }
    if (data === "monthly") {
      response = getMonthlyDataApi(data);
    }

    return response;
  } catch (error) {
    return rejectWithValue(getErrorPayload(error));
  }
});

export const getAudiencesMetricsChartsData = createAsyncThunk("dashboardAnalytics/getAudiencesMetricsChartsData", async (data, { rejectWithValue }) => {
  try {
    var response;

    if (data === "all") {
      response = getAllAudiencesMetricsDataApi(data);
    }
    if (data === "monthly") {
      response = getMonthlyAudiencesMetricsDataApi(data);
    }
    if (data === "halfyearly") {
      response = getHalfYearlyAudiencesMetricsDataApi(data);
    }
    if (data === "yearly") {
      response = getYearlyAudiencesMetricsDataApi(data);
    }

    return response;
  } catch (error) {
    return rejectWithValue(getErrorPayload(error));
  }
});

export const getUserDeviceChartsData = createAsyncThunk("dashboardAnalytics/getUserDeviceChartsData", async (data, { rejectWithValue }) => {
  try {
    var response;
    if (data === "today") {
      response = getTodayDeviceDataApi(data);
    }
    if (data === "lastWeek") {
      response = getLastWeekDeviceDataApi(data);
    }
    if (data === "lastMonth") {
      response = getLastMonthDeviceDataApi(data);
    }
    if (data === "currentYear") {
      response = getCurrentYearDeviceDataApi(data);
    }

    return response;
  } catch (error) {
    return rejectWithValue(getErrorPayload(error));
  }
});

export const getAudiencesSessionsChartsData = createAsyncThunk("dashboardAnalytics/getAudiencesSessionsChartsData", async (data, { rejectWithValue }) => {
  try {
    var response;
    if (data === "today") {
      response = getTodaySessionDataApi(data);
    }
    if (data === "lastWeek") {
      response = getLastWeekSessionDataApi(data);
    }
    if (data === "lastMonth") {
      response = getLastMonthSessionDataApi(data);
    }
    if (data === "currentYear") {
      response = getCurrentYearSessionDataApi(data);
    }

    return response;
  } catch (error) {
    return rejectWithValue(getErrorPayload(error));
  }
});
