import React, { useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import image from "../../images/no-image.jpg";
import Button from "@material-ui/core/Button";
import { UserContext } from "../../Context/UserContext";

const useStyles = makeStyles((theme) => ({
  root: {
    // flexGrow: 1,
  },
  flex: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    // flexGrow: 1,
  },
  image: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    objectFit: "cover",
  },
}));

export default function Navbar({ history }) {
  const { userData, setUserData } = useContext(UserContext);

  const logout = () => {
    setUserData({ token: null, user: null });
    localStorage.setItem("auth-token", "");
    history.push("/login");
  };

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar className={classes.flex}>
          <div className={classes.flex}>
            {userData.token && (
              <img
                className={classes.image}
                src={
                  userData.user.profilePicture
                    ? userData.user.profilePicture
                    : image
                }
                alt=""
              />
            )}
            <Typography
              variant="h6"
              style={{ margin: 20 }}
              className={classes.title}
            >
              {userData.token &&
                `${userData.user.displayName} @${userData.user.uniqueName}`}
            </Typography>
          </div>
          <Button onClick={logout} variant="contained" color="secondary">
            Logout
          </Button>
        </Toolbar>
      </AppBar>
    </div>
  );
}
