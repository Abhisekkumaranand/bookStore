import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.PROD ? "/api/orders" : "http://localhost:5000/api/orders",
    credentials: "include",
  }),
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: "/",
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: ["Order"],
    }),
    getMyOrders: builder.query({
      query: () => "/myorders",
      providesTags: ["Order"],
    }),
    getOrderById: builder.query({
      query: (id) => `/${id}`,
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
} = ordersApi;