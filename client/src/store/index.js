import { configureStore } from "@reduxjs/toolkit";
import theme from "./slices/themeSlice";
import cart from "./slices/cartSlice";
import wishlist from "./slices/wishlistSlice";
import auth from "./slices/authSlice";
import { booksApi } from "./api/booksApi";
import { categoriesApi } from "./api/categoriesApi";
import { authApi } from "./api/authApi";
import { reviewsApi } from "./api/reviewsApi";
import { couponsApi } from "./api/couponsApi";
import { newsletterApi } from "./api/newsletterApi";
import { contactApi } from "./api/contactApi";
import { ordersApi } from "./api/ordersApi";
import { adminApi } from "./api/adminApi";

export const store = configureStore({
  reducer: {
    theme, cart, wishlist, auth,
    [booksApi.reducerPath]: booksApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
    [couponsApi.reducerPath]: couponsApi.reducer,
    [newsletterApi.reducerPath]: newsletterApi.reducer,
    [contactApi.reducerPath]: contactApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (gDM) =>
    gDM().concat(
      booksApi.middleware,
      categoriesApi.middleware,
      authApi.middleware,
      reviewsApi.middleware,
      couponsApi.middleware,
      newsletterApi.middleware,
      contactApi.middleware,
      ordersApi.middleware,
      adminApi.middleware
    )
});
