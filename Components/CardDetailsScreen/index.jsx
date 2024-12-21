import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import config from "../../config";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart, updateQuantity } from "@/store/Slice";
import { useNavigation } from "@react-navigation/native";

export default function CardDetailsScreen({ route }) {
  const [detailsData, setDetailsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentCardData, userName } = route.params;
  const apiUrl = config.API_URL;
  const navigation = useNavigation();

  const cartItems = useSelector((state) => state.cartData.items); 
  const dispatch = useDispatch();

  const fetchCardData = useCallback(async () => {
    if (!userName?.id || !currentCardData?.id) return;
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/get_shop_details`, {
        params: { user_id: userName.id, shop_id: currentCardData.id },
      });
      if (response.data) {
        const formattedData = Object.keys(response.data.data).map(
          (category) => ({
            title: category,
            data: response.data.data[category],
          })
        );
        setDetailsData(formattedData);
      } else {
        Alert.alert("Error", "Failed to fetch shop details");
      }
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      Alert.alert("Error", "An error occurred while fetching shop details");
    } finally {
      setLoading(false);
    }
  }, [userName, currentCardData]);

  useEffect(() => {
    fetchCardData();
  }, [fetchCardData]);

  const ProductItem = ({ item }) => {
    const dispatch = useDispatch(); 

    const cartItem = useSelector((state) =>
      state.cartData.items.find((cartItem) => cartItem.id === item.id)
    );

    const quantity = cartItem ? cartItem.quantity : 1; 

    const handleAddToCart = () => {
      if (cartItem) {
        dispatch(updateQuantity({ id: item.id, quantity: quantity + 1 }));
      } else {
        dispatch(addToCart({ ...item, quantity: 1 }));
      }
    };

    const handleUpdateQuantity = (newQuantity) => {
      if (newQuantity > 0) {
        // Update the quantity in the Redux store
        dispatch(updateQuantity({ id: item.id, quantity: newQuantity }));
      } else {
        // If quantity is zero, remove the item
        dispatch(removeFromCart(item));
      }
    };

    return (
      <View style={styles.productCard}>
        <Image source={{ uri: item.product_img }} style={styles.productImage} />
        <Text style={styles.productName}>{item.product_name}</Text>
        <Text style={styles.productPrice}>₹{item.price}</Text>

        {cartItem ? ( // Check if item is in cart
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPress={() => handleUpdateQuantity(quantity - 1)}
            >
              <Text style={styles.quantityButton}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => handleUpdateQuantity(quantity + 1)}
            >
              <Text style={styles.quantityButton}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <FlatList
          data={detailsData}
          renderItem={({ item }) => {
            const [title, imageUrl] = item.title.split("__");
            return (
              <View style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <Image source={{ uri: imageUrl }} style={styles.logo} />
                  <Text style={styles.categoryTitle}>{title}</Text>
                </View>
                <FlatList
                  horizontal
                  data={item.data}
                  renderItem={({ item }) => <ProductItem item={item} />}
                  keyExtractor={(item) => item.id.toString()}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalListContainer}
                />
              </View>
            );
          }}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No data available</Text>
            </View>
          }
          contentContainerStyle={styles.container}
        />
      </ScrollView>
      <TouchableOpacity
        style={styles.gotocart}
        onPress={() => navigation.navigate("Cart")}
      >
        <Text
          style={{
            color: "white",
            fontWeight: "bold",
          }}
        >
          {totalItems} items | ₹{totalPrice.toFixed(2)}{" "}
        </Text>
        <Text
          style={{
            color: "white",
            fontWeight: "bold",
          }}
        >
          {" "}
          View Cart
        </Text>
      </TouchableOpacity>
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
    color: "white",
  },
quantityContainer: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 10,
  borderWidth: 1,
  borderColor: "#007BFF",  
  borderRadius: 8,  
  backgroundColor: "#f0f8ff", 
  elevation: 3,  
},

quantityButton: {
  backgroundColor: "#007BFF", 
  borderRadius: 8, 
  padding: 10,
  marginHorizontal: 10,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#000",
  elevation: 3,
},

quantityText: {
  fontSize: 18,  
  fontWeight: "bold",
  marginHorizontal: 5,
  paddingHorizontal: 10,

  color: "#333",  
},

  removeButton: {
    marginTop: 10,
    backgroundColor: "#dc3545",
    paddingVertical: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 10,
  },
  container: {
    paddingBottom: 20,
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
  logo: {
    width: 50, // Adjust the size of the logo
    height: 50,
    borderRadius: 8,
    marginRight: 10, // Spacing between logo and title
  },
  categorySection: {
    marginVertical: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
  },
  categoryHeader: {
    flexDirection: "row", // Set to row to align logo and title in one row
    alignItems: "center", // Center vertically
    justifyContent: "flex-start", // Align to the start
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 5,
  },
  productCard: {
    width: 150,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  productImage: {
    width: "100%",
    height: 100,
    resizeMode: "contain",
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
    marginVertical: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    marginTop: 10,
    backgroundColor: "#28a745",
    paddingVertical: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  horizontalListContainer: {
    paddingVertical: 10,
  },
});
