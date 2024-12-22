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
import { MaterialIcons } from "@expo/vector-icons"; // Added this import
import { FontAwesome5 } from "@expo/vector-icons"; // Added this import

const ProfileScreen = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const apiUrl = config.API_URL;

  useEffect(() => {
    const getUserIdFromStorage = async () => {
      try {
        const userData = await AsyncStorage.getItem("currentUserData");
        if (userData) {
          const parsedData = JSON.parse(userData);
          setUserId(parsedData.id);
        }
      } catch (error) {
        console.error("Failed to retrieve user ID.", error);
      }
    };

    getUserIdFromStorage();
  }, []);

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/get-profile`, {
        params: { id: userId },
      });
      setProfileData(response.data.data);
    } catch (error) {
      Alert.alert("Error", "An error occurred while fetching profile details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ fontSize: 16, color: "#8A8A8A" }}>
          No profile data available.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileSection}>
        <Image
          source={{
            uri:
              profileData.profile_image ||
              "https://png.pngtree.com/png-vector/20221231/ourmid/pngtree-adoption-and-community-society-logo-solidarity-vector-png-image_43732886.jpg",
          }}
          style={styles.profileImage}
        />
        <Text style={styles.name}>{profileData.name}</Text>
        <Text style={styles.email}>{profileData.email}</Text>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Mobile Number</Text>
          <Text style={styles.value}>{profileData.mobile || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Society/Office Name</Text>
          <Text style={styles.value}>{profileData.society_name || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Block</Text>
          <Text style={styles.value}>{profileData.building_name || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Flat No</Text>
          <Text style={styles.value}>{profileData.flat_no || "N/A"}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    padding: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: "orange", // Specify the color directly
    borderWidth: 1, // Set the width of the border
    marginBottom: 15,
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF3D00",
  },
  email: {
    fontSize: 14,
    color: "#8A8A8A",
  },
  infoSection: {
    marginTop: 20,
    width: "100%",
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 60,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  label: {
    flex: 1,
    marginLeft: 5,
    fontSize: 13,
    color: "#8A8A8A",
  },
  value: {
    fontSize: 13,
    color: "#000",
  },
  editButton: {
    backgroundColor: "#FF3D00",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 50,
    alignItems: "center",
    shadowColor: "#FF3D00",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  editButtonText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default ProfileScreen;
