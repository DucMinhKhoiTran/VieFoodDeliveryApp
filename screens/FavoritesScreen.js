import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { firestore, auth } from "../config/firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  addDoc,
} from "firebase/firestore";

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth.currentUser) {
      const q = query(
        collection(firestore, "favorites"),
        where("userId", "==", auth.currentUser.uid)
      );
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          let favs = [];
          querySnapshot.forEach((docSnapshot) => {
            favs.push({ id: docSnapshot.id, ...docSnapshot.data() });
          });
          setFavorites(favs);
          setLoading(false);
        },
        (error) => {
          console.error(error);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    }
  }, []);

  const removeFavorite = async (id) => {
    try {
      await deleteDoc(doc(firestore, "favorites", id));
      alert("Removed from favorites");
    } catch (error) {
      alert("Error removing favorite: " + error.message);
    }
  };

  const handleAddToCart = async (item) => {
    try {
      await addDoc(collection(firestore, "carts"), {
        idMeal: item.idMeal,
        strMeal: item.strMeal,
        userId: auth.currentUser.uid,
        quantity: 1,
        addedAt: new Date(),
      });
      alert("Added to cart!");
    } catch (error) {
      alert("Error adding to cart: " + error.message);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("Details", { restaurant: item })}
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.strMeal}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={() => handleAddToCart(item)}
            style={styles.cartButton}
          >
            <Text style={styles.cartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => removeFavorite(item.id)}
            style={styles.removeButton}
          >
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
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
      <Text style={styles.title}>My Favorites</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No favorites added.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#E53935",
    marginBottom: 15,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E53935",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
    fontFamily: "Roboto",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cartButton: {
    backgroundColor: "#E53935",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  cartButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: "#3F00FF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  removeText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  emptyText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    color: "#777",
  },
});

export default FavoritesScreen;
