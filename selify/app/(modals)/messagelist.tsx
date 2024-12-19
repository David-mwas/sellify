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
import { apiUrl } from "@/constants/api";
import { router } from "expo-router";
import { ThemeContext } from "@/contexts/ThemeContext";
import { Colors } from "@/constants/Colors";
import LottieView from "lottie-react-native";

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
    };

    fetchChats();
  }, [userId]);

  interface SellerResponse {
    user: User;
  }

  interface ChatItem {
    id: string;
    participants: string[];
    lastMessage: string;
    timestamp: { seconds: number };
  }

  const renderChatItem = ({ item }: { item: ChatItem }) => {
    const otherUserId = item.participants.find((id) => id !== userId);
    // console.log("otherUserId", item);
    // console.log(
    //   "user",
    //   otherUserId === userId ? item?.receiverImage : item?.senderImage
    // );

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
      {chats.length > 0 ? (
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
            // Find more Lottie files at
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
