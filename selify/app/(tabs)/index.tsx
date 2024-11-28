import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Image,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import { Link, router } from "expo-router";

function Index() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setProducts([
        {
          id: 1,
          title: "Product 1",
          images: [
            {
              url: "https://picsum.photos/200/300",
              thumbnailUrl: "https://example.com/image1-thumbnail.jpg",
            },
          ],
          price: 100,
          categoryId: 1,
          userId: 1,
          location: {
            latitude: 0.2861635,
            longitude: 34.7630199,
          },
        },
        {
          id: 2,
          title: "Product 2",
          images: [
            {
              url: "https://picsum.photos/200/300",
              thumbnailUrl: "https://example.com/image2-thumbnail.jpg",
            },
          ],
          price: 200,
          categoryId: 2,
          userId: 2,
          location: {
            latitude: 0.2861635,
            longitude: 34.7630199,
          },
        },
        {
          id: 3,
          title: "Product 3",
          images: [
            {
              url: "https://picsum.photos/200/300",
              thumbnailUrl: "https://example.com/image3-thumbnail.jpg",
            },
          ],
          price: 300,
          categoryId: 3,
          userId: 3,
          location: {
            latitude: 0.2861635,
            longitude: 34.7630199,
          },
        },
      ]);
      setIsLoading(false);
      setIsRefreshing(false); // Reset the refreshing state
    }, 1000); // Simulate a 2-second loading time
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <SafeAreaView className="flex-1 px-6 py-4">
      <Image
        source={require("@/assets/images/selify.png")}
        style={{
          width: 100,
          height: 80,
          resizeMode: "contain",
        }}
      />

      {isLoading ? (
        // Shimmer Placeholder
        <View style={{ flex: 1 }}>
          {[...Array(5)].map((_, index) => (
            <View
              key={index}
              style={{
                marginBottom: 20,
                backgroundColor: "#fff",
                borderRadius: 10,
                overflow: "hidden",
                elevation: 3,
              }}
            >
              <ShimmerPlaceholder
                style={{
                  width: "100%",
                  height: 220,
                  borderRadius: 10,
                  marginBottom: 10,
                }}
              />
              <View style={{ padding: 10 }}>
                <ShimmerPlaceholder
                  style={{ height: 20, marginBottom: 8, borderRadius: 5 }}
                />
                <ShimmerPlaceholder
                  style={{ height: 16, width: "60%", borderRadius: 5 }}
                />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlashList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({
            item,
          }: {
            item: {
              id: number;
              title: string;
              images: { url: string; thumbnailUrl: string }[];
              price: number;
              categoryId: number;
              userId: number;
              location: { latitude: number; longitude: number };
            };
          }) => (
            <Link
              href={{
                pathname: "/(tabs)/products/[id]",
                params: {
                  id: item.id,
                  title: item.title,
                  price: item.price,
                  image: item.images[0].url,
                  location: JSON.stringify(item.location),
                },
              }}
              className="mb-6"
              style={{ elevation: 3 }}
            >
              <Image
                source={{ uri: item.images[0].url }}
                style={{
                  width: "100%",
                  height: 220,
                  resizeMode: "cover",
                  borderRadius: 15,
                }}
              />
              <View className="mt-2">
                <Text className="text-lg font-bold text-[#333]">
                  {item.title}
                </Text>
                <Text className="text-lg font-semibold text-md">
                  KES {item.price}
                </Text>
              </View>
            </Link>
          )}
          estimatedItemSize={200}
          showsVerticalScrollIndicator={false}
          onRefresh={() => {
            setIsRefreshing(true);
            fetchProducts();
          }}
          refreshing={isRefreshing} // Required boolean prop
        />
      )}
    </SafeAreaView>
  );
}

export default Index;
