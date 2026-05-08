import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const reviewsApi = createApi({
  reducerPath: "reviewsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.PROD ? "/api/reviews" : "http://localhost:5000/api/reviews",
    credentials: "include",
  }),
  tagTypes: ["Review"],
  endpoints: (builder) => ({
    getBookReviews: builder.query({
      query: (bookId) => `/book/${bookId}`,
      providesTags: ["Review"],
    }),
    addReview: builder.mutation({
      query: (reviewData) => ({
        url: "/",
        method: "POST",
        body: reviewData,
      }),
      invalidatesTags: ["Review"],
    }),
  }),
});

export const { useGetBookReviewsQuery, useAddReviewMutation } = reviewsApi;