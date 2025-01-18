import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Image,
} from "react-native";
import React, { useContext, useState } from "react";
import Modal from "react-native-modal";
import { Feather, Ionicons } from "@expo/vector-icons"; // Use Ionicons from @expo/vector-icons
import { router } from "expo-router";
import { AuthContext } from "@/contexts/AuthContext";
import { ThemeContext } from "@/contexts/ThemeContext"; // For theme management
import { Colors } from "@/constants/Colors"; // Custom colors based on themes
import { useLocation } from "@/hooks/useLocation";
import { LocationObject } from "@/constants/types";
import { usePushNotificationToken } from "@/hooks/useExpoPushToken";

export default function register() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCOpen, setIsCOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const { location, errorMsg } = useLocation();
  const { pushToken, errorMsg: error } = usePushNotificationToken();

  // Get AuthContext and check if it's defined
  const authContext = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);

  if (!authContext || !themeContext) {
    throw new Error("Contexts not found");
  }

  const { register, isLoading } = authContext;
  const { isDarkMode } = themeContext;

  const LocationObject: LocationObject = {
    latitude: location?.coords.latitude ?? 0,
    longitude: location?.coords.longitude ?? 0,
  };
  // if (error || errorMsg) {
  //   Alert.alert("Error", error ?? errorMsg ?? "Unknown error");
  // }
  if (errorMsg) {
    Alert.alert("Error", errorMsg);
  }

  const handleSubmit = () => {
    Keyboard.dismiss();
    if (!username || !email || !password || !confirmPassword) {
      setModalMessage("All fields are required");
      setIsModalVisible(true);
      return;
    }
    if (password !== confirmPassword) {
      setModalMessage("Password does not match");
      setIsModalVisible(true);
      return;
    }
    const emailTest =
      /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

    if (!emailTest.test(email.trim())) {
      setModalMessage("Invalid email address");
      setIsModalVisible(true);
      return;
    }
    const phoneTest = /^(\+254|0)?(7|1)\d{8}$|^(\+254|0)?20\d{6}$/;
    if (!phoneTest.test(phoneNumber)) {
      setModalMessage(
        "Invalid kenyan phone number, Mobile numbers: Start with 07, 01, or 2547, 2541, followed by 7 digits. Landline numbers: Start with 020 or 25420, followed by 6 digits."
      );
      setIsModalVisible(true);
      return;
    }
    const passwordTest = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordTest.test(password)) {
      setModalMessage(
        "Password must contain at least 8 characters, one Uppercase, one Lowercase, and one Number"
      );
      setIsModalVisible(true);
      return;
    }
    register(
      email,
      username,
      phoneNumber,
      password,
      confirmPassword,
      LocationObject,
      pushToken!
    );
  };

  const handleOpen = () => setIsOpen((prev) => !prev);
  const handleCOpen = () => setIsCOpen((prev) => !prev);

  // Set theme-based colors
  const backgroundColor = isDarkMode
    ? Colors.dark.background
    : Colors.light.background;
  const textColor = isDarkMode ? Colors.dark.text : Colors.light.text;
  const inputBorderColor = isDarkMode ? Colors.dark.tint : Colors.light.tint;
  const iconColor = isDarkMode ? Colors.dark.icon : Colors.light.icon;

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ backgroundColor }}
        className="flex-1 justify-center items-center"
      >
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={{ color: textColor }} className="text-lg mt-4">
          Registering...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ backgroundColor }} className="flex-1">
      <KeyboardAvoidingView
        className="flex justify-center items-center h-screen px-4 space-y-6"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="gap-4">
            <Image
              source={require("../../assets/images/selify.png")}
              style={{
                width: 200,
                height: 100,
                alignSelf: "center",
                resizeMode: "contain",
                // backgroundColor: "red",
                top: 2,
              }}
            />

            {/* Username input with icon */}
            <View
              style={{ borderColor: inputBorderColor }}
              className="border rounded-lg w-full flex flex-row items-center px-4 py-2"
            >
              <Ionicons name="person-outline" size={20} color={iconColor} />
              <TextInput
                onChange={(e) => setUsername(e.nativeEvent.text)}
                className="ml-2 flex-1"
                placeholder="Username..."
                placeholderTextColor={iconColor}
                style={{ color: textColor }}
              />
            </View>

            {/* Email input with icon */}
            <View
              style={{ borderColor: inputBorderColor }}
              className="border rounded-lg w-full flex flex-row items-center px-4 py-2"
            >
              <Ionicons name="mail-outline" size={20} color={iconColor} />
              <TextInput
                onChange={(e) => setEmail(e.nativeEvent.text.trim())}
                className="ml-2 flex-1"
                placeholder="Email..."
                placeholderTextColor={iconColor}
                style={{ color: textColor }}
              />
            </View>
            {/* Phone number input with icon */}
            <View
              style={{ borderColor: inputBorderColor }}
              className="border rounded-lg w-full flex flex-row items-center px-4 py-2"
            >
              <Feather name="phone" size={20} color={iconColor} />
              <TextInput
                keyboardType="phone-pad"
                // maxLength={10}
                onChange={(e) => setPhoneNumber(e.nativeEvent.text)}
                className="ml-2 flex-1"
                placeholder="Phone number eg 07xxxxxxxx..."
                placeholderTextColor={iconColor}
                style={{ color: textColor }}
              />
            </View>

            {/* Password input with icon */}
            <View
              style={{ borderColor: inputBorderColor }}
              className="border rounded-lg w-full flex flex-row items-center px-4 py-2"
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={iconColor}
              />
              <TextInput
                onChange={(e) => setPassword(e.nativeEvent.text)}
                secureTextEntry={!isOpen}
                className="ml-2 flex-1"
                placeholder="Password..."
                placeholderTextColor={iconColor}
                style={{ color: textColor }}
              />
              <TouchableOpacity onPress={handleOpen}>
                <Feather
                  name={isOpen ? "eye" : "eye-off"}
                  size={24}
                  color={iconColor}
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password input with icon */}
            <View
              style={{ borderColor: inputBorderColor }}
              className="border rounded-lg w-full flex flex-row items-center px-4 py-2"
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={iconColor}
              />
              <TextInput
                onChange={(e) => setConfirmPassword(e.nativeEvent.text)}
                secureTextEntry={!isCOpen}
                className="ml-2 flex-1"
                placeholder="Confirm Password..."
                placeholderTextColor={iconColor}
                style={{ color: textColor }}
              />
              <TouchableOpacity onPress={handleCOpen}>
                <Feather
                  name={isCOpen ? "eye" : "eye-off"}
                  size={24}
                  color={iconColor}
                />
              </TouchableOpacity>
            </View>

            {/* Register button */}
            <TouchableOpacity
              className="bg-[#c58343cc] rounded-lg w-full px-4 py-3"
              onPress={handleSubmit}
            >
              <Text className="text-white text-center font-bold">Register</Text>
            </TouchableOpacity>

            {/* Login link below the Register button */}
            <View className="w-full flex flex-row justify-start mt-2">
              <TouchableOpacity
                className="flex flex-row justify-center items-center"
                onPress={() => router.replace("/(auth)/Login")}
              >
                <Text
                  style={{ color: Colors.light.tint }}
                  className="text-lg underline"
                >
                  Already have an account?{" "}
                </Text>
                <Text
                  style={{ color: Colors.light.tint }}
                  className="text-lg font-bold underline  "
                >
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Custom Modal */}
      <Modal isVisible={isModalVisible}>
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "red" }}>
            Error
          </Text>
          <Text style={{ fontSize: 16, marginTop: 10, textAlign: "center" }}>
            {modalMessage}
          </Text>
          <TouchableOpacity
            onPress={() => setIsModalVisible(false)}
            style={{
              backgroundColor: "#c58343cc",
              padding: 10,
              marginTop: 20,
              borderRadius: 5,
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                paddingHorizontal: 20,
              }}
            >
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
