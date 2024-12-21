import config from "@/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Alert, ActivityIndicator } from "react-native";

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
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      {profileData ? (
        <>
   
          <Image source={{ uri: profileData.profile_image }} style={styles.profileImage} />
          <Text style={styles.label}>Name: {profileData.name || "N/A"}</Text>
          <Text style={styles.label}>Email: {profileData.email || "N/A"}</Text>
          <Text style={styles.label}>Mobile: {profileData.mobile || "N/A"}</Text>
          <Text style={styles.label}>Flat No: {profileData.flat_no || "N/A"}</Text>
          <Text style={styles.label}>Building: {profileData.building_name || "N/A"}</Text>
          <Text style={styles.label}>Society: {profileData.society_name || "N/A"}</Text>
        </>
      ) : (
        <Text style={styles.label}>No profile data available.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center", justifyContent: "center" },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 20 },
  label: { fontSize: 16, marginVertical: 5 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default ProfileScreen;
