import { createSlice } from "@reduxjs/toolkit";

const load = () => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("cart") || "[]"); } catch { return []; }
};
const save = (items) => {
  if (typeof window !== "undefined") localStorage.setItem("cart", JSON.stringify(items));
};

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: load() },
  reducers: {
    addToCart: (state, { payload }) => {
      const existing = state.items.find(i => i.id === payload.id);
      if (existing) existing.quantity = Math.min(existing.quantity + 1, payload.stock || 99);
      else state.items.push({ ...payload, quantity: 1 });
      save(state.items);
    },
    removeFromCart: (state, { payload }) => {
      state.items = state.items.filter(i => i.id !== payload);
      save(state.items);
    },
    updateQty: (state, { payload }) => {
      const item = state.items.find(i => i.id === payload.id);
      if (item) item.quantity = Math.max(1, payload.quantity);
      save(state.items);
    },
    clearCart: (state) => { state.items = []; save(state.items); },
  },
});

export const { addToCart, removeFromCart, updateQty, clearCart } = cartSlice.actions;
export const selectCartCount = (s) => s.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartTotal = (s) => s.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
export default cartSlice.reducer;
