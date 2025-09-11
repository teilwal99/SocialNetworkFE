import React, { createContext, useContext, useEffect, useState } from "react";

import jwtDecode from "jwt-decode";
import { deleteItem, getItem, saveItem } from "@/app/utils/Storage";
import { getCurrentUser } from "@/apis/users";
import { User } from "@/app/type/user";

interface AuthContextType {
  user: User | null;
  isSignedIn: boolean;
  setIsSignedIn: (state:boolean) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  isLoaded: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isSignedIn: false,
  setIsSignedIn: () => {},
  token: null,
  setToken: () => {},
  isLoaded: false,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = await getItem("access_token");

      if (storedToken) {
        try {
          const decoded: any = jwtDecode(storedToken);
          if (decoded.exp && decoded.exp < Date.now() / 1000) {
            await deleteItem("access_token");
            setTokenState(null);
          } else {
            setTokenState(storedToken);
            setIsSignedIn(true);
          }
        } catch {
          setTokenState(null);
        }
      }

      setIsLoaded(true);
      
      try {
        const u = await getCurrentUser();
        setUser(u);
      } catch (err) {
        console.error("Failed to fetch user", err);
        setUser(null);
      } 
    };

    checkAuth();
  }, [token]);

  const setToken = async (token: string | null) => {
    if (token) {
      await saveItem("access_token", token);
      setIsSignedIn(true);
    } else {
      await deleteItem("access_token");
      setIsSignedIn(false);
    }
    setTokenState(token);
  };

  const logout = async () => {
    await deleteItem("access_token");
    setIsSignedIn(false);
    setTokenState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isSignedIn,
        setIsSignedIn,
        setToken,
        isLoaded,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
