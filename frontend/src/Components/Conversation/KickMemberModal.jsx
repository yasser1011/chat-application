import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import image from "../../images/no-image.jpg";
import { Button, CircularProgress } from "@material-ui/core";
import { apiUrl } from "../../apiUrl";
import { SocketContext } from "../../Context/SocketContext";
import { UserContext } from "../../Context/UserContext";

const KickMemberModal = React.forwardRef(
  ({ conversationId, setKickMemberModalOpen }, ref) => {
    const { userData } = useContext(UserContext);
    const { socket } = useContext(SocketContext);

    const [conversationLoading, setConversationLoading] = useState(true);
    const [membersExceptUser, setMembersExceptUser] = useState([]);

    const [kickMemberLoading, setKickMemberLoading] = useState(false);

    const fetchConversation = async () => {
      try {
        const convRes = await axios.get(
          `${apiUrl}/conversations/getConvInfo/${conversationId}`,
          {
            headers: { "x-auth-token": userData.token },
          }
        );
        setMembersExceptUser(
          convRes.data.members.filter((m) => m._id !== userData.user.id)
        );
        setConversationLoading(false);
      } catch (error) {
        setConversationLoading(false);
      }
    };

    const kickMember = async (user) => {
      setKickMemberLoading(true);
      try {
        const kickingMemberRes = await axios.post(
          `${apiUrl}/conversations/kickMember/${conversationId}`,
          { kickedMember: user._id },
          {
            headers: { "x-auth-token": userData.token },
          }
        );
        socket.emit("kickMember", { conversationId, userId: user._id });
        setKickMemberLoading(false);
        setKickMemberModalOpen(false);
      } catch (error) {
        setKickMemberLoading(false);
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
      <div className="modalPaper" onClick={(e) => e.stopPropagation()}>
        <h1 style={{ textAlign: "center" }}>Members</h1>
        {membersExceptUser.map((member) => {
          return (
            <div key={member._id} className="ModalContent">
              <div className="userInfo">
                <img
                  className="conversationImg"
                  src={member.profilePicture ? member.profilePicture : image}
                  alt=""
                />
                <span className="conversationName">
                  {member.displayName} @ {member.uniqueName}
                </span>
              </div>
              <div>
                <Button
                  onClick={() => kickMember(member)}
                  disabled={kickMemberLoading}
                  variant="contained"
                  color="secondary"
                >
                  {kickMemberLoading ? <CircularProgress /> : "Kick"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

export default KickMemberModal;
