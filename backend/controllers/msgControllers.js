const message = require("../models/message");
const user = require("../models/user");
let cloudinary = require("../lib/cloudinary.js");

const getUserSidebar = async (req, res) => {
  try {
    let loggedInUserId = req.user.id;
    console.log("req.user =", JSON.stringify(req.user, null, 2));

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
    console.log(
      "current user is" + currUser + "is sending text to " + SendToUserId
    );

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

    await newmessage.save();
    res.status(201).json(newmessage);
  } catch (e) {
    console.log("error while sending message" + e);
    res.status(400).send({ message: "error in sending message backend" });
  }
};

module.exports = { getUserSidebar, getChat, sendMessage };
