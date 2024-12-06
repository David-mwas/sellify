import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Text,
  View,
  Image,
  SafeAreaView,
  Dimensions,
  StyleSheet,
  Pressable,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import { Link } from "expo-router";
import { Entypo } from "@expo/vector-icons";
import { ThemeContext } from "@/contexts/ThemeContext";
import { Colors } from "@/constants/Colors";
import { apiUrl } from "@/constants/api";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get("window");
type Category = {
  name: string;
  _id: string;
  emoji: string;
};

function Index() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [category, setCategory] = useState<Category[] | null>(null);

  const themeContext = useContext(ThemeContext);
  const isDarkMode = themeContext?.isDarkMode || false;
  const themeColors = isDarkMode ? Colors.dark : Colors.light;

  const categoryRef = useRef<FlashList<Category> | null>(null);

  const scrollCategory = (index: number) => {
    categoryRef.current?.scrollToIndex({ index: index - 2, animated: true });
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${apiUrl}/category`);
      const data = await response.json();
      if (response.ok) {
        setCategory(data?.categories);
      }
      // console.log(data?.categories);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/products`);
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    handleFetchProducts();
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <Image
        source={require("@/assets/images/selify.png")}
        style={styles.logo}
      />

      {category && (
        <FlashList
          ref={categoryRef}
          contentContainerStyle={{ padding: 4 }}
          showsHorizontalScrollIndicator={false}
          data={category}
          horizontal
          estimatedItemSize={19}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => scrollCategory(index)}
              key={item._id}
              style={{
                marginHorizontal: 2,
                backgroundColor: themeColors.icon,
                borderRadius: 10,
                padding: 10,
              }}
            >
              <Text className="text-white">{item.emoji + " " + item.name}</Text>
            </Pressable>
          )}
        />
      )}
      {isLoading ? (
        <View style={{ flex: 1 }}>
          {[...Array(10)].map((_, index) => (
            <View key={index} style={styles.shimmerContainer}>
              <ShimmerPlaceholder
                style={styles.shimmerImage}
                shimmerColors={["#f0f0f0", "#e0e0e0", "#f0f0f0"]}
              />
              <View style={styles.shimmerTextContainer}>
                <ShimmerPlaceholder
                  style={styles.shimmerTitle}
                  shimmerColors={["#f0f0f0", "#e0e0e0", "#f0f0f0"]}
                />
                <ShimmerPlaceholder
                  style={styles.shimmerSubtitle}
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
          renderItem={({ item }) => (
            <View style={styles.productContainer}>
              <Link
                href={{
                  pathname: "/(tabs)/products/[id]",
                  params: {
                    id: item._id,
                    title: item.title,
                    price: item.price,
                    image: JSON.stringify(item.images),
                    location: JSON.stringify(item.location),
                    user: JSON.stringify(item.userId),
                  },
                }}
              >
                <View style={{ flex: 1, width: "100%" }}>
                  <Image
                    source={{ uri: item.images[0].url }}
                    style={styles.productImage}
                    className="object-top"
                  />
                  <BlurView
                    intensity={100}
                    tint="light"
                    style={styles.blurView}
                  >
                    <Text
                      style={[
                        styles.productTitle,
                        { color: Colors.light.text },
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[styles.productPrice, { color: themeColors.tint }]}
                    >
                      <Entypo
                        name="price-tag"
                        size={16}
                        color={themeColors.tint}
                      />{" "}
                      KES {item.price}
                    </Text>
                  </BlurView>
                </View>
              </Link>
            </View>
          )}
          estimatedItemSize={20}
          showsVerticalScrollIndicator={false}
          onRefresh={() => {
            setIsRefreshing(true);
            handleFetchProducts();
          }}
          refreshing={isRefreshing}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  logo: {
    width: 100,
    height: 80,
    resizeMode: "contain",
  },
  shimmerContainer: {
    marginBottom: 20,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
  },
  shimmerImage: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 10,
  },
  shimmerTextContainer: {
    padding: 10,
  },
  shimmerTitle: {
    height: 20,
    marginBottom: 8,
    borderRadius: 5,
  },
  shimmerSubtitle: {
    height: 16,
    width: "60%",
    borderRadius: 5,
  },
  productContainer: {
    marginVertical: 10,
    borderRadius: 15,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 280,
    borderRadius: 15,
    objectFit: "cover",
    resizeMode: "cover",
  },
  blurView: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    paddingHorizontal: 10,
    paddingVertical: 5,
    justifyContent: "center",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: "heavy",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Index;
