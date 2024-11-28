import { View, Text } from "react-native";
import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";

const product = () => {
  const { id } = useLocalSearchParams();
  return (
    <View>
      <Stack.Screen
        options={{
          title: id.toString(),
          headerShown: true,
          headerTitleAlign: "center",
        }}
      />
      <Text>{id}</Text>
    </View>
  );
};

export default product;
