import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC2YoARl0zzZ0swOCTeDronm3kpdvEVv9U",
  authDomain: "masters-ga.firebaseapp.com",
  databaseURL: "https://masters-ga-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "masters-ga",
  storageBucket: "masters-ga.firebasestorage.app",
  messagingSenderId: "869175454165",
  appId: "1:869175454165:web:946451ad5d5253f05df55c",
  measurementId: "G-N43FDBZ4ZK",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
