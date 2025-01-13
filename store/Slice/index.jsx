import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cartData",
  initialState: {
    items: [],
    itemsCart: [],
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
    addToCartOnCart: (state, action) => {
      const existingItem = state.itemsCart.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.itemsCart.push(action.payload);
      }
    },
    removeFromCartOnCart: (state, action) => {
      state.itemsCart = state.itemsCart.filter(
        (item) => item.id !== action.payload.id
      );
    },
    updateQuantityOnCart: (state, action) => {
      const item = state.itemsCart.find(
        (item) => item.id === action.payload.id
      );
      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.itemsCart = state.items.filter(
            (item) => item.id !== action.payload.id
          );
        }
      }
    },
    clearItemsCart: (state) => {
      state.items = [];
    },
    clearItemsOnCart: (state) => {
      state.itemsCart = [];
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  removeFromCartOnCart,
  updateQuantityOnCart,
  shopId,
  addToCartOnCart,
  setShopId,
  setUserId,
  clearItemsOnCart,
  clearItemsCart,
  userId,
} = cartSlice.actions;

export default cartSlice.reducer;
