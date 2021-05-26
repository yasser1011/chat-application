import React, { useState, useEffect, useContext } from "react";
import { TextField, Button, CircularProgress } from "@material-ui/core";
import image from "../../images/no-image.jpg";
import axios from "axios";
import { apiUrl } from "../../apiUrl";
import { UserContext } from "../../Context/UserContext";
import { SocketContext } from "../../Context/SocketContext";

const InviteMemberModal = React.forwardRef(
  ({ conversationId, setInviteMemberOpen }, ref) => {
    const { userData } = useContext(UserContext);
    const { socket } = useContext(SocketContext);

    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [searchUser, setSearchUser] = useState("");

    const [inviteUserLoading, setInviteUserLoading] = useState(false);

    const fetchUsers = async () => {
      try {
        const usersRes = await axios.get(
          `${apiUrl}/users/getUsersNotInConvo/${conversationId}`
        );
        setUsers(usersRes.data);
        setFilteredUsers(usersRes.data);
        setUsersLoading(false);
      } catch (error) {
        setUsersLoading(false);
        console.log(error);
      }
    };

    const handleUsersFilter = () => {
      if (searchUser === "") {
        setFilteredUsers(users);
      } else {
        setFilteredUsers(
          users.filter((u) => u.displayName.includes(searchUser))
        );
      }
    };

    const inviteUser = async (user) => {
      setInviteUserLoading(true);
      try {
        const addingMemberRes = await axios.post(
          `${apiUrl}/conversations/addMember/${conversationId}`,
          { newMember: user._id },
          {
            headers: { "x-auth-token": userData.token },
          }
        );
        socket.emit("addMember", {
          conversation: addingMemberRes.data,
          userId: user._id,
        });
        setInviteUserLoading(false);
        setInviteMemberOpen(false);
      } catch (error) {
        setInviteUserLoading(false);
      }
    };

    useEffect(() => {
      fetchUsers();
    }, []);

    useEffect(() => {
      handleUsersFilter();
    }, [searchUser]);

    if (usersLoading) {
      return (
        <div>
          {/* <h2>Loading</h2> */}
          <CircularProgress />
        </div>
      );
    }
    return (
      <div className="modalPaper" onClick={(e) => e.stopPropagation()}>
        <h1>Invite Member</h1>
        <div>
          <TextField
            fullWidth
            onFocus={(e) => e.stopPropagation()}
            label="Search User"
            value={searchUser}
            onChange={(e) => {
              e.stopPropagation();
              setSearchUser(e.target.value);
            }}
          />
          {filteredUsers.map((u) => {
            return (
              <div key={u._id} className="ModalContent">
                <div className="userInfo">
                  <img
                    className="conversationImg"
                    src={u.profilePicture ? u.profilePicture : image}
                    alt=""
                  />
                  <span className="conversationName">{u.displayName}</span>
                </div>
                <div>
                  <Button
                    onClick={() => inviteUser(u)}
                    disabled={inviteUserLoading}
                    variant="contained"
                    color="primary"
                  >
                    {inviteUserLoading ? "Loading" : "Add"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

export default InviteMemberModal;
