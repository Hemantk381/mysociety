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

export default function ForgotScreen({ setForgot }) {
  const [data, setData] = useState({ mobile: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isMobileVerify, setIsMobileVerify] = useState(false);

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
    if (name === "email") {
      if (!value) {
        error = "Email is required";
      }
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
    return error === "";
  };

  const verifyMobile = async () => {
    try {
      const response = await axios.post(`${apiUrl}/api/verify_mobile`, {
        mobile: data.mobile,
      });
      if (response.status === 200) {
        await AsyncStorage.setItem(
          "currentUserData",
          JSON.stringify(response.data.user)
        );
        setIsMobileVerify(true);
      } else {
        // window.alert("You don't have an account. Please register.");
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleLogin = async () => {
    const isMobileValid = validateField("mobile", data.mobile);
    const isPasswordValid = validateField("password", data.email);

    if (!isMobileValid || !isPasswordValid) return;
    try {
      const response = await axios.post(`${apiUrl}/api/send_password_email`, {
        mobile: data.mobile,
        email: data.email,
      });
      if (response.status === 200) {
        // setIsMobileVerify(true);
        setForgot(false);
      } else {
        // window.alert("You don't have an account. Please register.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (value, name) => {
    if (value?.length === 10) {
      verifyMobile();
    }

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
    <>
      <TouchableOpacity onPress={() => setForgot(false)}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <Text style={styles.title}>Forgot Password</Text>

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

        {isMobileVerify && (
          <>
            {" "}
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Email"
              value={data.email}
              onChangeText={(value) => handleChange(value, "email")}
            />
            {renderError("email")}
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </>
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
  loginText: {
    fontSize: 12,
    color: "#007BFF",
  },
});
