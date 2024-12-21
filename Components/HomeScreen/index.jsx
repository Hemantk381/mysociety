import React, { useCallback, useEffect, useState } from "react";
import { View, Alert, FlatList, StyleSheet, Animated } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Accordion from "../Accordian";
import config from "../../config"
import { useNavigation } from "@react-navigation/native";


export default function HomeScreen() {
  const [userName, setUserName] = useState("");
  const [cardData, setCardData] = useState({}); 
  const [currentCardData, setCurrentCardData]=useState();
  const animatedValue = new Animated.Value(0); // Initialize animated value
  const navigation = useNavigation();

  const apiUrl = config.API_URL;



  useEffect(() => {
    const getUserName = async () => {
      try {
        const UserData = await AsyncStorage.getItem("currentUserData");
        if (UserData) {
          const parsedData = JSON.parse(UserData);
          setUserName(parsedData);
        }
      } catch (error) {
        console.error("Failed to retrieve user name.", error);
      }
    };

    getUserName();
  }, []);

  const fetchCardData = useCallback(async () => {
    if (!userName.id) return;

    try {
      const response = await axios.get(
        `${apiUrl}/api/home`,
        {
          params: { user_id: userName.id },
        }
      );
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

  // Convert cardData to an array of keys for FlatList rendering
  const accordionData = Object.keys(cardData)
    .filter((key) => cardData[key].length > 0) // Filter out empty blocks
    .map((key) => ({ title: key, data: cardData[key] })); // Create an array of objects with title and data

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



    const handleCardPress = (cardData) => {
      setCurrentCardData(cardData);
      // Pass both currentCardData and userName when navigating
      navigation.navigate("CardDetails", { currentCardData: cardData, userName });
    };
    




  return (
    <View style={{ flex: 1 }}>
      <Animated.Text style={[styles.welcome, { transform: [{ translateX }] }]}>
       {cardData.today_update}!
      </Animated.Text>
      <FlatList
        data={accordionData}
        renderItem={({ item }) => (
          <Accordion title={item.title} data={item.data} onCardPress={handleCardPress} />
        )}
        keyExtractor={(item) => item.title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  welcome: {
    padding: 8,
    whiteSpace: 'nowrap', 
    color:"green"
  },
});
