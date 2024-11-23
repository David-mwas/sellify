const express = require("express");
const logger = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");
const createError = require("http-errors");
const multer = require("multer");
const http = require("http");
const { Server } = require("socket.io");

const { authRouter } = require("./routes/auth");
const { userRouter } = require("./routes/user");
const { productRouter } = require("./routes/product");
const { categoryRouter } = require("./routes/category");
const { messageRouter } = require("./routes/messages"); // New message route
const { messageModel } = require("./models/messageModel"); // Message model
const { userModel } = require("./models/userModel"); // User model

require("./helpers/mongoDBhelpers");

const upload = multer();
dotenv.config();
const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (adjust for production)
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(upload.any());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger("dev"));
app.use(cors());

// Routes
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to Selify API" });
});

app.use("/api/v1", authRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1", productRouter);
app.use("/api/v1", categoryRouter);
app.use("/api/v1", messageRouter); // Register message route

// Error handling
app.use(async (req, res, next) => {
  const error = createError.NotFound("The page does not exist");
  next(error);
});

app.use(async (error, req, res, next) => {
  const status = error.status || 500;
  res.status(status).json({
    message: error.message,
    status: error.status,
  });
});

// Socket.IO setup
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join room
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // Send message
  socket.on("send_message", async (data) => {
    const { message, sender, receiver } = data;

    // Save message in the database
    const newMessage = await messageModel.create({
      message,
      sender,
      receiver,
    });

    // Emit the message to the receiver
    const roomId = `${sender}_${receiver}`; // Combine sender and receiver as room ID
    io.to(roomId).emit("receive_message", newMessage);

    console.log(`Message sent to room: ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const port = process.env.PORT || 5000;

server.listen(port, (error) => {
  if (error) {
    console.error(`An error has occurred: ${error}`);
  }
  console.log(`Server running on http://127.0.0.1:${port}`);
});

// const express = require("express");
// const logger = require("morgan");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const createError = require("http-errors");
// const multer = require("multer");
// const { authRouter } = require("./routes/auth");
// const { userRouter } = require("./routes/user");
// const { productRouter } = require("./routes/product");
// const { categoryRouter } = require("./routes/category");
// require("./helpers/mongoDBhelpers");

// const upload = multer();
// dotenv.config();
// const app = express();

// // middlewares
// app.use(upload.any());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(logger("dev"));
// app.use(cors());

// // routes
// app.get("/", (req, res) => {
//   res.status(200).json({
//     message: "Welcome to Selify API",
//   });
// });

// app.use("/api/v1", authRouter);
// app.use("/api/v1", userRouter);
// app.use("/api/v1", productRouter);
// app.use("/api/v1", categoryRouter);
// // error handling
// app.use(async (req, res, next) => {
//   const error = createError.NotFound("The page does not exist");
//   next(error);
// });

// app.use(async (error, req, res, next) => {
//   const status = error.status || 500;
//   res.status(status).json({
//     message: error.message,
//     status: error.status,
//   });
// });

// const port = process.env.PORT || 5000;

// app.listen(port, (error) => {
//   if (error) {
//     console.error(`An error has occured: ${error}`);
//   }
//   console.log(`server running on http://127.0.0.1:${port}`);
// });
