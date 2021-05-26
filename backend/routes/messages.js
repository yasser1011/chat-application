const express = require("express");
const router = express.Router();
const { auth } = require("../midllewares/auth");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

//save a message
router.post("/", auth, async (req, res) => {
  const { conversationId, sender, text } = req.body;
  if (!conversationId || !sender || !text)
    return res.status(400).json({ msg: "bad message" });

  let conversation;
  let user;
  try {
    conversation = await Conversation.findById(conversationId);
  } catch (error) {
    return res.status(400).json({ msg: "no conversation with that sender ID" });
  }

  try {
    user = await User.findById(sender);
  } catch (error) {
    return res.status(400).json({ msg: "no user with that ID" });
  }

  if (!conversation.members.some((m) => m.toString() === user._id.toString())) {
    return res
      .status(400)
      .json({ msg: "user dosent belong to that conversation" });
  }

  const newMessage = new Message({ conversationId, sender, text });
  try {
    const savedMessage = await newMessage.save();
    const populatedMessage = await savedMessage
      .populate({
        path: "sender",
        select: ["profilePicture", "_id"],
      })
      .execPopulate();
    res.send(populatedMessage);
  } catch (error) {
    return res.status(503).json({ msg: "error in DB" });
  }
});

//get messages of a conversation
router.get("/:conversationId", auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
  } catch (error) {
    return res.status(400).json({ msg: "no conversation with that ID" });
  }

  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    }).populate({
      path: "sender",
      select: ["profilePicture", "_id"],
    });
    res.send(messages);
  } catch (error) {
    return res.status(400).json({ msg: "error in db" });
  }
});

module.exports = router;
