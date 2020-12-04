import React, { useContext } from "react";
import moment from "moment";

import { AuthContext } from "../../contexts/AuthContext";

function Message({ message }) {
  const { currentUser } = useContext(AuthContext);

  function isImage(message) {
    return (
      message.hasOwnProperty("image") && !message.hasOwnProperty("content")
    );
  }

  return currentUser ? (
    <li
      className={`Message ${message.user.id === currentUser.uid &&
        "self-message"} ${isImage(message) && "image-wrapper"}`}
      data-timestamp={message.timestamp}
    >
      <div className="Message__avatar">
        <img src={message.user.avatar} alt={message.user.name} />
      </div>
      {isImage(message) ? (
        <img className="Message__image" src={message.image} alt="" />
      ) : (
        <div className="Message__content">{message.content}</div>
      )}
      <div className="Message__time">
        {moment(message.timestamp).format("HH:mm")}
      </div>
    </li>
  ) : (
    ""
  );
}

export default Message;
