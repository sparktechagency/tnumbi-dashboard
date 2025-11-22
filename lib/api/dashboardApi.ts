import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from '../baseApi';

// Dashboard API slice
export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Dashboard'],
  endpoints: (builder) => ({
    getDashboardCardData: builder.query({
      query: (data) => {        
        return {
          url: `/analytics/dashboard/stats?=year=${data?.year}`,
          method: "GET"
        }
      },
      providesTags: ['Dashboard'],
    }),
    getDashboardStats: builder.query({
      query: (data) => `/analytics/monthly/user/stats?year=${data?.year}`,
      providesTags: ['Dashboard'],
    }),
        getUserAnalytics: builder.query({
      query: () => '/analytics/monthly/user/stats',
      providesTags: ['Dashboard'],
    }),
    totalRevenue: builder.query({
      query: (data) => `/analytics/monthly/revenue/stats?year=${data?.year}`,
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useTotalRevenueQuery,
  useGetDashboardCardDataQuery,
} = dashboardApi;