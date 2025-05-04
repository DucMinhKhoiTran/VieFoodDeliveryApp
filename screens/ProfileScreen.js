import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { auth, firestore } from "../config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

const ProfileScreen = () => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(firestore, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserInfo(docSnap.data());
        }
      }
    };
    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    signOut(auth).catch((error) => alert(error.message));
  };

  if (!userInfo) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.info}>Name: {userInfo.name}</Text>
      <Text style={styles.info}>Email: {userInfo.email}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Logout" color="#E53935" onPress={handleLogout} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#E53935",
    marginBottom: 20,
  },
  info: {
    fontSize: 18,
    color: "#333",
    marginBottom: 10,
    fontWeight: "bold",
  },
  buttonContainer: {
    marginTop: 20,
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
  },
});

export default ProfileScreen;
