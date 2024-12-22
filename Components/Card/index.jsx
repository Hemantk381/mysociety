import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Card, Title, Paragraph } from "react-native-paper";

const CustomCard = ({
  data,
  onPress,
  style = {},
  titleStyle = {},
  paragraphStyle = {},
  coverStyle = {},
  showName = true,
  showMobile = true,
  customContent = null,
}) => {
  if (!data || !data.shop_name || !data.profile_image) {
    return null;
  }

  return (
    <Card style={[styles.card, style]} onPress={() => onPress(data)}>
      <View style={styles.imageContainer}>
        <Card.Cover
          source={{ uri: data.profile_image }}
          style={[styles.cardCover, coverStyle]}
        />
        {/* Optionally display name over the image */}
        {showName && (
          <Text style={[styles.subTitle, styles.nameOverlay]}>{data.name}</Text>
        )}
      </View>

      <Card.Content>
        <Title style={[styles.title, titleStyle]}>{data.shop_name}</Title>
        <Paragraph style={[styles.paragraphP, paragraphStyle]}>
          Building: {data.building_id}
        </Paragraph>
        <Paragraph style={[styles.paragraph, paragraphStyle]}>
          Time: {data.open_time} - {data.close_time}
        </Paragraph>

        {/* Optionally display mobile */}
        {showMobile && data.mobile && (
          <Paragraph style={[styles.paragraph, paragraphStyle]}>
            Mobile: {data.mobile}
          </Paragraph>
        )}

        {/* Render any custom content passed as prop */}
        {customContent}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    marginHorizontal: 15,
    borderRadius: 12,
  },
  imageContainer: {
    position: "relative", // To allow absolute positioning of the name over the image
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden", // Ensures the image fits within the card bounds
  },
  cardCover: {
    width: "100%", // Ensure the image spans the full width of the card
    height: 80, // Set your desired height for the image
  },
  nameOverlay: {
    position: "absolute", // Position the name over the image
    bottom: 5, // Adjust as needed to position the name
    left: 5, // Adjust the horizontal position
    fontSize: 10, // Customize the font size as needed
    fontWeight: "bold",
    color: "#fff", // Set text color to white (or any contrast color)
    backgroundColor: "green", // Optional: Add a semi-transparent background to make text more readable
    padding: 5, // Add padding around the text
    borderRadius: 5, // Optional: Add rounded corners to the background
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  subTitle: {
    fontSize: 10,
    color: "#777",
    marginTop: 0,
  },
  paragraphP: {
    marginTop: -5,
    fontSize: 10,
    color: "#555",
    marginVertical: 0,
  },
  paragraph: {
    fontSize: 10,
    color: "#555",
    marginVertical: 0,
  },
});

export default CustomCard;
