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
} from "react-native";
import axios from "axios";
import config from "../../config";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart, updateQuantity } from "@/store/Slice";
import { useNavigation } from "@react-navigation/native";
import ShopDetailsComponent from "./ShopDetailsComponent";
import CategorySelector from "./CategorySelector";
import { ScrollView } from "react-native-gesture-handler";

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

  console.log(cartItems, "cartitem");

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

  useEffect(() => {
    if (productData?.length > 0) {
      const inital = productData?.filter((item) => item.quantity !== null);

      console.log(productData, "sddsjjds");
      inital?.map((item) => dispatch(addToCart(item))); // Optimistic update
    }
    // dispatch(addToCart({ ...item, quantity: 1 })); // Optimistic update
  }, [productData]);

  const fetchListData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/get_product`, {
        params: {
          user_id: userID,
          shop_id: currentShopId,
          product_category_id:
            selectedCategories.length > 0 ? selectedCategories?.join(",") : -1,
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

  const ProductItem = React.memo(({ item }) => {
    const cartItems = useSelector((state) => state.cartData.items);
    const cartItem = cartItems.find((cartItem) => cartItem.id === item.id);
    const quantity = cartItem ? cartItem.quantity : 0; // Ensure quantity reflects the current state

    console.log(cartItems, "qunety");

    const [showQuantityAdjusters, setShowQuantityAdjusters] = useState(false);

    useEffect(() => {
      setShowQuantityAdjusters(Boolean(cartItem)); // Adjusters are shown if the item is in the cart
    }, [cartItem]);

    const handleAddToCart = async () => {
      setShowQuantityAdjusters(true);
      if (cartItem) {
        const updatedQuantity = quantity + 1;
        dispatch(updateQuantity({ id: item.id, quantity: updatedQuantity })); // Optimistic update

        try {
          await axios.post(`${apiUrl}/api/addToCart`, {
            user_id: userID,
            product_id: item.id,
            quantity: updatedQuantity,
            shop_id: currentShopId,
          });
        } catch (error) {
          console.error(error.response ? error.response.data : error.message);
          Alert.alert("Error", "Failed to update the cart");
          dispatch(updateQuantity({ id: item.id, quantity: quantity })); // Rollback in case of error
        }
      } else {
        dispatch(addToCart({ ...item, quantity: 1 })); // Optimistic update

        try {
          await axios.post(`${apiUrl}/api/addToCart`, {
            user_id: userID,
            shop_id: currentShopId,
            product_id: item.id,
            quantity: 1,
          });
        } catch (error) {
          console.error(error.response ? error.response.data : error.message);
          Alert.alert("Error", "Failed to update the cart");
          dispatch(removeFromCart({ id: item.id })); // Rollback in case of error
        }
      }
    };
    const handleUpdateQuantity = async (newQuantity) => {
      if (newQuantity <= 0) {
        dispatch(removeFromCart(item)); // Optimistic update
        setShowQuantityAdjusters(false);
      }
      // try {
      //   await axios.post(`${apiUrl}/api/removeFromCart`, {
      //     user_id: userID,
      //     product_id: item.id,
      //     shop_id: currentShopId,
      //   });
      // } catch (error) {
      //   console.error(error.response ? error.response.data : error.message);
      //   Alert.alert("Error", "Failed to update the cart");
      //   dispatch(addToCart({ ...item, quantity })); // Rollback
      //   setShowQuantityAdjusters(true);
      // }
      // } else {

      dispatch(updateQuantity({ id: item.id, quantity: newQuantity })); // Optimistic update

      try {
        await axios.post(`${apiUrl}/api/addToCart`, {
          user_id: userID,
          product_id: item.id,
          quantity: newQuantity,
          shop_id: currentShopId,
        });
      } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        Alert.alert("Error", "Failed to update the cart");
        dispatch(updateQuantity({ id: item.id, quantity: quantity })); // Rollback
      }
    };

    return (
      <View style={styles.productCard}>
        <View style={styles.productInfo}>
          <Image
            source={{ uri: item.product_img }}
            style={styles.productImage}
          />
          <View style={styles.productDetails}>
            <Text style={styles.productName}>{item.product_name}</Text>
            <Text style={styles.productPrice}>₹{item.price}</Text>
            <Text style={styles.productPrice}>Size: {item.size}</Text>

            {!showQuantityAdjusters && quantity !== null ? (
              <TouchableOpacity
                onPress={handleAddToCart}
                style={styles.addButton}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  onPress={() => handleUpdateQuantity(quantity - 1)}
                  style={[
                    styles.quantityButton,
                    { backgroundColor: "#FF6F61" },
                  ]}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.quantityText}>{quantity}</Text>

                <TouchableOpacity
                  onPress={() => handleUpdateQuantity(quantity + 1)}
                  style={[
                    styles.quantityButton,
                    { backgroundColor: "#4CAF50" },
                  ]}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  });

  return (
    <>
      <ShopDetailsComponent details={detailsData?.shop_details} />
      <CategorySelector
        categories={detailsData?.shop_category}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      />
      <div
        style={{
          overflowY: "auto",
          maxHeight: "500px",
          height: 300,
          marginTop: "-0",
        }}
      >
        <FlatList
          data={productData}
          renderItem={({ item }) => <ProductItem item={item} />}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No data available</Text>
            </View>
          }
          contentContainerStyle={styles.flatListContainer}
        />
      </div>

      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={styles.gotocart}
          onPress={() => {
            // dispatch(addToCart([]));
            navigation.navigate("Cart");
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            {totalItems} items | ₹{totalPrice.toFixed(2)}
          </Text>
          <Text style={{ color: "white", fontWeight: "bold" }}>View Cart</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  flatListContainer: {
    paddingBottom: 120, // Ensure footer space
  },
  // stickyFooter: {
  //   position: "absolute", // Makes it "stick"
  //   bottom: 0, // Aligns to the bottom
  //   left: 0, // Aligns to the left
  //   right: 0, // Aligns to the right
  //   backgroundColor: "#000", // Optional: Footer background
  //   padding: 16, // Optional: Padding for content
  // },
  // gotocart: {
  //   alignItems: "center",
  //   justifyContent: "center",
  //   padding: 10,
  //   backgroundColor: "#FF6F61", // Example color
  //   borderRadius: 5, // Optional styling
  // },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  productCard: {
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
    flexDirection: "row",
    alignItems: "center",
    display: "flex",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#007BFF",
    width: 140,
    borderRadius: 8,
    backgroundColor: "#f0f8ff",
    padding: 5,
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
    width: 140,
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
