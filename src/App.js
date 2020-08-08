import React, { useState } from 'react';
import Home from './pages/Home';
import Head from './components/Head';
import { ThemeContext } from './Theme';

function App() {
  const [theme, setTheme] = useState('light');

  function changeTheme() {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }

  return (
    <ThemeContext.Provider value={{ theme }}>
      <Head changeTheme={changeTheme} />
      <Home />
    </ThemeContext.Provider>
  );
}

export default App;
