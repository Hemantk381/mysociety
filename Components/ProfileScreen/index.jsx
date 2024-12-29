import config from "@/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";

const ProfileScreen = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [imageLoading, setImageLoading] = useState(false);
  const [loadingSocieties, setLoadingSocieties] = useState(true);

  const [societies, setSocieties] = useState([]);
  const [buildings, setBuildings] = useState([]);

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

  const fetchSocieties = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/get-society`);
      if (response.data) {
        setSocieties(response.data.data);
      } else {
        Alert.alert("Error", "Failed to fetch societies");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred while fetching societies");
    } finally {
      setLoadingSocieties(false);
    }
  };
  useEffect(() => {
    fetchSocieties();
  }, []);
  const fetchBuildings = useCallback(async (societyId) => {
    if (!societyId) {
      Alert.alert("Error", "Society ID is required");
      return;
    }

    setLoadingBuildings(true);
    try {
      const response = await axios.get(`${apiUrl}/api/get-bilding`, {
        params: { society_id: societyId },
      });

      if (response.data) {
        setBuildings(response.data.data);
      } else {
        Alert.alert("Error", "Failed to fetch buildings");
      }
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      Alert.alert("Error", "An error occurred while fetching buildings");
    } finally {
      setLoadingBuildings(false);
    }
  }, []);

  const handleSocietyChange = (societyId) => {
    console.log(societyId, "Sddsdsdsds");
    setFormData({ ...formData, society_id: societyId });
    if (societyId) {
      fetchBuildings(societyId);
    } else {
      setBuildings([]);
    }
  };

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
      setFormData(response.data.data); // Pre-fill form data
    } catch (error) {
      Alert.alert("Error", "An error occurred while fetching profile details.");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      await axios.post(`${apiUrl}/api/edit_profile`, {
        id: userId,
        ...formData,
      });
      Alert.alert("Success", "Profile updated successfully.");
      setIsEditing(false);
      fetchProfile(); // Refresh profile data
    } catch (error) {
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Image Upload
  // Handle Image Upload using fetch and FormData
  const handleImageUpload = async () => {
    try {
      // Request permission for media library
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Denied",
          "You need to allow access to upload images."
        );
        return;
      }

      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      // If the user selects an image
      if (!result.canceled) {
        console.log("Selected Image URI:", result); // Log the URI for debugging

        // Create FormData and append user ID and image file
        const formData = new FormData();
        formData.append("id", userId); // Append userId
        const image = {
          uri: result.assets[0].uri, // Use URI from ImagePicker result
          type: result.assets[0].type || "image/jpeg", // Default to 'image/jpeg' if no type is provided
          name: result.assets[0].uri.split("/").pop(), // Extract filename from URI
        };

        console.log(image, "sdsdhbjb");

        // Append the image file to FormData
        formData.append("profile_image", image);

        // Set image loading state
        setImageLoading(true);

        // Create the fetch request
        try {
          await axios.post(`${apiUrl}/api/get_profile_pic`, {
            id: userId,
            profile_image: result.assets[0].uri,
          });
          Alert.alert("Success", "Profile updated successfully.");
          setIsEditing(false);
          fetchProfile(); // Refresh profile data
        } catch (error) {
          Alert.alert("Error", "Failed to update profile.");
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to upload image.");
    } finally {
      setImageLoading(false); // Reset image loading state
    }
  };

  if (loading || imageLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileSection}>
        <Image
          source={{
            uri:
              profileData?.profile_image ||
              "https://png.pngtree.com/png-vector/20221231/ourmid/pngtree-adoption-and-community-society-logo-solidarity-vector-png-image_43732886.jpg",
          }}
          style={styles.profileImage}
        />
        <TouchableOpacity
          onPress={handleImageUpload}
          style={styles.editImageButton}
        >
          <Text style={styles.editImageText}>Change Picture</Text>
        </TouchableOpacity>
      </View>

      {isEditing ? (
        <View style={styles.editForm}>
          <TextInput
            style={styles.inputField}
            placeholder="Name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
          <TextInput
            style={styles.inputField}
            placeholder="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
          />
          <TextInput
            style={styles.inputField}
            placeholder="Mobile Number"
            aria-disabled={true}
            value={formData.mobile}
            onChangeText={(text) => setFormData({ ...formData, mobile: text })}
          />

          {loadingSocieties ? (
            <ActivityIndicator size="large" color="#007BFF" />
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.society_id}
                onValueChange={handleSocietyChange}
                style={styles.picker}
              >
                <Picker.Item
                  label="Select Society/Office"
                  value=""
                  style={{ fontSize: "10px" }}
                />
                {societies.map((society) => (
                  <Picker.Item
                    key={society.id}
                    label={society.name}
                    value={society.id}
                  />
                ))}
              </Picker>
            </View>
          )}
          {buildings?.length > 0 && (
            <>
              {loadingBuildings ? (
                <ActivityIndicator size="large" color="#007BFF" />
              ) : (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.building_id}
                    onValueChange={(value) => {
                      console.log(value, "sdds");
                      setFormData({ ...formData, building_id: value });
                    }}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Building" value="" />
                    {buildings.map((building) => (
                      <Picker.Item
                        key={building.id}
                        label={building.name}
                        value={building.id}
                      />
                    ))}
                  </Picker>
                </View>
              )}
            </>
          )}
          {/* {renderError("society_id")} */}
          {/* <TextInput
            style={styles.inputField}
            placeholder="Society Name"
            value={formData.society_name}
            onChangeText={(text) =>
              setFormData({ ...formData, society_name: text })
            }
          /> */}
          {/* <TextInput
            style={styles.inputField}
            placeholder="Block"
            value={formData.building_name}
            onChangeText={(text) =>
              setFormData({ ...formData, building_name: text })
            }
          /> */}
          <TextInput
            style={styles.inputField}
            placeholder="Flat No"
            value={formData.flat_no}
            onChangeText={(text) => setFormData({ ...formData, flat_no: text })}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={updateProfile} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsEditing(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Mobile Number</Text>
            <Text style={styles.value}>{profileData?.mobile || "N/A"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Society/Office Name</Text>
            <Text style={styles.value}>
              {profileData?.society_name || "N/A"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Block</Text>
            <Text style={styles.value}>
              {profileData?.building_name || "N/A"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Flat No</Text>
            <Text style={styles.value}>{profileData?.flat_no || "N/A"}</Text>
          </View>
        </View>
      )}

      {!isEditing && (
        <TouchableOpacity
          onPress={() => setIsEditing(true)}
          style={styles.editButton}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      )}
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
  editForm: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  inputField: {
    width: "100%",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 15,
    backgroundColor: "#F9F9F9",
    color: "#333333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  saveButton: {
    flex: 0.48,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  cancelButton: {
    flex: 0.48,
    backgroundColor: "#FF3D00",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#FF3D00",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "bold",
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
  pickerContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
  },
  picker: {
    height: 50,
    borderWidth: 0,
    width: "100%",
    borderColor: "#ced4da",
    padding: 6,
    borderRadius: 8,
    fontSize: 14,
    color: "#333",
  },
});

export default ProfileScreen;
