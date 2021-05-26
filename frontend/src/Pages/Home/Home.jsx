import React, { useContext, useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import "./Home.css";
import Navbar from "../../Components/Navbar/Navbar";
import { UserContext } from "../../Context/UserContext";
import Conversations from "../../Components/Conversations/Conversations";
import OnlineUsers from "../../Components/OnlineUsers/OnlineUsers";
import ConversationMessages from "../../Components/ConversationMessages/ConversationMessages";
import { SocketContext, socket } from "../../Context/SocketContext";

const Home = ({ history, location }) => {
  const { userData } = useContext(UserContext);
  const { socket } = useContext(SocketContext);

  const [selectedConversationId, setSelectedConversationId] = useState(null);

  useEffect(() => {
    if (userData.token) {
      socket.emit("login", userData.user);
    }

    return () => {
      if (userData.token) {
        socket.emit("logout", userData.user);
      }
    };
  }, []);

  if (!userData.token) {
    return (
      <Redirect
        to={{
          pathname: "/login",
          state: {
            from: location,
          },
        }}
      />
    );
  }

  return (
    // <SocketContext.Provider value={{ socket }}>
    <div>
      <Navbar history={history} />
      <div className="messenger">
        <div className="chatMenu">
          <Conversations
            selectedConversationId={selectedConversationId}
            setSelectedConversationId={setSelectedConversationId}
          />
        </div>
        <div className="chatBox">
          <div className="chatBoxWrapper">
            {selectedConversationId ? (
              <>
                <ConversationMessages conversationId={selectedConversationId} />
              </>
            ) : (
              <h3>Select a Conversation</h3>
            )}
          </div>
        </div>
        <div className="chatOnline">
          <div className="chatOnlineWrapper">
            <OnlineUsers />
          </div>
        </div>
      </div>
    </div>
    // </SocketContext.Provider>
  );
};

export default Home;
