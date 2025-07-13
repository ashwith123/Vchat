const { Server } = require("socket.io");
const express = require("express");
const app = express();
const http = require("http");
const { create } = require("../models/user");

const server = http.createServer(app);

const OnlineUsers = {}; //store onlineusersid:socketid

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

function getReciverSocketId(userid) {
  return OnlineUsers[userid];
}

io.on("connection", (socket) => {
  console.log("user connection", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) OnlineUsers[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(OnlineUsers));

  socket.on("disconnect", () => {
    console.log("a user disconneced");
    delete OnlineUsers[userId];
    io.emit("getgetOnlineUsers", Object.keys(OnlineUsers));
  });
});

module.exports = { io, app, server, getReciverSocketId };
