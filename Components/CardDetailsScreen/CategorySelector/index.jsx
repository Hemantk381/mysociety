import React, { useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Button } from "react-native-paper";

const CategorySelector = ({
  categories,
  selectedCategories,
  setSelectedCategories,
}) => {
  const handleSelectCategory = (category) => {
    setSelectedCategories((prevSelected) => {
      if (prevSelected.includes(category)) {
        return prevSelected.filter((item) => item?.id !== category?.id); // Deselect if already selected
      } else {
        return [...prevSelected, category]; // Select if not already selected
      }
    });
  };

  const renderItem = ({ item }) => (
    <Button
      style={[
        styles.categoryButton,
        selectedCategories.includes(item.id) && styles.selectedCategory,
      ]}
      labelStyle={[
        styles.categoryText,
        selectedCategories.includes(item.id) && styles.selectedText,
      ]}
      mode="contained" // You can choose the style: 'text', 'outlined', 'contained'
      onPress={() => handleSelectCategory(item.id)}
    >
      {item.name}
    </Button>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.categoryList}
        showsHorizontalScrollIndicator={false} // Disable horizontal scroll indicator
        horizontal={true} // Set FlatList to horizontal mode
      />
    </View>
  );
};

export default CategorySelector;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // flexGrow: 1,
    marginTop: 10,

    justifyContent: "center",
    alignItems: "center",

    // marginBottom: 30,
  },
  categoryList: {
    width: "100%", // Full width of the container
    height: 30,
    marginBottom: 0,
  },
  categoryButton: {
    marginHorizontal: 8, // Space between buttons
    borderRadius: 8,
    borderWidth: 1,
    // borderColor: "#EF5A6F",
    justifyContent: "center", // Align text vertically
    alignItems: "center", // Align text horizontally
    paddingVertical: 10, // Adjust the padding for a minimal appearance
    height: 30,
  },
  selectedCategory: {
    backgroundColor: "#EF5A6F", // Selected button color
    // borderColor: "#3498db",
    height: 30,
  },
  categoryText: {
    fontSize: 12, // Font size
    color: "white", // Text color
    fontWeight: "600",
    textAlign: "center", // Center text
  },
  selectedText: {
    color: "white", // Text color for selected category
  },
});
