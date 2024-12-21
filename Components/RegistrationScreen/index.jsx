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
import config from "../../config"


export default function RegistrationScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    password: "",
    society_id: "",
    building_id: "",
    flat_no: ""
  });

  const [societies, setSocieties] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loadingSocieties, setLoadingSocieties] = useState(true);
  const [loadingBuildings, setLoadingBuildings] = useState(false);



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
    setFormData(prevData => ({
      ...prevData,
      [fieldName]: value,
    }));
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
    console.log("Registration details: ", formData);
  
    try {
      const response = await axios.post(`${apiUrl}/api/register`, formData);
      if (response.status === 200) {
        Alert.alert("Success", "Registration successful!");
        navigation.navigate("Login"); 
      } else {
        Alert.alert("Error", response.data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.response ? error.response.data.message : "An error occurred. Please try again.");
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={formData.name}
        onChangeText={(value) => handleChange(value, "name")}
      />

      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        value={formData.mobile}
        onChangeText={(value) => handleChange(value, "mobile")}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={formData.password}
        onChangeText={(value) => handleChange(value, "password")}
        secureTextEntry
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
          <Picker.Item label="Select Society" value="" />
          {societies.map(society => (
            <Picker.Item key={society.id} label={society.name} value={society.id} />
          ))}
        </Picker>
        </View>
      )}

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
              {buildings.map(building => (
                <Picker.Item key={building.id} label={building.name} value={building.id} />
              ))}
            </Picker>
            </View>
          )}
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="Flat Number"
        value={formData.flat_no}
        onChangeText={(value) => handleChange(value, "flat_no")}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.buttonText}>Go to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    marginBottom: 16,
  },
  picker: {
    height: 50, 
    width: "100%",
  },
});
