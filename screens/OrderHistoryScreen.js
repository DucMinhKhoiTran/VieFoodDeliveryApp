import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { firestore, auth } from "../config/firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const OrderHistoryScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Query only orders for the current user
  useEffect(() => {
    if (auth.currentUser) {
      const q = query(
        collection(firestore, "orders"),
        where("userId", "==", auth.currentUser.uid)
      );
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          let orderList = [];
          querySnapshot.forEach((docSnapshot) => {
            orderList.push({ id: docSnapshot.id, ...docSnapshot.data() });
          });
          setOrders(orderList);
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

  // Render each order. If not delivered, make it clickable.
  const renderOrderItem = ({ item }) => {
    const OrderCardContent = () => (
      <View style={styles.orderCard}>
        <Text style={styles.orderStatus}>Status: {item.orderStatus}</Text>
        <Text style={styles.placedAt}>
          Placed: {new Date(item.placedAt.seconds * 1000).toLocaleString()}
        </Text>
        {item.items && item.items.length > 0 && (
          <View style={styles.orderItemsContainer}>
            {item.items.map((orderItem, index) => (
              <View key={index} style={styles.orderItem}>
                {orderItem.strMealThumb ? (
                  <Image
                    source={{ uri: orderItem.strMealThumb }}
                    style={styles.orderItemImage}
                  />
                ) : (
                  <View style={styles.noImage}>
                    <Text style={styles.noImageText}>No Image</Text>
                  </View>
                )}
                <View style={styles.orderItemDetails}>
                  <Text style={styles.orderItemName}>{orderItem.strMeal}</Text>
                  <Text style={styles.orderItemQuantity}>
                    Quantity: {orderItem.quantity}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );

    // Only make the order clickable if it is not delivered.
    if (item.orderStatus !== "Delivered") {
      return (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("OrderTracking", { orderId: item.id })
          }
        >
          <OrderCardContent />
        </TouchableOpacity>
      );
    } else {
      return <OrderCardContent />;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order History</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No orders found.</Text>
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
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E53935",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  orderStatus: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  placedAt: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
  },
  orderItemsContainer: {
    marginTop: 10,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  orderItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  noImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  noImageText: {
    fontSize: 10,
    color: "#fff",
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  orderItemQuantity: {
    fontSize: 14,
    color: "#777",
  },
  emptyText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    color: "#777",
  },
});

export default OrderHistoryScreen;
