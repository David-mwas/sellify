import { View, Text } from "react-native";
import React, { useContext } from "react";
import { Stack } from "expo-router/stack";
import { ThemeContext } from "@/contexts/ThemeContext"; // Import ThemeContext
import { Colors } from "@/constants/Colors"; // Import Colors

export default function Modals() {
  const themeContext = useContext(ThemeContext); // Access the theme context
  const isDarkMode = themeContext?.isDarkMode || false; // Get current theme
  const themeColors = isDarkMode ? Colors.dark : Colors.light; // Use colors based on theme

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "simple_push",
        headerStyle: {
          backgroundColor: themeColors.headerBackground,
        },
        headerTintColor: themeColors.headerText,
      }}
    >
      <Stack.Screen name="[id]" options={{ animation: "simple_push" }} />
    </Stack>
  );
}
