const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { io, app, server } = require("./lib/socket");

const authRoute = require("../backend/routes/authRoute");
const authMessage = require("../backend/routes/authMessage");
const dotenv = require("dotenv");

dotenv.config();
app.use(cookieParser());

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/api", authRoute);
app.use("/api/msg", authMessage);

mongoose
  .connect("mongodb://localhost:27017/vchat", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected!");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Error-handling middleware
app.use((err, req, res, next) => {
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Payload too large. Max 10MB allowed.",
    });
  }

  // General catch
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

server.listen(8080, (req, res) => {
  console.log("listening at port 8080");
});
