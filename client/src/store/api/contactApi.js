import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const contactApi = createApi({
  reducerPath: "contactApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.PROD ? "/api/contact" : "http://localhost:5000/api/contact",
    credentials: "include",
  }),
  endpoints: (builder) => ({
    submitContactForm: builder.mutation({
      query: (formData) => ({
        url: "/",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const { useSubmitContactFormMutation } = contactApi;