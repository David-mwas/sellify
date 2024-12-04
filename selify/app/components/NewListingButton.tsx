import React, { useContext } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { ThemeContext } from "@/contexts/ThemeContext";

interface NLButtonProps {
  onPress: () => void;
}
function NewListingButton({ onPress }: NLButtonProps) {
  const themeContext = useContext(ThemeContext); // Access the theme context
  const isDarkMode = themeContext?.isDarkMode || false; // Get current theme
  const themeColors = isDarkMode ? Colors.dark : Colors.light;
  return (
    <TouchableOpacity
      activeOpacity={1}
      touchSoundDisabled={false}
      onPress={onPress}
      style={{
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 30,
        backgroundColor: themeColors.background,
      }}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: Colors.darkGreen,
            borderColor: themeColors.background,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="plus-circle"
          color={"#fff"}
          size={40}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    // elevation: 30, // Add elevation for Android
    // shadowColor: "#000", // Add shadow for iOS
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.2,
    // shadowRadius: 2,
    // zIndex: 999,
    borderRadius: 40,
    borderWidth: 10,
    bottom: 25,
    height: 80,
    justifyContent: "center",
    width: 80,
  },
});

export default NewListingButton;
