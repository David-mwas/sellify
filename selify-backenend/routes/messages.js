const express = require("express");
const { sendMessage, getMessages } = require("../controllers/message");

const messageRouter = express.Router();

// POST: Send a message
messageRouter.post("/messages/send", sendMessage);

// GET: Get messages between two users
//Query Parameters: ?sender=<userId>&receiver=<userId></userId>
messageRouter.get("/messages", getMessages);

exports.messageRouter = messageRouter;
