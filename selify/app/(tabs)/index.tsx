import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Text,
  View,
  Image,
  SafeAreaView,
  Dimensions,
  StyleSheet,
  Pressable,
  Animated,
  FlatList,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import { Link } from "expo-router";
import { Entypo } from "@expo/vector-icons";
import { ThemeContext } from "@/contexts/ThemeContext";
import { Colors } from "@/constants/Colors";
import { apiUrl } from "@/constants/api";
import { BlurView } from "expo-blur";
import { AuthContext } from "@/contexts/AuthContext";
import { UserProfile } from "./account";

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
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile>();

  const categoryRef = useRef<FlashList<Category> | null>(null);

  const authContext = useContext(AuthContext);

  const themeContext = useContext(ThemeContext);
  const isDarkMode = themeContext?.isDarkMode || false;
  const themeColors = isDarkMode ? Colors.dark : Colors.light;

  if (!authContext || !themeContext) {
    throw new Error("Contexts not found");
  }

  const { userToken } = authContext;

  const animatedCategoryOpacity = useRef(new Animated.Value(1)).current;
  const shimmerScale = useRef(new Animated.Value(1)).current;

  const scrollCategory = (index: number) => {
    categoryRef.current?.scrollToIndex({
      index: index < 1 ? 0 : index - 1,
      animated: true,
    });
  };

  const pressed = (id: string) => {
    setSelected(id);

    // Animate category selection
    Animated.sequence([
      Animated.timing(animatedCategoryOpacity, {
        toValue: 0.7,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animatedCategoryOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateShimmer = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerScale, {
          toValue: 1.08,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerScale, {
          toValue: 0.9,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const fetchData = async () => {
    setIsLoading(true);
    setIsLoadingCategories(true);
    setIsUserLoading(true);

    try {
      const [userProfileResponse, categoriesResponse, productsResponse] =
        await Promise.all([
          fetch(`${apiUrl}/user/profile`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }),
          fetch(`${apiUrl}/category`),
          fetch(`${apiUrl}/products`),
        ]);

      if (userProfileResponse.ok) {
        const userData = await userProfileResponse.json();
        setUserProfile(userData.userProfile);
      }

      if (categoriesResponse.ok) {
        const categoryData = await categoriesResponse.json();
        setCategories(categoryData.categories);
      }

      if (productsResponse.ok) {
        const productData = await productsResponse.json();
        setProducts(productData.products);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingCategories(false);
      setIsUserLoading(false);
    }
  };

  const handleFetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${apiUrl}/products`);
      if (response.ok) {
        setIsLoading(false);
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    animateShimmer();
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View className="w-full flex-row items-center justify-between ">
        <Image
          source={require("@/assets/images/selify.png")}
          style={styles.logo}
        />
        <View className="flex-col">
          {userProfile?.imageUrl ? (
            <Image
              source={{ uri: userProfile?.imageUrl?.url }}
              className="w-[3rem] h-[3rem] object-contain rounded-full mr-2"
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                shadowColor: themeColors.tint,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                borderColor: themeColors.tint,
                borderWidth: 1,
              }}
            />
          ) : (
            <Text
              className="p-4 rounded-full items-center flex justify-center text-center text-white font-extrabold  mr-2 w-[50px] h-[50px]"
              style={{
                color: "#eee",
                backgroundColor: "#999",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              {userProfile?.username.slice(0, 2)}
            </Text>
          )}
        </View>
      </View>
      {isLoadingCategories ? (
        <FlashList
          data={Array(5).fill({})}
          horizontal
          estimatedItemSize={50}
          contentContainerStyle={{ padding: 2 }}
          showsHorizontalScrollIndicator={false}
          renderItem={() => (
            <Animated.View
              style={[
                styles.shimmerContainer,
                { transform: [{ scale: shimmerScale }] },
              ]}
            >
              <ShimmerPlaceholder
                shimmerColors={["#f0f0f0", "#e0e0e0", "#f0f0f0"]}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                }}
              />
              <ShimmerPlaceholder
                shimmerColors={["#f0f0f0", "#e0e0e0", "#f0f0f0"]}
                style={{
                  height: 12,
                  width: 60,
                  borderRadius: 5,
                }}
              />
            </Animated.View>
          )}
        />
      ) : (
        categories && (
          <FlashList
            ref={categoryRef}
            contentContainerStyle={{ padding: 2 }}
            showsHorizontalScrollIndicator={false}
            data={categories}
            horizontal
            keyExtractor={(item) => item._id}
            extraData={selected} // Ensure re-render on state change
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => {
                  pressed(item._id);
                  scrollCategory(index);
                }}
                key={item._id}
                style={{
                  marginHorizontal: 2,
                  backgroundColor:
                    selected === item._id ? themeColors.tint : themeColors.icon,
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <Animated.View
                  style={{
                    opacity:
                      selected === item._id ? animatedCategoryOpacity : 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 20, textAlign: "center" }}>
                    {item.emoji}
                  </Text>
                  <Text 
                    style={{
                      fontSize: 16,
                      textTransform: "capitalize",
                      color: "white",
                      marginLeft: 8,
                      textAlign: "center",
                    }}
                  >
                    {item.name}
                  </Text>
                </Animated.View>
              </Pressable>
            )}
          />
        )
      )}

      {isLoading ? (
        <View style={styles.productsContainer}>
          {[...Array(10)].map((_, index) => (
            <View key={index} style={styles.productShimmer}>
              <ShimmerPlaceholder
                style={styles.shimmerImage}
                shimmerColors={["#cccccc", "#dddddd", "#cccccc"]}
              />
              <View style={styles.shimmerTextContainer}>
                <ShimmerPlaceholder
                  style={styles.shimmerTitle}
                  shimmerColors={["#cccccc", "#dddddd", "#cccccc"]}
                />
                <ShimmerPlaceholder
                  style={styles.shimmerSubtitle}
                  shimmerColors={["#cccccc", "#dddddd", "#cccccc"]}
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
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 2,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    padding: 10,
    width: 120,
    justifyContent: "space-between",
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
  productsContainer: { flex: 1, marginTop: 10 },
  productShimmer: { marginBottom: 20, borderRadius: 10, overflow: "hidden" },
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
    fontWeight: "bold",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },

  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  profileEmail: {
    fontSize: 14,
    color: "gray",
  },
});

export default Index;
