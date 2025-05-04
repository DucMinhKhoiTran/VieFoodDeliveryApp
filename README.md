# VieFood Delivery App

VieFood Delivery App is a React Native application designed for food delivery services. It includes features like restaurant browsing, order tracking, and user authentication. The app integrates with Firebase for backend services such as authentication, Firestore database, and real-time updates.

---

## Features

- **User Authentication**: Sign up, log in, and manage user sessions.
- **Restaurant Browsing**: View a list of restaurants and their details.
- **Order Tracking**: Track orders in real-time with location updates.
- **Favorites**: Add and manage favorite restaurants.
- **Cart Management**: Add items to the cart and place orders.
- **Real-Time Updates**: Firebase Firestore for real-time data synchronization.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Firebase Project](https://console.firebase.google.com/) with Firestore and Authentication enabled

---

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/bry-delivery-app.git
   cd bry-delivery-app
   ```
2. **Install Dependencies**:
   ```bash
    npm install
   ```

4. **Install Expo CLI (if not already installed)**:
   ```bash
    npm install -g expo-cli
   ```

6. **Set Up Firebase**:

   - Go to **Firebase Console**
   - Create a new project
   - Enable Firestore Database and Authentication (Email/Password)
   - Add a new web app to your Firebase project and copy the Firebase configuration

7. **Configure Firebase**:

   - Replace the content of config/firebaseConfig.js with your Firebase configuration:
   // filepath: /config/firebaseConfig.js
   ```
   import { initializeApp } from "firebase/app";
   import { getAuth } from "firebase/auth";
   import { getFirestore } from "firebase/firestore";

   const firebaseConfig = {
   apiKey: "YOUR_API_KEY",
   authDomain: "YOUR_AUTH_DOMAIN",
   projectId: "YOUR_PROJECT_ID",
   storageBucket: "YOUR_STORAGE_BUCKET",
   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
   appId: "YOUR_APP_ID",
   };

   const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   export const firestore = getFirestore(app);
   ```
8. **Run the App**:
   ```bash
   npx expo start
   ```
