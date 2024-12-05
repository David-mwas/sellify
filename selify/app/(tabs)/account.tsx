import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Switch,
} from "react-native";

import { AuthContext } from "../../contexts/AuthContext";
import { ThemeContext } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { apiUrl } from "@/constants/api";
import { Link } from "expo-router";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import { Colors } from "@/constants/Colors";

export interface UserProfile {
  location: Location;
  _id: string;
  username: string;
  email: string;
  imageUrl: { url: string };
  phoneNumber: string;
  listings: any[];
  messages: any[];
  expoPushToken: string;
}

function Account() {
  const [isLoading, setIsLoading] = useState(true);

  const authContext = useContext(AuthContext);

  const [userProfile, setUserProfile] = useState<UserProfile>();

  const themeContext = useContext(ThemeContext); // Access the theme context
  const isDarkMode = themeContext?.isDarkMode || false; // Get current theme
  const themeColors = isDarkMode ? Colors.dark : Colors.light;

  if (!authContext || !themeContext) {
    throw new Error("Contexts not found");
  }

  const { logout, userToken } = authContext;

  const [isNotificationsEnabled, setIsNotificationsEnabled] =
    React.useState(true);
  const [language, setLanguage] = useState("English");

  useLayoutEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${apiUrl}/user/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
        if (response.ok) {
          setIsLoading(false);
          const data = await response.json();
          setUserProfile(data?.userProfile);
          // console.log("userdata ", data);
        }
      } catch (error) {
        setIsLoading(false);
        console.error("Error", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProfile();
  }, [userToken]);

  const toggleNotifications = () =>
    setIsNotificationsEnabled((previousState) => !previousState);

  const handleLanguageChange = () => {
    // Toggle between languages (example)
    setLanguage((prev) => (prev === "English" ? "Spanish" : "English"));
  };
  console.log("userProfile", userProfile?.imageUrl.url);
  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* User Profile */}
      <Link
        className="flex items-center mb-6  object-contain rounded-full"
        href={{
          pathname: "/(modals)/user",
          params: {
            // id: userProfile?._id!,
            userdata: JSON.stringify(userProfile),

            // title: item.title,
            // price: item.price,
            // image: item.images[0].url,
            // location: JSON.stringify(item.location),
            // user: JSON.stringify(item.userId),
          },
        }}
        style={styles.profileContainer}
      >
        <View>
          {userProfile?.imageUrl ? (
            <Image
              source={{ uri: userProfile?.imageUrl?.url }}
              className="w-[3rem] h-[3rem] object-contain rounded-full mr-2"
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
        <View style={styles.profileDetails}>
          {isLoading ? (
            <ShimmerPlaceholder
              style={{ width: 100, height: 20 }}
              shimmerColors={["#333", "#999", "#333"]}
            />
          ) : (
            <Text style={[styles.profileName, { color: themeColors.text }]}>
              {userProfile?.username}
            </Text>
          )}
          {isLoading ? (
            <ShimmerPlaceholder
              style={{ width: 150, height: 20, marginTop: 4 }}
              shimmerColors={["#333", "#999", "#333"]}
            />
          ) : (
            <Text style={[styles.profileEmail, { color: themeColors.text }]}>
              {userProfile?.email}
            </Text>
          )}
        </View>
      </Link>

      {/* Settings Options */}
      <TouchableOpacity style={styles.row}>
        <Ionicons
          name="list-circle-outline"
          size={24}
          color={themeColors.text}
        />
        <Text style={[styles.rowText, { color: themeColors.text }]}>
          My Listings
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.row]}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={24}
          color={themeColors.text}
        />
        <Text style={[styles.rowText, { color: themeColors.text }]}>
          My Messages
        </Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <Ionicons
          name="notifications-outline"
          size={24}
          color={themeColors.text}
        />
        <Text style={[styles.rowText, { color: themeColors.text }]}>
          Notifications
        </Text>
        <Switch
          value={isNotificationsEnabled}
          onValueChange={toggleNotifications}
        />
      </View>

      <View style={styles.row}>
        <Ionicons
          name={isDarkMode ? "moon-outline" : "sunny-outline"}
          size={24}
          color={themeColors.text}
        />
        <Text style={[styles.rowText, { color: themeColors.text }]}>Theme</Text>
        <Switch
          value={isDarkMode}
          onValueChange={themeContext?.toggleTheme}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>

      <TouchableOpacity style={styles.row} onPress={handleLanguageChange}>
        <Ionicons name="language-outline" size={24} color={themeColors.text} />
        <Text style={[styles.rowText, { color: themeColors.text }]}>
          Language
        </Text>
        <Text style={[styles.rowTextSmall, { color: themeColors.text }]}>
          {language}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row}>
        <Ionicons
          name="help-circle-outline"
          size={24}
          color={themeColors.text}
        />
        <Text style={[styles.rowText, { color: themeColors.text }]}>Help</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.logout,
          {
            backgroundColor: "tomato",
            alignItems: "center",
            justifyContent: "center",
            padding: 12,
            borderRadius: 40,
            flexDirection: "row",
          },
        ]}
        onPress={logout}
      >
        <Text style={{ textAlign: "center" }}>
          <Ionicons
            name="log-out-outline"
            size={24}
            color={"white"}
            style={{ textAlign: "center" }}
          />
        </Text>
        <Text
          style={[
            {
              color: "white",
              textTransform: "uppercase",
              fontWeight: "800",
              textAlign: "center",
              marginLeft: 12,
            },
          ]}
        >
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  dark: {
    backgroundColor: "#121212",
  },
  light: {
    backgroundColor: "#FFFFFF",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  rowText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
    color: "#333",
  },
  rowTextSmall: {
    fontSize: 14,
    color: "gray",
  },
  logout: {
    marginTop: 30,

    paddingTop: 8,
  },
});

export default Account;
