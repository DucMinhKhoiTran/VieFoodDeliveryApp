import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);

        // convert to address
        let address = await Location.reverseGeocodeAsync(loc.coords);
        if (address.length > 0) {
          const { city, country } = address[0];
          setAddress(`${city}, ${country}`);
        }
      }
    })();
  }, []);

  return (
    <ImageBackground
      source={{
        uri: "https://tse3.mm.bing.net/th?id=OIP.mu5LK8b-Eexk9Wp8wzPA6wHaJ4&w=200&h=267&c=7",
      }}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Welcome to VieFoodDeli!</Text>
        {location ? (
          <>
            {address && <Text style={styles.subtitle}>Address: {address}</Text>}
          </>
        ) : (
          <ActivityIndicator size="small" color="#E53935" />
        )}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Restaurants")}
          >
            <Ionicons name="restaurant-outline" size={24} color="#fff" />
            <Text style={styles.buttonText}>Browse Restaurants</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("OrderHistory")}
          >
            <Ionicons name="time-outline" size={24} color="#fff" />
            <Text style={styles.buttonText}>Order History</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  backgroundImage: {
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(245, 245, 245, 0.51)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#E53935",
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    color: "#FFFFFF",
    marginBottom: 30,
  },
  buttonGroup: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E53935",
    padding: 15,
    borderRadius: 8,
    width: "80%",
    marginBottom: 15,
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 10,
  },
});

export default HomeScreen;
