import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import config from "../../config";

export default function RegistrationScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    password: "",
    society_id: "",
    building_id: "",
    flat_no: "",
  });

  const [societies, setSocieties] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loadingSocieties, setLoadingSocieties] = useState(true);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [errors, setErrors] = useState({});

  const apiUrl = config.API_URL;

  useEffect(() => {
    fetchSocieties();
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

  const handleChange = (value, fieldName) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: value,
    }));

    validateField(fieldName, value); // Perform real-time validation
  };

  const validateField = (fieldName, value) => {
    let error = "";

    switch (fieldName) {
      case "name":
        if (!value.trim()) error = "Name is required";
        break;
      case "mobile":
        if (!value.trim()) {
          error = "Mobile number is required";
        } else if (!/^[0-9]{10}$/.test(value)) {
          error = "Enter a valid 10-digit mobile number";
        }
        break;
      case "password":
        if (!value.trim()) {
          error = "Password is required";
        } else if (value.length < 6) {
          error = "Password must be at least 6 characters long";
        }
        break;
      case "society_id":
        if (!value) error = "Society selection is required";
        break;
      case "building_id":
        if (!value) error = "Building selection is required";
        break;
      case "flat_no":
        if (!value.trim()) error = "Flat number is required";
        break;
      default:
        break;
    }

    setErrors((prevErrors) => ({ ...prevErrors, [fieldName]: error }));
    return error === "";
  };

  const handleSocietyChange = (societyId) => {
    handleChange(societyId, "society_id");
    if (societyId) {
      fetchBuildings(societyId);
    } else {
      setBuildings([]);
    }
  };

  const handleRegister = async () => {
    const fieldsToValidate = Object.keys(formData);
    let isValid = true;

    fieldsToValidate.forEach((field) => {
      const isFieldValid = validateField(field, formData[field]);
      if (!isFieldValid) isValid = false;
    });

    if (!isValid) {
      Alert.alert("Error", "Please fill all required fields correctly.");
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/api/register`, formData);
      if (response.status === 200) {
        Alert.alert("Success", "Registration successful!");
        navigation.navigate("Login");
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Registration failed. Please try again."
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error",
        error.response
          ? error.response.data.message
          : "An error occurred. Please try again."
      );
    }
  };

  const renderError = (fieldName) => {
    if (errors[fieldName]) {
      return <Text style={styles.errorText}>{errors[fieldName]}</Text>;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Getting Started</Text>
      <Text style={styles.para}>Create an account to continue!</Text>

      <TextInput
        style={[styles.input, errors.name && styles.inputError]}
        placeholder="Full Name"
        placeholderTextColor="#999"
        value={formData.name}
        onChangeText={(value) => handleChange(value, "name")}
      />
      {renderError("name")}

      <TextInput
        style={[styles.input, errors.mobile && styles.inputError]}
        placeholder="Mobile Number"
        placeholderTextColor="#999"
        maxLength={10}
        value={formData.mobile}
        onChangeText={(value) => {
          const numericValue = value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
          handleChange(numericValue, "mobile");
        }}
        keyboardType="phone-pad"
      />
      {renderError("mobile")}

      <TextInput
        style={[styles.input, errors.password && styles.inputError]}
        placeholder="Password"
        placeholderTextColor="#999"
        value={formData.password}
        onChangeText={(value) => handleChange(value, "password")}
        secureTextEntry
      />
      {renderError("password")}

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
      {renderError("society_id")}

      {formData.society_id && (
        <>
          {loadingBuildings ? (
            <ActivityIndicator size="large" color="#007BFF" />
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.building_id}
                onValueChange={(value) => handleChange(value, "building_id")}
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
      {renderError("building_id")}

      <TextInput
        style={[styles.input, errors.flat_no && styles.inputError]}
        placeholder="Flat Number"
        placeholderTextColor="#999"
        value={formData.flat_no}
        onChangeText={(value) => handleChange(value, "flat_no")}
      />
      {renderError("flat_no")}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.linkButtonText}>
          Already have an account? Log in
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
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#00000",
    textAlign: "center",
    marginTop: -10,
    marginBottom: 8,
  },
  para: {
    fontSize: 12,
    fontWeight: "semibold",
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 35,
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
  inputError: {
    borderColor: "#ff4d4d",
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
  button: {
    backgroundColor: "#2D6A4F",
    padding: 14,
    borderRadius: 6,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "semibold",
  },
  linkButton: {
    marginTop: 20,
    alignItems: "center",
  },
  linkButtonText: {
    color: "#007BFF",
    fontSize: 10,
    textDecorationLine: "underline",
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
