import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider, isFirebaseConfigured } from "../firebase";
import { demoAccounts, roleLabels } from "../utils/mockData";

const AuthContext = createContext(null);

function getStoredSession() {
  try {
    return JSON.parse(localStorage.getItem("nyayanet_session") || "null");
  } catch {
    return null;
  }
}

function persistSession(session) {
  if (session) localStorage.setItem("nyayanet_session", JSON.stringify(session));
  else localStorage.removeItem("nyayanet_session");
}

function pathForRole(role) {
  return {
    beneficiary: "/beneficiary",
    shopowner: "/shop",
    officer: "/officer",
  }[role] || "/beneficiary";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredSession);
  const [role, setRole] = useState(getStoredSession()?.role || null);
  const [demoMode, setDemoMode] = useState(Boolean(getStoredSession()?.demoMode));
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return undefined;
    }

    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        const stored = getStoredSession();
        if (!stored?.demoMode) {
          setUser(null);
          setRole(null);
          setDemoMode(false);
          persistSession(null);
        }
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      const profile = userSnap.exists()
        ? userSnap.data()
        : { role: "beneficiary", name: firebaseUser.displayName || "NyayaNet User" };

      if (!userSnap.exists()) {
        await setDoc(userRef, profile, { merge: true });
      }

      const session = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: profile.name || firebaseUser.displayName || firebaseUser.email,
        role: profile.role,
        demoMode: false,
      };

      setUser(session);
      setRole(session.role);
      setDemoMode(false);
      persistSession(session);
      setLoading(false);
    });
  }, []);

  async function loginWithEmail(email, password, requestedRole) {
    if (!isFirebaseConfigured || !auth) {
      const demoRole = requestedRole || Object.values(demoAccounts).find((account) => account.email === email)?.role || "beneficiary";
      return loginDemo(demoRole);
    }

    const credential = await signInWithEmailAndPassword(auth, email, password);
    const userRef = doc(db, "users", credential.user.uid);
    const userSnap = await getDoc(userRef);
    const resolvedRole = userSnap.exists() ? userSnap.data().role : requestedRole || "beneficiary";

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        role: resolvedRole,
        name: credential.user.displayName || roleLabels[resolvedRole],
        email,
      });
    }

    return pathForRole(resolvedRole);
  }

  async function loginWithGoogle(requestedRole = "beneficiary") {
    if (!isFirebaseConfigured || !auth) return loginDemo(requestedRole);

    const credential = await signInWithPopup(auth, googleProvider || new GoogleAuthProvider());
    const userRef = doc(db, "users", credential.user.uid);
    const userSnap = await getDoc(userRef);
    const resolvedRole = userSnap.exists() ? userSnap.data().role : requestedRole;

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        role: resolvedRole,
        name: credential.user.displayName || roleLabels[resolvedRole],
        email: credential.user.email,
      });
    }

    return pathForRole(resolvedRole);
  }

  function loginDemo(nextRole = "beneficiary") {
    const account = demoAccounts[nextRole] || demoAccounts.beneficiary;
    const session = {
      uid: `demo-${account.role}`,
      email: account.email,
      name: account.name,
      role: account.role,
      demoMode: true,
    };

    setUser(session);
    setRole(account.role);
    setDemoMode(true);
    persistSession(session);
    return pathForRole(account.role);
  }

  async function logout() {
    if (isFirebaseConfigured && auth?.currentUser) await signOut(auth);
    setUser(null);
    setRole(null);
    setDemoMode(false);
    persistSession(null);
  }

  const value = useMemo(
    () => ({
      user,
      role,
      demoMode,
      loading,
      isAuthenticated: Boolean(user),
      loginWithEmail,
      loginWithGoogle,
      loginDemo,
      logout,
      pathForRole,
    }),
    [demoMode, loading, role, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

