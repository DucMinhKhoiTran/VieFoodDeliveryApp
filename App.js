import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, firestore } from "./config/firebaseConfig";

// import screens
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import RestaurantListScreen from "./screens/RestaurantListScreen";
import RestaurantDetailsScreen from "./screens/RestaurantDetailsScreen";
import CartScreen from "./screens/CartScreen";
import OrderTrackingScreen from "./screens/OrderTrackingScreen";
import OrderHistoryScreen from "./screens/OrderHistoryScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
import ProfileScreen from "./screens/ProfileScreen";

const AuthStack = createStackNavigator();
const HomeStack = createStackNavigator();
const FavoritesStack = createStackNavigator();
const Tab = createBottomTabNavigator();

// CartBadge component: displays a small red badge with count of cart items
const CartBadge = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (auth.currentUser) {
      const q = query(
        collection(firestore, "carts"),
        where("userId", "==", auth.currentUser.uid)
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        let cnt = 0;
        querySnapshot.forEach(() => {
          cnt++;
        });
        setCount(cnt);
      });
      return () => unsubscribe();
    }
  }, []);

  return (
    <View
      style={{
        position: "absolute",
        right: -6,
        top: -3,
        backgroundColor: "red",
        borderRadius: 8,
        width: 16,
        height: 16,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#fff", fontSize: 10 }}>{count}</Text>
    </View>
  );
};

const HomeStackScreen = () => {
  return (
    <HomeStack.Navigator initialRouteName="HomeMain">
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: "VieFoodDeli",
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 15 }}
              onPress={() => navigation.navigate("Cart")}
            >
              <View>
                <Ionicons name="cart-outline" size={24} color="#E53935" />
                <CartBadge />
              </View>
            </TouchableOpacity>
          ),
        })}
      />
      <HomeStack.Screen
        name="Restaurants"
        component={RestaurantListScreen}
        options={{ title: "Restaurants" }}
      />
      <HomeStack.Screen
        name="Details"
        component={RestaurantDetailsScreen}
        options={{ title: "Details" }}
      />
      <HomeStack.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: "My Cart" }}
      />
      <HomeStack.Screen
        name="OrderTracking"
        component={OrderTrackingScreen}
        options={{ title: "Track Order" }}
      />
      <HomeStack.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{ title: "Order History" }}
      />
    </HomeStack.Navigator>
  );
};

const FavoritesStackScreen = () => {
  return (
    <FavoritesStack.Navigator initialRouteName="Favorites">
      <FavoritesStack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: "Favorites" }}
      />
      <FavoritesStack.Screen
        name="Details"
        component={RestaurantDetailsScreen}
        options={{ title: "Details" }}
      />
    </FavoritesStack.Navigator>
  );
};

// MainTabNavigator provides bottom tabs for Home, Favorites, and Profile
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "HomeTab") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "FavoritesTab") {
            iconName = focused ? "heart" : "heart-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#E53935",
        tabBarInactiveTintColor: "#777",
        headerShown: false, // Hide header for all tabs
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="FavoritesTab"
        component={FavoritesStackScreen}
        options={{ title: "Favorites" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (initializing) {
        setInitializing(false);
      }
    });
    return unsubscribe;
  }, [initializing]);

  if (initializing) {
    return null;
  }

  return (
    <NavigationContainer>
      {user ? (
        <MainTabNavigator />
      ) : (
        <AuthStack.Navigator>
          <AuthStack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: "Login" }}
          />
          <AuthStack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: "Register" }}
          />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default App;
