import logo from "./logo.svg";
import React, { useContext } from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { UserContext } from "./Context/UserContext";
import Error from "./Pages/Error/Error";
import Home from "./Pages/Home/Home";
import Login from "./Pages/Login/Login";
import Register from "./Pages/Register/Register";
import { SocketContext, socket } from "./Context/SocketContext";
import CircularProgress from "@material-ui/core/CircularProgress";

function App() {
  const { userLoading } = useContext(UserContext);

  if (userLoading) {
    return (
      <div className="App">
        {/* <h1>Loading</h1> */}
        <CircularProgress />
      </div>
    );
  }

  return (
    <SocketContext.Provider value={{ socket }}>
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
          <Route path="*" component={Error} />
        </Switch>
      </Router>
    </SocketContext.Provider>
  );
}

export default App;
