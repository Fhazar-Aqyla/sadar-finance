import { createSlice } from "@reduxjs/toolkit";
import { getAllData, getAudiencesMetricsChartsData, getUserDeviceChartsData, getAudiencesSessionsChartsData } from './thunk';

export const initialState = {
  chartData: [],
  audiencesMetricsData: [],
  userDeviceData: [],
  audiencesSessionsData: [],
  error: null
};

const DashboardAnalyticsSlice = createSlice({
  name: 'DashboardAnalytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllData.fulfilled, (state, action) => {
      state.chartData = action.payload;
      state.error = null;
    });
    builder.addCase(getAllData.rejected, (state, action) => {
      state.chartData = [];
      state.error = action.payload?.error || action.error?.message || null;
    });

    builder.addCase(getAudiencesMetricsChartsData.fulfilled, (state, action) => {
      state.audiencesMetricsData = action.payload;
      state.error = null;
    });
    builder.addCase(getAudiencesMetricsChartsData.rejected, (state, action) => {
      state.audiencesMetricsData = [];
      state.error = action.payload?.error || action.error?.message || null;
    });

    builder.addCase(getUserDeviceChartsData.fulfilled, (state, action) => {
      state.userDeviceData = action.payload;
      state.error = null;
    });
    builder.addCase(getUserDeviceChartsData.rejected, (state, action) => {
      state.userDeviceData = [];
      state.error = action.payload?.error || action.error?.message || null;
    });

    builder.addCase(getAudiencesSessionsChartsData.fulfilled, (state, action) => {
      state.audiencesSessionsData = action.payload;
      state.error = null;
    });
    builder.addCase(getAudiencesSessionsChartsData.rejected, (state, action) => {
      state.audiencesSessionsData = [];
      state.error = action.payload?.error || action.error?.message || null;
    });

  }
});

export default DashboardAnalyticsSlice.reducer;
