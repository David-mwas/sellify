const mongoose = require("mongoose");
require("dotenv").config();

const dbUrl = process.env.mongoDbUrl;
mongoose
  .connect(dbUrl, {
    dbName: process.env.mongoDbName,
  })
  .then(() => {
    console.log("connected to mongodb successfully");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

const con = mongoose.connection;
con.on("connected", () => {
  console.log("mongoose connected to mongodb");
});

con.on("error", () => {
  console.log("mongoose encountered an error while connecting to mongodb");
});

con.on("disconnect", () => {
  console.log("mongoose disconnected from mongodb");
});
