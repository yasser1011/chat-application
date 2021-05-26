import React, { useContext } from "react";
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
} from "@material-ui/core";
import axios from "axios";
import { apiUrl } from "../../apiUrl";
import { UserContext } from "../../Context/UserContext";

const LeaveConversationAlert = React.forwardRef(
  (
    {
      setConversations,
      conversationId,
      setLeaveGroupAlertOpen,
      selectedConversationId,
      setSelectedConversationId,
    },
    ref
  ) => {
    const { userData } = useContext(UserContext);

    const leaveConversation = async (e) => {
      e.stopPropagation();
      try {
        const leaveRes = await axios.get(
          `${apiUrl}/conversations/leaveConversation/${conversationId}`,
          {
            headers: { "x-auth-token": userData.token },
          }
        );
        setConversations((currConvs) => {
          return currConvs.filter((c) => c._id !== conversationId);
        });
        setLeaveGroupAlertOpen(false);
        if (conversationId === selectedConversationId) {
          setSelectedConversationId(null);
        }
      } catch (error) {
        console.log(error);
      }
    };

    return (
      <div className="leaveConvPaper">
        <DialogTitle id="alert-dialog-title">
          {"Leave Conversation"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are You Sure You Want To Leave The Conversation
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={(e) => {
              setLeaveGroupAlertOpen(false);
              e.stopPropagation();
            }}
            color="primary"
          >
            No
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={leaveConversation}
          >
            Yes
          </Button>
        </DialogActions>
      </div>
    );
  }
);

export default LeaveConversationAlert;
