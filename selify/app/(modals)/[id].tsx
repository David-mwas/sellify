import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "@/contexts/ThemeContext";
import { Colors } from "@/constants/Colors";
import { apiUrl } from "@/constants/api";
import { AuthContext } from "@/contexts/AuthContext";
interface UserProfile {
  username: string;
  email: string;
  imageUrl: { url: string };
  phoneNumber: string;
}

const ProfilePage = () => {
  const { userdata } = useLocalSearchParams();
  const user: UserProfile = JSON.parse(userdata as string);
  const authContext = useContext(AuthContext);
  const userToken = authContext?.userToken || "";
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
  const [imageUrl, setImageUrl] = useState(user.imageUrl);
  const [isLoading, setIsLoading] = useState(false);

  const themeContext = useContext(ThemeContext); // Access the theme context
  const isDarkMode = themeContext?.isDarkMode || false; // Get current theme
  const themeColors = isDarkMode ? Colors.dark : Colors.light;

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUrl({ url: result.assets[0].uri });
    }
  };

  const formData = new FormData();
  formData.append("username", username);
  formData.append("email", email);
  formData.append("phoneNumber", phoneNumber);

  if (imageUrl) {
    const file = {
      uri: imageUrl,
      type: "image/jpeg",
      name: "profile.jpg",
    };
    formData.append("files", file as any);
  }
  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${apiUrl}/user/edit-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        setIsLoading(false);
        Alert.alert("Profile updated successfully");
      } else {
        setIsLoading(false);
        Alert.alert("Failed to update profile");
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          { flex: 1, alignItems: "center", justifyContent: "center" },
          { backgroundColor: themeColors.background },
        ]}
      >
        <ActivityIndicator size="large" color={themeColors.tint} />
        <Text style={{ color: themeColors.text, fontWeight: "800" }}>
          Loading...
        </Text>
      </View>
    );
  }
  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <Stack.Screen
        options={{
          title: `Hello ${user.username}`,
          headerShown: true,
          headerTitleAlign: "center",
        }}
      />

      {/* Profile Picture Section */}
      <View style={styles.profilePictureContainer}>
        <TouchableOpacity onPress={handleImagePicker}>
          <Image
            source={{
              uri: imageUrl?.url || "https://via.placeholder.com/150",
            }}
            style={styles.profilePicture}
          />
          {!imageUrl?.url ? null : (
            <Ionicons
              name="camera"
              size={32}
              className="absolute bottom-2 right-2"
              color={"gray"}
            />
          )}
        </TouchableOpacity>
        <Text style={[styles.changePhotoText, { color: themeColors.text }]}>
          Change Profile Picture
        </Text>
      </View>

      {/* Editable Fields */}
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: themeColors.text }]}>
            Username
          </Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholderTextColor={themeColors.text}
            placeholder="Enter username"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: themeColors.text }]}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholderTextColor={themeColors.text}
            placeholder="Enter email"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: themeColors.text }]}>
            Phone Number
          </Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            placeholderTextColor={themeColors.text}
            placeholder="Enter phone number"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: themeColors.tint, borderRadius: 40 },
          ]}
          onPress={handleSave}
        >
          <Text style={[styles.saveButtonText, { textTransform: "uppercase" }]}>
            Save Changes
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  profilePictureContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#ccc",
  },
  changePhotoText: {
    marginTop: 10,
    color: "#007BFF",
    fontSize: 16,
  },
  form: {
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "semibold",
  },
});

export default ProfilePage;
