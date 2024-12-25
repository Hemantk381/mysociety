import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cartData",
  initialState: {
    items: [],
    shopId: null,
    userId: null,
  },
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload.id);
    },
    setShopId: (state, action) => {
      state.shopId = action.payload.id; // Corrected reducer
    },
    setUserId: (state, action) => {
      state.userId = action.payload.id; // Corrected reducer
    },
    updateQuantity: (state, action) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.items = state.items.filter(
            (item) => item.id !== action.payload.id
          );
        }
      }
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  shopId,
  setShopId,
  setUserId,
  userId,
} = cartSlice.actions;

export default cartSlice.reducer;
