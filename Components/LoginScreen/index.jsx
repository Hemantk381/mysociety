import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from "../../config"
export default function LoginScreen({ navigation }) {
  const [data, setData] = useState({ mobile: '', password: '' });

  const apiUrl = config.API_URL;


  const handleLogin = async () => {
    const { mobile, password } = data;
    console.log("Login details: ", mobile, password);
    try {
      const response = await axios.post(`${apiUrl}/api/login`, data);
      if (response.status === 200) {
        Alert.alert("Success", "Login successful!");
        console.log(response.data, "response");
        // Stringify and save user data to AsyncStorage
        await AsyncStorage.setItem('currentUserData', JSON.stringify(response.data.user)); 
        navigation.navigate("HomeDrawer");

      } else {
        Alert.alert("Error", response.data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.response ? error.response.data.message : "An error occurred. Please try again.");
    }
  };
  

  const handleChange = (value, name) => {
    setData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        value={data.mobile}
        onChangeText={value => handleChange(value, 'mobile')}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={data.password}
        onChangeText={value => handleChange(value, 'password')}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Registration')}>
        <Text style={styles.buttonText}>Go to Registration</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
