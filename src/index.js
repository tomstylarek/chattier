import React, { useEffect, useContext } from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter
} from "react-router-dom";
import firebase from "./firebase";

import ThemeProvider from "./components/ThemeProvider";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import AuthContextProvider, { AuthContext } from "./contexts/AuthContext";
import Spinner from "./components/Spinner";
import "./index.css";

function Root({ history }) {
  const { setUser, clearUser, loading } = useContext(AuthContext);

  useEffect(() => {
    // check if the auth state is changed
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // put the user data on global state. Now is accessible from all the children components
        setUser(user);
        // redirect to home page
        history.push("/");
      } else {
        // log out and clear the user
        clearUser(user);
        // redirect to the login page
        history.push("/login");
      }
    });
  }, []);

  return loading ? (
    <Spinner />
  ) : (
    <Switch>
      // We can't put the theme provider here because it causes the login and register routes not to mount.
      // The switch component only nests routes
      <Route exact path="/" component={ThemeProvider} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
    </Switch>
  );
}

// HOC to access the history object
const RootWithAuth = withRouter(Root);

ReactDOM.render(
  <AuthContextProvider>
    <Router>
      <RootWithAuth />
    </Router>
  </AuthContextProvider>,
  document.getElementById("root")
);
