import { useEffect, useState } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "../firebase";

// Firebase keys can't contain . # $ / [ ]
// Encode these characters for storage, decode when reading back
function encodeKeys(obj) {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) return obj;
  const encoded = {};
  for (const [key, value] of Object.entries(obj)) {
    const safeKey = key
      .replace(/%/g, "%25")
      .replace(/\./g, "%2E")
      .replace(/#/g, "%23")
      .replace(/\$/g, "%24")
      .replace(/\//g, "%2F")
      .replace(/\[/g, "%5B")
      .replace(/\]/g, "%5D");
    encoded[safeKey] = value;
  }
  return encoded;
}

function decodeKeys(obj) {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) return obj;
  const decoded = {};
  for (const [key, value] of Object.entries(obj)) {
    const originalKey = decodeURIComponent(key);
    decoded[originalKey] = value;
  }
  return decoded;
}

export function useFirebaseData(path, initialValue) {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(true);

  const isScoresPath = path === "scores";

  useEffect(() => {
    const dbRef = ref(db, path);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null) {
        setData(isScoresPath ? decodeKeys(val) : val);
      } else {
        setData(initialValue);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [path]);

  const setFirebaseData = (newData) => {
    const value = typeof newData === "function" ? newData(data) : newData;
    setData(value);
    set(ref(db, path), isScoresPath ? encodeKeys(value) : value);
  };

  return [data, setFirebaseData, loading];
}
