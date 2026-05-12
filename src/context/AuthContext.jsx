import {
  createContext,
  useEffect,
  useState
}
from "react";

import {
  onAuthStateChanged
}
from "firebase/auth";

import {
  auth
}
from "../firebase/firebase";

export const AuthContext =
  createContext();

export default function AuthProvider({
  children
}) {

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        currentUser => {

          setUser(currentUser);

          setLoading(false);
        }
      );

    return unsubscribe;

  }, []);

  return (

    <AuthContext.Provider
      value={{ user }}>

      {!loading && children}

    </AuthContext.Provider>
  );
}