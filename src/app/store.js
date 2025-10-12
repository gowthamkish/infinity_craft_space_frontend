import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import productsReducer from "../features/productsSlice";
import cartReducer from "../features/cartSlice";
import adminReducer from "../features/adminSlice";

export const store = configureStore({
  reducer: { 
    auth: authReducer, 
    products: productsReducer, 
    cart: cartReducer,
    admin: adminReducer
  },
});
