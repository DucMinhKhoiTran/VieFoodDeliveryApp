import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  Image,
  Button,
  TextInput,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
} from "react-native";
import { firestore, auth } from "../config/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

const RestaurantDetailsScreen = ({ route, navigation }) => {
  const { restaurant } = route.params;
  const [quantity, setQuantity] = useState("1");
  const [review, setReview] = useState("");
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  // Add item to cart with current user's ID
  const addToCart = async () => {
    try {
      await addDoc(collection(firestore, "carts"), {
        idMeal: restaurant.idMeal,
        strMeal: restaurant.strMeal,
        quantity: parseInt(quantity, 10),
        userId: auth.currentUser.uid,
        addedAt: new Date(),
      });
      alert("Item added to cart!");
      navigation.navigate("Cart");
    } catch (error) {
      alert("Error adding to cart: " + error.message);
    }
  };

  // Fetch reviews for the restaurant
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsQuery = query(
          collection(firestore, "restaurants", restaurant.idMeal, "reviews")
        );
        const querySnapshot = await getDocs(reviewsQuery);
        const reviewsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReviews(reviewsList);
      } catch (error) {
        Alert.alert("Error", "Error fetching reviews: " + error.message);
      }
    };

    fetchReviews();
  }, [restaurant.idMeal]);

  // Submit review
  const submitReview = async () => {
    try {
      const username = auth.currentUser.name || "Anonymous"; // Use display name if available
      await addDoc(
        collection(firestore, "restaurants", restaurant.idMeal, "reviews"),
        {
          review,
          username,
          createdAt: new Date(),
        }
      );
      Alert.alert("Success", "Review submitted!");
      setReview("");

      // Refresh reviews after submission
      const fetchReviews = async () => {
        const reviewsQuery = query(
          collection(firestore, "restaurants", restaurant.idMeal, "reviews")
        );
        const querySnapshot = await getDocs(reviewsQuery);
        const reviewsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReviews(reviewsList);
      };
      fetchReviews();
    } catch (error) {
      Alert.alert("Error", "Error submitting review: " + error.message);
    }
  };

  // Check if the restaurant is already in favorites
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const favoritesQuery = query(
          collection(firestore, "favorites"),
          where("idMeal", "==", restaurant.idMeal),
          where("userId", "==", auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(favoritesQuery);
        setIsFavorite(!querySnapshot.empty); // Set to true if the restaurant is in favorites
      } catch (error) {
        console.error("Error checking favorite status:", error.message);
      }
    };

    checkFavoriteStatus();
  }, [restaurant.idMeal]);

  // Add or remove from favorites
  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        // Remove from favorites
        const favoritesQuery = query(
          collection(firestore, "favorites"),
          where("idMeal", "==", restaurant.idMeal),
          where("userId", "==", auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(favoritesQuery);
        const batch = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(batch);
        setIsFavorite(false);
        alert("Removed from favorites!");
      } else {
        // Add to favorites
        await addDoc(collection(firestore, "favorites"), {
          idMeal: restaurant.idMeal,
          strMeal: restaurant.strMeal,
          strMealThumb: restaurant.strMealThumb,
          userId: auth.currentUser.uid,
          favoritedAt: new Date(),
        });
        setIsFavorite(true);
        alert("Added to favorites!");
      }
    } catch (error) {
      alert("Error toggling favorite status: " + error.message);
    }
  };

  // Set up the header with the "Add to Favorites" icon
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"} // Toggle icon based on favorite status
          size={24}
          color="#E53935"
          style={{ marginRight: 15 }}
          onPress={toggleFavorite}
        />
      ),
    });
  }, [navigation, isFavorite]);

  return (
    <FlatList
      data={reviews}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.reviewItem}>
          <Text style={styles.reviewUsername}>{item.username}</Text>
          <Text style={styles.reviewText}>{item.review}</Text>
        </View>
      )}
      ListHeaderComponent={
        <View style={styles.container}>
          <Text style={styles.title}>{restaurant.strMeal}</Text>
          {restaurant.strMealThumb && (
            <Image
              source={{ uri: restaurant.strMealThumb }}
              style={styles.image}
            />
          )}
          <Text style={styles.description}>{restaurant.strInstructions}</Text>
          <TextInput
            style={styles.input}
            placeholder="Quantity"
            placeholderTextColor="#777"
            keyboardType="numeric"
            value={quantity}
            onChangeText={(text) => setQuantity(text)}
          />
          <View style={styles.buttonContainer}>
            <Button title="Add to Cart" color="#E53935" onPress={addToCart} />
          </View>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>Submit a Review</Text>
          <TextInput
            style={styles.reviewInput}
            placeholder="Write your review here..."
            placeholderTextColor="#777"
            value={review}
            onChangeText={(text) => setReview(text)}
          />
          <View style={styles.buttonContainer}>
            <Button
              title="Submit Review"
              color="#E53935"
              onPress={submitReview}
            />
          </View>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>Reviews</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#E53935",
    marginBottom: 10,
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: 200,
    marginBottom: 10,
    borderRadius: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 15,
    color: "#333",
    textAlign: "justify",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E53935",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    color: "#333",
  },
  reviewInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E53935",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#E53935",
    marginVertical: 15,
    width: "100%",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E53935",
    marginBottom: 10,
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  reviewItem: {
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewUsername: {
    fontWeight: "bold",
    color: "#E53935",
    marginBottom: 5,
  },
  reviewText: {
    color: "#333",
  },
});

export default RestaurantDetailsScreen;
