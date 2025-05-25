import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, authReady } from "../Services/firebase/config/firebaseConfig";
import { fetchUserRole } from "../Services/firebase/roles";

interface UserRole extends User {
  rol?: "admin" | "user";
}

interface AuthContextProps {
  user: UserRole | null;
}

const AuthContext = createContext<AuthContextProps>({ user: null });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserRole | null>(null);

  useEffect(() => {
    const fetchRoleAndSetUser = async (user: User) => {
      try {
        const roleUser = await fetchUserRole(user.uid);

        const userWithRole: UserRole = { 
          ...user, 
          rol: roleUser?.rol === "admin" || roleUser?.rol === "user" ? roleUser.rol : undefined 
        };
        setUser(userWithRole);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    authReady.then(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          fetchRoleAndSetUser(user);
        } else {
          setUser(null);
        }
      });

      return () => unsubscribe();
    });
  }, []);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
