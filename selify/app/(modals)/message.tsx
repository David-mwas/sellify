import React, { useState, useEffect, useContext } from "react";
import {
  GiftedChat,
  IMessage,
  Bubble,
  InputToolbar,
} from "react-native-gifted-chat";
import {
  TouchableOpacity,
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons"; // For icons
import { apiUrl } from "@/constants/api";
import { AuthContext } from "@/contexts/AuthContext";
import { ThemeContext } from "@/contexts/ThemeContext";
import { useUserContext } from "@/contexts/userContext";
import { useSearchParams } from "expo-router/build/hooks";
import listenForMessages from "../../utils/messageListener"; // Helper to listen to Firebase

import { Colors } from "@/constants/Colors";

import { Keyboard } from "react-native";

// Define the ChatScreen Component
const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  const { userProfile } = useUserContext();
  const sellerId = useSearchParams().get("sellerId");

  const authContext = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);

  if (!authContext || !themeContext) {
    throw new Error("Contexts must be used within their providers");
  }

  const { userToken } = authContext;
  const isDarkMode = themeContext?.isDarkMode || false; // Theme mode
  const themeColors = isDarkMode ? Colors.dark : Colors.light;

  const chatId = [userProfile?._id, sellerId].sort().join("_");

  // Send message handler
  const handleSend = async (newMessages: IMessage[] = []) => {
    const message = newMessages[0];
    if (message) {
      try {
        setIsLoading(true);
        const res = await fetch(`${apiUrl}/messages/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            message: message.text,
            sender: userProfile?._id,
            receiver: sellerId,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const sentMessage: IMessage = {
            _id: data?.id || message._id,
            text: message?.text,
            createdAt: new Date(),
            user: {
              _id: userProfile?._id || "",
              name: userProfile?.username || "You",
            },
          };
          setMessages((prev) => GiftedChat.append(prev, [sentMessage]));
        }
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Format messages from Firestore
  const formatMessages = (firebaseMessages: any[]) =>
    firebaseMessages.map((msg) => ({
      _id: msg.id,
      text: msg.message,
      createdAt: msg.timestamp.toDate(),
      user: {
        _id: msg.sender,
        name: msg.senderName,
      },
    }));

  // Message listener (real-time updates)
  useEffect(() => {
    const unsubscribe: () => void = listenForMessages(
      chatId,
      setIsLoadingChat,
      (data: any[]) => {
        setMessages(formatMessages(data).reverse());
      }
    );
    return () => unsubscribe();
  }, [chatId]);

  // Custom Send Button
  const renderSend = (props: any) => (
    <TouchableOpacity
      style={[
        styles.sendButton,
        { backgroundColor: props.text ? themeColors.tint : "#ccc" },
      ]}
      onPress={() => {
        Keyboard.dismiss();
        if (props.text && props.onSend) {
          props.onSend({ text: props.text.trim() }, true);
        }
      }}
    >
      <FontAwesome name="send" size={20} color="#fff" />
    </TouchableOpacity>
  );

  // Custom Message Bubbles
  const renderBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        left: {
          backgroundColor: isDarkMode ? "#333" : "#E5E5EA",
          borderRadius: 10,
        },
        right: {
          backgroundColor: themeColors.tint,
          borderRadius: 10,
        },
      }}
      textStyle={{
        left: { color: isDarkMode ? "#fff" : "#000" },
        right: { color: "#fff" },
      }}
    />
  );

  // Custom Input Toolbar
  const renderInputToolbar = (props: any) => (
    <InputToolbar
      {...props}
      textInputProps={{
        placeholderTextColor: isDarkMode ? "#fff" : "#000",
        style: {
          width: "85%",
          color: isDarkMode ? "#fff" : "#000", // Set input text color here
        },
      }}
      wrapperStyle={{ backgroundColor: "red" }}
      containerStyle={{
        width: "100%",
        height: 60,
        backgroundColor: isDarkMode ? "#222" : "#f2f2f2",
        padding: 5,
        paddingTop: 10,
      }}
    />
  );

  return (
    <>
      {isLoadingChat ? (
        <View
          style={[
            styles.container,
            { backgroundColor: themeColors.background },
          ]}
        >
          <ActivityIndicator size="large" color={themeColors.tint} />
        </View>
      ) : (
        <>
          <GiftedChat
            messagesContainerStyle={{
              backgroundColor: themeColors.background,
              paddingBottom: 10,
            }}
            quickReplyContainerStyle={{
              backgroundColor: themeColors.background,
            }}
            messages={messages}
            onSend={(newMessages) => handleSend(newMessages)}
            user={{
              _id: userProfile?._id || "unknown",
              name: userProfile?.username || "You",
            }}
            renderSend={renderSend}
            renderBubble={renderBubble}
            renderInputToolbar={renderInputToolbar}
            placeholder="Type your message here..."
            // isTyping={isLoading}
            alwaysShowSend={true}
            // renderAvatarOnTop

            renderChatFooter={() => (
              <View
                style={{
                  backgroundColor: themeColors.background,
                  padding: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: themeColors.text }}>
                  Chat with the seller
                </Text>
              </View>
            )}
            minInputToolbarHeight={50} // Ensures the input toolbar height remains consistent
            keyboardShouldPersistTaps="handled" // Ensures the keyboard handles taps properly
          />
        </>
      )}
    </>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButton: {
    padding: 8,
    borderRadius: 20,
    marginBottom: 5,
    marginRight: 5,
  },
});

export default ChatScreen;
