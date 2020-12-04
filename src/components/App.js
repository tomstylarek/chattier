import React, { useContext, useEffect } from "react";
import ChannelContextProvider from "../contexts/ChannelContext";
import { ThemeContext } from "../contexts/ThemeContext";
import "./App.css";
import "./darkTheme.css";

import OptionsPanel from "./OptionsPanel/OptionsPanel";
import SidePanel from "./SidePanel/SidePanel";
import Messages from "./Messages/Messages";
import MetaPanel from "./MetaPanel/MetaPanel";

function App() {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div className={`App ${darkMode && "App--dark"}`}>
      <ChannelContextProvider>
        <SidePanel />
        <Messages />
        <div className="side-container">
          <OptionsPanel />
          <MetaPanel />
        </div>
      </ChannelContextProvider>
    </div>
  );
}

export default App;
