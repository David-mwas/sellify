import React, { useState, useEffect, useContext } from "react";
import { Text, View, Image, SafeAreaView } from "react-native";
import { FlashList } from "@shopify/flash-list";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import { Link, router } from "expo-router";
import { Entypo } from "@expo/vector-icons";
import { ThemeContext } from "@/contexts/ThemeContext";
import { Colors } from "@/constants/Colors";
import { apiUrl } from "@/constants/api";
import { BlurView } from "expo-blur";

function Index() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const themeContext = useContext(ThemeContext); // Access the theme context
  const isDarkMode = themeContext?.isDarkMode || false; // Get current theme
  const themeColors = isDarkMode ? Colors.dark : Colors.light;

  const handleFetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/products`);
      const data = await response.json();
      // console.log(data.products.location);
      setProducts(data.products);

      setIsLoading(false);
      setIsRefreshing(false);
    } catch (error) {
      setIsLoading(false);
      setIsRefreshing(false);
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  useEffect(() => {
    handleFetchProducts();
    // fetchProducts();
  }, []);
  // console.log(products.map((item) => item.userId.username));
  return (
    <SafeAreaView
      className="flex-1 px-6 py-4"
      style={{ backgroundColor: themeColors.background }}
    >
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
          {[...Array(10)].map((_, index) => (
            <View
              key={index}
              style={{
                marginBottom: 20,
                backgroundColor: "#e0e0e0",
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
                shimmerColors={["#f0f0f0", "#e0e0e0", "#f0f0f0"]}
              />
              <View style={{ padding: 10 }}>
                <ShimmerPlaceholder
                  style={{ height: 20, marginBottom: 8, borderRadius: 5 }}
                  shimmerColors={["#f0f0f0", "#e0e0e0", "#f0f0f0"]}
                />
                <ShimmerPlaceholder
                  style={{ height: 16, width: "60%", borderRadius: 5 }}
                  shimmerColors={["#f0f0f0", "#e0e0e0", "#f0f0f0"]}
                />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlashList
          data={products}
          keyExtractor={(item) => item?._id}
          renderItem={({
            item,
          }: {
            item: {
              _id: string;
              title: string;
              images: { url: string; thumbnailUrl: string }[];
              price: number;
              categoryId: string;
              userId: string;
              location: { latitude: number; longitude: number };
              user: string;
            };
          }) => (
            <View className="my-3 relative">
              <Link
                href={{
                  pathname: "/(tabs)/products/[id]",
                  params: {
                    id: item._id,
                    title: item.title,
                    price: item.price,
                    image: item.images[0].url,
                    location: JSON.stringify(item.location),
                    user: JSON.stringify(item.userId),
                  },
                }}
                className="mb-6 my-3 "
                style={{ elevation: 3 }}
              >
                {/* */}
                <Image
                  source={{ uri: item.images[0].url }}
                  style={{
                    width: "100%",
                    height: 200,
                    resizeMode: "cover",
                    borderRadius: 15,
                  }}
                />
                {/* <BlurView
                  intensity={100}
                  style={styles.blurContainer}
                ></BlurView> */}
                <BlurView
                  style={{
                    flex: 1,

                    margin: 0,
                    // textAlign: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                  intensity={10}
                  className="pr-4 absolute bottom-0 left-0 rounded-0  rounded-tl-0 rounded-tr-[30px] "
                >
                  <Text className="text-lg font-bold text-[#333]">
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: themeColors.tint,
                      marginBottom: 5,
                      fontWeight: "bold",
                    }}
                  >
                    <Text>
                      <Entypo
                        name="price-tag"
                        size={20}
                        color={themeColors.tint}
                      />
                    </Text>
                    KES {item.price}
                  </Text>
                </BlurView>
                {/*  */}
              </Link>
            </View>
          )}
          estimatedItemSize={200}
          showsVerticalScrollIndicator={false}
          onRefresh={() => {
            setIsRefreshing(true);
            handleFetchProducts();
            // setIsRefreshing(false);
          }}
          refreshing={isRefreshing} // Required boolean prop
        />
      )}
    </SafeAreaView>
  );
}

export default Index;
