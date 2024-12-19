import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const listenForMessages = (
  chatId: string,
  setIsLoadingChat: any,
  setMessages: any
) => {
  setIsLoadingChat(true);
  const q = query(
    collection(db, "sellifychats", chatId, "messages"),
    orderBy("timestamp", "asc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("messo", messages);
    setMessages(messages);
    setIsLoadingChat(false);
  });

  return unsubscribe; // Call this to stop listening
};
export default listenForMessages;
