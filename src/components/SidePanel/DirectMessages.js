import React, { useState, useContext, useEffect } from "react";
import firebase from "../../firebase";
import { AuthContext } from "../../contexts/AuthContext";
import { ChannelContext } from "../../contexts/ChannelContext";

import arrowDownIcon from "./arrow-down.svg";

function DirectMessages() {
  const {
    setCurrentChannel,
    setPrivateChannel,
    setActiveChannel,
    activeChannel
  } = useContext(ChannelContext);
  const { currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [usersRef, setUsersRef] = useState(firebase.database().ref("users"));
  // ref to the connected users in the database
  const [connectedRef, setConnectedRef] = useState(
    firebase.database().ref(".info/connected")
  );
  const [presenceRef, setPresenceRef] = useState(
    firebase.database().ref("presence")
  );

  useEffect(() => {
    if (currentUser) {
      addListeners(currentUser.uid);
    }

    return () => {
      removeListeners();
    };
  }, []);

  function removeListeners() {
    usersRef.off();
    presenceRef.off();
    connectedRef.off();
  }

  function addListeners(currentUserUid) {
    const loadedUsers = [];
    usersRef.on("child_added", snap => {
      if (currentUserUid !== snap.key) {
        let user = snap.val();
        user["uid"] = snap.key;
        user["status"] = "offline";
        loadedUsers.push(user);
        setUsers(loadedUsers);
      }
    });

    connectedRef.on("value", snap => {
      if (snap.val() === true) {
        const ref = presenceRef.child(currentUserUid);
        ref.set(true);
        ref.onDisconnect().remove(err => {
          if (err !== null) {
            console.log(err);
          }
        });
      }
    });

    presenceRef.on("child_added", snap => {
      if (currentUserUid !== snap.key) {
        addStatusToUser(snap.key);
      }
    });

    presenceRef.on("child_removed", snap => {
      if (currentUserUid !== snap.key) {
        addStatusToUser(snap.key, false);
      }
    });
  }

  function addStatusToUser(userId, connected = true) {
    const updatedUsers = users.reduce((acc, user) => {
      if (user.uid === userId) {
        user["status"] = `${connected ? "online" : "offline"}`;
      }

      return acc.concat(user);
    }, []);
    setUsers(updatedUsers);
  }

  function getChannelId(userId) {
    const currentUserId = currentUser.uid;
    // create the path to the channel
    return userId < currentUserId
      ? `${userId}/${currentUserId}`
      : `${currentUserId}/${userId}`;
  }

  // put the channel on global state
  function changeChannel(user) {
    const channelId = getChannelId(user.uid);
    const channelData = {
      id: channelId,
      name: user.name
    };
    setCurrentChannel(channelData);
    setPrivateChannel(true);
    setActiveChannel(user.uid);
  }

  function displayUsers(users) {
    if (users && users.length > 0) {
      const userElements = users.map(user => (
        <li
          className={`channel-item ${user.uid === activeChannel && "active"}`}
          key={user.uid}
          onClick={() => changeChannel(user)}
          title={user.name}
        >
          <img className="avatar-img" src={user.avatarPhoto} alt="@" />
          {user.name}
          <div className={`status-circle ${user.status}`} />
        </li>
      ));

      return <ul className="Channel-items">{userElements}</ul>;
    }
  }

  return (
    <div className="Channels-component">
      <div className="Channels">
        <div className="Channels-name">
          <img src={arrowDownIcon} alt="" />
          direct messages
          <span className="Channel-counter">{users && users.length}</span>
        </div>
      </div>

      {displayUsers(users)}
    </div>
  );
}

export default DirectMessages;
