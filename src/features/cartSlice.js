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

    updateCartItemQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const existing = state.items.find(
        (item) => item.product._id === productId
      );
      if (existing) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          state.items = state.items.filter(
            (item) => item.product._id !== productId
          );
        } else {
          existing.quantity = quantity;
          existing.totalPrice = existing.quantity * existing.product.price;
        }
      }
    },

    removeItemCompletely: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(
        (item) => item.product._id !== productId
      );
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { 
  addToCart, 
  removeFromCart, 
  updateCartItemQuantity, 
  removeItemCompletely, 
  clearCart 
} = cartSlice.actions;
export default cartSlice.reducer;
