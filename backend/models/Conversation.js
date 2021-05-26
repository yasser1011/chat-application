const mongoose = require("mongoose");

const conversationSchema = mongoose.Schema(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    name: { type: String, default: "" },
    photo: { type: String, default: "" },
  },
  { timeStamps: true }
);

module.exports = mongoose.model("conversations", conversationSchema);
