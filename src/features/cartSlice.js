import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity } = action.payload;
      const existing = state.items.find(
        (item) => item.product._id === product._id
      );
      if (existing) {
        existing.quantity += quantity;
        existing.totalPrice = existing.quantity * existing.product.price;
      } else {
        state.items.push({ product, quantity, totalPrice: product.price });
      }
    },

    removeFromCart: (state, action) => {
      console.log("Removing from cart:", action.payload, state);
      const productId = action.payload.product._id;
      const existing = state.items.find(
        (item) => item.product._id === productId
      );
      if (existing) {
        if (existing.quantity > 1) {
          existing.quantity -= 1;
          existing.totalPrice = existing.quantity * existing.product.price;
        } else {
          state.items = state.items.filter(
            (item) => item.product._id !== productId
          );
        }
      }
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
