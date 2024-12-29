import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Provider } from "react-redux";
import { store } from "@/store";
import config from "@/config";

// Importing components for screens
import LoginScreen from "@/Components/LoginScreen";
import RegistrationScreen from "@/Components/RegistrationScreen";
import HomeScreen from "@/Components/HomeScreen";
import ProfileScreen from "@/Components/ProfileScreen";
import CardDetailsScreen from "@/Components/CardDetailsScreen";
import CartScreen from "@/Components/CartScreen";
import OrderHistoryScreen from "@/Components/OrderHistory";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

// Main App Component
const App = () => {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <NavigationContainer independent={true}>
            <Stack.Navigator initialRouteName="HomeDrawer">
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen
                name="Registration"
                component={RegistrationScreen}
              />
              <Stack.Screen name="CardDetails" component={CardDetailsScreen} />
              <Stack.Screen name="Cart" component={CartScreen} />
              <Stack.Screen
                name="HomeDrawer"
                component={HomeDrawer}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </GestureHandlerRootView>
    </Provider>
  );
};

// Drawer with Home and Profile
const HomeDrawer = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={HomeStack} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Orders" component={OrderHistoryScreen} />
    </Drawer.Navigator>
  );
};

// Custom Drawer Content with Profile Header
const CustomDrawerContent = (props) => {
  const [profileData, setProfileData] = useState(null);
  const apiUrl = config.API_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem("currentUserData");
        if (userData) {
          const parsedData = JSON.parse(userData);
          const response = await axios.get(`${apiUrl}/api/get-profile`, {
            params: { id: parsedData.id },
          });
          setProfileData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to retrieve profile data.", error);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      props.navigation.replace("Login");
    } catch (error) {
      Alert.alert("Error", "An error occurred during logout.");
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      {profileData ? (
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: profileData.profile_image }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{profileData.name || "User"}</Text>
          <Text style={styles.profileName}>
            {profileData.mobile || "1234567890"}
          </Text>
        </View>
      ) : (
        <ActivityIndicator size="small" color="#0000ff" style={styles.loader} />
      )}
      <DrawerItemList {...props} />
      <DrawerItem
        label="Logout"
        onPress={handleLogout}
        labelStyle={styles.logoutLabel}
        style={styles.logoutButton}
      />
    </DrawerContentScrollView>
  );
};

// Styles for components
const styles = StyleSheet.create({
  profileHeader: {
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  logoutButton: {
    marginVertical: 10,
  },
  logoutLabel: {
    color: "#FF6347",
    fontWeight: "bold",
  },
  loader: {
    padding: 20,
  },
});

export default App;
