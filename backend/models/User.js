const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  displayName: { type: String, required: true },
  uniqueName: { type: String, required: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: "" },
  createdAt: { type: Date, default: new Date() },
});

module.exports = mongoose.model("users", userSchema);
