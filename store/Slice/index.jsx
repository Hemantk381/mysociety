import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cartData',
  initialState: {
    items: [],
  },
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        // If the item already exists, update the quantity
        existingItem.quantity += action.payload.quantity;
      } else {
        // If it doesn't exist, add the item to the cart
        state.items.push(action.payload);
      }
    },
    removeFromCart: (state, action) => {
      // Remove item by id
      state.items = state.items.filter(item => item.id !== action.payload.id);
    },
    updateQuantity: (state, action) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity; // Update quantity based on the payload
        if (item.quantity <= 0) {
          // If quantity is 0 or less, remove the item
          state.items = state.items.filter(item => item.id !== action.payload.id);
        }
      }
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity } = cartSlice.actions;

export default cartSlice.reducer;
