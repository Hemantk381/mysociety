import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../../config";
import ForgotScreen from "../ForgotScreen";
import DeviceInfo from "react-native-device-info";
import { Platform } from "react-native";

export default function LoginScreen({ navigation }) {
  const [data, setData] = useState({ mobile: "", password: "" });
  const [errors, setErrors] = useState({});
  const [forgot, setForgot] = useState(false);

  const apiUrl = config.API_URL;

  const validateField = (name, value) => {
    let error = "";

    if (name === "mobile") {
      if (!value) {
        error = "Mobile number is required";
      } else if (!/^[0-9]{10}$/.test(value)) {
        error = "Enter a valid 10-digit mobile number";
      }
    }

    if (name === "password") {
      if (!value) {
        error = "Password is required";
      } else if (value.length < 6) {
        error = "Password must be at least 6 characters";
      }
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
    return error === "";
  };

  const handleLogin = async () => {
    const isMobileValid = validateField("mobile", data.mobile);
    const isPasswordValid = validateField("password", data.password);

    if (!isMobileValid || !isPasswordValid) return;
    let deviceData = null;
    if (Platform.OS === "web") {
      // Handle web-specific information
      const userAgent = navigator.userAgent; // Example: You can get browser info from the user agent
      let deviceType = "Unknown";
      let deviceName = "Unknown";

      if (/iPhone/.test(userAgent)) {
        deviceType = "iOS";
        deviceName = "iPhone";
      } else if (/iPad/.test(userAgent)) {
        deviceType = "iOS";
        deviceName = "iPad";
      } else if (/Android/.test(userAgent)) {
        deviceType = "Android";
        deviceName = "Android Device";
      } else if (/Windows/.test(userAgent)) {
        deviceType = "Windows";
        deviceName = "Windows PC";
      } else if (/Mac/.test(userAgent)) {
        deviceType = "MacOS";
        deviceName = "Mac Device";
      }

      // Generate a pseudo-unique ID for web
      const deviceId = `web-${Math.random().toString(36).substr(2, 9)}`;
      deviceData = {
        deviceId: deviceId,
        deviceName: deviceName,
        deviceType: deviceType,
        mobile: data.mobile,
        password: data.password,
      };
    } else {
      // Fetch device information for iOS/Android
      const deviceId = await DeviceInfo.getUniqueId(); // Device unique ID
      const deviceName = await DeviceInfo.getDeviceName(); // Device name
      const deviceType = await DeviceInfo.getSystemName(); // iOS or Android
      deviceData = {
        deviceId: deviceId,
        deviceName: deviceName,
        deviceType: deviceType,
        mobile: data.mobile,
        password: data.password,
      };
    }
    try {
      const response = await axios.post(`${apiUrl}/api/login`, deviceData);
      if (response.status === 200) {
        // window.alert("Success", "Login successful!");
        await AsyncStorage.setItem(
          "currentUserData",
          JSON.stringify(response.data.user)
        );
        navigation.navigate("HomeDrawer");
      } else {
        window.alert("You don't have an account. Please register.");
      }
    } catch (error) {
      console.error(error);
      showNotification(
        error.response
          ? error.response.data.message
          : "An error occurred. Please try again."
      );
    }
  };

  const showNotification = (message) => {
    Alert.alert("Notice", message, [
      {
        text: "Register Now",
        onPress: () => navigation.navigate("Registration"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleChange = (value, name) => {
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    validateField(name, value);
  };

  const renderError = (field) => {
    if (errors[field]) {
      return <Text style={styles.errorText}>{errors[field]}</Text>;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {forgot ? (
        <ForgotScreen setForgot={setForgot} />
      ) : (
        <View>
          <View style={styles.outside}>
            <Image
              source={
                "https://png.pngtree.com/png-vector/20221231/ourmid/pngtree-adoption-and-community-society-logo-solidarity-vector-png-image_43732886.jpg"
              }
              style={styles.banner}
            />
          </View>

          <Text style={styles.title}>My Society</Text>

          <TextInput
            style={[styles.input, errors.mobile && styles.inputError]}
            placeholder="Mobile Number"
            maxLength={10}
            value={data.mobile}
            onChangeText={(value) => {
              // Only allow numeric input
              const numericValue = value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
              handleChange(numericValue, "mobile");
            }}
            keyboardType="phone-pad" // Ensure the number pad is shown
          />

          {renderError("mobile")}

          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Password"
            value={data.password}
            onChangeText={(value) => handleChange(value, "password")}
            secureTextEntry
          />
          {renderError("password")}
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => {
              setForgot(true);
              console.log("Forgot Password pressed");
            }}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate("Registration")}
          >
            <Text style={styles.linkButtonText}>
              Don't have an account? Register
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  outside: {
    display: "flex",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    alignItems: "center",
  },
  banner: {
    marginTop: -10,
    width: 100, // Set the width of the circular image
    height: 100, // Set the height of the circular image
    borderRadius: 50, // Half of the width/height to make it circular
    overflow: "hidden", // Ensures the image is clipped to the circle
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    paddingTop: 5,
    paddingBottom: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#343a40",
  },
  subtitle: {
    fontSize: 16,
    color: "#6c757d",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    backgroundColor: "#fff",
    color: "#00000",
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
    fontSize: 14,
  },
  placeholder: {
    fontSize: 10, // Change the font size of the placeholder
    color: "#999", // Change the color of the placeholder
  },
  inputError: {
    borderColor: "#e63946",
  },
  errorText: {
    color: "#e63946",
    marginBottom: 10,
    fontSize: 8,
    marginTop: -8,
  },
  button: {
    backgroundColor: "#2D6A4F",
    padding: 14,
    borderRadius: 6,
    marginTop: 16,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkButton: {
    marginTop: 16,
  },
  linkButtonText: {
    color: "#007BFF",
    textAlign: "center",
    fontSize: 10,
  },
  forgotPassword: {
    fontSize: 10,
    color: "#007BFF",
    textAlign: "right",
  },
  forgotPasswordText: {
    fontSize: 10,
    color: "#007BFF",
    textAlign: "right",
  },
});
