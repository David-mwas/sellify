import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase"; // Your Firebase config file
import { useUserContext } from "@/contexts/userContext";
import { router } from "expo-router";
import { ThemeContext } from "@/contexts/ThemeContext";
import { Colors } from "@/constants/Colors";
import LottieView from "lottie-react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";

const ChatList = () => {
  interface ChatItem {
    id: string;
    participants: string[];
    lastMessage: string;
    timestamp: { seconds: number };
    senderName: string;
    receiverName: string;
    senderImage: string;
    receiverImage: string;
  }

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const shimmerItems = new Array(5).fill(null);
  interface User {
    _id: string;
    username: string;
    imageUrl: { url: string };
  }

  const { userProfile } = useUserContext();
  const userId = userProfile?._id;

  const themeContext = useContext(ThemeContext); // Access the theme context
  const isDarkMode = themeContext?.isDarkMode || false; // Get current theme
  const themeColors = isDarkMode ? Colors.dark : Colors.light;

  useEffect(() => {
    const fetchChats = async () => {
      setIsLoading(true);
      const chatRef = collection(db, "sellifychats");
      const q = query(
        chatRef,
        where("participants", "array-contains", userId) // Checks if userId is part of participants
      );

      const chatSnapshot = await getDocs(q);
      const chatData = chatSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          participants: data.participants,
          senderName: data.senderName,
          receiverName: data.receiverName,
          senderImage: data.senderImage,
          receiverImage: data.receiverImage,
          lastMessage: data.lastMessage,
          timestamp: data.timestamp,
        };
      });
      setChats(chatData);
      setIsLoading(false);
    };

    fetchChats();
  }, [userId]);

  interface ChatItem {
    id: string;
    participants: string[];
    lastMessage: string;
    timestamp: { seconds: number };
  }

  const renderChatItem = ({ item }: { item: ChatItem }) => {
    const otherUserId = item.participants.find((id) => id !== userId);
    
    return (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: themeColors.cardBg,
          padding: 10,
          borderRadius: 10,
          marginVertical: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 1,
        }}
        onPress={() =>
          router.navigate({
            pathname: `/(modals)/message`,
            params: { sellerId: otherUserId },
          })
        }
      >
        <Image
          source={{
            uri:
              otherUserId === userId
                ? item?.receiverImage
                : item?.senderImage
                ? otherUserId === userId
                  ? item?.receiverImage
                  : item?.senderImage
                : `https://ui-avatars.com/api/?name=${
                    otherUserId === userId
                      ? item?.receiverName
                      : item?.senderName
                  }&background=random`,
          }}
          style={styles.avatar}
        />
        <View style={styles.chatDetailsContainer}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: themeColors.text,
            }}
          >
            {otherUserId === userId ? item?.receiverName : item?.senderName}
          </Text>
          <Text style={styles.lastMessage}>{item.lastMessage}</Text>
        </View>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp?.seconds * 1000).toLocaleTimeString()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: themeColors.background, padding: 10 }}
    >
      {isLoading ? (
        <View style={{ flex: 1, paddingVertical: 20 }}>
          {shimmerItems.map((_, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 15,
                backgroundColor: themeColors.cardBg,
                padding: 10,
                borderRadius: 10,
              }}
            >
              {/* Avatar shimmer */}
              <ShimmerPlaceholder
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  marginRight: 10,
                }}
                shimmerColors={["#f0f0f0", "#e0e0e0", "#f0f0f0"]}
              />

              {/* Text shimmer */}
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                }}
              >
                <View>
                  <ShimmerPlaceholder
                    style={{
                      height: 20,
                      width: "70%",
                      borderRadius: 4,
                      marginBottom: 8,
                    }}
                    shimmerColors={["#f0f0f0", "#e0e0e0", "#f0f0f0"]}
                  />
                  <ShimmerPlaceholder
                    style={{ height: 16, width: "40%", borderRadius: 4 }}
                    shimmerColors={["#f0f0f0", "#e0e0e0", "#f0f0f0"]}
                  />
                </View>
                <View style={{ flex: 1, alignItems: "flex-end" }}>
                  <ShimmerPlaceholder
                    style={{
                      height: 12,
                      width: "100%",
                      borderRadius: 4,
                      // marginLeft: -15,
                    }}
                    shimmerColors={["#f0f0f0", "#e0e0e0", "#f0f0f0"]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : chats?.length > 0 ? (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={{
            paddingBottom: 10,
          }}
        />
      ) : (
        <View className="justify-center items-center">
          <LottieView
            autoPlay
            style={{
              width: 200,
              height: 200,
              backgroundColor: "transparent",
              marginTop: 20,
            }}
            source={require("../../assets/lottie/Animation - 1732533924789.json")}
          />
          <Text
            style={{
              color: themeColors.text,
              textAlign: "center",
              marginTop: 20,
              fontWeight: "bold",
              fontSize: 20,
            }}
          >
            you have no chats yet !
          </Text>
        </View>
      )}
    </View>
  );
};

export default ChatList;

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  chatDetailsContainer: {
    flex: 1,
  },

  lastMessage: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#bbb",
  },
});
