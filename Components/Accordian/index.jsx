import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Card from '../Card';
import Icon from 'react-native-vector-icons/Ionicons';

const Accordion = ({ title, data, onCardPress }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity onPress={toggleAccordion} style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        <Icon
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="white"
          style={styles.icon}
        />
      </TouchableOpacity>
      {isExpanded && (
        <FlatList
          data={data}
          renderItem={({ item }) => <Card data={item} onPress={onCardPress} />}
          keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  accordionContainer: {
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#007BFF',
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
  },
  icon: {
    marginLeft: 10, 
  },
});

export default Accordion;
