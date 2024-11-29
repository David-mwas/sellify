import { apiUrl } from "@/constants/api";
import { Colors } from "@/constants/Colors";
import { ThemeContext } from "@/contexts/ThemeContext";
import { Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  Keyboard,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { KeyboardAvoidingView } from "react-native";
import { TextInput } from "react-native";
import { Text, View } from "react-native";
import { SelectList } from "react-native-dropdown-select-list";

function Add() {
  const navigation = useNavigation(); // Ensure this is called directly in the component
  const isFocused = useIsFocused();

  const [selected, setSelected] = useState("");
  const [categories, setCategories] = useState<
    { key: string; value: string }[]
  >([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const themeContext = useContext(ThemeContext); // Access the theme context
  const isDarkMode = themeContext?.isDarkMode || false; // Get current theme
  const themeColors = isDarkMode ? Colors.dark : Colors.light;

  // Set theme-based colors
  const backgroundColor = isDarkMode
    ? Colors.dark.background
    : Colors.light.background;
  const textColor = isDarkMode ? Colors.dark.text : Colors.light.text;
  const inputBorderColor = isDarkMode ? Colors.dark.tint : Colors.light.tint;
  const iconColor = isDarkMode ? Colors.dark.icon : Colors.light.icon;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${apiUrl}/category`);
        const data = await response.json();
        let newArray = data.categories.map((item: any) => ({
          key: item._id,
          value: `${item.emoji} ${item.name}`,
        }));
        setCategories(newArray);
      } catch (error) {
        console.error(error);
      }
    };
    // fetchCategories();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (isFocused) {
      navigation.setOptions({
        tabBarStyle: {
          display: keyboardVisible ? "none" : "flex",
        },
      });
    }
  }, [keyboardVisible, isFocused]);

  return (
    <SafeAreaView className="flex-1">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View className="px-4 py-4 gap-4">
            <Text
              className="text-xl font-extrabold uppercase mb-4"
              style={{ color: themeColors.tint }}
            >
              Post A Product
            </Text>
            <Text
              className="text-md font-semibold"
              style={{ color: themeColors.text }}
            >
              Upload upto 3 images
            </Text>
            <View className="w-[120px] h-[100px] rounded-md bg-gray-400 justify-center items-center">
              <Ionicons name="camera" size={24} color="#eee" />
            </View>
            <View
              style={{ borderColor: inputBorderColor }}
              className="border rounded-lg w-full flex flex-row items-center px-4 py-2"
            >
              <MaterialIcons
                name="drive-file-rename-outline"
                size={20}
                color={iconColor}
              />
              <TextInput
                className="ml-2 flex-1"
                placeholder="Email..."
                placeholderTextColor={iconColor}
                style={{ color: textColor }}
              />
            </View>
            <View
              style={{ borderColor: inputBorderColor }}
              className="border rounded-lg flex flex-row items-center px-4 py-2 w-52"
            >
              <Entypo name="price-tag" size={20} color={iconColor} />
              <TextInput
                className="ml-2 flex-1"
                placeholder="price..."
                keyboardType="numeric"
                placeholderTextColor={iconColor}
                style={{ color: textColor }}
              />
            </View>
            <SelectList
              dropdownStyles={{
                borderColor: themeColors.tint,
              }}
              dropdownTextStyles={{
                color: themeColors.text,
                fontWeight: "semibold",
                textTransform: "capitalize",
              }}
              boxStyles={{
                borderColor: themeColors.tint,
              }}
              setSelected={(val: string) => setSelected(val)}
              data={categories}
              save="value"
            />
            <View
              style={{ borderColor: inputBorderColor }}
              className="border rounded-lg flex flex-row items-center px-4 py-2"
            >
              <MaterialIcons name="description" size={20} color={iconColor} />
              <TextInput
                className="ml-2 flex-1"
                placeholder="description..."
                placeholderTextColor={iconColor}
                style={{ color: textColor }}
              />
            </View>
            <TouchableOpacity
              className="w-full p-4 rounded-[30px] mt-6"
              style={{ backgroundColor: themeColors.tint }}
            >
              <Text className="text-white text-center font-semibold uppercase">
                Post Product
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

export default Add;
