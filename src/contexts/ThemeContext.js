import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

function ThemeContextProvider({ children }) {
  const [darkMode, setDarkMode] = useState(
    (localStorage.getItem("darkMode") === "true" ? true : false) || false
  );

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContextProvider;
