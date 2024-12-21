import React, { useState } from "react";
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

export default function LoginScreen({ navigation }) {
  const [data, setData] = useState({ mobile: "", password: "" });
  const [errors, setErrors] = useState({});

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

    try {
      const response = await axios.post(`${apiUrl}/api/login`, data);
      if (response.status === 200) {
        Alert.alert("Success", "Login successful!");
        await AsyncStorage.setItem(
          "currentUserData",
          JSON.stringify(response.data.user)
        );
        navigation.navigate("HomeDrawer");
      } else {
        showNotification("You don't have an account. Please register.");
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
      {/* <Image
        source={require("../../assets/login-banner.png")}
        style={styles.banner}
      /> */}

      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Login to your account</Text>

      <TextInput
        style={[styles.input, errors.mobile && styles.inputError]}
        placeholder="Mobile Number"
        value={data.mobile}
        onChangeText={(value) => handleChange(value, "mobile")}
        keyboardType="phone-pad"
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  banner: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
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
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#e63946",
  },
  errorText: {
    color: "#e63946",
    marginBottom: 8,
    fontSize: 14,
  },
  button: {
    backgroundColor: "#007BFF",
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
    fontSize: 16,
  },
});
