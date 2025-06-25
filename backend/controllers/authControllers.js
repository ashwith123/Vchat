let user = require("../models/user");
let jwt = require("jsonwebtoken");
const secret = "process.env.SECRET";
let cloudinary = require("../lib/cloudinary.js");

if (!secret) {
  throw new Error("JWT Secret not set in environment variables");
}

const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    let currUser = await user.findOne({ email });
    if (!currUser) {
      return res
        .status(400)
        .send({ message: "User not found try creating new account" });
    } else {
      let isCorrectPass = await currUser.matchPassword(password);
      if (isCorrectPass) {
        let payload = {
          // add all these so check auth can acces from token when refresh
          id: currUser._id,
          email: currUser.email,
          username: currUser.username,
          profilePic: currUser.profilePic,
          createdAt: currUser.createdAt,
        };

        let token = jwt.sign(payload, secret, { expiresIn: "1h" });
        res.cookie("token", token, {
          httpOnly: true,
          secure: false,
          sameSite: "Strict",
          maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
          _id: currUser._id,
          username: currUser.username,
          email: currUser.email,
          profilePic: currUser.profilePic,
          createdAt: currUser.createdAt,
        });
      } else {
        res.send({ message: "password is incorrect" });
      }
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

const signin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!email || !password || !username) {
      return res.status(400).send({ message: "all feilds required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .send({ message: "password must be greater than 6 letter" });
    }

    const existingUser = await user.findOne({ email });

    if (existingUser) {
      console.log("User already exists with email:", existingUser.email);
      return res.status(400).send({ message: "User already exists" });
    }

    const newUser = new user({
      username,
      email,
      password,
    });

    await newUser.save();

    let payload = {
      id: newUser._id,
      email: newUser.email,
      username: newUser.username,
      profilePic: newUser.profilePic,
      createdAt: newUser.createdAt,
    };

    let token = jwt.sign(payload, secret, { expiresIn: "1h" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      profilePic: newUser.profilePic,
      createdAt: newUser.createdAt,
    });
  } catch (e) {
    console.error("Error in login controller:", e);
    res.status(500).send({ message: "Server error" });
  }
};

const profile = async (req, res) => {
  try {
    const currUser = await user.findById(req.user.id);
    if (!currUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Profile found", user: currUser });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Server error" });
  }
};

const profileUpdate = async (req, res) => {
  try {
    let newimage = req.body.profilePic;
    let currUser = req.user.id;
    const existingUser = await user.findById(currUser);
    const uploadResponse = await cloudinary.uploader.upload(newimage);
    const updatedUser = await user
      .findByIdAndUpdate(
        currUser,
        {
          profilePic: uploadResponse.secure_url,
        },
        { new: true }
      )
      .select("-password");

    res.status(201).json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
      createdAt: updatedUser.createdAt,
    });
  } catch (e) {
    console.log("error while uplaoding ", e);
    return res
      .status(500)
      .json({ message: "Failed to upload image", error: e.message });
  }
};

const checkAuth = (req, res) => {
  try {
    const currUser = req.user; //geting from middle ware
    user
      .findById(currUser.id)
      .select("-password")
      .then((fullUser) => {
        if (!fullUser)
          return res.status(404).json({ message: "User not found" });
        res.status(200).json(fullUser);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Server error" });
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "Strict",
    });
    res.status(200).send({ message: "Logout successful" });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  login,
  signin,
  profile,
  profileUpdate,
  checkAuth,
  logout,
};
