import { db } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const sendMessage = async (
  chatId: string,
  message: any,
  sender: string,
  receiver: string
) => {
  try {
    await addDoc(collection(db, "chats", chatId, "messages"), {
      message,
      sender,
      receiver,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

export default sendMessage;
