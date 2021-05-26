import React, { useContext, useEffect, useRef, useState } from "react";
import Message from "../Message/Message";
import axios from "axios";
import { apiUrl } from "../../apiUrl";
import "./ConversationMessages.css";
import { UserContext } from "../../Context/UserContext";
import MessageInput from "./MessageInput";
import { SocketContext } from "../../Context/SocketContext";
import { CircularProgress } from "@material-ui/core";

const ConversationMessages = ({ conversationId }) => {
  const { userData } = useContext(UserContext);
  const { socket } = useContext(SocketContext);

  const [conversationMsgs, setConversationMsgs] = useState([]);
  const [msgsLoading, setMsgsLoading] = useState(true);

  const scrollRef = useRef();

  const fetchConversationMsgs = async () => {
    try {
      const msgsRes = await axios.get(`${apiUrl}/messages/${conversationId}`, {
        headers: { "x-auth-token": userData.token },
      });
      setConversationMsgs(msgsRes.data);
      setMsgsLoading(false);
    } catch (error) {
      console.log(error);
      setMsgsLoading(false);
    }
  };

  //fetching conversation messages from db
  useEffect(() => {
    fetchConversationMsgs();
  }, [conversationId]);

  //for scrolling
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMsgs, msgsLoading]);

  //socketio catching message, check to see if msg from socket same as currenct conv id
  useEffect(() => {
    // console.log(conversationId);
    socket.on("chatMessage", (msg) => {
      if (msg.conversationId === conversationId) {
        // console.log("conversationId", conversationId);
        // console.log(msg.text, msg.conversationId);
        setConversationMsgs((currMsgs) => {
          return [...currMsgs, msg];
        });
      }
    });
    //need to remove listener when convId change cuz if it's
    //equal once it will always listen to the event even after
    //convId got changed
    return () => socket.removeAllListeners("chatMessage");
  }, [conversationId, socket]);

  if (msgsLoading) {
    return (
      <div className="chatBoxTop">
        {/* <h3>Loading</h3> */}
        <CircularProgress />
      </div>
    );
  }

  return (
    <>
      <div className="chatBoxTop">
        {conversationMsgs.map((msg) => {
          return (
            <div ref={scrollRef} key={msg._id}>
              <Message msg={msg} own={msg.sender._id === userData.user.id} />
            </div>
          );
        })}
        {/* <Message />
      <Message own={true} />
      <Message />
      <Message />
      <Message />
      <Message />
      <Message />
      <Message />
      <Message />
      <Message />
      <Message /> */}
      </div>
      <div className="chatBoxBottom">
        <MessageInput
          conversationId={conversationId}
          setConversationMsgs={setConversationMsgs}
        />
      </div>
    </>
  );
};

export default ConversationMessages;
