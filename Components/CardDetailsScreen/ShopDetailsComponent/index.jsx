import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // Importing Material Icons for better visuals

const ShopDetailsComponent = ({ details }) => {
  console.log(details, "details");
  return (
    <View style={styles.container}>
      {/* Profile Image */}
      {details?.profile_image && (
        <Image
          source={{ uri: details?.profile_image }}
          style={styles?.profileImage}
        />
      )}
      <View style={styles.detailsContainer}>
        <div
          style={{
            display: "flex ",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={styles.shopName}>{details?.shop_name || "N/A"}</Text>
          <MaterialIcons
            name="phone"
            size={15}
            color="#3498db"
            style={styles.icon}
          />
        </div>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
    backgroundColor: "#f7f7f7",
    marginBottom: 10,
  },
  profileImage: {
    width: "100%", // Adjust as needed
    height: 130, // Adjust the height to make it a rectangle
    borderRadius: 0, // Slight border-radius for rounded corners, or set to 0 for sharp corners
    alignSelf: "center",
  },

  shopName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  detailsContainer: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    // flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7f8c8d",
  },
  value: {
    fontSize: 16,
    color: "#34495e",
  },
});

export default ShopDetailsComponent;
