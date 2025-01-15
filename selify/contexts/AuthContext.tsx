import React, { createContext, useState, useEffect, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { Alert, ToastAndroid } from "react-native";
import { router } from "expo-router";
import { LocationObject } from "@/constants/types";
import { apiUrl } from "@/constants/api";

interface AuthContextType {
  userToken: string | null;
  login: (email: string, password: string) => Promise<void>; // Change to include credentials
  logout: () => Promise<void>;
  isLoading: boolean;
  register: (
    email: string,
    username: string,
    phoneNumber: string,
    password1: string,
    password2: string,
    location: LocationObject
    // pushToken: string
  ) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync("Token");

        if (token) {
          setIsLoading(false);
          setUserToken(token);
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error("Error loading token:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, [userToken]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      // Call your authentication API here to get the token
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }), // Send username and password
      });

      if (!response.ok) {
        const data = await response.json();

        setIsLoading(false);
        Alert.alert("Login failed", "Invalid credentials");
        // throw new Error("Login failed"); // Handle failed login
      }

      if (response.status === 200) {
        const data = await response.json();
        console.log(data?.access_token);
        // const token = data.key; // Assuming  API returns the token in this format

        await SecureStore.setItemAsync("Token", data?.access_token);
        setUserToken(data?.access_token);

        router.replace("/(tabs)");
        setIsLoading(false);
        ToastAndroid.show("Login Successful", ToastAndroid.SHORT);
        // Alert.alert("Login Successful", "You are now logged in");
      }
      if (response.status === 401) {
        const data = await response.json();

        setIsLoading(false);
        Alert.alert("Login failed", "Invalid credentials"); // Handle failed login
        throw new Error("Login failed");
      }
      if (response.status !== 200 && response.status !== 401) {
        const data = await response.json();

        setIsLoading(false);
        Alert.alert("Login failed", "Invalid credentials");
        throw new Error("Login failed");
      }
    } catch (error) {
      setIsLoading(false);
      // Alert.alert("Login failed " + error);
      console.log("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    username: string,
    phoneNumber: string,
    password1: string,
    password2: string,
    location: LocationObject
    // pushToken: string
  ) => {
    setIsLoading(true);

    try {
      // Call your authentication API here to get the token
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          email: email,
          phoneNumber: phoneNumber,
          password: password1,
          confirm_password: password2,
          location: location,
          // expoPushToken: pushToken,
        }), // Send username and password
      });

      if (!response.ok) {
        const data = await response.json();
        console.log(data?.message);
        setIsLoading(false);
        Alert.alert("Registration failed: " + data?.message);
        // throw new Error("Register failed"); // Handle failed login
      }

      if (response.status === 201) {
        const data = await response.json();

        router.replace("/(auth)/Login");
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Registration failed " + error);
      console.error("Register failed:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("Token");
      setUserToken(null);
      router.replace("/(auth)/Login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ userToken, login, register, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
