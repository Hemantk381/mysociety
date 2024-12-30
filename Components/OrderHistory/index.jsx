import config from "@/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { FlatList } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";

const OrderHistoryScreen = () => {
  const [order_history, setOrder_history] = useState(null);
  const [loading, setLoading] = useState(false);

  const userID = useSelector((state) => state.cartData.userId);

  const apiUrl = config.API_URL;
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}/api/order_history`,
        { user_id: userID },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      setOrder_history(response.data.data);
    } catch (error) {
      setOrder_history([]);
      Alert.alert("Error", "An error occurred while fetching profile details.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [])
  );

  useEffect(() => {
    console.log("test");
  }, []); // Ensures the API call on navigation
  console.log("test");

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (!order_history) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ fontSize: 16, color: "#8A8A8A" }}>
          No order data available.
        </Text>
      </View>
    );
  }

  const renderOrderDetails = (details) => (
    <View>
      {details.map((item) => (
        <View style={styles.productCard} key={item.product_id}>
          <Image
            source={{ uri: item.product_image }}
            style={styles.productImage}
          />
          <View style={styles.productDetails}>
            <Text style={styles.productName}>{item.product_name}</Text>
            <Text style={styles.productQty}>Qty: {item.qty}</Text>
            <Text style={styles.productPrice}>Price: ₹{item.price}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderOrderCard = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.headerRow}>
        <MaterialIcons name="storefront" size={24} color="#4A90E2" />
        <Text style={styles.shopName}>{item.shop_name}</Text>
      </View>
      <View style={styles.orderDetailsRow}>
        <Text style={styles.orderId}>Order ID: {item.order_id}</Text>
        <Text style={styles.transactionDate}>{item.transaction_date}</Text>
      </View>
      <View style={styles.amountStatusRow}>
        <Text style={styles.totalAmount}>Total: ₹{item.total_amt}</Text>
        <Text
          style={[
            styles.status,
            item.status === "Delivered"
              ? styles.statusDelivered
              : styles.statusPending,
          ]}
        >
          {item.status}
        </Text>
      </View>
      <View style={styles.divider} />
      {renderOrderDetails(item.order_details)}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <FlatList
        data={order_history}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderCard}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F5F5",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    margin: 10,
    borderRadius: 12,
    padding: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  shopName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  orderDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  orderId: {
    fontSize: 14,
    color: "#666",
  },
  transactionDate: {
    fontSize: 14,
    color: "#666",
  },
  amountStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
  },
  statusDelivered: {
    color: "#4CAF50",
  },
  statusPending: {
    color: "#FF5733",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 10,
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    padding: 10,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  productQty: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  productPrice: {
    fontSize: 12,
    color: "#333",
    marginTop: 4,
  },
});

export default OrderHistoryScreen;
