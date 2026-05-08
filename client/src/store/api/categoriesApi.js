import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const categoriesApi = createApi({
  reducerPath: "categoriesApi",
  baseQuery: fetchBaseQuery({
     baseUrl: "http://localhost:5000/api/categories",
    credentials: "include",
   }),
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => "/",
    }),
  }),
});

export const { useGetCategoriesQuery } = categoriesApi;