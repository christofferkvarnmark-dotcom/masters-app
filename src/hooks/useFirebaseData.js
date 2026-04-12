import { useEffect, useState, useRef, useCallback } from "react";
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
  const dataRef = useRef(data);

  const isScoresPath = path === "scores";

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    const dbRef = ref(db, path);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null) {
        const decoded = isScoresPath ? decodeKeys(val) : val;
        setData(decoded);
        dataRef.current = decoded;
      } else {
        setData(initialValue);
        dataRef.current = initialValue;
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [path]);

  const setFirebaseData = useCallback((newData) => {
    const value = typeof newData === "function" ? newData(dataRef.current) : newData;
    setData(value);
    dataRef.current = value;
    set(ref(db, path), isScoresPath ? encodeKeys(value) : value);
  }, [path, isScoresPath]);

  return [data, setFirebaseData, loading];
}
