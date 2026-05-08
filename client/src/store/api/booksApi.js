import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const booksApi = createApi({
  reducerPath: "booksApi",
  // Using your real backend URL and including credentials so auth cookies are sent
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    credentials: "include"
  }),
  endpoints: (b) => ({
    listBooks: b.query({
      query: (args) => {
        // Remove undefined and null values so they aren't sent as the string "undefined"
        const cleanArgs = Object.fromEntries(
          Object.entries(args || {}).filter(([_, v]) => v !== undefined && v !== null)
        );

        const params = new URLSearchParams(cleanArgs).toString();
        return params ? `/books?${params}` : `/books`;
      }
    }),
    getBook: b.query({ query: (id) => `/books/${id}` }),
    featured: b.query({ query: () => `/books/featured` }),
    newArrivals: b.query({ query: () => `/books/new-arrivals` }),
    topRated: b.query({ query: () => `/books/top-rated` }),
    recommendations: b.query({ query: (id) => `/books/${id}/recommendations` }),
  }),
});

export const {
  useListBooksQuery, useGetBookQuery, useFeaturedQuery,
  useNewArrivalsQuery, useTopRatedQuery, useRecommendationsQuery,
} = booksApi;
