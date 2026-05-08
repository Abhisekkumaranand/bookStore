import { createSlice } from "@reduxjs/toolkit";

const load = () => {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
};

const authSlice = createSlice({
  name: "auth",
  initialState: { user: load() },
  reducers: {
    loginSuccess: (state, { payload }) => {
      state.user = payload;
      if (typeof window !== "undefined") localStorage.setItem("user", JSON.stringify(payload));
    },
    logout: (state) => {
      state.user = null;
      if (typeof window !== "undefined") localStorage.removeItem("user");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
