const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    conversationId: { type: String },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    text: { type: String },
  },
  { timeStamps: true }
);

module.exports = mongoose.model("messages", messageSchema);
