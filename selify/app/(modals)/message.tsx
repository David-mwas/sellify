import React, { useState, useEffect, useContext } from "react";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import listenForMessages from "../../utils/messageListener"; // Helper functions
import { apiUrl } from "@/constants/api";
import { AuthContext } from "@/contexts/AuthContext";
import { ThemeContext } from "@/contexts/ThemeContext";
import { useUserContext } from "@/contexts/userContext";
import { useSearchParams } from "expo-router/build/hooks";

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { userProfile } = useUserContext();
  const sellerId = useSearchParams().get("sellerId");

  const authContext = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);

  if (!authContext || !themeContext) {
    throw new Error("Contexts must be used within their providers");
  }

  const { userToken } = authContext;

  const chatId = [userProfile?._id, sellerId].sort().join("_");

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
            _id: data?.id,
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

  useEffect(() => {
    const unsubscribe: () => void = listenForMessages(
      chatId,
      (firebaseMessages: any[]) => {
        const formattedMessages: IMessage[] = firebaseMessages?.map(
          (msg: any) => ({
            _id: msg?.id,
            text: msg?.message,
            createdAt: msg?.timestamp.toDate(),
            user: {
              _id: msg?.sender,
              name: msg?.sender === userProfile?._id ? "You" : msg?.sender, // Customize as needed
            },
          })
        );
        setMessages(formattedMessages?.reverse()); // GiftedChat expects the newest message first
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  return (
    <GiftedChat
      messages={messages}
      onSend={(newMessages) => handleSend(newMessages)}
      user={{
        _id: userProfile?._id || "",
        name: userProfile?.username || "You",
      }}
      isTyping={isLoading}
    />
  );
};

export default ChatScreen;
