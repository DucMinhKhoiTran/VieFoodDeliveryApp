import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
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
  updateDoc,
} from "firebase/firestore";
import * as Location from "expo-location";

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch only orders of current user
  useEffect(() => {
    if (auth.currentUser) {
      const q = query(
        collection(firestore, "carts"),
        where("userId", "==", auth.currentUser.uid)
      );
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          let items = [];
          querySnapshot.forEach((docSnapshot) => {
            items.push({ id: docSnapshot.id, ...docSnapshot.data() });
          });
          setCartItems(items);
          setLoading(false);
        },
        (error) => {
          console.error(error);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    }
  }, [auth.currentUser]);

  // Update quantity or remove if quantity goes below 1
  const updateQuantity = async (item, newQuantity) => {
    try {
      if (newQuantity < 1) {
        await deleteDoc(doc(firestore, "carts", item.id));
      } else {
        await updateDoc(doc(firestore, "carts", item.id), {
          quantity: newQuantity,
        });
      }
    } catch (error) {
      Alert.alert("Error updating quantity: " + error.message);
    }
  };

  const handleIncrement = (item) => updateQuantity(item, item.quantity + 1);
  const handleDecrement = (item) => updateQuantity(item, item.quantity - 1);
  const handleRemoveItem = async (item) => {
    try {
      await deleteDoc(doc(firestore, "carts", item.id));
      Alert.alert("Item removed from cart.");
    } catch (error) {
      Alert.alert("Error removing item: " + error.message);
    }
  };

  const placeOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert("Your cart is empty.");
      return;
    }
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      // Create order document including the current user's ID
      const orderDoc = await addDoc(collection(firestore, "orders"), {
        items: cartItems,
        orderStatus: "Placed",
        placedAt: new Date(),
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        userId: auth.currentUser.uid,
      });
      // Clear cart items after order is placed
      for (let item of cartItems) {
        await deleteDoc(doc(firestore, "carts", item.id));
      }
      Alert.alert("Order placed successfully!");
      navigation.navigate("OrderTracking", { orderId: orderDoc.id });
    } catch (error) {
      Alert.alert("Error placing order: " + error.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>
        {item.strMeal} - Qty: {item.quantity}
      </Text>
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleDecrement(item)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleIncrement(item)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
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
      <Text style={styles.title}>My Cart</Text>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Your cart is empty.</Text>
        }
      />
      {cartItems.length > 0 && (
        <View style={styles.placeOrderButtonContainer}>
          <Button title="Place Order" color="#E53935" onPress={placeOrder} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5", padding: 15 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#E53935",
    marginBottom: 15,
    textAlign: "center",
  },
  itemContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E53935",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
  },
  itemText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 10,
    fontWeight: "bold",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  quantityButton: {
    backgroundColor: "#3F00FF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  quantityButtonText: { color: "#FFFFFF", fontSize: 18 },
  quantityText: { fontSize: 18, color: "#333", marginHorizontal: 10 },
  removeButton: {
    backgroundColor: "#E53935",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  removeButtonText: { color: "#FFFFFF", fontSize: 16 },
  emptyText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    color: "#777",
  },
  placeOrderButtonContainer: {
    marginTop: 20,
    borderRadius: 8,
    overflow: "hidden",
  },
});

export default CartScreen;
