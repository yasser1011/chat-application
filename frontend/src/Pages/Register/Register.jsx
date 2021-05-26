import React from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Alert from "@material-ui/lab/Alert";
import { Link } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import FileBase from "react-file-base64";
import axios from "axios";
import { useState, useContext } from "react";
import { UserContext } from "../../Context/UserContext";
import { apiUrl } from "../../apiUrl";

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  fileInput: {
    width: "97%",
    margin: "10px 0",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function Register({ history }) {
  const { setUserData } = useContext(UserContext);

  const classes = useStyles();

  const [user, setUser] = useState({
    displayName: "",
    uniqueName: "",
    password: "",
    profilePicture: "",
  });
  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setUser({ ...user, [name]: value });
  };

  const [errorNotificationMsg, setErrorNotificationMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const registerRes = await axios.post(`${apiUrl}/users/register`, user);
      setUserData({
        token: registerRes.data.token,
        user: registerRes.data.user,
      });
      localStorage.setItem("auth-token", registerRes.data.token);
      history.push("/");
    } catch (error) {
      console.log(error);
      setErrorNotificationMsg(error.response.data.msg);
      setTimeout(() => {
        setErrorNotificationMsg("");
      }, 1500);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        {errorNotificationMsg ? (
          <Alert severity="error">{errorNotificationMsg}</Alert>
        ) : (
          ""
        )}
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="displayName"
                value={user.displayName}
                onChange={handleChange}
                variant="outlined"
                required
                fullWidth
                id="displayName"
                label="Display Name"
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="uniqueName"
                value={user.uniqueName}
                onChange={handleChange}
                variant="outlined"
                required
                fullWidth
                id="uniqueName"
                label="Unique Name"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                value={user.password}
                onChange={handleChange}
                name="password"
                label="Password"
                type="password"
                id="password"
              />
            </Grid>
            <Grid>
              <Typography>Select Profile Picture</Typography>
              <div className={classes.fileInput}>
                <FileBase
                  type="file"
                  multiple={false}
                  onDone={({ base64 }) =>
                    setUser({ ...user, profilePicture: base64 })
                  }
                />
              </div>
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Sign Up
          </Button>
          <Grid container justify="flex-end">
            <Grid item>
              <Link to="/login">Already have an account? Sign In</Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={5}>
        <Copyright />
      </Box>
    </Container>
  );
}
