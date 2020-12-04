import React, { useState } from "react";
import firebase from "../../firebase";
import { Link } from "react-router-dom";

import "./auth.css";
import chatIcon from '../chat-icon.svg';

function Login() {
  const [user, setUser] = useState({
    email: "",
    password: ""
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function isFieldEmpty({ email, password }) {
    if (email.length === 0 || password.length === 0) {
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
        field.classList.add("login-field-error");
      }
    });
  }

  // add error classes to specific fields in object
  function addErrorClassTo(errorFields) {
    let fields = document.querySelectorAll(".field");

    fields.forEach(field => {
      if (errorFields.includes(field.name)) {
        field.classList.add("login-field-error");
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
    } else if (user.password.length < 6) {
      setErrorMessage("The password must have at least 6 characters");
      addErrorClassTo(["password", "passwordConfirmation"]);
      return false;
    } else {
      // valid form
      return true;
    }
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
        .signInWithEmailAndPassword(user.email, user.password)
        .then(signedInUser => {
          console.log(signedInUser);
          setErrorMessage("");
          setLoading(false);
        })
        .catch(err => {
          console.log(err);
          setErrorMessage(err.message);
          setLoading(false);
        });
    }
  }

  return (
    <div className="Login auth-container">
      <form onSubmit={handleSubmit} className="form login-form">
        <div className="form-header">
          <h1 className="SidePanel-title">
            <span className="title__icon">
              <img src={chatIcon} alt="" />
            </span>{" "}
            chattier
          </h1>
          <p>Log In</p>
        </div>
        <div className="form-fields">
          <input
            className="field login-field"
            name="email"
            type="text"
            placeholder="Email Address"
            onChange={handleChange}
            value={user.email}
          />
          <input
            className="field login-field"
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            value={user.password}
          />
          <div className="error-message login-error-message">
            <p>{errorMessage}</p>
          </div>
          <button className="btn register-btn" disabled={loading}>
            {loading ? <div className="btn-loader">Loading...</div> : "Submit"}
          </button>
        </div>
        <div className="redirect login-redirect">
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Login;
