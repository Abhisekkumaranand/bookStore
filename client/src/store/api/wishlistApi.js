import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const wishlistApi = createApi({
  reducerPath: "wishlistApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/wishlist",
    credentials: "include",
  }),
  tagTypes: ["Wishlist", "Cart"],
  endpoints: (builder) => ({
    getWishlist: builder.query({
      query: () => "/",
      providesTags: ["Wishlist"],
    }),
    toggleWishlist: builder.mutation({
      query: (bookId) => ({ url: "/toggle", method: "POST", body: { bookId } }),
      invalidatesTags: ["Wishlist"],
    }),
    moveToCart: builder.mutation({
      query: (bookId) => ({ url: "/move-to-cart", method: "POST", body: { bookId } }),
      invalidatesTags: ["Wishlist", "Cart"], // Also updates the cart!
    }),
  }),
});

export const { useGetWishlistQuery, useToggleWishlistMutation, useMoveToCartMutation } = wishlistApi;