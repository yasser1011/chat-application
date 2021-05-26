import React, { useEffect, useState, useContext } from "react";
import "./Conversation.css";
import image from "../../images/no-image.jpg";
import sound from "../../images/ios_notification.mp3";
import { IconButton, Menu, MenuItem, Modal, Badge } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { UserContext } from "../../Context/UserContext";
import { SocketContext } from "../../Context/SocketContext";
import LeaveConversationAlert from "./LeaveConversationAlert";
import ShowMembersModal from "./ShowMembersModal";
import InviteMemberModal from "./InviteMemberModal";
import KickMemberModal from "./KickMemberModal";

const ITEM_HEIGHT = 48;

const Conversation = ({
  setConversations,
  selectedConversationId,
  setSelectedConversationId,
  conversation,
  conversationName,
  conversationImage,
}) => {
  const { userData } = useContext(UserContext);
  const { socket } = useContext(SocketContext);

  const [friendUser, setFriendUser] = useState({});

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [convInfoModalOpen, setConvInfoModalOpen] = useState(false);
  const [leaveGroupAlertOpen, setLeaveGroupAlertOpen] = useState(false);
  const [inviteMemberModal, setInviteMemberOpen] = useState(false);
  const [kickMemberModalOpen, setKickMemberModalOpen] = useState(false);

  const [convNotificationInvisible, setConvNotificationInvisible] =
    useState(true);

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const openMembersModal = (e) => {
    e.stopPropagation();
    setAnchorEl(null);
    setConvInfoModalOpen(true);
  };

  const openLeaveConvAlert = (e) => {
    e.stopPropagation();
    setAnchorEl(null);
    setLeaveGroupAlertOpen(true);
  };

  const openInviteMemberModal = (e) => {
    e.stopPropagation();
    setAnchorEl(null);
    setInviteMemberOpen(true);
  };

  const openKickMemberModal = (e) => {
    e.stopPropagation();
    setAnchorEl(null);
    setKickMemberModalOpen(true);
  };

  useEffect(() => {
    if (conversationName == null || conversationImage == null) {
      const friend = conversation.members.find(
        (m) => m._id !== userData.user.id
      );
      setFriendUser(friend);
    }
  }, []);

  useEffect(() => {
    // console.log(conversationId);
    socket.on("chatNotification", (convId) => {
      if (convId !== selectedConversationId && convId === conversation._id) {
        setConvNotificationInvisible(false);
        const audio = new Audio(sound);
        audio.play();
      }
    });
    return () => socket.removeAllListeners("chatNotification");
  }, [selectedConversationId]);

  return (
    <div
      onClick={() => {
        setSelectedConversationId(conversation._id);
        setConvNotificationInvisible(true);
      }}
      className={
        conversation._id === selectedConversationId
          ? "conversationSelected"
          : "conversation"
      }
    >
      <div className="convInfo">
        <Badge
          color="secondary"
          overlap="circle"
          invisible={convNotificationInvisible}
        >
          <img
            className="conversationImg"
            src={
              conversationImage
                ? conversationImage
                : friendUser
                ? friendUser.profilePicture
                  ? friendUser.profilePicture
                  : image
                : image
            }
            alt=""
          />
        </Badge>
        <span className="conversationName">
          {conversationName ? conversationName : friendUser.displayName}
        </span>
      </div>
      <div>
        <IconButton
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={handleMenuClick}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="long-menu"
          anchorEl={anchorEl}
          keepMounted
          open={open}
          onClose={handleMenuClose}
          PaperProps={{
            style: {
              maxHeight: ITEM_HEIGHT * 4.5,
              width: "20ch",
            },
          }}
        >
          <MenuItem onClick={openMembersModal}>Show Members</MenuItem>
          <MenuItem onClick={openLeaveConvAlert}>Leave</MenuItem>
          <MenuItem onClick={openInviteMemberModal}>Invite Member</MenuItem>
          <MenuItem onClick={openKickMemberModal}>Kick Member</MenuItem>
        </Menu>
      </div>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        disableEnforceFocus
        className="convInfoWrapper"
        open={convInfoModalOpen}
        onClose={(event) => {
          setConvInfoModalOpen(false);
          event.stopPropagation();
        }}
      >
        <ShowMembersModal conversationId={conversation._id} />
      </Modal>
      <Modal
        className="convInfoWrapper"
        open={leaveGroupAlertOpen}
        disableEnforceFocus
        onClose={(event) => {
          event.stopPropagation();
          setLeaveGroupAlertOpen(false);
        }}
        aria-labelledby="alert-Modal-title"
        aria-describedby="alert-Modal-description"
      >
        <LeaveConversationAlert
          conversationId={conversation._id}
          setConversations={setConversations}
          setLeaveGroupAlertOpen={setLeaveGroupAlertOpen}
          selectedConversationId={selectedConversationId}
          setSelectedConversationId={setSelectedConversationId}
        />
      </Modal>
      <Modal
        className="convInfoWrapper"
        open={inviteMemberModal}
        disableEnforceFocus
        onClose={(event) => {
          event.stopPropagation();
          setInviteMemberOpen(false);
        }}
      >
        <InviteMemberModal
          conversationId={conversation._id}
          setInviteMemberOpen={setInviteMemberOpen}
        />
      </Modal>
      <Modal
        className="convInfoWrapper"
        open={kickMemberModalOpen}
        disableEnforceFocus
        onClose={(event) => {
          event.stopPropagation();
          setKickMemberModalOpen(false);
        }}
      >
        <KickMemberModal
          conversationId={conversation._id}
          setKickMemberModalOpen={setKickMemberModalOpen}
        />
      </Modal>
    </div>
  );
};

export default Conversation;
