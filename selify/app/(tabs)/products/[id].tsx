import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useContext,
  useMemo,
} from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Button,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import ParallaxScrollView from "../../../app-example/components/ParallaxScrollView";

import {
  GestureHandlerRootView,
  Pressable,
} from "react-native-gesture-handler";
import { Entypo, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "@/contexts/ThemeContext";
import { Colors } from "@/constants/Colors";
import { apiUrl } from "@/constants/api";
import Swiper from "react-native-swiper";

const product = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const title = searchParams.get("title");
  const price = searchParams.get("price");

  const images = searchParams.get("image");
  // console.log("images", images);

  const location = searchParams.get("location");
  const user = searchParams.get("user");
  console.log("user", user);
  const themeContext = useContext(ThemeContext); // Access the theme context
  const isDarkMode = themeContext?.isDarkMode || false; // Get current theme
  const themeColors = isDarkMode ? Colors.dark : Colors.light;

  interface LocationData {
    lat: string;
    lon: string;
    display_name: string;
    name?: string;
  }
  interface UserData {
    location: Location;
    _id: string;
    username: string;
    email: string;
    imageUrl: {
      url: string;
    };
    phoneNumber: string;
    listings: any[] | [];
    messages: any[];
    expoPushToken: string;
    createdAt: Date;
  }
  interface Image {
    url: string;
  }

  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const userData: UserData = user
    ? JSON.parse(user)
    : ({ listings: [] } as UserData);
  console.log("userData", userData);
  const productImage = images ? JSON.parse(images) : [];
  console.log("images", productImage);
  // const bottomSheetRef = useRef<BottomSheetModal>(null);
  const loc = location ? JSON.parse(location) : null;

  const [listings, setListings] = useState<any[] | null>(null);
  // console.log(loc.latitude, loc.longitude);
  useEffect(() => {
    const fetchLocation = async () => {
      const headersList = {
        Accept: "*/*",
        "Content-Type": "application/json",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
      };

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${loc.latitude}&lon=${loc.longitude}&format=json`,
          { method: "GET", headers: headersList }
        );
        const data = await res.json();
        setLocationData(data);
      } catch (error) {
        console.log("Error " + error);
      }
    };
    fetchLocation();
  }, []);

  useEffect(() => {
    const fetchUserListings = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/products/user/${userData?._id}`
        );
        if (response.ok) {
          const data = await response.json();
          setListings(data?.products);
        }
      } catch (error) {
        console.error("Error", error);
      }
    };
    fetchUserListings();
  }, [userData?._id]);

  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const renderLocationDetails = () => {
    if (!locationData)
      return (
        <Text style={{ color: themeColors.text, fontWeight: "600" }}>
          Loading location...
        </Text>
      );

    const { display_name } = locationData;

    return (
      <View
        style={[
          styles.locationCard,
          {
            backgroundColor: themeColors.cardBg,
          },
        ]}
      >
        <View className="flex flex-row w-full ">
          <Ionicons name="location" size={18} color={themeColors.tint} />
          <Text
            className="font-bold text-lg"
            style={{ color: themeColors.tint, marginLeft: 5 }}
          >
            Address
          </Text>
        </View>
        <Text style={[styles.locationItem, { color: themeColors.text }]}>
          {display_name || "N/A"}
        </Text>
        <Pressable
          onPress={handlePresentModalPress}
          style={[styles.mapButton, { backgroundColor: themeColors.icon }]}
        >
          <View className="flex flex-row justify-center items-center text-center gap-2">
            <FontAwesome5 name="map-marked-alt" size={24} color="white" />
            <Text style={styles.mapButton}>View On Map</Text>
          </View>
        </Pressable>
      </View>
    );
  };

  const renderImageSwiper = () => {
    const imagess = productImage;

    if (!images || images?.length === 0) {
      return (
        <View style={styles.imagePlaceholder}>
          <Text style={{ color: themeColors.text }}>No images available</Text>
        </View>
      );
    }

    return (
      <Swiper
        style={styles.swiper}
        nextButton={
          <Text style={{ color: themeColors.tint }}>
            <Ionicons
              name="chevron-forward"
              size={28}
              color={themeColors.tint}
            />
          </Text>
        }
        prevButton={
          <Text style={{ color: themeColors.tint }}>
            <Ionicons name="chevron-back" size={28} color={themeColors.tint} />
          </Text>
        }
        bounces
        bouncesZoom
        showsButtons
        autoplay={true}
        autoplayTimeout={5}
        loop
        dotColor={themeColors.text}
        dot={
          <View
            style={{
              backgroundColor: Colors.light.icon,
              width: 10,
              height: 10,
              borderRadius: "50%",
              margin: 3,
            }}
          />
        }
        activeDot={
          <View
            style={{
              backgroundColor: themeColors.tint,
              width: 10,
              height: 10,
              borderRadius: "50%",
              margin: 3,
            }}
          />
        }
        activeDotColor={themeColors.tint}
      >
        {imagess?.length > 0 ? (
          imagess?.map((img: Image, index: string) => (
            <View key={index} style={styles.slide}>
              <Image source={{ uri: img?.url || "" }} style={styles.images} />
            </View>
          ))
        ) : (
          <Text>No images</Text>
        )}
      </Swiper>
    );
  };

  // Memoize snap points for performance
  const snapPoints = useMemo(() => ["25%", "50%"], []);

  const contactModalRef = useRef<BottomSheetModal>(null);

  // Handlers for modals
  const handleContactModalPress = useCallback(() => {
    contactModalRef.current?.present();
  }, []);
  return (
    <GestureHandlerRootView
      style={[{ flex: 1 }, { backgroundColor: themeColors.background }]}
    >
      <BottomSheetModalProvider>
        <ParallaxScrollView
          headerBackgroundColor={{ dark: "red", light: "red" }}
          headerImage={renderImageSwiper()}
        >
          <View
            style={[
              styles.container,
              { backgroundColor: themeColors.background },
            ]}
          >
            <Stack.Screen
              options={{
                title: id ? id.toString() : "Default Title",
                headerShown: false,
                headerTitleAlign: "center",
              }}
            />
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 5,
                color: themeColors.text,
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                fontSize: 18,
                color: themeColors.tint,
                marginBottom: 5,
              }}
            >
              <Text>
                <Entypo name="price-tag" size={20} color={themeColors.tint} />
              </Text>
              KES {price}
            </Text>
            <Text style={{ color: themeColors.icon, marginLeft: 2 }}>
              Posted by
            </Text>
            <TouchableOpacity className="flex flex-row  gap-2 mt-2 mb-2 ml-4">
              {userData?.imageUrl?.url ? (
                <Image
                  source={{ uri: userData.imageUrl?.url || "" }}
                  className="w-[3rem] h-[3rem] object-contain rounded-full"
                />
              ) : (
                <Text
                  className="p-4 rounded-full items-center flex justify-center text-center text-white font-extrabold"
                  style={{
                    color: "#eee",
                    backgroundColor: "#999",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  {userData?.username?.slice(0, 2) || "U1"}
                </Text>
              )}

              <View className="flex-1">
                <Text style={{ fontWeight: "800", color: themeColors.text }}>
                  {userData?.username}
                </Text>
                <Text style={{ fontWeight: "500", color: themeColors.text }}>
                  {userData?.listings?.length || listings?.length} Listings
                </Text>
              </View>
              <View className="self-center">
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={themeColors.tint}
                  className="ml-auto"
                />
              </View>
            </TouchableOpacity>
            <Pressable
              onPress={() => handleContactModalPress()}
              style={{
                backgroundColor: themeColors.tint,
                borderRadius: 30,
                padding: 14,
                marginTop: 10,
              }}
            >
              <Text className="text-white text-center font-semibold uppercase">
                Contact Seller
              </Text>
            </Pressable>
            {renderLocationDetails()}
          </View>
        </ParallaxScrollView>
        <BottomSheetModal
          ref={contactModalRef}
          onChange={handleSheetChanges}
          snapPoints={["50%", "90%"]}
         
        >
          <BottomSheetView  style={{
            backgroundColor: "#f1f1f1",
            padding: 20,
            borderRadius: 10,
          }}>
            <View style={{ padding: 20 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 15,
                  color:"#333",
                }}
              >
                Contact Seller
              </Text>

              {/* Message Seller Option */}
              <TouchableOpacity
                onPress={() => Alert.alert("Message Seller")}
                style={[
                  styles.contactOption,
                  { backgroundColor: themeColors.cardBg },
                ]}
              >
                <Ionicons
                  name="chatbubbles"
                  size={24}
                  color={themeColors.tint}
                  style={{ marginRight: 10 }}
                />
                <Text style={{ color: themeColors.text }}>Message</Text>
              </TouchableOpacity>

              {/* Call Seller Option */}
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(`Call Seller`, `Phone: ${userData.phoneNumber}`)
                }
                style={[
                  styles.contactOption,
                  { backgroundColor: themeColors.cardBg },
                ]}
              >
                <Ionicons
                  name="call"
                  size={24}
                  color={themeColors.tint}
                  style={{ marginRight: 10 }}
                />
                <Text style={{ color: themeColors.text }}>Call</Text>
              </TouchableOpacity>
            </View>
          </BottomSheetView>
        </BottomSheetModal>

        {locationData && (
          <BottomSheetModal
            ref={bottomSheetModalRef}
            onChange={handleSheetChanges}
            snapPoints={["50%", "90%"]}
          >
            <BottomSheetView style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: parseFloat(locationData.lat),
                  longitude: parseFloat(locationData.lon),
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: parseFloat(locationData.lat),
                    longitude: parseFloat(locationData.lon),
                  }}
                  title={locationData.name || "Location"}
                  description={locationData.display_name}
                />
              </MapView>
            </BottomSheetView>
          </BottomSheetModal>
        )}
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

export default product;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 5, gap: 10 },
  image: { width: "100%", height: 300, marginBottom: 5 },

  locationCard: {
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 15,
    marginTop: 15,
    borderRadius: 8,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  locationItem: { fontSize: 16, marginBottom: 5 },
  boldText: { fontWeight: "bold" },
  mapButton: {
    paddingVertical: 6,
    textAlign: "center",
    color: "#fff",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    display: "flex",
    fontWeight: "semibold",
    marginTop: 10,
  },
  mapButtonText: { color: "#fff", fontSize: 16 },
  mapContainer: { flex: 1 },
  map: { width: "100%", height: "100%" },

  swiper: {
    height: 300, // Adjust to your preferred height
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  images: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "tomato", // Placeholder background
  },
  contactButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  contactOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
});
