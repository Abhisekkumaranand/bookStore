import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const couponsApi = createApi({
  reducerPath: "couponsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:5000/api/coupons" ,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    validateCoupon: builder.mutation({
      query: (code) => ({
        url: "/validate",
        method: "POST",
        body: { code },
      }),
    }),
  }),
});

export const { useValidateCouponMutation } = couponsApi;