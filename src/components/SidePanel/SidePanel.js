import React from "react";
import UserPanel from "./UserPanel";
import Starred from "./Starred";
import Channels from "./Channels";
import DirectMessages from "./DirectMessages";
import "./SidePanel.css";

import chatIcon from "../chat-icon.svg";

function SidePanel() {
  return (
    <div className="SidePanel">
      <h1 className="SidePanel-title">
        <span className="title__icon">
          <img src={chatIcon} alt="" />
        </span>{" "}
        chattier
      </h1>
      <UserPanel />
      <Starred />
      <Channels />
      <DirectMessages />
    </div>
  );
}

export default SidePanel;
