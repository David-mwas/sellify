import React, { useContext } from "react";
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

function Account() {
  const authContext = useContext(AuthContext);
  const isDarkModeContext = useContext(ThemeContext);

  if (!authContext || !isDarkModeContext) {
    throw new Error("Contexts not found");
  }

  const { logout } = authContext;
  const { isDarkMode, toggleTheme } = isDarkModeContext;

  const [isNotificationsEnabled, setIsNotificationsEnabled] =
    React.useState(true);
  const [language, setLanguage] = React.useState("English");

  const toggleNotifications = () =>
    setIsNotificationsEnabled((previousState) => !previousState);

  const handleLanguageChange = () => {
    // Toggle between languages (example)
    setLanguage((prev) => (prev === "English" ? "Spanish" : "English"));
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.dark : styles.light]}>
      {/* User Profile */}
      <View style={styles.profileContainer}>
        <Image
          source={{
            uri: "https://via.placeholder.com/150",
          }}
          style={styles.profileImage}
        />
        <View style={styles.profileDetails}>
          <Text style={styles.profileName}>John Doe</Text>
          <Text style={styles.profileEmail}>john.doe@example.com</Text>
        </View>
      </View>

      {/* Settings Options */}
      <TouchableOpacity style={styles.row}>
        <Ionicons name="list-circle-outline" size={24} color="gray" />
        <Text style={styles.rowText}>My Listings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row}>
        <Ionicons name="chatbubble-ellipses-outline" size={24} color="gray" />
        <Text style={styles.rowText}>My Messages</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <Ionicons name="notifications-outline" size={24} color="gray" />
        <Text style={styles.rowText}>Notifications</Text>
        <Switch
          value={isNotificationsEnabled}
          onValueChange={toggleNotifications}
        />
      </View>

      <View style={styles.row}>
        <Ionicons
          name={isDarkMode ? "moon-outline" : "sunny-outline"}
          size={24}
          color="gray"
        />
        <Text style={styles.rowText}>Theme</Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>

      <TouchableOpacity style={styles.row} onPress={handleLanguageChange}>
        <Ionicons name="language-outline" size={24} color="gray" />
        <Text style={styles.rowText}>Language</Text>
        <Text style={styles.rowTextSmall}>{language}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row}>
        <Ionicons name="help-circle-outline" size={24} color="gray" />
        <Text style={styles.rowText}>Help</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.row, styles.logout]} onPress={logout}>
        <Ionicons name="log-out-outline" size={24} color="red" />
        <Text style={[styles.rowText, { color: "red" }]}>Logout</Text>
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
    color: "#333",
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
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
});

export default Account;
