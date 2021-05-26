import React, { useEffect, useState } from "react";
import "./Message.css";
import image from "../../images/no-image.jpg";

const Message = ({ msg, own }) => {
  const [isImage, setIsImage] = useState(false);

  useEffect(() => {
    if (msg.text.length < 100) return;
    setIsImage(true);
  }, []);

  return (
    <div className={own ? "message own" : "message"}>
      <div className="messageTop">
        <img
          className="senderImg"
          src={msg.sender.profilePicture ? msg.sender.profilePicture : image}
          alt=""
        />
        {isImage ? (
          <img className="messageImg" src={msg.text} alt=""></img>
        ) : (
          <p className="messageText">{msg.text}</p>
        )}
      </div>
      {/* <div className="messageBottom">1 Hour Ago</div> */}
    </div>
  );
};

export default Message;
