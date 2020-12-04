import React, { useState, useEffect, useContext, useRef } from "react";
import moment from "moment";
import firebase from "../../firebase";
import MessagesForm from "./MessagesForm";
import { AuthContext } from "../../contexts/AuthContext";
import { ChannelContext } from "../../contexts/ChannelContext";
import { ThemeContext } from "../../contexts/ThemeContext";
import Message from "./Message";
import Typing from "./Typing";
import Skeleton from "./Skeleton";

import "./Messages.css";
import searchIcon from "./search.svg";
import darkModeSearchIcon from "./search-dark-mode.svg";
import exitIcon from "./exit.svg";
import darkModeExitIcon from "./exit-dark-mode.svg";
import starIcon from "./star.svg";
import clickedStarIcon from "./star-clicked.svg";

function Messages() {
  const { currentUser } = useContext(AuthContext);
  const { currentChannel, privateChannel } = useContext(ChannelContext);
  const { darkMode } = useContext(ThemeContext);
  const [messagesRef, setMessagesRef] = useState(
    firebase.database().ref("messages")
  );
  const [privateMessagesRef, setPrivateMessagesRef] = useState(
    firebase.database().ref("privateMessages")
  );
  const [usersRef, setUsersRef] = useState(firebase.database().ref("users"));
  const [typingRef, setTypingRef] = useState(firebase.database().ref("typing"));
  const [connectedRef, setConnectedRef] = useState(
    firebase.database().ref(".info/connected")
  );
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const lastMessage = useRef(null);
  const messagesList = useRef(null);
  const [numOfUsers, setNumOfUsers] = useState(0);
  const [displaySearchTab, setDisplaySearchTab] = useState(false);
  // search tab for match messages
  const [searchMessage, setSearchMessage] = useState("");
  const [matchingMessages, setMatchingMessages] = useState([]);
  // block scrollToBottom when scrollToMessage is excecuted
  const [blockScrollToBottom, setBlockScrollToBottom] = useState(false);
  const [isChannelStarred, setChannelStarred] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [listeners, setListeners] = useState([]);

  useEffect(() => {
    if (!blockScrollToBottom) {
      scrollToBottom();
    }
  });

  useEffect(() => {
    if (currentChannel && currentUser) {
      // when channel is changed, get the messages from the database
      removeListeners();
      addListeners(currentChannel.id);
      addUserStarsListener(currentChannel.id, currentUser.uid);
    }

    return () => {
      removeListeners();
      connectedRef.off();
    };
  }, [currentChannel]);

  useEffect(() => {
    if (messages.length > 0) {
      countUniqueUsers(messages);
      setMessagesLoading(false);
    }
  }, [messages]);

  useEffect(() => {
    if (searchMessage !== "") {
      searchMatchingMessages(searchMessage);
    } else {
      setMatchingMessages([]);
    }
  }, [searchMessage]);

  useEffect(() => {
    if (currentUser && currentChannel) {
      starChannel();
    }
  }, [isChannelStarred]);

  function removeListeners() {
    listeners.forEach(listener => {
      listener.ref.child(listener.id).off(listener.event);
    });
  }

  function addToListeners(id, ref, event) {
    const index = listeners.findIndex(listener => {
      return (
        listener.id === id && listener.ref === ref && listener.event === event
      );
    });

    // if the index doesn't exist create it
    if (index === -1) {
      const newListener = { id, ref, event };
      setListeners(prevListeners => prevListeners.concat(newListener));
    }
  }

  function addListeners(channelId) {
    addMessageListener(channelId);
    addTypingListeners(channelId);
  }

  function addTypingListeners(channelId) {
    let newTypingUsers = [];
    typingRef.child(channelId).on("child_added", snap => {
      // if the current typing user is other than the current user
      if (snap.key !== currentUser.uid) {
        newTypingUsers = newTypingUsers.concat({
          id: snap.key,
          name: snap.val()
        });
        setTypingUsers(newTypingUsers);
      }
    });
    addToListeners(channelId, typingRef, "child_added");

    typingRef.child(channelId).on("child_removed", snap => {
      const index = newTypingUsers.findIndex(user => user.id === snap.key);

      if (index !== -1) {
        newTypingUsers = newTypingUsers.filter(user => user.id !== snap.key);

        setTypingUsers(newTypingUsers);
      }
    });
    addToListeners(channelId, typingRef, "child_removed");

    connectedRef.on("value", snap => {
      if (snap.val() === true) {
        typingRef
          .child(channelId)
          .child(currentUser.uid)
          .onDisconnect()
          .remove(err => {
            if (err !== null) {
              console.log(err);
            }
          });
      }
    });
  }

  function addMessageListener(channelId) {
    // set messages to an empty array for the cases where there are no messages to display
    // If this is not done, the channels without messages display the last messages in state
    // this happened because of the method child(), if there's no such child, the method returns anything
    setMessages([]);
    const ref = getMessagesRef();
    ref.child(channelId).on("child_added", snap => {
      setMessages(prevMessages => prevMessages.concat(snap.val()));
    });

    addToListeners(channelId, ref, "child_added");
  }

  function addUserStarsListener(channelId, userId) {
    usersRef
      .child(userId)
      .child("starred")
      .once("value")
      .then(data => {
        if (data.val() !== null) {
          // array with the keys on data.val()
          const channelIds = Object.keys(data.val());
          const prevStarred = channelIds.includes(channelId);
          setChannelStarred(prevStarred);
        }
      });
  }

  function getMessagesRef() {
    return privateChannel ? privateMessagesRef : messagesRef;
  }

  function displayMessages(messages) {
    if (messages.length > 0) {
      return messages.map(message => (
        <Message key={message.timestamp} message={message} />
      ));
    }
  }

  function scrollToBottom() {
    lastMessage.current.scrollIntoView({ behavior: "smooth" });
  }

  function countUniqueUsers(messages) {
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }

      return acc;
    }, []);

    setNumOfUsers(uniqueUsers.length);
  }

  function openSearchTab() {
    setDisplaySearchTab(true);
  }

  function closeSearchTab() {
    setDisplaySearchTab(false);
    setSearchMessage("");
  }

  function handleStar() {
    setChannelStarred(prevValue => !prevValue);
    // next function is excecuted when this state is updated
  }

  function starChannel() {
    if (isChannelStarred) {
      usersRef.child(`${currentUser.uid}/starred`).update({
        [currentChannel.id]: {
          name: currentChannel.name,
          details: currentChannel.details,
          createdBy: {
            name: currentChannel.createdBy.name,
            avatar: currentChannel.createdBy.avatar
          }
        }
      });
    } else {
      usersRef
        .child(`${currentUser.uid}/starred`)
        .child(currentChannel.id)
        .remove(err => {
          if (err !== null) {
            console.log(err);
          }
        });
    }
  }

  function handleChange(event) {
    setSearchMessage(event.target.value);
    // search for matches on useEffect
  }

  function searchMatchingMessages(searchString) {
    // case insensitive
    const regex = new RegExp(searchString, "i");
    // array of matching messages
    const newMatchingMessages = messages.reduce((acc, message) => {
      // if not an image
      if (message.content) {
        if (regex.test(message.content)) {
          acc.push(message);
        }
      }

      return acc;
    }, []);

    setMatchingMessages(newMatchingMessages);
  }

  function scrollToMessage(id) {
    // HTMLCollection to array and find item
    let messageItems = [...messagesList.current.children];
    let messageIndex = messageItems.findIndex(
      item => item.getAttribute("data-timestamp") == id
    );
    let message = messagesList.current.children.item(messageIndex);

    // scroll message into view
    setBlockScrollToBottom(true); // block the scroll to bottom action
    message.scrollIntoView({ block: "center" });
    if (message.classList.contains("self-message")) {
      message.classList.add("self-message-searched");
      setTimeout(() => {
        message.classList.remove("self-message-searched");
      }, 2000);
    } else {
      message.classList.add("message-searched");
      setTimeout(() => {
        message.classList.remove("message-searched");
      }, 2000);
    }
    closeSearchTab();
  }

  function displayMatchingMessages(messages) {
    return messages.map(message => (
      <li
        onClick={() => scrollToMessage(message.timestamp)}
        key={message.timestamp}
        className="search-tab-content-item"
      >
        <p className="search-tab-content-item__mesage">{message.content}</p>
        <div className="search-tab-content-item__date">
          {moment(message.timestamp).format("DD/MM/YY HH:mm")}
        </div>
      </li>
    ));
  }

  function displayTypingUsers(users) {
    if (users.length > 0) {
      console.log("a user is typing");
      return users.map(user => (
        <div
          key={user.id}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: ".5rem"
          }}
        >
          <span className="user-typing">{user.name} is typing</span>
          <Typing />
        </div>
      ));
    }
  }

  function displaySkeleton() {
    return (
      <>
        <Skeleton />
        <Skeleton className="Skeleton-self-message" />
        <Skeleton />
        <Skeleton />
      </>
    );
  }

  return (
    <div className="Messages">
      <div className="Messages-window">
        <div className="Messages-header">
          <div className="Messages-header-info">
            <div className="Messages-header-info__channel-name">
              {currentChannel &&
                `${privateChannel ? "@" : "#"} ${currentChannel.name}`}
              {!privateChannel && (
                <img
                  className="channel-name__icon"
                  onClick={handleStar}
                  src={isChannelStarred ? clickedStarIcon : starIcon}
                  alt="&#9734;"
                />
              )}
            </div>
            {!privateChannel && (
              <div className="Messages-header-info__users">{`${numOfUsers} user${
                numOfUsers !== 1 ? "s" : ""
              }`}</div>
            )}
          </div>
          <div className="Messages-header-search">
            <button
              onClick={openSearchTab}
              title="Search Messages"
              type="button"
            >
              <img src={darkMode ? darkModeSearchIcon : searchIcon} />
            </button>
          </div>
        </div>
        <div className="Messages-content-wrapper">
          <ul ref={messagesList} className="Messages-content">
            {messagesLoading ? displaySkeleton() : displayMessages(messages)}
            {/* dummy element for scroll to bottom */}
            <div ref={lastMessage} />
            {/* loading animation when user is typing */}
            {displayTypingUsers(typingUsers)}
          </ul>
          <MessagesForm
            messagesRef={messagesRef}
            setMessages={setMessages}
            setBlockScrollToBottom={setBlockScrollToBottom}
            getMessagesRef={getMessagesRef}
          />
        </div>
      </div>
      <div className={`Messages-search-tab ${displaySearchTab && "open-tab"}`}>
        <form
          onSubmit={e => {
            e.preventDefault();
          }}
          className="Messages-search-tab-header"
        >
          <input
            onChange={handleChange}
            value={searchMessage}
            type="text"
            placeholder="Search Messages"
          />
          <button onClick={closeSearchTab} type="button">
            <img src={darkMode ? darkModeExitIcon : exitIcon} alt="x" />
          </button>
        </form>
        <ul className="Messages-search-tab-content">
          {displayMatchingMessages(matchingMessages)}
        </ul>
      </div>
    </div>
  );
}

export default Messages;
