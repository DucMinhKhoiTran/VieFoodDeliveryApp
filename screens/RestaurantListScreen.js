import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from "react-native";

const RestaurantListScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=")
      .then((response) => response.json())
      .then((json) => {
        if (json.meals !== null) {
          setRestaurants(json.meals);
          setFilteredRestaurants(json.meals);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
    if (text !== "") {
      const filtered = restaurants.filter((item) =>
        item.strMeal.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    } else {
      setFilteredRestaurants(restaurants);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("Details", { restaurant: item })}
    >
      <Text style={styles.cardTitle}>{item.strMeal}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Restaurants..."
        placeholderTextColor="#777"
        value={search}
        onChangeText={(text) => handleSearch(text)}
      />
      <FlatList
        data={filteredRestaurants}
        keyExtractor={(item) => item.idMeal}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#E53935",
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  cardTitle: {
    fontSize: 18,
    color: "#333",
    paddingLeft: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#E53935",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
    color: "#333",
  },
});

export default RestaurantListScreen;
