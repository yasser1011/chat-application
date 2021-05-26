import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../Context/UserContext";
import image from "../../images/no-image.jpg";
import { apiUrl } from "../../apiUrl";
import axios from "axios";
import { TextField, Button, CircularProgress } from "@material-ui/core";
import "./Conversations.css";

const Users = React.forwardRef(
  ({ setMemberNames, setConversation, memberNames }, ref) => {
    const { userData } = useContext(UserContext);

    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [searchUser, setSearchUser] = useState("");

    const fetchUsers = async () => {
      try {
        const usersRes = await axios.get(`${apiUrl}/users`);
        const filteredUsers = usersRes.data.filter(
          (u) => u._id !== userData.user.id
        );
        setUsers(filteredUsers);
        setFilteredUsers(filteredUsers);
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

    const addUser = (user) => {
      setMemberNames((currMembers) => {
        return [
          ...currMembers,
          {
            displayName: user.displayName,
            uniqueName: user.uniqueName,
            _id: user._id,
          },
        ];
      });
      setConversation((currConversation) => {
        return {
          ...currConversation,
          members: [...currConversation.members, user._id],
        };
      });
    };

    const checkMember = (user) => {
      const member = memberNames.find((m) => m.uniqueName === user.uniqueName);
      if (member) return true;
      else return false;
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
      <div>
        <TextField
          fullWidth
          label="Search User"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
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
                <span className="conversationName">{`${u.displayName} @${u.uniqueName}`}</span>
              </div>
              <div>
                <Button
                  onClick={() => addUser(u)}
                  disabled={checkMember(u)}
                  variant="contained"
                  color="primary"
                >
                  Add
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

export default Users;
