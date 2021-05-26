const express = require("express");
const router = express.Router();
const { auth } = require("../midllewares/auth");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

//save a conversation
router.post("/", auth, async (req, res) => {
  const { members, name, photo } = req.body;
  if (!members || members.length <= 1)
    return res.status(400).json({ msg: "not enough members specified" });

  if (members.length > 2 && !name)
    return res.status(400).json({ msg: "Please Enter Conversation Name" });
  const newConversation = new Conversation({ members, name, photo });
  try {
    const savedConversation = await newConversation.save();
    const populatedConv = await savedConversation
      .populate({
        path: "members",
        select: ["profilePicture", "_id", "displayName", "uniqueName"],
      })
      .execPopulate();
    res.send(populatedConv);
  } catch (error) {
    return res.status(503).json({ msg: "error in DB" });
  }
});

//get conversations of a user
router.get("/:userId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
  } catch (error) {
    return res.status(400).json({ msg: "no user with that ID" });
  }

  try {
    const userConversations = await Conversation.find({
      // members: { $in: [req.params.userId] },
      members: { $in: [req.user] },
    }).populate({
      path: "members",
      select: ["profilePicture", "_id", "displayName", "uniqueName"],
    });
    res.send(userConversations);
  } catch (error) {
    return res.status(503).json({ msg: "error in DB" });
  }
});

router.get("/getConvInfo/:conversationId", async (req, res) => {
  try {
    const conversation = await Conversation.findById(
      req.params.conversationId
    ).populate({
      path: "members",
      select: ["profilePicture", "_id", "displayName", "uniqueName"],
    });
    res.send(conversation);
  } catch (error) {
    // console.log(error);
    return res.status(400).json({ msg: "no conversation with that id" });
  }
});

router.get("/leaveConversation/:conversationId", auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (conversation.members.length === 1) {
      await Message.deleteMany({ conversationId: conversation._id });
      await conversation.delete();
      return res.status(200).json({ msg: "conversation deleted" });
    }
    if (conversation.members.includes(req.user)) {
      const filteredMembers = conversation.members.filter(
        (m) => m.toString() != req.user.toString()
      );
      const updatedConversation = await conversation.updateOne({
        members: filteredMembers,
      });
      return res.send({ msg: "conversation updated" });
    } else {
      return res.status(400).json({ msg: "user is not in conversation" });
    }
  } catch (error) {
    // console.log(error);
    return res.status(400).json({ msg: "no conversation with that id" });
  }
});

router.post("/addMember/:conversationId", async (req, res) => {
  const { newMember } = req.body;

  try {
    const user = await User.findById(newMember);
  } catch (error) {
    return res.status(400).json({ msg: "no user with that ID" });
  }

  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (conversation.members.includes(newMember)) {
      return res.status(400).json({ msg: "user already in conversation" });
    }
    const newMembers = [...conversation.members, newMember];
    // const updatedConversation = await conversation.updateOne({
    //   members: newMembers,
    // });
    const updatedConversation = await Conversation.findByIdAndUpdate(
      req.params.conversationId,
      { $set: { members: newMembers } },
      { new: true }
    );
    const populatedConv = await updatedConversation
      .populate({
        path: "members",
        select: ["profilePicture", "_id", "displayName", "uniqueName"],
      })
      .execPopulate();
    return res.send(populatedConv);
  } catch (error) {
    // console.log(error);
    return res.status(400).json({ msg: "no conversation with that id" });
  }
});

router.post("/kickMember/:conversationId", async (req, res) => {
  const { kickedMember } = req.body;

  try {
    const user = await User.findById(kickedMember);
  } catch (error) {
    return res.status(400).json({ msg: "no user with that ID" });
  }

  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation.members.includes(kickedMember)) {
      return res.status(400).json({ msg: "user not in the conversation" });
    }
    const newMembers = conversation.members.filter(
      (m) => m.toString() != kickedMember.toString()
    );
    const updatedConversation = await conversation.updateOne({
      members: newMembers,
    });
    return res.send({ msg: "member kicked" });
  } catch (error) {
    // console.log(error);
    return res.status(400).json({ msg: "no conversation with that id" });
  }
});

module.exports = router;
