import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.PROD ? "/api/admin" : "http://localhost:5000/api/admin",
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => "/stats", // Adjust to match your admin.route.js setup
    }),
    getRevenueChart: builder.query({
      query: () => "/revenue-chart",
    }),
    getAllUsers: builder.query({
      query: (params) => ({ url: "/users", params }),
    }),
    getTopSellingBooks: builder.query({
      query: () => "/top-selling-books",
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetRevenueChartQuery,
  useGetAllUsersQuery,
  useGetTopSellingBooksQuery,
} = adminApi;