import React, { useState, useContext, useEffect } from "react";
import firebase from "../../firebase";
import { AuthContext } from "../../contexts/AuthContext";
import { ChannelContext } from "../../contexts/ChannelContext";
import { ThemeContext } from "../../contexts/ThemeContext";

import hashtagIcon from "./hashtag.svg";
import darkModeHashtagIcon from "./hashtag-dark.svg";
import addIcon from "./add-icon.svg";
import darkModeAddIcon from "./add-dark-mode.svg";
import arrowDownIcon from "./arrow-down.svg";

function Channels() {
  const {
    currentChannel,
    setCurrentChannel,
    setPrivateChannel,
    setActiveChannel,
    activeChannel
  } = useContext(ChannelContext);
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const [channels, setChannels] = useState([]);
  const [channelInfo, setChannelInfo] = useState({
    channelName: "",
    channelDetails: ""
  });
  const [displayAddChannel, setDisplayAddChannel] = useState(false);
  // add reference to the collection of channels in the db
  const [channelsRef, setChannelsRef] = useState(
    firebase.database().ref("channels")
  );
  const [messagesRef, setMessagesRef] = useState(
    firebase.database().ref("messages")
  );
  const [typingRef, setTypingRef] = useState(firebase.database().ref("typing"));
  const [channel, setChannel] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [currentSnap, setCurrentSnap] = useState(null);

  useEffect(() => {
    // excecute when component did mount
    addListeners();

    // axecute when component will unmount
    return () => {
      removeListeners();
    };
  }, []);

  // set first channel when the channels are updated
  useEffect(() => {
    setTimeout(() => {
      setFirstChannel();
    }, 1000);
  }, [channels]);

  useEffect(() => {
    if (channel && currentSnap) {
      addNotificationListener(currentSnap.key);
    }
  }, [channel]);

  function setFirstChannel() {
    if (channels.length > 0) {
      setActiveChannel(channels[0].id);
      setCurrentChannel(channels[0]);
      setChannel(channels[0]);
    }
  }

  function addListeners() {
    let loadedChannels = [];
    channelsRef.on("child_added", snap => {
      setCurrentSnap(snap);
      loadedChannels.push(snap.val());
      setChannels(loadedChannels);
      // this is asynchronous, so we need to set the first channel in the useEffect hook
      // listening for changes in the channels state
    });
  }

  function addNotificationListener(channelId) {
    messagesRef.child(channelId).on("child_added", snap => {
      if (channel) {
        handleNotifications(channelId, channel.id, notifications, snap);
      }
    });
  }

  function handleNotifications(
    channelId,
    currentChannelId,
    notifications,
    snap
  ) {
    let lastTotal = 0;
    let index = notifications.findIndex(
      notification => notification.id === channelId
    );

    if (index !== -1) {
      if (channelId !== currentChannelId) {
        lastTotal = notifications[index].total;

        if (snap.numChildren() - lastTotal > 0) {
          notifications[index].count = snap.numChildren() - lastTotal;
        }
      }

      notifications[index].lastKnownTotal = snap.numChildren();
    } else {
      notifications.push({
        id: channelId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0
      });
    }

    setNotifications(notifications);
  }

  function removeListeners() {
    channelsRef.off();
    channels.forEach(channel => {
      messagesRef.child(channel.id).off();
    });
  }

  function openAddChannelModal() {
    setDisplayAddChannel(true);
  }

  function closeAddChannelWindow() {
    setDisplayAddChannel(false);
  }

  function isFormValid({ channelName, channelDetails }) {
    if (channelName === "" || channelDetails === "") {
      return false;
    }
    return true;
  }

  function addChannel() {
    // get a unique identifier for the new channel
    const key = channelsRef.push().key;
    const newChannel = {
      id: key,
      name: channelInfo.channelName,
      details: channelInfo.channelDetails,
      createdBy: {
        name: currentUser.displayName,
        avatar: currentUser.photoURL
      }
    };

    channelsRef
      // set the new channel as a child of the collection
      .child(key)
      .update(newChannel)
      .then(() => {
        closeAddChannelWindow();
        setChannelInfo({ channelName: "", channelDetails: "" });
        console.log("channel added");
      })
      .catch(err => {
        console.log(err);
      });
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (isFormValid(channelInfo)) {
      addChannel();
    }
  }

  function handleChange(event) {
    setChannelInfo(prevInfo => {
      return {
        ...prevInfo,
        [event.target.name]: event.target.value
      };
    });
  }

  function clearNotifications() {
    let index = notifications.findIndex(
      notification => notification.id === channel.id
    );

    if (index !== -1) {
      let updatedNotifications = [...notifications];
      updatedNotifications[index].total = notifications[index].lastKnownTotal;
      updatedNotifications[index].count = 0;
      setNotifications(updatedNotifications);
    }
  }

  function changeChannel(channel) {
    // remove typing user when change channel
    typingRef
      .child(currentChannel.id)
      .child(currentUser.uid)
      .remove();

    setActiveChannel(channel.id);
    clearNotifications();
    // put the channel on global state
    setCurrentChannel(channel);
    setPrivateChannel(false);
    setChannel(channel);
  }

  function getNotificationCount(channel) {
    setTimeout(() => {
      let count = 0;
      notifications.forEach(notification => {
        if (notification.id === channel.id) {
          count = notification.count;
        }
      });

      if (count > 0) return count;
    }, 1);
  }

  function displayChannels(channels) {
    if (channels.length > 0) {
      const channelElements = channels.map(channel => (
        <li
          className={`channel-item ${channel.id === activeChannel && "active"}`}
          key={channel.id}
          onClick={() => changeChannel(channel)}
          title={channel.name}
        >
          {getNotificationCount(channel) && (
            <div className="notification">{getNotificationCount(channel)}</div>
          )}
          <img src={darkMode ? darkModeHashtagIcon : hashtagIcon} alt="#" />
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
          channels
          <span className="Channel-counter">{channels.length}</span>
        </div>
        <div
          onClick={openAddChannelModal}
          className="Channels-add"
          title="Add Channel"
        >
          <img src={darkMode ? darkModeAddIcon : addIcon} alt="+" />
        </div>
      </div>

      {/* channel items */}
      {displayChannels(channels)}

      <div className={`add-channel-window ${displayAddChannel && "open"}`}>
        <form className="add-channel-form">
          <input
            type="text"
            name="channelName"
            placeholder="Name"
            onChange={handleChange}
            value={channelInfo.channelName}
          />
          <input
            type="text"
            name="channelDetails"
            placeholder="Description"
            onChange={handleChange}
            value={channelInfo.channelDetails}
          />
          <div className="add-channel-buttons">
            <button onClick={handleSubmit} className="btn add-btn">
              Add
            </button>
            <button
              type="button"
              onClick={closeAddChannelWindow}
              className="btn cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Channels;
