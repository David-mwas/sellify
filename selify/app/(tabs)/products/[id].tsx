import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useContext,
} from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Button,
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

const product = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const title = searchParams.get("title");
  const price = searchParams.get("price");
  const image = searchParams.get("image");
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
    imageUrl: string;
    phoneNumber: string;
    listings: any[];
    messages: any[];
    expoPushToken: string;
    createdAt: Date;
  }

  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const userData: UserData = user ? JSON.parse(user) : null;
  // const bottomSheetRef = useRef<BottomSheetModal>(null);
  const loc = location ? JSON.parse(location) : null;

  const [listings, setListings] = useState();
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

  // console.log("id", userData._id);
  useEffect(() => {
    const fetchUserListings = async () => {
      try {
        const response = await fetch(`${apiUrl}/products/user/${userData._id}`);
        if (response.ok) {
          const data = await response.json();
          setListings(data?.products);
          // console.log("userdata ", data);
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
    if (!locationData) return <Text>Loading location...</Text>;

    const { display_name } = locationData;

    return (
      <View style={styles.locationCard}>
        <View className="flex flex-row w-full ">
          <Ionicons name="location" size={18} color={themeColors.tint} />
          <Text
            className="font-bold text-lg"
            style={{ color: themeColors.tint, marginLeft: 5 }}
          >
            Address
          </Text>
        </View>
        <Text style={styles.locationItem}>{display_name || "N/A"}</Text>
        <Pressable onPress={handlePresentModalPress} style={styles.mapButton}>
          <View className="flex flex-row justify-center items-center text-center gap-2">
            <FontAwesome5 name="map-marked-alt" size={24} color="white" />
            <Text style={styles.mapButton}>View On Map</Text>
          </View>
        </Pressable>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <ParallaxScrollView
          headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
          headerImage={
            <Image source={{ uri: image || "" }} style={styles.image} />
          }
        >
          <View style={styles.container}>
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
                fontSize: 16,
                color: themeColors.tint,
                marginBottom: 5,
              }}
            >
              <Text>
                <Entypo name="price-tag" size={20} color={themeColors.tint} />
              </Text>
              KES {price}
            </Text>

            <TouchableOpacity className="flex flex-row  gap-2 mt-2 mb-2 ml-2">
              {!userData.imageUrl ? (
                <Image
                  source={{ uri: userData.imageUrl || "" }}
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
                  {userData.username.slice(0, 2)}
                </Text>
              )}
              <View className="flex-1">
                <Text className={`font-bold text-[${themeColors.tint}]`}>
                  {userData.username}
                </Text>
                <Text className={`font-semibold text-[${themeColors.tint}]`}>
                  {userData.listings.length || listings?.length} Listings
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
            {/* <View
              className="w-full h-[.3px] mb-2"
              style={{ backgroundColor: themeColors.tint }}
            /> */}
            <TouchableOpacity
              className="w-full p-4 rounded-[30px] mt-6"
              style={{ backgroundColor: themeColors.tint }}
            >
              <Text className="text-white text-center font-semibold uppercase">
                Contact Seller
              </Text>
            </TouchableOpacity>
            {renderLocationDetails()}
          </View>
        </ParallaxScrollView>

        {locationData && (
          <BottomSheetModal
            ref={bottomSheetModalRef}
            onChange={handleSheetChanges}
            snapPoints={["50%", "90%"]}
            style={styles.bottomSheet}
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
    // padding: 15,
    paddingHorizontal: 4,
    paddingTop: 20,
    paddingBottom: 10,
    marginTop: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#c58343cc",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 1,
  },
  locationItem: { fontSize: 16, marginBottom: 5 },
  boldText: { fontWeight: "bold" },
  mapButton: {
    paddingVertical: 6,
    textAlign: "center",
    backgroundColor: "#aaa",
    color: "#fff",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    display: "flex",
    fontWeight: "semibold",
  },
  mapButtonText: { color: "#fff", fontSize: 16 },
  mapContainer: { flex: 1 },
  map: { width: "100%", height: "100%" },
  bottomSheet: {
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.2,
    // shadowRadius: 4,
    // elevation: 1,
  },
});
