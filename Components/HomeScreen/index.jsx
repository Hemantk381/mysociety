import React, { useCallback, useEffect, useState } from "react";
import { View, Alert, FlatList, StyleSheet, Animated } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Accordion from "../Accordian";
import config from "../../config";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setUserId } from "@/store/Slice";

export default function HomeScreen() {
  const [userName, setUserName] = useState(null);
  const [cardData, setCardData] = useState(null);

  const animatedValue = new Animated.Value(0); // Initialize animated value
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const apiUrl = config.API_URL;

  useEffect(() => {
    const getUserName = async () => {
      try {
        const UserData = await AsyncStorage.getItem("currentUserData");
        if (UserData) {
          const parsedData = JSON.parse(UserData);
          setUserName(parsedData);
          dispatch(setUserId({ id: parsedData?.id }));
        }
      } catch (error) {
        console.error("Failed to retrieve user name.", error);
      }
    };

    getUserName();
  }, []);

  const fetchCardData = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/get-block`, {
        params: { user_id: userName.id },
      });
      console.log(response.data.data, "zzzzzz");

      if (response.data) {
        setCardData(response.data.data || {});
      } else {
        Alert.alert("Error", "Failed to fetch buildings");
      }
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      Alert.alert("Error", "An error occurred while fetching buildings");
    }
  }, [userName]);

  useEffect(() => {
    fetchCardData();
  }, [fetchCardData]);

  useEffect(() => {
    const startMarquee = () => {
      animatedValue.setValue(0); // Reset the animated value to 0
      Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 10000, // Adjust duration for speed
          useNativeDriver: true,
        })
      ).start();
    };

    startMarquee();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [300, -300],
  });

  return (
    <View style={{ flex: 1, padding: 10 }}>
      {/* <p style={styles.welcome}>{cardData.today_update || "Good Morning"}!</p> */}
      <FlatList
        data={cardData}
        renderItem={({ item }) => (
          <Accordion key={item?.id} title={item.block} userId={userName.id} />
        )}
        keyExtractor={(item) => item.title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  welcome: {
    padding: 8,
    fontSize: 16, // Adjusted font size for better visibility
    fontWeight: "bold", // Added bold text style
    color: "green",
    backgroundColor: "#f0f9f1", // Light green background
    borderRadius: 8, // Rounded corners
    overflow: "hidden", // Ensures the background stays confined
    textAlign: "center", // Centers the text horizontally
    marginVertical: 10, // Adds vertical spacing
    marginHorizontal: 20, // Adds horizontal spacing
  },
});
