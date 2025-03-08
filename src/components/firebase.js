import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore';

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