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
  Image,
  View,
  TextInput,
  Text,
} from "react-native";
import Modal from "react-native-modal";
import { KeyboardAvoidingView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { FlashList } from "@shopify/flash-list";
import { SelectList } from "react-native-dropdown-select-list";
import { useLocation } from "@/hooks/useLocation";

function Add() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [selected, setSelected] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");

  const [categories, setCategories] = useState<
    { key: string; value: string }[]
  >([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const themeContext = useContext(ThemeContext);
  const isDarkMode = themeContext?.isDarkMode || false;
  const themeColors = isDarkMode ? Colors.dark : Colors.light;
  const inputBorderColor = isDarkMode ? Colors.dark.tint : Colors.light.tint;
  const iconColor = isDarkMode ? Colors.dark.icon : Colors.light.icon;

  const { location, errorMsg, isLocationLoading } = useLocation();
  console.log(location?.coords.latitude, location?.coords.longitude);
  if (errorMsg) {
    console.log("Error", errorMsg);
  }

  // Fetch categories (optional)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${apiUrl}/category`);
        if (response.ok) {
          const data = await response.json();
          const newArray = data.categories.map((item: any) => ({
            key: item._id,
            value: `${item.emoji} ${item.name}`,
          }));
          setCategories(newArray);
        }
      } catch (error) {
        console.error("Error", error);
      }
    };
    fetchCategories();
  }, []);

  // Handle keyboard visibility
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

  // Handle image selection
  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.5,
    });

    if (!result.canceled) {
      if (selectedImages.length < 3) {
        setSelectedImages((prev) => [...prev, result.assets[0].uri]);
      } else {
        alert("You can upload up to 3 images only.");
      }
    }
  };

  // Remove an image
  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };
  // selectedImages.map((item) => console.log(item));

  const handlePostProduct = async () => {
    const formData = new FormData();
    formData.append("name", title);
    formData.append("price", price.toString());
    formData.append("category", selected);
    formData.append("description", description);
    formData.append("latitude", location?.coords.latitude?.toString() || "");
    formData.append("longitude", location?.coords.longitude?.toString() || "");
    selectedImages.map(async (item, index) => {
      const response = await fetch(item);
      const blob = await response.blob();
      formData.append(`image${index + 1}`, blob, `image${index + 1}.jpg`);
    });

    if (!title || !price || !selected || !description) {
      setIsModalVisible(true);
      setModalMessage("Please fill all the fields!");
      return;
    }
    if (selectedImages.length === 0) {
      setIsModalVisible(true);
      setModalMessage("Please upload at least one image!");
      return;
    }
    try {
      // const response = await fetch(`${apiUrl}/product`, {
      //   method: "POST",
      //   body: formData,
      // });
      // if (response.ok) {
      //   const data = await response.json();
      //   console.log(data);
      //   setIsModalVisible(true);
      //   setModalMessage("Product posted successfully!");
      // } else {
      //   setIsModalVisible(true);
      //   setModalMessage("Failed to post product!");
      // }
    } catch (error) {
      console.error("Error", error);
    }
  };
  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: themeColors.background }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
              Upload up to 3 images
            </Text>

            {/* Image Selection Section */}
            <View className="flex flex-row gap-4 items-center">
              {/* Conditional Rendering of the "Upload Image" Button */}
              {selectedImages.length < 3 && (
                <TouchableOpacity
                  onPress={handleImagePick}
                  className="w-[120px] h-[100px] rounded-md bg-gray-400 justify-center items-center"
                >
                  <Ionicons name="camera" size={24} color="#eee" />
                </TouchableOpacity>
              )}

              <FlashList
                scrollEnabled={true}
                horizontal
                data={selectedImages}
                renderItem={({ item, index }) => (
                  <View className="relative overflow-x-scroll mx-2">
                    <Image
                      source={{ uri: item }}
                      className="w-[100px] h-[100px] rounded-lg"
                    />
                    {/* Remove Icon */}
                    <TouchableOpacity
                      onPress={() => removeImage(index)}
                      className="absolute top-0 right-0 p-2 bg-opacity-50 rounded-full"
                    >
                      <Ionicons
                        name="close-circle"
                        size={28}
                        color="#fff"
                        style={{ color: themeColors.text }}
                      />
                    </TouchableOpacity>
                  </View>
                )}
                keyExtractor={(item, index) => `${item}-${index}`}
                estimatedItemSize={100}
              />
            </View>

            {/* Other Input Fields */}
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
                placeholder="Product Name..."
                placeholderTextColor={iconColor}
                style={{ color: themeColors.text }}
              />
            </View>

            {/* Price Input */}
            <View
              style={{ borderColor: inputBorderColor }}
              className="border rounded-lg flex flex-row items-center px-4 py-2 w-52"
            >
              <Entypo name="price-tag" size={20} color={iconColor} />
              <TextInput
                className="ml-2 flex-1"
                placeholder="Price..."
                keyboardType="numeric"
                placeholderTextColor={iconColor}
                style={{ color: themeColors.text }}
              />
            </View>

            {/* Category Dropdown */}
            <SelectList
              dropdownStyles={{ borderColor: themeColors.tint }}
              dropdownTextStyles={{
                color: themeColors.text,
                fontWeight: "semibold",
                textTransform: "capitalize",
              }}
              boxStyles={{ borderColor: themeColors.tint }}
              setSelected={(val: string) => setSelected(val)}
              data={categories}
              save="value"
            />

            {/* Description Input */}
            <View
              style={{ borderColor: inputBorderColor }}
              className="border rounded-lg flex flex-row items-center px-4 py-2"
            >
              <MaterialIcons name="description" size={20} color={iconColor} />
              <TextInput
                className="ml-2 flex-1"
                placeholder="Description..."
                placeholderTextColor={iconColor}
                style={{ color: themeColors.text }}
              />
            </View>

            {/* Post Product Button */}
            <TouchableOpacity
              className="w-full p-4 rounded-[30px] mt-6"
              style={{ backgroundColor: themeColors.tint }}
            >
              <Text className="text-white text-center font-semibold uppercase">
                Post Product
              </Text>
            </TouchableOpacity>
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

export default Add;
