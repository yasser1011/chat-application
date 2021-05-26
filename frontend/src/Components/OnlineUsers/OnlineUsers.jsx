import React, { useContext, useEffect, useState } from "react";
import "./OnlineUsers.css";
import image from "../../images/no-image.jpg";
import { SocketContext } from "../../Context/SocketContext";
import { UserContext } from "../../Context/UserContext";

const OnlineUsers = () => {
  const { userData } = useContext(UserContext);
  const { socket } = useContext(SocketContext);

  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    socket.on("loggedUsers", (users) => {
      // console.log(users);
      setOnlineUsers(users.filter((u) => u.id !== userData.user.id));
    });
  }, []);

  return (
    <div className="onlineUsers">
      <h2>Online Users</h2>
      {onlineUsers.map((user) => {
        return (
          <div key={user.id} className="onlineUser">
            <div className="imgContainer">
              <img
                className="onlineUserImg"
                src={user.profilePicture ? user.profilePicture : image}
                alt=""
              />
              <div className="onlineBadge"></div>
            </div>
            <span className="onlineUsername">{`${user.displayName} @${user.uniqueName}`}</span>
          </div>
        );
      })}
    </div>
  );
};

export default OnlineUsers;
