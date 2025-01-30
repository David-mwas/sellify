import React, { useState, useContext, useRef, useEffect } from "react";

import {
  Text,
  View,
  Image,
  SafeAreaView,
  StyleSheet,
  Pressable,
  Animated,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import { Link } from "expo-router";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "@/contexts/ThemeContext";
import { Colors } from "@/constants/Colors";
import { apiUrl } from "@/constants/api";
import { BlurView } from "expo-blur";
import { AuthContext } from "@/contexts/AuthContext";
import { useUserContext } from "@/contexts/userContext";
import LottieView from "lottie-react-native";
import NetInfo from "@react-native-community/netinfo";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type Category = {
  name: string;
  _id: string;
  emoji: string;
};

const fetchCategories = async () => {
  const response = await fetch(`${apiUrl}/category`);
  if (!response.ok) throw new Error("Error fetching categories");
  return response.json();
};

type Product = {
  _id: string;
  title: string;
  price: number;
  images: { url: string }[];
  location: string;
  userId: string;
};

function Index() {
  const [selected, setSelected] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);

  const categoryRef = useRef<FlashList<Category> | null>(null);

  const authContext = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);
  const isDarkMode = themeContext?.isDarkMode || false;
  const themeColors = isDarkMode ? Colors.dark : Colors.light;
  const {
    userProfile,
    fetchedUserProfile,
    isLoading: isLoadingUser,
    error: userError,
  } = useUserContext();

  if (!authContext || !themeContext) {
    throw new Error("Contexts not found");
  }

  NetInfo.fetch().then((state) => {
    // console.log("Connection type", state.type);
    // console.log("Is connected?", state.isConnected);
  });

  const fetchProducts = async (): Promise<{ products: Product[] }> => {
    const response = await fetch(`${apiUrl}/products`);
    if (!response.ok) throw new Error("Error fetching products");
    const data = await response.json();
    setProducts(data.products);
    return data;
  };

  const fetchProductsByCategory = async (id: string) => {
    const response = await fetch(`${apiUrl}/products/category/${id}`);
    if (!response.ok) throw new Error("Error fetching products by category");
    const data = await response.json();
    console.log(data.products);
    setProducts(data.products);
    return data.products;
  };

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

  const {
    data: categories,
    isLoading: isLoadingCategories,
    refetch: refetchCategories,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  const {
    data: product,
    isLoading: isLoadingProducts,
    refetch: refetchProducts,
    error: productsError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
  const queryClient = useQueryClient();

  const handleFetchProductsByCategory = async (id: string) => {
    await queryClient.prefetchQuery({
      queryKey: ["products", id],
      queryFn: () => fetchProductsByCategory(id),
    });
    setSelected(id);
  };

  useEffect(() => {
    // Function to handle network change
    interface NetworkState {
      isConnected: boolean | null;
    }

    const handleNetworkChange = (state: NetworkState) => {
      setIsConnected(state.isConnected);
      if (state.isConnected) {
        // Refetch data when online

        console.log("Refetching data as the app is back online");
        fetchedUserProfile(); // Refetch user profile
        refetchProducts(); // Refetch products
        refetchCategories();
      }
    };

    animateShimmer();
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [refetchProducts, queryClient]);

  const renderNetworkStatus = () => {
    if (isConnected === false) {
      return (
        <Text
          style={{
            color: "white",
            backgroundColor: "tomato",
            padding: 10,
            textAlign: "center",
            borderRadius: 15,
          }}
        >
          Please check your internet connection
        </Text>
      );
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Network Status */}
      {renderNetworkStatus()}

      <View className="w-full flex-row items-center justify-between ">
        <Image
          source={require("@/assets/images/selify.png")}
          style={styles.logo}
        />
        {isLoadingUser || userError ? (
          <View className="flex-row items-center">
            {/* Shimmer for Profile Image */}
            <ShimmerPlaceholder
              style={styles.shimmerCircle}
              shimmerColors={["#E0E0E0", "#F0F0F0", "#E0E0E0"]}
            />
          </View>
        ) : (
          <View className="flex-col">
            {userProfile?.imageUrl ? (
              <View>
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
                {isConnected && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: 12,
                      height: 12,
                      backgroundColor: "green",
                      borderRadius: 50,
                      borderWidth: 2,
                      borderColor: "white",
                    }}
                  />
                )}
              </View>
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
        )}
      </View>
      {isLoadingCategories || categoriesError ? (
        <FlashList
          data={Array(5).fill({})}
          horizontal
          estimatedItemSize={50}
          contentContainerStyle={{ padding: 2 }}
          showsHorizontalScrollIndicator={false}
          renderItem={() => (
            <Animated.View
              style={[styles.shimmerContainer, { opacity: shimmerScale }]}
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
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => {
                // fetchedUserProfile();
                refetchProducts();
              }}
              style={{
                marginHorizontal: 2,
                backgroundColor: themeColors.icon,
                borderRadius: 10,
                padding: 10,
              }}
            >
              <Animated.View
                style={{
                  opacity: animatedCategoryOpacity,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 20, textAlign: "center" }}>
                  <Ionicons name="refresh-circle" size={24} color="white" />
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
                  All
                </Text>
              </Animated.View>
            </Pressable>
            <FlashList
              ref={categoryRef}
              contentContainerStyle={{ padding: 2 }}
              showsHorizontalScrollIndicator={false}
              data={categories.categories}
              horizontal
              keyExtractor={(item) => item._id}
              extraData={selected} // Ensure re-render on state change
              renderItem={({ item, index }) => (
                <Pressable
                  onPress={() => {
                    pressed(item._id);
                    handleFetchProductsByCategory(item._id);
                    scrollCategory(index);
                  }}
                  key={item._id}
                  style={{
                    marginHorizontal: 2,
                    backgroundColor:
                      selected === item._id
                        ? themeColors.tint
                        : themeColors.icon,
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
          </View>
        )
      )}

      {isLoadingProducts || productsError ? (
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
        <>
          {products && products?.length === 0 ? (
            <View className="justify-center items-center">
              <LottieView
                autoPlay
                style={{
                  width: 200,
                  height: 200,
                  backgroundColor: "transparent",
                  marginTop: 20,
                }}
                // Find more Lottie files at
                source={require("../../assets/lottie/Animation - 1732533924789.json")}
              />
              <Text
                style={{
                  color: themeColors.text,
                  textAlign: "center",
                  marginTop: 20,
                  fontWeight: "bold",
                  fontSize: 20,
                }}
              >
                No products found!
              </Text>
            </View>
          ) : (
            <FlashList
              // extraData={selected}
              data={products}
              keyExtractor={(item) => item?._id}
              renderItem={({ item }) => (
                <View style={styles.productContainer}>
                  <Link
                    href={{
                      pathname: "/(tabs)/products/[id]",
                      params: {
                        id: item?._id,
                        title: item.title,
                        price: item.price,
                        image: JSON.stringify(item?.images),
                        location: JSON.stringify(item.location),
                        user: JSON.stringify(item?.userId),
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
                          style={[
                            styles.productPrice,
                            { color: themeColors.tint },
                          ]}
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
                setSelected(null);
                refetchProducts();
              }}
              refreshing={isLoadingProducts}
            />
          )}
        </>
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
  shimmerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
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
