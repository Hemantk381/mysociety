// Card.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const AboutScreen = () => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}></Text>
      <Text>Enginner </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    margin: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default AboutScreen;
