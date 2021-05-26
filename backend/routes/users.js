const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const { auth } = require("../midllewares/auth");
const Conversation = require("../models/Conversation");

router.post("/register", async (req, res) => {
  const { displayName, uniqueName, password, profilePicture } = req.body;
  if (!displayName || !uniqueName || !password) {
    return res.status(400).json({ msg: "enter full data" });
  }
  const existingUser = await User.findOne({ uniqueName });
  if (existingUser)
    return res
      .status(400)
      .json({ msg: "Unique Name already exist choose another one" });

  //hashing password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  //create new user
  const newUser = new User({
    displayName,
    uniqueName,
    password: hashedPassword,
    profilePicture,
  });
  //save user
  try {
    const savedUser = await newUser.save();
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET);
    res.send({
      user: {
        id: savedUser._id,
        displayName: savedUser.displayName,
        profilePicture: savedUser.profilePicture,
        uniqueName: savedUser.uniqueName,
      },
      token,
    });
  } catch (e) {
    res.json({ msg: e });
  }
});

router.post("/login", async (req, res) => {
  const { uniqueName, password } = req.body;
  if (!uniqueName || !password)
    return res.status(400).json({ msg: "enter fields" });

  const existingUser = await User.findOne({ uniqueName });
  if (!existingUser)
    return res
      .status(400)
      .json({ msg: "user doesnt exist with this username" });

  //checking if password is correct
  const validPass = await bcrypt.compare(password, existingUser.password);
  if (!validPass) return res.status(400).send({ msg: "wrong password" });

  const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET);
  res.json({
    token,
    user: {
      id: existingUser._id,
      displayName: existingUser.displayName,
      profilePicture: existingUser.profilePicture,
      uniqueName: existingUser.uniqueName,
    },
  });
});

router.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    // console.log(token);
    if (!token) return res.json(false);
    //get user id from token
    const verified = jwt.verify(token, process.env.JWT_SECRET); //if it doesnt verify it goes to the catch
    // console.log(verified);
    if (!verified) return res.json(false);
    //find user from db by token id
    const user = await User.findById(verified.id);
    if (!user) return res.json(false);
    res.json(true);
  } catch (e) {
    console.log("err");
    console.log(e.message);
    // res.status(500).json({ msg: e.message });
    return res.json(false);
  }
});

router.get("/getUser", auth, async (req, res) => {
  const user = await User.findById(req.user);
  if (!user) return res.send("token verification failed");
  res.json({
    user: {
      id: user._id,
      displayName: user.displayName,
      uniqueName: user.uniqueName,
      profilePicture: user.profilePicture,
    },
  });
});

router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    res.json({
      user: {
        id: user._id,
        displayName: user.displayName,
        uniqueName: user.uniqueName,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    return res.status(503).json({ msg: "User Not Found" });
  }
});

router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    return res.status(503).json({ msg: "error in db" });
  }
});

router.get("/getUsersNotInConvo/:conversationId", async (req, res) => {
  try {
    const users = await User.find();
    const conversation = await Conversation.findById(req.params.conversationId);
    const filteredUsers = users.filter(
      (user) => !conversation.members.includes(user._id)
    );

    res.send(filteredUsers);
  } catch (error) {
    // console.log(error);
    return res.status(400).json({ msg: "no conversation with that id" });
  }
});

module.exports = router;
