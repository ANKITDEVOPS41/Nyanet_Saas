import { addDoc, collection, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useCallback, useMemo } from "react";
import { db, isFirebaseConfigured } from "../firebase";

function readLocalCollection(name) {
  try {
    return JSON.parse(localStorage.getItem(`nyayanet_${name}`) || "[]");
  } catch {
    return [];
  }
}

function writeLocalCollection(name, value) {
  localStorage.setItem(`nyayanet_${name}`, JSON.stringify(value));
}

export function useFirestore() {
  const addTransaction = useCallback(async function addTransaction(transaction) {
    const payload = {
      ...transaction,
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      await addDoc(collection(db, "transactions"), {
        ...transaction,
        createdAt: serverTimestamp(),
      });
      return payload;
    }

    const transactions = readLocalCollection("transactions");
    writeLocalCollection("transactions", [...transactions, payload]);
    return payload;
  }, []);

  const addAlert = useCallback(async function addAlert(alert) {
    const payload = {
      id: `A${Date.now()}`,
      ...alert,
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      await addDoc(collection(db, "alerts"), {
        ...alert,
        createdAt: serverTimestamp(),
      });
      return payload;
    }

    const alerts = readLocalCollection("alerts");
    writeLocalCollection("alerts", [...alerts, payload]);
    return payload;
  }, []);

  const subscribeAlerts = useCallback(function subscribeAlerts(callback) {
    if (isFirebaseConfigured && db) {
      return onSnapshot(collection(db, "alerts"), (snapshot) => {
        callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
    }

    callback(readLocalCollection("alerts"));
    return () => {};
  }, []);

  const getLocalTransactions = useCallback(function getLocalTransactions() {
    return readLocalCollection("transactions");
  }, []);

  return useMemo(
    () => ({ addTransaction, addAlert, subscribeAlerts, getLocalTransactions }),
    [addAlert, addTransaction, getLocalTransactions, subscribeAlerts],
  );
}
