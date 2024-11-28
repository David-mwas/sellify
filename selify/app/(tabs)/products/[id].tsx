import { View, Text, Image, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import ParallaxScrollView from "../../../app-example/components/ParallaxScrollView";
import { StatusBar } from "expo-status-bar";
const product = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const title = searchParams.get("title");
  const price = searchParams.get("price");
  const image = searchParams.get("image");
  const location = searchParams.get("location");

  useEffect(() => {
    const fetchLocation = async () => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=0.2861635&lon=34.7630199&format=json`
      );

      const data = await res.json();
      console.log(data);
    };
    fetchLocation();
  }, []);
  console.log(location);
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={<Image source={{ uri: image || "" }} style={styles.image} />}
    >
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: id ? id.toString() : "Default Title",
            headerShown: false,
            headerTitleAlign: "center",
          }}
        />

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.price}>KES {price}</Text>
      </View>
    </ParallaxScrollView>
  );
};

export default product;
const styles = StyleSheet.create({
  container: { flex: 1, padding: 5 },
  image: { width: "100%", height: 300, marginBottom: 5 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 5 },
  price: { fontSize: 20, color: "green", marginBottom: 5 },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
