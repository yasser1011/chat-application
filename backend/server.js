const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const app = express();
const server = http.createServer(app);
const initSocketListeners = require("./socketListeners");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const usersRoute = require("./routes/users");
const conversationsRoute = require("./routes/conversations");
const messagesRoute = require("./routes/messages");

const io = socketio(server, {
  //for socketio 3.0 version fix cors problem
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json({ limit: "30MB" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

app.use("/users", usersRoute);
app.use("/conversations", conversationsRoute);
app.use("/messages", messagesRoute);

app.get("/", (req, res) => {
  res.send("Home route");
});

mongoose.connect(
  process.env.DB_CONNECTION,
  { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true },
  () => {
    console.log("connected to db");
  }
);

initSocketListeners(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
