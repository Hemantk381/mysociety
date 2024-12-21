import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const Card = ({ data, onPress }) => {
  if (!data || !data.shop_name || !data.owner_name || !data.logo_url) {
    return null; 
  }

  return (
    <TouchableOpacity onPress={() => onPress(data)}>
      <View style={styles.card}>
        <Image source={{ uri: data.logo_url }} style={styles.logo} />
        <Text style={styles.tag}>{data.name}</Text>

        <View style={styles.details}>
          <Text style={styles.ownerName}>Owner: {data.owner_name}</Text>
          <Text style={styles.description}>{data.shop_name}</Text>
          <Text style={styles.mobile}>Mobile: {data.mobile}</Text>
          <Text style={styles.tower}>Tower: {data.tower}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 20,
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
    position: 'relative',
  },
  tag: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF6347',
    color: 'white',
    padding: 5,
    borderRadius: 5,
    fontSize: 10,
    fontWeight: 'bold',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 20,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 15,
  },
  ownerName: {
    fontSize: 14,
    color: '#555',
  },
  description: {
    fontSize: 16,
    marginVertical: 5,
  },
  mobile: {
    fontSize: 14,
    color: '#555',
  },
  tower: {
    fontSize: 14,
    color: '#555',
  },
});

export default Card;

// import React from "react";
// import { View, Text, Image, TouchableOpacity } from "react-native";

// const Card = ({ data, onPress }) => {
//   if (!data || !data.shop_name || !data.owner_name || !data.logo_url) {
//     return null;
//   }

//   return (
//     <TouchableOpacity onPress={() => onPress(data)} className="mb-4">
//       <View className="flex-row p-5 mx-2 bg-white rounded-lg shadow-md">
//         <Image
//           source={{ uri: data.logo_url }}
//           className="w-24 h-24 rounded-lg mr-4"
//         />
//         <View className="flex-1 justify-center">
//           <Text className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
//             {data.name}
//           </Text>
//           <Text className="text-gray-600 text-sm">Owner: {data.owner_name}</Text>
//           <Text className="text-lg font-semibold my-1">{data.shop_name}</Text>
//           <Text className="text-gray-600 text-sm">Mobile: {data.mobile}</Text>
//           <Text className="text-gray-600 text-sm">Tower: {data.tower}</Text>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );
// };

// export default Card;
