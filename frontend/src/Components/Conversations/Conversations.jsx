import React, { useContext, useEffect, useState } from "react";
import { Button, CircularProgress } from "@material-ui/core";
import Modal from "@material-ui/core/Modal";
import Conversation from "../Conversation/Conversation";
import AddConversationModal from "./AddConversationModal";
import { UserContext } from "../../Context/UserContext";
import axios from "axios";
import { apiUrl } from "../../apiUrl";
import "./Conversations.css";
import "../../Pages/Home/Home.css";
import { SocketContext } from "../../Context/SocketContext";

const Conversations = ({
  selectedConversationId,
  setSelectedConversationId,
}) => {
  const { userData } = useContext(UserContext);
  const { socket } = useContext(SocketContext);

  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [addNewConvModal, setAddNewConvModal] = useState(false);

  const fetchConversations = async () => {
    try {
      const conversationsRes = await axios.get(
        `${apiUrl}/conversations/${userData.user.id}`,
        {
          headers: { "x-auth-token": userData.token },
        }
      );
      setConversations(conversationsRes.data);
      setConversationsLoading(false);
    } catch (error) {
      console.log(error);
      setConversationsLoading(false);
    }
  };

  //getting user conversations from db
  useEffect(() => {
    fetchConversations();
  }, []);

  //joining user conversations
  useEffect(() => {
    if (conversations.length > 0 && !conversationsLoading) {
      let conversationsIds = [];
      conversations.forEach((c) => {
        conversationsIds.push(c._id);
      });
      socket.emit("joinConversations", [...conversationsIds, userData.user.id]);
    } else if (conversations.length === 0 && !conversationsLoading) {
      socket.emit("joinConversations", userData.user.id);
    }
  }, [conversations, conversationsLoading]);

  useEffect(() => {
    socket.on("newConversation", (conversation) => {
      // console.log(conversation);
      //send that conversation Id to the joinConversation event
      //no need to send conversation to the join event since it's sent
      //automatically in the above useEffect cuz conversations changed
      setConversations((currConvs) => {
        return [...currConvs, conversation];
      });
    });
  }, []);

  useEffect(() => {
    // console.log(conversationId);
    socket.on("kickMember", (conversationId) => {
      setConversations((currConvs) => {
        return currConvs.filter((c) => c._id !== conversationId);
      });
      if (conversationId === selectedConversationId) {
        setSelectedConversationId(null);
      }
    });
    //need to remove listener when convId change cuz if it's
    //equal once it will always listen to the event even after
    //convId got changed
    return () => socket.removeAllListeners("kickMember");
  }, [selectedConversationId, socket]);

  if (conversationsLoading) {
    return (
      <div className="chatMenuWrapper">
        {/* <h2>Loading</h2> */}
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="chatMenuWrapper">
      <Button
        onClick={() => setAddNewConvModal(true)}
        variant="contained"
        color="primary"
      >
        Add New
      </Button>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        disableEnforceFocus
        className="modalWrapper"
        open={addNewConvModal}
        onClose={() => setAddNewConvModal(false)}
      >
        <AddConversationModal
          setConversations={setConversations}
          setAddNewConvModal={setAddNewConvModal}
        />
      </Modal>
      <h2>Conversations</h2>
      {conversations.map((c) => {
        return (
          <Conversation
            key={c._id}
            setConversations={setConversations}
            selectedConversationId={selectedConversationId}
            setSelectedConversationId={setSelectedConversationId}
            conversation={c}
            conversationName={c.name ? c.name : null}
            conversationImage={c.photo ? c.photo : null}
          />
        );
      })}
    </div>
  );
};

export default Conversations;
