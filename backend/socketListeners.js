module.exports = function (io) {
  let onlineUsers = [];

  io.on("connection", (socket) => {
    // console.log("a user connected", socket.id);

    //adding user when loggin in
    socket.on("login", (user) => {
      user.socketId = socket.id;
      onlineUsers.push(user);
      io.emit("loggedUsers", onlineUsers);
      //   console.log(onlineUsers);
    });

    //removing user when logging out
    socket.on("logout", (user) => {
      onlineUsers = onlineUsers.filter((u) => u.id !== user.id);
      //   console.log(onlineUsers);
      io.emit("loggedUsers", onlineUsers);
    });

    //joining user's conversations and his userId
    socket.on("joinConversations", (conversations) => {
      //   console.log("conversations", conversations);
      socket.join(conversations);
    });

    //sending a chat message and a notification
    socket.on("chatMessage", (message) => {
      socket.to(message.conversationId).emit("chatMessage", message);
      socket
        .to(message.conversationId)
        .emit("chatNotification", message.conversationId);
    });

    //creating a new conversation and sending it to all the members
    socket.on("newConversation", (conversation) => {
      const membersIds = [];
      conversation.members.forEach((member) => {
        membersIds.push(member._id);
      });
      // console.log(membersIds);
      socket.to(membersIds).emit("newConversation", conversation);
    });

    //inviting a user to conversation and sending it to him
    socket.on("addMember", (data) => {
      socket.to(data.userId).emit("newConversation", data.conversation);
    });

    //sending conversationId to the removed user so it get filtered out from his convos
    socket.on("kickMember", (data) => {
      // console.log(data);
      socket.to(data.userId).emit("kickMember", data.conversationId);
    });

    socket.on("disconnect", () => {
      onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);
      io.emit("loggedUsers", onlineUsers);
      // console.log(onlineUsers);
      // console.log("user disconnected");
    });
  });
};
