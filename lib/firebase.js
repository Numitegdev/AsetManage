import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
   // Tambahkan addDoc di sini
} from "firebase/firestore";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBKp9tN2AeByL3kLNdBb4CKeWabnZWJk44",
  authDomain: "dataaset-5e86e.firebaseapp.com",
  projectId: "dataaset-5e86e",
  storageBucket: "dataaset-5e86e.appspot.com", // Perbaiki storageBucket
  messagingSenderId: "1044117119492",
  appId: "1:1044117119492:web:3bd985ce4bc83daeb9cb51",
  measurementId: "G-1FDPN3HYX5",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, getDocs, doc, updateDoc, deleteDoc, addDoc }; // Tambahkan addDoc di sini