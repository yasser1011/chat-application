import React, { useContext, useState } from "react";
import { Button, CircularProgress } from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";
import EmojiEmotionsIcon from "@material-ui/icons/EmojiEmotions";
import "./ConversationMessages.css";
import axios from "axios";
import FileBase from "react-file-base64";
import Picker from "emoji-picker-react";
import { apiUrl } from "../../apiUrl";
import { UserContext } from "../../Context/UserContext";
import { SocketContext } from "../../Context/SocketContext";

const MessageInput = ({ conversationId, setConversationMsgs }) => {
  const { userData } = useContext(UserContext);
  const { socket } = useContext(SocketContext);

  const [msgText, setMsgText] = useState("");
  const [msgImage, setMsgImage] = useState("");
  const [chosenEmoji, setChosenEmoji] = useState(null);
  const [audioRecord, setAudioRecord] = useState(null);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [saveMsgLoading, setSaveMsgLoading] = useState(false);

  const submitMessage = async () => {
    setSaveMsgLoading(true);
    const msgSubmitted = {
      conversationId,
      sender: userData.user.id,
      text: msgText || msgImage,
    };
    try {
      const msgRes = await axios.post(`${apiUrl}/messages`, msgSubmitted, {
        headers: { "x-auth-token": userData.token },
      });
      setConversationMsgs((oldMsgs) => {
        return [...oldMsgs, msgRes.data];
      });

      //socket emitting
      socket.emit("chatMessage", msgRes.data);

      setSaveMsgLoading(false);
      setMsgText("");
      setMsgImage("");
    } catch (error) {
      console.log(error);
      setSaveMsgLoading(false);
    }
  };

  return (
    <>
      <div>
        <div className="inputWrapper">
          <textarea
            maxLength="99"
            disabled={msgImage}
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            className="chatMessageInput"
            cols="60"
            rows="10"
            placeholder="write something"
          ></textarea>
          <EmojiEmotionsIcon
            style={{ color: "blue" }}
            onClick={() => setEmojiPickerVisible(!emojiPickerVisible)}
          />
          {emojiPickerVisible ? (
            <Picker
              onEmojiClick={(e, emojiObject) => {
                setChosenEmoji(emojiObject);
                setMsgText(`${msgText}${emojiObject.emoji}`);
              }}
            />
          ) : null}
        </div>
        <FileBase
          type="file"
          multiple={false}
          onDone={({ base64 }) => {
            setMsgImage(base64);
            setMsgText("");
          }}
        />
        <Button
          size="small"
          variant="contained"
          color="secondary"
          onClick={() => setMsgImage("")}
        >
          clear
        </Button>
      </div>
      <Button
        onClick={submitMessage}
        disabled={saveMsgLoading || (!msgText && !msgImage)}
        variant="contained"
        color="primary"
        endIcon={<SendIcon />}
      >
        {saveMsgLoading ? <CircularProgress /> : "Send"}
      </Button>
    </>
  );
};

export default MessageInput;
