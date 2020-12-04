import React, { useContext, useState, useEffect } from "react";
import firebase from "../../firebase";
import { ChannelContext } from "../../contexts/ChannelContext";
import "./MetaPanel.css";

function MetaPanel() {
  const { currentChannel, privateChannel } = useContext(ChannelContext);

  return (
    <div className="MetaPanel-component">
      <div className="MetaPanel">
        {!privateChannel && (
          <div className="MetaPanel-field">
            <h5>channel details</h5>
            <p>{currentChannel && currentChannel.details}</p>
          </div>
        )}
        <div className="MetaPanel-field">
          <h5>photos & media</h5>
        </div>
        <div className="MetaPanel-field">
          <h5>attachments</h5>
        </div>
      </div>
    </div>
  );
}

export default MetaPanel;
