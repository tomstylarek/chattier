// Component to provide theme context to the App component.
// The App can't wrab the content of the component with the provider directly, because it needs to destructure 
// a property from context. That destructuring is made before the component renders, so it takes a propery from
// an undefined context, since the context provider is rendered later in the excecution of the component.

import React from 'react';
import ThemeContextProvider from "../contexts/ThemeContext";
import App from './App';

function ThemeProvider() {
  return (
    <ThemeContextProvider>
      <App />
    </ThemeContextProvider>
  )
}

export default ThemeProvider;