import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
} from "react-native";
import Card from "../Card";
import config from "../../config";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";

const Accordion = ({ title, userId }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [blockData, setBlockData] = useState([]);
  const [heightAnim] = useState(new Animated.Value(0)); // Animation for the accordion content
  const apiUrl = config.API_URL;

  // Fetch data when userId or accordion is toggled
  useEffect(() => {
    if (isExpanded) {
      fetchCardData();
    }
  }, [isExpanded, userId]);

  const fetchCardData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/get-shop`, {
        params: {
          user_id: userId,
          block: title,
        },
      });
      if (response.data) {
        setBlockData(response.data.data || []);
      }
    } catch (error) {
      setBlockData([]);
      console.error(error.response ? error.response.data : error.message);
    }
  };

  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
    Animated.timing(heightAnim, {
      toValue: isExpanded ? 0 : 200, // Change 200 to dynamic height if needed
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const onCardPress = (item) => {
    console.log("Card pressed:", item);
  };

  // Filter out non-present or empty items
  console.log(blockData, "blockData");
  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity onPress={toggleAccordion} style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        <Icon
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="white"
          style={styles.icon}
        />
      </TouchableOpacity>
      {/* Animated FlatList for smooth transition */}
      <Animated.View style={[styles.contentContainer, { height: heightAnim }]}>
        {isExpanded &&
          (blockData?.length > 0 ? (
            <div style={{ overflowY: "auto", maxHeight: "500px", height: 300 }}>
              {blockData?.map((item) => {
                return (
                  <div key={item.id} style={{ marginBottom: "20px" }}>
                    <Card data={item} onPress={() => onCardPress(item)} />
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ fontSize: 12 }}>No shop available</p>
          ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  accordionContainer: {
    marginVertical: 10,

    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    overflow: "hidden",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#6C63FF", // Gradient-like color
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    letterSpacing: 0.5,
  },
  icon: {
    marginLeft: 10,
  },
  contentContainer: {
    overflow: "hidden",
    backgroundColor: "#f4f4f4",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
});

export default Accordion;
