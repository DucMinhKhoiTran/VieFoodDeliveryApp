import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Button,
  StyleSheet,
  Alert,
} from "react-native";
import { firestore } from "../config/firebaseConfig";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import * as Location from "expo-location";
import MapView, { Marker, Polyline } from "react-native-maps";

const OrderTrackingScreen = ({ route }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentAddress, setCurrentAddress] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [routeCoords, setRouteCoords] = useState([]);

  useEffect(() => {
    const orderRef = doc(firestore, "orders", orderId);
    const unsubscribe = onSnapshot(
      orderRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setOrder(docSnap.data());
          setLoading(false);

          // Convert pickup location to address
          if (docSnap.data().location) {
            Location.reverseGeocodeAsync(docSnap.data().location)
              .then((addresses) => {
                if (addresses.length > 0) {
                  const { street, city, region, country } = addresses[0];
                  setPickupAddress(`${street}, ${city}, ${region}, ${country}`);
                }
              })
              .catch((error) => {
                console.error("Error converting pickup location:", error);
              });
          }
        } else {
          Alert.alert("Order not found.");
        }
      },
      (error) => {
        console.error(error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [orderId]);

  useEffect(() => {
    let locationSubscription;
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }
      locationSubscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 10 },
        async (loc) => {
          const newLoc = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
          setCurrentLocation(newLoc);
          setRouteCoords((prev) => [...prev, newLoc]);

          // Convert current location to address
          try {
            const addresses = await Location.reverseGeocodeAsync(newLoc);
            if (addresses.length > 0) {
              const { street, city, region, country } = addresses[0];
              setCurrentAddress(`${street}, ${city}, ${region}, ${country}`);
            }
          } catch (error) {
            console.error("Error converting current location:", error);
          }
        }
      );
    })();
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const markDelivered = async () => {
    try {
      const orderRef = doc(firestore, "orders", orderId);
      await updateDoc(orderRef, { orderStatus: "Delivered" });
      Alert.alert("Order marked as delivered.");
    } catch (error) {
      Alert.alert("Error updating order: " + error.message);
    }
  };

  if (loading || !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Tracking</Text>
      <Text style={styles.statusText}>Status: {order.orderStatus}</Text>
      <Text style={styles.statusText}>
        Placed at: {new Date(order.placedAt.seconds * 1000).toLocaleString()}
      </Text>
      {pickupAddress && (
        <Text style={styles.locationText}>Pickup: {pickupAddress}</Text>
      )}
      {currentAddress && (
        <Text style={styles.locationText}>Your Location: {currentAddress}</Text>
      )}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: order.location.latitude,
          longitude: order.location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker coordinate={order.location} title="Pickup Location" />
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Your Location"
            pinColor="blue"
          />
        )}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={3}
            strokeColor="#E53935"
          />
        )}
      </MapView>
      <View style={styles.buttonContainer}>
        <Button
          title="Mark as Delivered"
          color="#E53935"
          onPress={markDelivered}
        />
      </View>
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
  loadingText: {
    fontSize: 16,
    color: "#333",
    marginTop: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#E53935",
    textAlign: "center",
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 5,
  },
  locationText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 5,
  },
  map: {
    flex: 1,
    marginTop: 10,
    borderRadius: 8,
  },
  buttonContainer: {
    marginVertical: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
});

export default OrderTrackingScreen;
