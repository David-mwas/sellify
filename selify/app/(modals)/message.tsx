import React, { useState, useEffect, useContext, useRef } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"; // Import relative time plugin
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { AuthContext } from "@/contexts/AuthContext";
import { ThemeContext } from "@/contexts/ThemeContext";
import { useUserContext } from "@/contexts/userContext";
import { Colors } from "@/constants/Colors";
import listenForMessages from "../../utils/messageListener"; // Import your Firebase message listener
import { apiUrl } from "@/constants/api";
import { useSearchParams } from "expo-router/build/hooks";

// Extend dayjs to use relative time
dayjs.extend(relativeTime);

const ChatScreen: React.FC = () => {
  const sellerId = useSearchParams().get("sellerId");

  const [messages, setMessages] = useState<{ [key: string]: any[] }>({});
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // reference for the FlatList
  const flatListRef = useRef<FlatList<any>>(null);

  const { userProfile } = useUserContext();
  const authContext = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);

  if (!authContext || !themeContext) {
    throw new Error("Contexts must be used within their providers");
  }

  const { userToken } = authContext;
  const isDarkMode = themeContext.isDarkMode;
  const themeColors = isDarkMode ? Colors.dark : Colors.light;

  const chatId = [userProfile?._id, sellerId].sort().join("_");

  // Format messages from Firebase and group by relative time
  const formatMessages = (firebaseMessages: any[]) => {
    const formattedMessages = firebaseMessages.map((msg) => ({
      id: msg.id,
      text: msg.message,
      senderId: msg.sender,
      timestamp: msg.timestamp.toDate(),
      relativeTime: dayjs(msg.timestamp.toDate()).fromNow(),
      user: {
        name: msg.senderName,
      },
    }));

    // Group by day (e.g., Today, Yesterday)
    const groupedMessages: { [key: string]: any[] } = {};

    formattedMessages.forEach((msg) => {
      const dayKey = dayjs(msg.timestamp).format("YYYY-MM-DD"); // Format as day key
      if (!groupedMessages[dayKey]) {
        groupedMessages[dayKey] = [];
      }
      groupedMessages[dayKey].push(msg);
    });

    return groupedMessages;
  };

  // Set up the Firebase listener for real-time updates
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = listenForMessages(
      chatId,
      setIsLoading,
      (firebaseMessages: any[]) => {
        const groupedMessages = formatMessages(firebaseMessages);
        setMessages(groupedMessages);
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  // Send message handler
  const handleSend = async () => {
    setIsSending(true);
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      senderId: userProfile?._id,
      timestamp: new Date().toISOString(),
      user: {
        name: userProfile?.username,
      },
    };

    setInputText("");
    Keyboard.dismiss();

    try {
      await fetch(`${apiUrl}/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          message: newMessage.text,
          sender: userProfile?._id,
          receiver: sellerId,
        }),
      });

      // Update the messages after sending the new message
      setMessages((prevMessages) => {
        const updatedMessages = { ...prevMessages };
        const dayKey = dayjs(newMessage.timestamp).format("YYYY-MM-DD");
        if (!updatedMessages[dayKey]) updatedMessages[dayKey] = [];
        updatedMessages[dayKey].push(newMessage);

        return updatedMessages;
      });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]); // Trigger scroll effect whenever messages are updated

  // Render message group header
  const renderHeader = (day: string) => {
    const formattedDay = dayjs(day).format("MMMM D, YYYY"); // Example: January 18, 2025
    return (
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{formattedDay}</Text>
      </View>
    );
  };

  // Render message item
  // Render message item
  const renderMessage = ({ item }: any) => {
    const isUserMessage = item.senderId === userProfile?._id;
    // Format the timestamp to show the actual time
    const formattedTime = dayjs(item.timestamp).format("h:mm A"); // Example: 5:30 PM, Jan 18, 2025

    return (
      <View
        style={[
          styles.messageContainer,
          { alignItems: isUserMessage ? "flex-end" : "flex-start" },
        ]}
      >
        <View
          style={{
            flexDirection:
              item?.user?.name !== userProfile?.username
                ? "row"
                : "row-reverse",
            alignItems: "center",
            gap: 5,
          }}
        >
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 50,
              backgroundColor: "#aaa",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 15,
            }}
          >
            <Text style={{ fontSize: 16, color: "#fff" }}>
              {item?.user?.name?.slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View
            style={[
              styles.messageBubble,
              {
                backgroundColor: isUserMessage
                  ? themeColors.tint
                  : themeColors.cardBg,
                alignSelf: isUserMessage ? "flex-end" : "flex-start",
              },
            ]}
          >
            <Text style={{ color: isUserMessage ? "#fff" : themeColors.text }}>
              {item.text}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: isUserMessage ? "#fff" : themeColors.text,
                marginTop: 2,
                textAlign: "right",
              }}
            >
              {formattedTime} {/* Show the actual time */}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Flatten the messages for the FlatList
  const flatMessages = Object.keys(messages).map((day) => ({
    day,
    messages: messages[day],
  }));

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={themeColors.tint} />
          <Text style={{ color: themeColors.text }}>Loading messages...</Text>
        </View>
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={flatMessages}
            renderItem={({ item }) => (
              <>
                {renderHeader(item.day)}
                {item.messages.map((msg: any) => renderMessage({ item: msg }))}
              </>
            )}
            keyExtractor={(item, index) => item.id}
            contentContainerStyle={styles.messagesContainer}
          />
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: themeColors.background },
            ]}
          >
            <TextInput
              style={[
                styles.textInput,
                { color: themeColors.text, borderColor: themeColors.tint },
              ]}
              placeholder={isSending ? "Sending..." : "Type a message..."}
              placeholderTextColor={isDarkMode ? "#aaa" : "#777"}
              editable={!isSending}
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor:
                    inputText.length < 2 ? "#aaa" : themeColors.tint,
                },
              ]}
              onPress={handleSend}
              disabled={isSending || inputText.length < 2}
            >
              <FontAwesome name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  messagesContainer: { padding: 10 },
  messageContainer: { marginVertical: 5 },
  messageBubble: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: "75%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 0.5,
    borderColor: "#aaa",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
  },
  textInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 20,
  },
  headerContainer: {
    paddingVertical: 5,
    alignItems: "center",
    marginTop: 10,
  },
  headerText: {
    fontSize: 16,
    color: "#777",
    fontWeight: "bold",
  },
});

export default ChatScreen;
