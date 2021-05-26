import { CircularProgress } from "@material-ui/core";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { apiUrl } from "../../apiUrl";
import { UserContext } from "../../Context/UserContext";
import image from "../../images/no-image.jpg";

//members change so need to fetch most updated members from db
//instead of sending updated whole conversation to socket io server with updated members
const ShowMembersModal = React.forwardRef(({ conversationId }, ref) => {
  const { userData } = useContext(UserContext);
  const [conversation, setConversation] = useState({});
  const [conversationLoading, setConversationLoading] = useState(true);

  const fetchConversation = async () => {
    try {
      const convRes = await axios.get(
        `${apiUrl}/conversations/getConvInfo/${conversationId}`,
        {
          headers: { "x-auth-token": userData.token },
        }
      );
      setConversation(convRes.data);
      setConversationLoading(false);
    } catch (error) {
      setConversationLoading(false);
    }
  };

  useEffect(() => {
    fetchConversation();
  }, []);

  if (conversationLoading) {
    return (
      <div className="modalPaper">
        {/* <h1 style={{ textAlign: "center" }}>Loading</h1> */}
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="modalPaper">
      <h1 style={{ textAlign: "center" }}>Members</h1>
      {conversation.members.map((member) => {
        return (
          <div key={member._id} className="userInfo">
            <img
              className="conversationImg"
              src={member.profilePicture ? member.profilePicture : image}
              alt=""
            />
            <span className="conversationName">
              {member.displayName} @ {member.uniqueName}
            </span>
          </div>
        );
      })}
    </div>
  );
});

export default ShowMembersModal;
