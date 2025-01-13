import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import axios from "axios";
import config from "../../config";
import { useSelector, useDispatch } from "react-redux";
import {
  addToCart,
  addToCartOnCart,
  removeFromCartOnCart,
  updateQuantityOnCart,
} from "@/store/Slice";
import { useNavigation } from "@react-navigation/native";

export default function CartScreen() {
  const currentShopId = useSelector((state) => state.cartData.shopId);
  const userID = useSelector((state) => state.cartData.userId);
  const [cartDetails, setCartDetails] = useState([]);
  const [totalAmountDetails, setTotalAmountDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const apiUrl = config.API_URL;

  const fetchListData = useCallback(async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${apiUrl}/api/cartList`, {
        params: {
          user_id: userID,
          shop_id: currentShopId,
        },
      });
      setCartDetails(response.data?.data || []);
      if (response.data?.data?.length > 0) {
        const inital = response.data?.data?.filter(
          (item) => item.quantity !== null
        );

        inital?.map((item) => dispatch(addToCartOnCart(item))); // Optimistic update
      }
      // dispatch(addToCart([]));
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      dispatch(addToCartOnCart([])); // Optimistic update
    } finally {
      setLoading(false);
    }
  }, [userID, currentShopId, apiUrl]);

  useEffect(() => {
    fetchListData();
  }, [fetchListData]);

  const fetchCartAmount = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/TotalCartAmt`, {
        params: {
          user_id: userID,
          shop_id: currentShopId,
        },
      });
      setTotalAmountDetails(response.data?.data);
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      setTotalAmountDetails(null);
    } finally {
      setLoading(false);
    }
  }, [userID, currentShopId, apiUrl]);

  useEffect(() => {
    fetchCartAmount();
  }, [fetchCartAmount]);

  const handelDeleteProduct = async (product) => {
    try {
      await axios.delete(`${apiUrl}/api/deleteCart`, {
        data: {
          user_id: userID,
          product_id: product.id,
          shop_id: currentShopId,
        },
      });
      fetchListData();
      fetchCartAmount();
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
    }
  };

  const PenderCartItem = React.memo(({ item }) => {
    const cartItems = useSelector((state) => state.cartData.itemsCart);
    const cartItem = cartItems.find((cartItem) => cartItem.id === item.id);
    const quantity = cartItem ? cartItem.quantity : 0; // Ensure quantity reflects the current state

    const handleUpdateQuantity = async (newQuantity) => {
      if (newQuantity <= 0) {
        dispatch(removeFromCartOnCart(item)); // Optimistic update
      }
      dispatch(updateQuantityOnCart({ id: item.id, quantity: newQuantity })); // Optimistic update

      try {
        await axios.post(`${apiUrl}/api/addToCart`, {
          user_id: userID,
          product_id: item.id,
          quantity: newQuantity,
          shop_id: currentShopId,
        });
        fetchCartAmount();
      } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        Alert.alert("Error", "Failed to update the cart");
        dispatch(updateQuantityOnCart({ id: item.id, quantity: quantity })); // Rollback
      }
    };
    return (
      <View style={styles.cartItem}>
        <TouchableOpacity
          onPress={() => handelDeleteProduct(item)}
          style={styles.removeButton}
        >
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
        <Image
          source={{ uri: item.product_image }}
          style={styles.productImage}
        />
        <View style={styles.cartItemDetails}>
          <Text style={styles.cartItemName}>{item.product_name}</Text>
          <Text style={styles.cartItemSubtext}>Spicy chicken</Text>
          <Text style={styles.cartItemPrice}>{item.price.toFixed(2)}</Text>
        </View>

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => handleUpdateQuantity(quantity - 1)}
            style={[styles.quantityButton, { backgroundColor: "#FF6F61" }]}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.quantityText}>{quantity}</Text>

          <TouchableOpacity
            onPress={() => handleUpdateQuantity(quantity + 1)}
            style={[styles.quantityButton, { backgroundColor: "#4CAF50" }]}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  });

  const handelPlaceOrder = async () => {
    // navigation.navigate("Orders");
    try {
      await axios.post(`${apiUrl}/api/order`, {
        user_id: userID,
        shop_id: currentShopId,
      });
      navigation.navigate("Orders");
      // fetchListData();
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
    }
  };
  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#FF6F61"
          style={styles.loadingSpinner}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <FlatList
            data={cartDetails}
            renderItem={({ item }) => <PenderCartItem item={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.cartList}
          />

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {totalAmountDetails?.amout_breakup?.sub_total}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax and Fees</Text>
              <Text style={styles.summaryValue}>
                {totalAmountDetails?.amout_breakup?.tax}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={styles.summaryValue}>
                {totalAmountDetails?.amout_breakup?.delivery_charge}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, styles.totalLabel]}>
                Total
              </Text>
              <Text style={[styles.summaryValue, styles.totalValue]}>
                {totalAmountDetails?.amout_breakup?.total_amount}
              </Text>
            </View>
            <View style={{ marginTop: 10 }}>
              <Text>Deliver to :</Text>
              <Text style={{ marginTop: 4 }}>
                {`${totalAmountDetails?.userAddress?.flat_no} ${totalAmountDetails?.userAddress?.building_name} ${totalAmountDetails?.userAddress?.society_name}`}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={styles.gotocart}
          onPress={() => handelPlaceOrder()}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            {/* {totalItems} items | ₹{totalPrice.toFixed(2)} */}
          </Text>
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Place Order
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,

    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    overflow: "hidden",
    height: 600,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  scrollContainer: {
    padding: 10,
    marginVertical: 10,

    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    overflow: "hidden",
  },
  cartList: {
    marginBottom: 20,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quantityButtonText: {
    display: "flex",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  quantityText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    width: 120,
    marginTop: 10,
    backgroundColor: "#28a745", // Green color for Add button
    paddingVertical: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 10,
    padding: 3,
    fontWeight: "bold",
  },
  quantityContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#007BFF",
    width: 120,
    borderRadius: 8,
    backgroundColor: "#f0f8ff",
    padding: 5,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: "600",
  },
  cartItemSubtext: {
    fontSize: 12,
    color: "#7F8C8D",
    marginVertical: 5,
  },
  cartItemPrice: {
    fontSize: 16,
    color: "#E74C3C",
    fontWeight: "bold",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF6F61",
    borderRadius: 15,
    marginHorizontal: 5,
  },
  quantityButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
  },
  cartItemQuantity: {
    fontSize: 14,
    fontWeight: "bold",
  },
  removeButton: {
    position: "absolute",
    left: 2,
    top: 0,
  },
  removeButtonText: {
    fontSize: 20,
    color: "#E74C3C",
    fontWeight: "bold",
  },
  promoCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  promoCodeInput: {
    flex: 1,
    padding: 10,
    borderColor: "#BDC3C7",
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 10,
    color: "#2C3E50",
  },
  promoApplyButton: {
    padding: 10,
    backgroundColor: "#FF6F61",
    borderRadius: 8,
  },
  promoApplyButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  summaryContainer: {
    padding: 15,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 30,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 16,
    color: "green",
  },
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    // Ensure it stays above the content
    elevation: 10,
  },
  gotocart: {
    padding: 14,
    margin: 10,
    alignItems: "center",

    backgroundColor: "green",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    borderRadius: 10,
  },
});
