import React, { useContext, useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import Modal from "react-native-modal";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { SelectList } from "react-native-dropdown-select-list";
import { apiUrl } from "@/constants/api";
import { Colors } from "@/constants/Colors";
import { AuthContext } from "@/contexts/AuthContext";
import { ThemeContext } from "@/contexts/ThemeContext";
import { useLocation } from "@/hooks/useLocation";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

function Add() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [selected, setSelected] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const authContext = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);

  if (!authContext || !themeContext) {
    throw new Error("Contexts must be used within their providers");
  }

  type FileData = {
    uri: string;
    name: string;
    type: string;
  };

  const { userToken } = authContext;
  const { isDarkMode } = themeContext;
  const themeColors = isDarkMode ? Colors.dark : Colors.light;
  // const iconcolors = isDarkMode ? Colors.dark.icon : Colors.light.icon;
  const inputBorderColor = isDarkMode ? Colors.dark.tint : Colors.light.tint;

  const { location, errorMsg } = useLocation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${apiUrl}/category`);
        if (response.ok) {
          const data = await response.json();
          const formattedCategories = data.categories.map((item: any) => ({
            key: item._id,
            value: `${item.emoji} ${item.name}`,
          }));
          setCategories(formattedCategories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
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

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePostProduct = async () => {
    if (!title || !price || !selected || !description) {
      setIsUploading(false);
      setModalMessage("Please fill all the fields!");
      setIsModalVisible(true);
      return;
    }

    if (selectedImages.length === 0) {
      setIsUploading(false);
      setModalMessage("Please upload at least one image!");
      setIsModalVisible(true);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("price", price.toString());
    formData.append("categoryId", selected);
    formData.append("description", description);
    formData.append("latitude", location?.coords.latitude?.toString() || "");
    formData.append("longitude", location?.coords.longitude?.toString() || "");

    for (const [index, uri] of selectedImages.entries()) {
      const response = await fetch(uri);
      const blob = await response.blob();

      const fileName = `image${index + 1}.jpg`;
      const fileType = blob.type;

      const file: FileData = {
        uri,
        name: fileName,
        type: fileType,
      };

      formData.append("files", file as any);
    }

    try {
      setIsUploading(true);

      const response = await fetch(`${apiUrl}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        setModalMessage("Product posted successfully!🚀");
      } else {
        const result = await response.json();
        setModalMessage(result.message || "Failed to post product!");
      }
    } catch (error) {
      setModalMessage(`Failed to post product! ${error}`);
      console.error("Failed to post product:", error);
    } finally {
      setIsUploading(false);
      // reset form
      setSelectedImages([]);
      setTitle("");
      setPrice(null);
      setDescription("");
      setSelected("");
      setIsUploading(false);
    }
    setIsModalVisible(true);
  };

  if (isUploading) {
    return (
      <SafeAreaView
        style={[
          {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            opacity: 0.6,
          },
          { backgroundColor: themeColors.background },
        ]}
      >
        <ActivityIndicator size="large" color={themeColors.tint} />
        <Text style={{ color: themeColors.text }}>Posting Product...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <KeyboardAwareScrollView
        bounces={true}
        style={{ flex: 1 }}
        // behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={{ padding: 16, gap: 16 }}>
          <Text
            style={{
              color: themeColors.tint,
              fontWeight: "bold",
              fontSize: 18,
            }}
          >
            Post a Product
          </Text>

          {/* Image Picker */}
          <Text style={{ color: themeColors.text }}>Upload up to 3 images</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {selectedImages.length < 3 && (
              <TouchableOpacity
                onPress={handleImagePick}
                style={{
                  width: 100,
                  height: 100,
                  backgroundColor: "#ccc",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 8,
                }}
              >
                <Ionicons name="camera" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            <FlashList
              data={selectedImages}
              horizontal
              renderItem={({ item, index }) => (
                <View style={{ position: "relative", marginHorizontal: 8 }}>
                  <Image
                    source={{ uri: item }}
                    style={{ width: 100, height: 100 }}
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    style={{ position: "absolute", top: 4, right: 4 }}
                  >
                    <Ionicons name="close-circle" size={24} color="#ff0000" />
                  </TouchableOpacity>
                </View>
              )}
              estimatedItemSize={100}
            />
          </View>
          {/* Other Inputs */}
          <View
            style={{ borderColor: inputBorderColor }}
            className="border rounded-lg w-full flex flex-row items-center px-4 py-2"
          >
            <Entypo name="new-message" size={20} color={themeColors.text} />
            <TextInput
              placeholder="Product Name"
              placeholderTextColor={themeColors.text}
              className="ml-2 flex-1"
              onChangeText={setTitle}
              style={{
                padding: 8,
              }}
            />
          </View>

          <View
            style={{ borderColor: inputBorderColor }}
            className="border rounded-lg  flex flex-row items-center px-4 py-2"
          >
            <Entypo name="price-tag" size={20} color={themeColors.text} />
            <TextInput
              placeholder="Price"
              placeholderTextColor={themeColors.text}
              keyboardType="numeric"
              onChangeText={(val) => setPrice(Number(val))}
              className="ml-2 flex-1"
              style={{
                padding: 8,
              }}
            />
          </View>

          <SelectList
            placeholder="Select Category"
            inputStyles={{
              color: themeColors.text,
            }}
            setSelected={setSelected}
            data={categories}
            boxStyles={{ borderColor: themeColors.tint }}
          />
          <View
            style={{ borderColor: inputBorderColor }}
            className="border rounded-lg w-full flex flex-row items-center px-4 py-2"
          >
            <MaterialIcons
              name="description"
              size={20}
              color={themeColors.text}
            />
            <TextInput
              placeholder="Description..."
              className="ml-2 flex-1"
              multiline={true}
              numberOfLines={4}
              onChangeText={setDescription}
              placeholderTextColor={themeColors.text}
            />
          </View>
          <TouchableOpacity
            disabled={isUploading}
            onPress={handlePostProduct}
            style={{
              backgroundColor: themeColors.tint,
              padding: 12,
              borderRadius: 20,
              marginTop: 20,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#fff",
                textTransform: "uppercase",
                fontWeight: "800",
              }}
            >
              {isUploading ? "Posting product..." : "Post Product"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* Modal */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
      >
        <View
          style={{
            backgroundColor: themeColors.background,
            padding: 16,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: themeColors.text,
              fontWeight: "heavy",
              fontSize: 18,
            }}
          >
            {modalMessage}
          </Text>
          <TouchableOpacity onPress={() => setIsModalVisible(false)}>
            <Text
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                color: "#fff",
                marginTop: 16,
                fontSize: 16,
                fontWeight: "bold",
                alignItems: "center",
                alignSelf: "center",
                backgroundColor: "#c58343cc",
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
