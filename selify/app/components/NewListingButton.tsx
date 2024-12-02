import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
interface NLButtonProps {
  onPress: () => void;
}
function NewListingButton({ onPress }: NLButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 30,
      }}
    >
      <View style={styles.container}>
        <MaterialCommunityIcons
          name="plus-circle"
          color={Colors.light.background}
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
    backgroundColor: Colors.darkGreen,
    borderColor: Colors.light.background,
    borderRadius: 40,
    borderWidth: 10,
    bottom: 20,
    height: 80,
    justifyContent: "center",
    width: 80,
  },
});

export default NewListingButton;
