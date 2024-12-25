import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import axios from "axios";
import config from "../../config";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart, updateQuantity } from "@/store/Slice";
import { useNavigation } from "@react-navigation/native";
import ShopDetailsComponent from "./ShopDetailsComponent";
import CategorySelector from "./CategorySelector";

export default function CardDetailsScreen() {
  const [detailsData, setDetailsData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const apiUrl = config.API_URL;
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cartData.items);
  const currentShopId = useSelector((state) => state.cartData.shopId);
  const userID = useSelector((state) => state.cartData.userId);

  const fetchCardData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/shop_details`, {
        params: { user_id: userID, shop_id: currentShopId },
      });
      if (response.data) {
        setDetailsData(response?.data?.data);
      } else {
        Alert.alert("Error", "Failed to fetch shop details");
      }
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      Alert.alert("Error", "An error occurred while fetching shop details");
    } finally {
      setLoading(false);
    }
  }, [userID]);

  useEffect(() => {
    fetchCardData();
  }, [fetchCardData]);

  const fetchListData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/get_product`, {
        params: {
          user_id: userID,
          shop_id: currentShopId,
          product_category_id:
            selectedCategories.length > 0 ? selectedCategories?.join(",") : 0,
        },
      });
      if (response.data) {
        setProductData(response?.data?.data);
      } else {
        Alert.alert("Error", "Failed to fetch shop details");
        setProductData([]);
      }
    } catch (error) {
      setProductData([]);
      console.error(error.response ? error.response.data : error.message);
      Alert.alert("Error", "An error occurred while fetching shop details");
    } finally {
      setLoading(false);
    }
  }, [userID, currentShopId, apiUrl, selectedCategories]);

  useEffect(() => {
    fetchListData();
  }, [fetchListData, selectedCategories]);

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const ProductItem = ({ item }) => {
    const cartItem = cartItems.find((cartItem) => cartItem.id === item.id);
    const quantity = cartItem ? cartItem.quantity : 1;

    const [showQuantityAdjusters, setShowQuantityAdjusters] = useState(false);

    const handleAddToCart = () => {
      if (cartItem) {
        dispatch(updateQuantity({ id: item.id, quantity: quantity + 1 }));
      } else {
        dispatch(addToCart({ ...item, quantity: 1 }));
      }
      setShowQuantityAdjusters(true); // Show quantity adjusters after adding
    };

    const handleUpdateQuantity = (newQuantity) => {
      if (newQuantity > 0) {
        dispatch(updateQuantity({ id: item.id, quantity: newQuantity }));
      } else {
        dispatch(removeFromCart(item));
      }
    };

    return (
      <View style={styles.productCard}>
        <View style={styles.productInfo}>
          {/* Product Image */}
          <Image
            source={{ uri: item.product_img }}
            style={styles.productImage}
          />

          {/* Product Details */}
          <View style={styles.productDetails}>
            <Text style={styles.productName}>{item.product_name}</Text>
            <Text style={styles.productPrice}>₹{item.price}</Text>
            <Text style={styles.productPrice}>₹{item.size}</Text>

            {/* Show "Add" Button Initially */}
            {!showQuantityAdjusters ? (
              <TouchableOpacity
                onPress={handleAddToCart}
                style={styles.addButton}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            ) : (
              // Show Quantity Adjusters after clicking "Add"
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  onPress={() => handleUpdateQuantity(quantity - 1)}
                  style={[
                    styles.quantityButton,
                    { backgroundColor: "#FF6F61" },
                  ]} // Red background for "-"
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.quantityText}>{quantity}</Text>

                <TouchableOpacity
                  onPress={() => {
                    handleAddToCart();
                    handleUpdateQuantity(quantity + 1);
                  }}
                  style={[
                    styles.quantityButton,
                    { backgroundColor: "#4CAF50" },
                  ]} // Green background for "+"
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <ShopDetailsComponent details={detailsData?.shop_details} />
      <CategorySelector
        categories={detailsData?.shop_category}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      />

      <FlatList
        data={productData}
        renderItem={({ item }) => <ProductItem item={item} />}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No data available</Text>
          </View>
        }
        contentContainerStyle={styles.container}
      />

      {/* Sticky "Go to Cart" Button */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={styles.gotocart}
          onPress={() => navigation.navigate("Cart")}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            {totalItems} items | ₹{totalPrice.toFixed(2)}{" "}
          </Text>
          <Text style={{ color: "white", fontWeight: "bold" }}>View Cart</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  gotocart: {
    padding: 10,
    margin: 10,
    alignItems: "center",
    backgroundColor: "#007BFF",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 10,
  },
  // quantityContainer: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   marginTop: 10,
  //   borderWidth: 1,
  //   borderColor: "#007BFF",
  //   borderRadius: 8,
  //   backgroundColor: "#f0f8ff",
  //   elevation: 3,
  // },
  quantityButton: {
    backgroundColor: "#007BFF",
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 10,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 5,
    paddingHorizontal: 10,
    color: "#333",
  },
  productCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  productCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  productInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  productImage: {
    width: 150,
    height: 70,
    resizeMode: "contain",
    marginRight: 10,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  productPrice: {
    fontSize: 14,
    color: "#007BFF",
    marginVertical: 5,
  },
  quantityContainer: {
    marginTop: 2,
    flexDirection: "row",
    width: 130,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#007BFF",
    borderRadius: 8,
    backgroundColor: "#f0f8ff",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  quantityButton: {
    backgroundColor: "#007BFF", // Default blue background
    borderRadius: 50, // Circular buttons
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  quantityButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    marginTop: 10,
    backgroundColor: "#28a745", // Green color for Add button
    paddingVertical: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  container: {
    paddingBottom: 100, // Space for the sticky footer
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
  },
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    // Ensure it stays above the content
    elevation: 10,
  },
  gotocart: {
    padding: 10,
    margin: 10,
    alignItems: "center",
    backgroundColor: "#007BFF",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 10,
  },
});
