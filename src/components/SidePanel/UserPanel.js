import React, { useContext, useRef, useState, useEffect } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { ThemeContext } from "../../contexts/ThemeContext";
import firebase from "../../firebase";

import settingsIcon from "./settings-icon.svg";
import darkModeSettingsIcon from "./settings-dark-mode.svg";
import userIcon from "./user-icon.svg";
import logoutIcon from "./logout-icon.svg";

function UserPanel() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const avatarFile = useRef(null);
  const [displayDropdown, setDisplayDropdown] = useState(false);
  const [newAvatarImage, setNewAvatarImage] = useState("");
  const [uploadedAvatarImage, setUploadedAvatarImage] = useState("");
  const [storageRef, setStorageRef] = useState(firebase.storage().ref());
  const [userRef, setUserRef] = useState(firebase.auth().currentUser);
  const [usersRef, setUsersRef] = useState(firebase.database().ref("users"));
  const [metadata, setMetadata] = useState({ contentType: "image/jpeg" });

  useEffect(() => {
    // on new avatar image update
    if (newAvatarImage !== "") {
      uploadImage();
    }
  }, [newAvatarImage]);

  useEffect(() => {
    if (uploadedAvatarImage !== "") {
      changeAvatar();
    }
  }, [uploadedAvatarImage]);

  function toggleDropdown() {
    setDisplayDropdown(prevState => !prevState);
  }

  function closeDropdown() {
    setDisplayDropdown(false);
  }

  function handleSignOut() {
    // this produces a change in the state of the auth
    // the user is cleared from the app and refirected to the login page
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log("signed out");
      });
  }

  function changeAvatar() {
    userRef
      .updateProfile({
        photoURL: uploadedAvatarImage
      })
      .then(() => {
        console.log("photo updated");
        closeDropdown();
      })
      .catch(err => {
        console.log(err);
      });

    usersRef
      .child(currentUser.uid)
      .update({ avatar: uploadedAvatarImage })
      .then(() => {
        console.log("user avatar updated");
      })
      .catch(err => {
        console.log(err);
      });
  }

  function uploadImage() {
    storageRef
      .child(`avatars/users/${userRef.uid}`)
      .put(newAvatarImage, metadata)
      .then(snap => {
        snap.ref.getDownloadURL().then(downloadURL => {
          // once the image is in the storage, keep that new value on state
          setUploadedAvatarImage(downloadURL);
          // next step on useEffect when this is completed
        });
      });
  }

  function handleAvatar() {
    avatarFile.current.click();
  }

  function handleChange(event) {
    const file = event.target.files[0];

    if (file) {
      setNewAvatarImage(file);
      // file will upload on useEffect, listening for changes in this image
    }
  }

  return currentUser ? (
    <div className="UserPanel">
      <div className="UserPanel-image">
        <img src={currentUser.photoURL} alt={currentUser.displayName} />
      </div>
      <div className="UserPanel-info">
        <div className="UserPanel-info__name">{currentUser.displayName}</div>
        <div
          onClick={toggleDropdown}
          className="UserPanel-info__settings"
          title="Settings"
        >
          <img
            src={darkMode ? darkModeSettingsIcon : settingsIcon}
            alt="settings"
          />
        </div>
      </div>
      <ul
        className={`UserPanel-settings-dropdown ${displayDropdown && "open"}`}
      >
        <li onClick={handleAvatar} className="settings-change-avatar">
          <img className="settings-icon" src={userIcon} alt="" />
          <input
            onChange={handleChange}
            type="file"
            ref={avatarFile}
            accept=".jpg, .jpeg, .png"
            style={{ display: "none" }}
          />
          Change Avatar
        </li>
        <li onClick={handleSignOut} className="settings-signout">
          <img className="settings-icon" src={logoutIcon} alt="" />
          Sign Out
        </li>
      </ul>
    </div>
  ) : (
    <div />
  );
}

export default UserPanel;
