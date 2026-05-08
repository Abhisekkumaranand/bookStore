import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const newsletterApi = createApi({
  reducerPath: "newsletterApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.PROD ? "/api/newsletter" : "http://localhost:5000/api/newsletter",
    credentials: "include",
  }),
  endpoints: (builder) => ({
    subscribe: builder.mutation({
      query: (email) => ({
        url: "/subscribe",
        method: "POST",
        body: { email },
      }),
    }),
  }),
});

export const { useSubscribeMutation } = newsletterApi;