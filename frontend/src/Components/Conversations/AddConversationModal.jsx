import React, { useContext, useState } from "react";
import CloseIcon from "@material-ui/icons/Close";
import { TextField, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Alert from "@material-ui/lab/Alert";
import FileBase from "react-file-base64";
import Users from "./Users";
import axios from "axios";
import { apiUrl } from "../../apiUrl";
import { UserContext } from "../../Context/UserContext";
import { SocketContext } from "../../Context/SocketContext";

const useStyles = makeStyles((theme) => ({
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    maxHeight: "550px",
    width: "550px",
    overflowY: "scroll",
    overflowX: "scroll",
  },
  members: {
    backgroundColor: "grey",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    width: "fit-content",
    marginBottom: "10px",
    marginTop: "10px",
    height: "50px",
    borderRadius: "25px",
  },
  memberBlock: {
    position: "relative",
    backgroundColor: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "70px",
    height: "30px",
    borderRadius: "25px",
    margin: "10px",
  },
  closeIcon: {
    position: "absolute",
    top: "-5px",
    right: "0px",
    cursor: "pointer",
    width: "20px",
  },
  fileInput: {
    width: "97%",
    margin: "10px 0",
    display: "flex",
    marginTop: "25px",
  },
  submit: {
    backgroundColor: "#8B008B",
    color: "white",
  },
}));
const AddConversationModal = React.forwardRef((props, ref) => {
  const classes = useStyles();
  const { userData } = useContext(UserContext);
  const { socket } = useContext(SocketContext);

  const [conversation, setConversation] = useState({
    members: [userData.user.id],
    name: "",
    photo: "",
  });
  const [memberNames, setMemberNames] = useState([]);
  const [saveConvLoading, setSaveConvLoading] = useState(false);
  const [notifMsg, setNotifMsg] = useState("");

  const filterMember = (member) => {
    setMemberNames((currMembers) => {
      return currMembers.filter((m) => m.uniqueName !== member.uniqueName);
    });
    setConversation((currConv) => {
      return {
        ...currConv,
        members: currConv.members.filter((m) => m !== member._id),
      };
    });
  };

  const handleSubmit = async () => {
    setSaveConvLoading(true);
    try {
      const convRes = await axios.post(
        `${apiUrl}/conversations`,
        conversation,
        {
          headers: { "x-auth-token": userData.token },
        }
      );
      props.setConversations((currConvs) => {
        return [...currConvs, convRes.data];
      });

      //send new conversation to socketio for all members
      socket.emit("newConversation", convRes.data);

      setSaveConvLoading(false);
      props.setAddNewConvModal(false);
    } catch (error) {
      console.log(error);
      setNotifMsg(error.response.data.msg);
      setTimeout(() => {
        setNotifMsg("");
      }, 1500);
      setSaveConvLoading(false);
    }
  };

  return (
    <div className={classes.paper}>
      {notifMsg ? <Alert severity="error">{notifMsg}</Alert> : null}
      <TextField
        label="Conversation Name"
        value={conversation.name}
        onChange={(e) =>
          setConversation((currConv) => {
            return {
              ...currConv,
              name: e.target.value,
            };
          })
        }
      />
      <div className={classes.fileInput}>
        <span style={{ paddingRight: "10px", fontWeight: "bold" }}>
          Conversation Pic:
        </span>
        <FileBase
          type="file"
          multiple={false}
          onDone={({ base64 }) =>
            setConversation((currConv) => {
              return {
                ...currConv,
                photo: base64,
              };
            })
          }
        />
      </div>
      <h4>Members</h4>
      <div className={classes.members}>
        {memberNames.map((member) => {
          return (
            <div key={member.uniqueName} className={classes.memberBlock}>
              <h5>{member.displayName}</h5>
              <CloseIcon
                onClick={() => filterMember(member)}
                className={classes.closeIcon}
              />
            </div>
          );
        })}
      </div>
      <Button
        disabled={saveConvLoading}
        onClick={handleSubmit}
        variant="contained"
        className={classes.submit}
      >
        Submit
      </Button>
      <Users
        {...props}
        ref={ref}
        setMemberNames={setMemberNames}
        setConversation={setConversation}
        memberNames={memberNames}
      />
    </div>
  );
});

export default AddConversationModal;
