import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity } from '@/store/Slice';

export default function CartScreen() {
  const cartItems = useSelector((state) => state.cartData.items);
  const dispatch = useDispatch();

  const handleUpdateQuantity = (item, quantity) => {
    if (quantity <= 0) {
      // Remove from cart if quantity is zero
      dispatch(removeFromCart(item));
    } else {
      // Update quantity in cart
      dispatch(updateQuantity({ id: item.id, quantity }));
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Text style={styles.cartItemName}>{item.product_name}</Text>
      <Text style={styles.cartItemPrice}>₹{item.price}</Text>
      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={() => handleUpdateQuantity(item, item.quantity - 1)}>
          <Text style={styles.quantityButton}>-</Text>
        </TouchableOpacity>
        <Text style={styles.cartItemQuantity}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => handleUpdateQuantity(item, item.quantity + 1)}>
          <Text style={styles.quantityButton}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cart</Text>
      {cartItems.length === 0 ? (
        <Text style={styles.emptyCartText}>Your cart is empty</Text>
      ) : (
        <FlatList
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
  },
  cartItemName: {
    fontSize: 16,
    flex: 1, // Allow name to take available space
  },
  cartItemPrice: {
    fontSize: 16,
    marginHorizontal: 10, // Add spacing between price and quantity
  },
  cartItemQuantity: {
    fontSize: 16,
    marginHorizontal: 10, // Add spacing for the quantity display
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  removeItemText: {
    color: 'red',
  },
  emptyCartText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: '#888',
  },
});
