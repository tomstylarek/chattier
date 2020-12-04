import React, { useState } from "react";
import firebase from "../../firebase";
import { Link } from "react-router-dom";
import randomColor from "randomcolor";

import "./auth.css";
import chatIcon from '../chat-icon.svg';

function Register() {
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    passwordConfirmation: ""
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [usersRef, setUsersRef] = useState(firebase.database().ref("users"));

  function isFieldEmpty({ username, email, password, passwordConfirmation }) {
    if (
      username.length === 0 ||
      email.length === 0 ||
      password.length === 0 ||
      passwordConfirmation === 0
    ) {
      return true;
    }
    return false;
  }

  function isValidEmail({ email }) {
    let emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    return emailRegex.test(email);
  }

  // add error classes to all empty fields
  function addErrorClassToEmptyFields(user) {
    let fields = document.querySelectorAll(".field");

    fields.forEach(field => {
      if (user[field.name] === "") {
        field.classList.add("field-error");
      }
    });
  }

  // add error classes to specific fields in object
  function addErrorClassTo(errorFields) {
    let fields = document.querySelectorAll(".field");

    fields.forEach(field => {
      if (errorFields.includes(field.name)) {
        field.classList.add("field-error");
      }
    });
  }

  function isFormValid() {
    if (isFieldEmpty(user)) {
      setErrorMessage("There are empty fields");
      addErrorClassToEmptyFields(user);
      return false;
    } else if (!isValidEmail(user)) {
      setErrorMessage("Invalid email address");
      addErrorClassTo(["email"]);
      return false;
    } else if (user.password !== user.passwordConfirmation) {
      setErrorMessage("The passwords are different");
      addErrorClassTo(["password", "passwordConfirmation"]);
      return false;
    } else if (user.password.length < 6) {
      setErrorMessage("The password must have at least 6 characters");
      addErrorClassTo(["password", "passwordConfirmation"]);
      return false;
    } else {
      // valid form
      return true;
    }
  }

  function saveUser(createdUser) {
    // create a new document with the id created by firebase in authentication
    // all new documents are created as children of the users collection
    return usersRef.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      avatarPhoto: createdUser.user.photoURL
    });
  }

  function handleChange(event) {
    event.target.classList.remove("field-error");
    setUser({ ...user, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (isFormValid()) {
      // starts loading the auth
      setLoading(true);
      firebase
        .auth()
        .createUserWithEmailAndPassword(user.email, user.password)
        .then(createdUser => {
          console.log(createdUser);
          setErrorMessage("");
          // add additional information to the user
          createdUser.user
            .updateProfile({
              displayName: user.username,
              photoURL: `https://avatar.oxro.io/avatar.svg?name=${
                user.username
              }&background=${randomColor().slice(1)}&length=1`
            })
            .then(() => {
              // save user in realtime database
              saveUser(createdUser)
                .then(() => {
                  console.log("user saved");
                  setLoading(false);
                })
                .catch(err => {
                  console.log(err);
                  setLoading(false);
                });
            })
            .catch(err => {
              console.log(err);
              setLoading(false);
            });
        })
        .catch(err => {
          console.log(err);
          // case email already in use by another account
          setErrorMessage(err.message);
          // loading finished
          setLoading(false);
        });
    }
  }

  return (
    <div className="Register auth-container">
      <form onSubmit={handleSubmit} className="form register-form">
        <div className="form-header">
          <h1 className="SidePanel-title">
            <span className="title__icon">
              <img src={chatIcon} alt="" />
            </span>{" "}
            chattier
          </h1>
          <p>Register</p>
        </div>
        <div className="form-fields">
          <input
            className="field"
            name="username"
            type="text"
            placeholder="Username"
            onChange={handleChange}
            value={user.username}
          />
          <input
            className="field"
            name="email"
            type="text"
            placeholder="Email Address"
            onChange={handleChange}
            value={user.email}
          />
          <input
            className="field"
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            value={user.password}
          />
          <input
            className="field"
            name="passwordConfirmation"
            type="password"
            placeholder="Password Confirmation"
            onChange={handleChange}
            value={user.passwordConfirmation}
          />
          <div className="error-message">
            <p>{errorMessage}</p>
          </div>
          <button className="btn register-btn" disabled={loading}>
            {loading ? <div className="btn-loader">Loading...</div> : "Submit"}
          </button>
        </div>
        <div className="redirect">
          <p>
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Register;
