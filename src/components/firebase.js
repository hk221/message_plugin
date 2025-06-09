import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore';
import { getAuth } from "firebase/auth";

// This file initializes Firebase with the provided configuration and exports the Firestore and Auth instances.
// It uses the Firebase SDK to connect to the Firestore database and authentication services.
// The configuration includes API keys and project identifiers necessary for connecting to the Firebase project.
// The exported `firestore` and `auth` can be used in other parts of the application to interact with Firestore and Firebase Authentication.
const firebaseConfig = {
  apiKey: "AIzaSyDqW8Mcav0opCXNvQOptRL8zhV19pwdazw",
  authDomain: "quizdatabase-6eda3.firebaseapp.com",
  projectId: "quizdatabase-6eda3",
  storageBucket: "quizdatabase-6eda3.firebasestorage.app",
  messagingSenderId: "741614543682",
  appId: "1:741614543682:web:4cbb172200a8fccd3c5edb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);