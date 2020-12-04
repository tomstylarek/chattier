import React, { useState, useContext, useEffect } from "react";
import firebase from "../../firebase";
import { ChannelContext } from "../../contexts/ChannelContext";
import { AuthContext } from "../../contexts/AuthContext";

import arrowDownIcon from "./arrow-down.svg";
import hashtagIcon from "./hashtag.svg";

function Starred() {
  const { currentUser } = useContext(AuthContext);
  const {
    setCurrentChannel,
    setPrivateChannel,
    setActiveChannel,
    activeChannel
  } = useContext(ChannelContext);
  const [usersRef, setUsersRef] = useState(firebase.database().ref("users"));
  const [starredChannels, setStarredChannels] = useState([]);

  useEffect(() => {
    if (currentUser) {
      addListeners(currentUser.uid);
    }

    return () => {
      if (currentUser) {
        removeListener();
      }
    };
  }, []);

  function removeListener() {
    usersRef.child(`${currentUser.uid}/starred`).off();
  }

  function addListeners(userId) {
    usersRef
      .child(userId)
      .child("starred")
      .on("child_added", snap => {
        const starredChannel = { id: snap.key, ...snap.val() };
        setStarredChannels(prevValues => [...prevValues, starredChannel]);
      });

    usersRef
      .child(userId)
      .child("starred")
      .on("child_removed", snap => {
        const channelToRemove = { id: snap.key, ...snap.val() };
        const filteredChannels = starredChannels.filter(channel => {
          return channel.id !== channelToRemove.id;
        });
        setStarredChannels(prevValues =>
          prevValues.filter(channel => channel.id !== channelToRemove.id)
        );
      });
  }

  function changeChannel(channel) {
    setActiveChannel(channel.id);
    // put the channel on global state
    setCurrentChannel(channel);
    setPrivateChannel(false);
  }

  function displayChannels(starredChannels) {
    if (starredChannels.length > 0) {
      const channelElements = starredChannels.map(channel => (
        <li
          className={`channel-item ${channel.id === activeChannel && "active"}`}
          key={channel.id}
          onClick={() => changeChannel(channel)}
          title={channel.name}
        >
          <img src={hashtagIcon} alt="#" />
          {channel.name}
        </li>
      ));

      return <ul className="Channel-items">{channelElements}</ul>;
    }
  }

  return (
    <div className="Channels-component">
      <div className="Channels">
        <div className="Channels-name">
          <img src={arrowDownIcon} alt="" />
          starred
          <span className="Channel-counter">{starredChannels.length}</span>
        </div>
      </div>

      {displayChannels(starredChannels)}
    </div>
  );
}

export default Starred;
