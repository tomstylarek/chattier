import React, { useContext, useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import firebase from "../../firebase";
import { ChannelContext } from "../../contexts/ChannelContext";
import { AuthContext } from "../../contexts/AuthContext";
import { ThemeContext } from "../../contexts/ThemeContext";
import MediaModal from "./MediaModal";
import { Picker, emojiIndex } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

import uploadMediaIcon from "./clip.svg";
import darkModeUploadMediaIcon from "./clip-dark-mode.svg";
import sendIcon from "./send-message.svg";
import emojiIcon from "./emoji.svg";

function MessagesForm({
  messagesRef,
  setMessages,
  setBlockScrollToBottom,
  getMessagesRef
}) {
  const { currentUser } = useContext(AuthContext);
  const { currentChannel, privateChannel } = useContext(ChannelContext);
  const { darkMode } = useContext(ThemeContext);
  const [message, setMessage] = useState("");
  const [displayMedia, setDisplayMedia] = useState(false);
  const [uploadState, setUploadState] = useState("");
  const [uploadTask, setUploadTask] = useState(null);
  const [storageRef, setStorageRef] = useState(firebase.storage().ref());
  const [typingRef, setTypingRef] = useState(firebase.database().ref("typing"));
  const [percentUploaded, setPercentUploaded] = useState(0);
  const [emojiPicker, setEmojiPicker] = useState(false);

  // input reference
  const messageInput = useRef(null);

  useEffect(() => {
    // on uploadTask change
    if (uploadTask !== null) {
      uploadTask.on(
        "state_changed",
        snap => {
          const actualPercentUploaded = Math.round(
            (snap.bytesTransferred / snap.totalBytes) * 100
          );
          setPercentUploaded(actualPercentUploaded);
        },
        // callbacks after listening for state changed
        err => {
          console.log(err);
          setUploadState("error");
          setUploadTask(null);
        },
        () => {
          uploadTask.snapshot.ref
            .getDownloadURL()
            .then(downloadUrl => {
              sendFileMessage(downloadUrl, getMessagesRef(), currentChannel.id);
            })
            .catch(err => {
              console.log(err);
              setUploadState("error");
              setUploadTask(null);
            });
        }
      );
    }

    return () => {
      if (uploadTask !== null) {
        uploadTask.cancel();
        setUploadTask(null);
      }
    };
  }, [uploadTask]);

  useEffect(() => {
    if (uploadState === "done") {
      addMessageListener(currentChannel.id);
    }
  }, [uploadState]);

  useEffect(() => {
    setMessage("");
  }, [currentChannel]);

  function sendFileMessage(fileUrl, ref, pathToUpload) {
    ref
      .child(pathToUpload)
      .push()
      .set(createMessage(fileUrl))
      .then(() => {
        setUploadState("done");
      })
      .catch(err => {
        console.log(err);
      });
  }

  function handleChange(event) {
    setMessage(event.target.value);
  }

  function handleKeyDown(event) {
    // wait for messages to update
    // this is necessary since messages state update after the event key down is fired
    setTimeout(() => {
      // if the user is typing, set the reference
      // if not, remove it
      if (event.target.value) {
        typingRef
          .child(currentChannel.id)
          .child(currentUser.uid)
          .set(currentUser.displayName);
      } else {
        typingRef
          .child(currentChannel.id)
          .child(currentUser.uid)
          .remove();
      }
    }, 1);
  }

  function handleTogglePicker() {
    setEmojiPicker(prevValue => !prevValue);
  }

  function handleAddEmoji(emoji) {
    const oldMessage = message;
    const newMessage = colonToUnicode(`${oldMessage} ${emoji.colons}`);
    setMessage(newMessage);
    setEmojiPicker(false);
    // focus on input after the emoji is picked
    messageInput.current.focus();
  }

  function colonToUnicode(message) {
    return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
      x = x.replace(/:/g, "");
      let emoji = emojiIndex.emojis[x];
      if (typeof emoji !== "undefined") {
        let unicode = emoji.native;
        if (typeof unicode !== "undefined") {
          return unicode;
        }
      }
      x = ":" + x + ":";
      return x;
    });
  }

  // function addMessageListener(channelId) {
  //   messagesRef.child(channelId).on("child_added", snap => {
  //     setMessages(prevMessages => {
  //       if (!prevMessages.includes(snap.val())) {
  //         return prevMessages.concat(snap.val());
  //       }
  //     });
  //   });
  // }

  function createMessage(fileUrl = null) {
    const newMessage = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: currentUser.uid,
        name: currentUser.displayName,
        avatar: currentUser.photoURL
      }
    };

    // condition to differetiate btw image and text
    if (fileUrl !== null) {
      newMessage["image"] = fileUrl;
    } else {
      newMessage["content"] = message;
    }

    return newMessage;
  }

  function sendMessage(event) {
    event.preventDefault();
    setBlockScrollToBottom(false);

    if (message !== "") {
      // set the message in the collection based on the id of the channel
      getMessagesRef()
        .child(currentChannel.id)
        .push()
        .set(createMessage())
        .then(() => {
          setMessage("");
          // addMessageListener(currentChannel.id);

          // remove typing user after sending the message
          typingRef
            .child(currentChannel.id)
            .child(currentUser.uid)
            .remove();
        })
        .catch(err => {
          console.log(err);
        });
    }
  }

  function toggleMediaModal() {
    if (displayMedia) {
      setDisplayMedia(false);
    } else {
      setDisplayMedia(true);
    }
  }

  function getPath() {
    if (privateChannel) {
      return `chat/private/${currentChannel.id}`;
    } else {
      return `chat/public/${currentChannel.id}`;
    }
  }

  function uploadFile(file, metadata) {
    // file to firebase storage for images
    // generate an aleatory id for the image name
    const filePath = `${getPath()}/${uuidv4()}.jpg`;

    setUploadState("uploading");
    setUploadTask(storageRef.child(filePath).put(file, metadata));
    // when this is finished, excecute the useEffect that listens for uploadTask
  }

  return (
    <form className="MessagesForm">
      <button
        disabled={uploadState === "uploading"}
        className="MessagesForm-upload-media"
        onClick={toggleMediaModal}
        type="button"
        title="Upload Media"
      >
        <img
          src={darkMode ? darkModeUploadMediaIcon : uploadMediaIcon}
          alt="Upload Media"
        />
        <MediaModal displayMedia={displayMedia} uploadFile={uploadFile} />
      </button>
      <div className="MessagesForm-input-container">
        <input
          className="MessagesForm-input"
          ref={messageInput}
          type="text"
          placeholder="Enter your message here"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          value={message}
        />
        <button
          className="MessagesForm-emoji-picker"
          onClick={handleTogglePicker}
          title="Pick an emoji"
          type="button"
        >
          <img src={emojiIcon} />
        </button>
        {emojiPicker && (
          <div className="emoji-picker">
            <Picker
              title="Pick your emoji"
              onSelect={handleAddEmoji}
              theme={darkMode ? "dark" : "light"}
            />
          </div>
        )}
      </div>
      <button
        className={`MessagesForm-send ${message === "" && "disabled"}`}
        onClick={sendMessage}
        title="Send Message"
      >
        Send <img src={sendIcon} alt="" />
      </button>
    </form>
  );
}

export default MessagesForm;
