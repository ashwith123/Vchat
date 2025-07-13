const message = require("../models/message");
const user = require("../models/user");
let cloudinary = require("../lib/cloudinary.js");
let { io, getReciverSocketId } = require("../lib/socket.js");

const getUserSidebar = async (req, res) => {
  try {
    let loggedInUserId = req.user.id;

    let filteredUsers = await user
      .find({ _id: { $ne: loggedInUserId } })
      .select("-password");
    res.send(filteredUsers);
  } catch (e) {
    console.log(e);
    res.status(400).send({ message: "unable to filter user for sidebar" });
  }
};

const getChat = async (req, res) => {
  try {
    let currUser = req.user.id;
    let SendToUserId = req.params.id;

    let chat = await message.find({
      $or: [
        { senderId: currUser, receiverId: SendToUserId },
        { senderId: SendToUserId, receiverId: currUser },
      ],
    });

    res.send(chat);
  } catch (e) {
    console.log(e);
    res.status(400).send({ message: "unable to retrive chat" });
  }
};

const sendMessage = async (req, res) => {
  try {
    let receiverId = req.params.id;
    let senderId = req.user.id;
    let { text, image } = req.body;

    let imageUrl = null;

    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({ message: "Failed to upload image." });
      }
    }
    let newmessage = new message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    let reciverSocketid = getReciverSocketId(receiverId);

    if (reciverSocketid) {
      io.to(reciverSocketid).emit("newMessage", newmessage);
    }

    await newmessage.save();
    res.status(201).json(newmessage);
  } catch (e) {
    console.log("error while sending message" + e);
    res.status(400).send({ message: "error in sending message backend" });
  }
};

module.exports = { getUserSidebar, getChat, sendMessage };
