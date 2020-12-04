import React, { createContext, useState } from "react";

export const ChannelContext = createContext();

function ChannelContextProvider({ children }) {
  const [currentChannel, setCurrentChannel] = useState(null);
  const [privateChannel, setPrivateChannel] = useState(false);
  const [activeChannel, setActiveChannel] = useState("");

  return (
    <ChannelContext.Provider
      value={{
        setCurrentChannel,
        currentChannel,
        privateChannel,
        setPrivateChannel,
        activeChannel,
        setActiveChannel
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
}

export default ChannelContextProvider;
