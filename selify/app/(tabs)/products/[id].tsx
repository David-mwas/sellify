import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useContext,
  useMemo,
  useLayoutEffect,
} from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Easing } from "react-native-reanimated";
import parsePhoneNumber, {
  parsePhoneNumberFromString,
} from "libphonenumber-js";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { router, Stack } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import ParallaxScrollView from "../../../app-example/components/ParallaxScrollView";

import {
  GestureHandlerRootView,
  Pressable,
  TextInput,
} from "react-native-gesture-handler";
import { Entypo, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "@/contexts/ThemeContext";
import { Colors } from "@/constants/Colors";
import { apiUrl } from "@/constants/api";
import Swiper from "react-native-swiper";
import * as SMS from "expo-sms";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useUserContext } from "@/contexts/userContext";

const product = () => {
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const title = searchParams.get("title");
  const price = searchParams.get("price");

  const images = searchParams.get("image");
  // console.log("images", images);

  const location = searchParams.get("location");
  const user = searchParams.get("user");
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

  const productImage = images ? JSON.parse(images) : [];

  const loc = location ? JSON.parse(location) : null;

  const [listings, setListings] = useState<any[] | null>(null);
  console.log("seller", userData._id);

  const { userProfile } = useUserContext();

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
  const contactModalRef = useRef<BottomSheetModal>(null);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const snapPoints = useMemo(() => ["60%", "90%"], []);

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

  // Handlers for modals
  const handleContactModalPress = useCallback(() => {
    // setIsOpened(true);
    contactModalRef.current?.present();
  }, []);

  useLayoutEffect(() => {
    bottomSheetModalRef.current?.dismiss({ easing: Easing.inOut(Easing.ease) });
    contactModalRef.current?.dismiss({
      easing: Easing.inOut(Easing.elastic()),
    });
  }, [id]);
  const sendSMS = async () => {
    if (!userData?.phoneNumber) {
      Alert.alert("Error", "phone number not available");
      return;
    }
    if (!message) {
      Alert.alert("Error", "SMS Message cannot be empty");
      return;
    }

    // Check if SMS is available on the device
    const isAvailable = await SMS.isAvailableAsync();

    if (isAvailable) {
      // Sending the message
      const { result } = await SMS.sendSMSAsync(
        [userData?.phoneNumber], // Recipient(s)
        message // Message content
      );
      console.log("SMS Result:", result); // 'sent' or 'cancelled'
    } else {
      Alert.alert("SMS Not Available", "This device cannot send SMS.");
    }
  };

  const makeCall = () => {
    // Alert.alert(`Call Seller`, `Phone: ${userData.phoneNumber}`);
    if (userData?.phoneNumber) {
      const url = `tel:${userData?.phoneNumber}`;
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            Linking.openURL(url);
          } else {
            Alert.alert("Error", "Phone call not supported on this device");
          }
        })
        .catch((err) => console.error("Error opening URL:", err));
    } else {
      Alert.alert("Error", "Invalid phone number");
    }
  };
  const phoneNumberWithoutCountryCode = userData?.phoneNumber; // Example phone number

  const getFormattedPhoneNumber = (phoneNumber: string) => {
    const phoneNumberWithCountryCode = parsePhoneNumberFromString(
      phoneNumber,
      "KE"
    ); // KE is Kenya's country code
    if (phoneNumberWithCountryCode) {
      return phoneNumberWithCountryCode.format("E.164"); // Formats the number with the country code, e.g., +254790309409
    }
    return null;
  };

  const handleSendWhatsApp = () => {
    if (!message) {
      Alert.alert("Error", "Message cannot be empty");
      return;
    }
    const phoneNumber = getFormattedPhoneNumber(phoneNumberWithoutCountryCode);
    if (phoneNumber) {
      const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(
        message
      )}`;

      // Open WhatsApp with the formatted phone number
      Linking.openURL(url).catch(() => {
        Alert.alert("Error", "Could not open WhatsApp.");
      });
    } else {
      Alert.alert(
        "Invalid phone number",
        "The phone number could not be formatted."
      );
    }
  };
  return (
    <GestureHandlerRootView
      style={[{ flex: 1 }, { backgroundColor: themeColors.background }]}
    >
      <BottomSheetModalProvider>
        <ParallaxScrollView
          headerBackgroundColor={{ dark: "#eee", light: "#333" }}
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
            {userData?._id === userProfile?._id ? (
              <Pressable
                onPress={() => router.navigate("/(modals)/messagelist")}
                style={{
                  backgroundColor: themeColors.tint,
                  borderRadius: 30,
                  padding: 14,
                  marginTop: 10,
                }}
              >
                <Text className="text-white text-center font-semibold uppercase">
                  View your messages
                </Text>
              </Pressable>
            ) : (
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
                  Contact Seller {userData?.username}
                </Text>
              </Pressable>
            )}
            {renderLocationDetails()}
          </View>
        </ParallaxScrollView>

        <BottomSheetModal
          ref={contactModalRef}
          onChange={handleSheetChanges}
          containerStyle={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          backgroundStyle={{ backgroundColor: themeColors.background }}
          snapPoints={snapPoints}
        >
          <KeyboardAwareScrollView
            style={{ backgroundColor: themeColors.background }}
            scrollEnabled={true}
          >
            <BottomSheetView
              style={{
                backgroundColor: "#a1a1a1",
                padding: 20,
                borderRadius: 10,
              }}
            >
              <View style={{ padding: 20 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    marginBottom: 15,
                    color: "#333",
                  }}
                >
                  Contact Seller {userData?.username}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    router.navigate({
                      pathname: `/(modals)/message`,
                      params: { sellerId: userData._id },
                    });
                  }}
                  style={[
                    styles.contactOption,
                    { backgroundColor: themeColors.cardBg, marginBottom: 40 },
                  ]}
                >
                  <Ionicons
                    name="chatbox"
                    size={24}
                    color={themeColors.tint}
                    style={{ marginRight: 10 }}
                  />
                  <Text style={{ color: themeColors.text, flex: 1 }}>
                    Message seller(DM)
                  </Text>
                  <View
                    style={{
                      alignSelf: "flex-end",
                    }}
                  >
                    <Entypo
                      name="chevron-right"
                      size={24}
                      color={themeColors.text}
                    />
                  </View>
                </TouchableOpacity>

                {/* Message Seller Option */}
                <TextInput
                  // value={message}
                  onChange={(e) => setMessage(e.nativeEvent.text)}
                  placeholder="Type your whatsapp message or SMS here..."
                  style={{
                    backgroundColor: "#f2f2f2",
                    padding: 10,
                    borderRadius: 8,
                    marginBottom: 10,
                    color: themeColors.icon,
                  }}
                />
                <View className="flex-row">
                  <TouchableOpacity
                    onPress={() => handleSendWhatsApp()}
                    style={[
                      styles.contactOption,
                      { backgroundColor: themeColors.cardBg, flex: 1 },
                    ]}
                  >
                    <FontAwesome5
                      name="whatsapp"
                      size={24}
                      color={themeColors.tint}
                      style={{ marginRight: 10 }}
                    />
                    <Text style={{ color: themeColors.text }}>WhatsApp</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => sendSMS()}
                    style={[
                      styles.contactOption,
                      {
                        backgroundColor: themeColors.cardBg,
                        flex: 1,
                        marginLeft: 10,
                      },
                    ]}
                  >
                    <FontAwesome5
                      name="sms"
                      size={24}
                      color={themeColors.tint}
                      style={{ marginRight: 10 }}
                    />
                    <Text style={{ color: themeColors.text }}>Send SMS</Text>
                  </TouchableOpacity>
                </View>

                {/* Call Seller Option */}
                <TouchableOpacity
                  onPress={() => {
                    makeCall();
                  }}
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
                  <Text style={{ color: themeColors.text }}>
                    Call : {userData.phoneNumber}
                  </Text>
                </TouchableOpacity>
              </View>
            </BottomSheetView>
          </KeyboardAwareScrollView>
        </BottomSheetModal>

        {locationData && (
          <BottomSheetModal
            ref={bottomSheetModalRef}
            onChange={handleSheetChanges}
            containerStyle={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            backgroundStyle={{ backgroundColor: themeColors.background }}
            snapPoints={snapPoints}
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
    height: 300, // Define the height for consistent display
    resizeMode: "cover", // Ensure images maintain aspect ratio
  },
  imagePlaceholder: {
    width: "100%",
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  contactOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
