const admin = require("../firebase");
const { userModel } = require("../models/userModel");

exports.sendMessage = async (req, res) => {
  try {
    const { message, sender, receiver } = req.body;

    if (!message || !sender || !receiver) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const senderName = await userModel.findById(sender);
    const receiverName = await userModel.findById(receiver);
    if (!senderName || !receiverName) {
      return res.status(404).json({ message: "User not found" });
    }

    const messageData = {
      message,
      sender,
      receiver,
      senderName: senderName?.username,
      receiverName: receiverName?.username,
      participants: [sender, receiver], // Added for easier querying
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    let chatData = {
      chatId: [sender, receiver].sort().join("_"),
      participants: [sender, receiver],
      senderName: senderName?.username,
      receiverName: receiverName?.username,
      senderImage: senderName?.imageUrl?.url,
      receiverImage: receiverName?.imageUrl?.url,
      lastMessage: message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Remove undefined fields from chatData
    chatData = Object.fromEntries(
      Object.entries(chatData).filter(([_, value]) => value !== undefined)
    );

    const db = admin.firestore();

    // Use the chatId as the document ID to ensure uniqueness
    const chatId = chatData.chatId;
    const chatRef = db.collection("sellifychats").doc(chatId);

    // Set or update the chat data
    await chatRef.set(chatData, { merge: true });

    // Add the message to the "messages" subcollection
    await chatRef.collection("messages").add(messageData);
    // send expo push notification
    const receiverUser = await userModel.findById(receiver);
    if (receiverUser && receiverUser.expoPushToken) {
      const message = {
        to: receiverUser.expoPushToken,
        sound: "default",
        title: "New message",
        body: `New message from ${senderName.username}: "${message}"`,
        data: { message, sender, receiver },
      };

      await admin.messaging().send(message);
    }
    

    res.status(201).json({ message: "Message sent", data: messageData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// const { Expo } = require("expo-server-sdk");
// const { messageModel } = require("../models/messageModel");
// const { userModel } = require("../models/userModel");

// // Create a new Expo SDK client
// const expo = new Expo();

// // Send a message with push notification
// exports.sendMessage = async (req, res) => {
//   try {
//     const { message, sender, receiver } = req.body;

//     if (!message || !sender || !receiver) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // Save the message to the database
//     const newMessage = await messageModel.create({
//       message,
//       sender,
//       receiver,
//     });

//     // Add the message to both users' message lists
//     await userModel.findByIdAndUpdate(sender, {
//       $push: { messages: newMessage._id },
//     });
//     await userModel.findByIdAndUpdate(receiver, {
//       $push: { messages: newMessage._id },
//     });

//     // Get receiver's push token
//     const receiverUser = await userModel.findById(receiver);

//     if (receiverUser && receiverUser.expoPushToken) {
//       // Check if the token is a valid Expo push token
//       if (Expo.isExpoPushToken(receiverUser.expoPushToken)) {
//         const messages = [
//           {
//             to: receiverUser.expoPushToken,
//             sound: "default",
//             body: `New message from ${sender}: "${message}"`,
//             data: { message, sender, receiver },
//           },
//         ];

//         // Send the push notification
//         const chunks = expo.chunkPushNotifications(messages);
//         const tickets = [];

//         for (const chunk of chunks) {
//           try {
//             const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
//             tickets.push(...ticketChunk);
//           } catch (error) {
//             console.error("Error sending notification:", error);
//           }
//         }
//       }
//     }

//     res.status(201).json({ message: "Message sent", data: newMessage });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// // Get messages between two users
// exports.getMessages = async (req, res) => {
//   try {
//     const { sender, receiver } = req.query;

//     if (!sender || !receiver) {
//       return res
//         .status(400)
//         .json({ message: "Sender and receiver are required" });
//     }

//     // Retrieve messages between the two users
//     const messages = await messageModel
//       .find({
//         $or: [
//           { sender, receiver },
//           { sender: receiver, receiver: sender },
//         ],
//       })
//       .sort({ createdAt: 1 }) // Sort by creation date
//       .populate("sender", "username email imageUrl") // Populate sender details
//       .populate("receiver", "username email imageUrl"); // Populate receiver details

//     res.status(200).json({ messages });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };
