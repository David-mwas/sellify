import React, { useState, useEffect } from "react";
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

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [user, setUser] = useState(null);
  const { userProfile } = useUserContext();
  const userId = userProfile?._id;

  useEffect(() => {
    const fetchChats = async () => {
      const chatRef = collection(db, "sellifychats");
      const q = query(
        chatRef,
        where("participants", "array-contains", userId) // Checks if userId is part of participants
      );

      const chatSnapshot = await getDocs(q);
      const chatData = chatSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(chatData);
    };

    fetchChats();
  }, [userId]);

  const fetchSeller = async (sellerId) => {
    const response = await fetch(`${apiUrl}/user/${sellerId}`);
    const data = await response.json();
    setUser(data?.user);
   
  };

  const renderChatItem = ({ item }) => {
    const otherUserId = item.participants.find((id) => id !== userId);
    fetchSeller(otherUserId);
    // console.log(user);

    return (
      <TouchableOpacity
        style={styles.chatItemContainer}
        onPress={
          () => {}
          // navigation.navigate("ChatDetails", { chatId: item.id, userId })
        }
      >
        <Image
          source={{
            uri: user?.profilePicture
              ? user?.profilePicture
              : `https://ui-avatars.com/api/?name=${user?.username}&background=random`,
          }}
          style={styles.avatar}
        />
        <View style={styles.chatDetailsContainer}>
          <Text style={styles.chatName}>{user?.username}</Text>
          <Text style={styles.lastMessage}>{item.lastMessage}</Text>
        </View>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp?.seconds * 1000).toLocaleTimeString()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.chatList}
      />
    </View>
  );
};

export default ChatList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  chatList: {
    paddingBottom: 10,
  },
  chatItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
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
  chatName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
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
