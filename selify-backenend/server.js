const express = require("express");
const logger = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");
const createError = require("http-errors");
const multer = require("multer");
require("./helpers/mongoDBhelpers");

const upload = multer();
dotenv.config();
const app = express();

// middlewares
app.use(upload.any());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger("dev"));
app.use(cors());

// routes
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Selify API",
  });
});

// error handling
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

const port = process.env.PORT || 5000;

app.listen(port, (error) => {
  if (error) {
    console.error(`An error has occured: ${error}`);
  }
  console.log(`server running on http://127.0.0.1:${port}`);
});
