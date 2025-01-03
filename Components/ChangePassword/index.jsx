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
import { TextInput } from "react-native-paper";

const ChangePassword = () => {
  const [order_history, setOrder_history] = useState(null);
  const [loading, setLoading] = useState(false);

  const userID = useSelector((state) => state.cartData.userId);
  const [data, setData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({});

  const apiUrl = config.API_URL;
  const validateField = (name, value) => {
    let error = "";

    if (name === "old_password") {
      if (!value) {
        error = "Password is required";
      } else if (value.length < 6) {
        error = "Password must be at least 6 characters";
      }
    }
    if (name === "new_password") {
      if (!value) {
        error = "Password is required";
      } else if (value.length < 6) {
        error = "Password must be at least 6 characters";
      }
    }
    if (name === "confirm_password") {
      if (!value) {
        error = "Password is required";
      } else if (value.length < 6) {
        error = "Password must be at least 6 characters";
      }
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
    return error === "";
  };

  const renderError = (field) => {
    if (errors[field]) {
      return <Text style={styles.errorText}>{errors[field]}</Text>;
    }
    return null;
  };

  const handleLogin = async () => {
    const isMobileValid = validateField("old_password", data.old_password);
    const isNewPasswordValid = validateField("new_password", data.new_password);
    const isConfirmPasswordValid = validateField(
      "confirm_password",
      data.confirm_password
    );

    if (!isMobileValid || !isNewPasswordValid || !isConfirmPasswordValid)
      return;
    const payload = {
      id: userID,
      old_password: data.old_password,
      password: data.new_password,
      password_confirmation: data.confirm_password,
    };
    try {
      const response = await axios.post(
        `${apiUrl}/api/change_password`,
        payload
      );
      if (response.status === 200) {
        // window.alert("Success", "Login successful!");
        await AsyncStorage.setItem(
          "currentUserData",
          JSON.stringify(response.data.user)
        );
        // navigation.navigate("home");
      } else {
        // window.alert("You don't have an account. Please register.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  const handleChange = (value, name) => {
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    validateField(name, value);
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={[styles.input, errors.old_password && styles.inputError]}
        placeholder="Old Password"
        value={data.old_password}
        onChangeText={(value) => handleChange(value, "old_password")}
        secureTextEntry
      />
      {renderError("password")}
      <TextInput
        style={[styles.input, errors.new_password && styles.inputError]}
        placeholder="New Password"
        value={data.new_password}
        onChangeText={(value) => handleChange(value, "new_password")}
        secureTextEntry
      />
      {renderError("password")}
      <TextInput
        style={[styles.input, errors.confirm_password && styles.inputError]}
        placeholder="Confirm Password"
        value={data.confirm_password}
        onChangeText={(value) => handleChange(value, "confirm_password")}
        secureTextEntry
      />
      {renderError("password")}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Change</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    padding: 30,
    backgroundColor: "#ffffff",
  },
  button: {
    backgroundColor: "#E966A0",
    padding: 14,
    borderRadius: 6,
    marginTop: 16,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    backgroundColor: "#fff",
    color: "#00000",
    padding: 5,
    marginBottom: 16,
    borderRadius: 7,
    fontSize: 14,
    height: 30,
  },
  inputError: {
    borderColor: "#ff4d4d",
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
});

export default ChangePassword;
