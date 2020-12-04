import React, { useState, useContext, useEffect } from "react";
import { ThemeContext } from '../../contexts/ThemeContext';

import "./OptionsPanel.css";
import sunIcon from './sun.svg';
import moonIcon from './moon.svg';

function OptionsPanel() {
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  function toggleTheme() {
    setDarkMode(prevMode => !prevMode);
  }

  return (
    <div className="OptionsPanel">
      <div className="OptionsPanel-theme" onClick={toggleTheme}>
        {darkMode ? <img className="light-mode-icon" src={sunIcon} alt="Light" /> : <img className="dark-mode-icon" src={moonIcon} alt="Dark" />}
      </div>
    </div>
  );
}

export default OptionsPanel;
