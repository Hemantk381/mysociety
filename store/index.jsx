// app/store.js
import { configureStore } from '@reduxjs/toolkit';
import cartSlice from "./Slice"
export const store = configureStore({
  reducer: {
    cartData: cartSlice,
  },
});
