import React, { useContext } from "react";
import { Text, Touchable, TouchableOpacity, View } from "react-native";
import { AuthContext } from "../../contexts/AuthContext";
import { ThemeContext } from "@/contexts/ThemeContext";
function account() {
  const authContext = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);

  if (!authContext || !themeContext) {
    throw new Error("Contexts not found");
  }

  const { logout, isLoading } = authContext;
  return (
    <View>
      <Text>account</Text>
      <TouchableOpacity onPress={logout}>
        <Text>Go to products</Text>
      </TouchableOpacity>
    </View>
  );
}

export default account;
