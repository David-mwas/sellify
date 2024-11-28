const express = require("express");
const { sendMessage, getMessages } = require("../controllers/message");
const { verifyAccessToken } = require("../helpers/getJwt");
const messageRouter = express.Router();

// POST: Send a message
messageRouter.post("/messages/send", verifyAccessToken, sendMessage);

// GET: Get messages between two users
//Query Parameters: ?sender=<userId>&receiver=<userId></userId>
messageRouter.get("/messages", verifyAccessToken, getMessages);

exports.messageRouter = messageRouter;
