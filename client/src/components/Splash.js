import React, { useState, useContext } from 'react';
import HistoryContext from '../HistoryContext';

const Splash = () => {
  const { updateUsername } = useContext(HistoryContext);
  const [usernameInput, setUsernameInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const isChrome =
      !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

    if (!isChrome) {
      alert(
        'Web Speech API is currently only compatible with Google Chrome and Microsoft Edge.'
      );
    }
    
    if (usernameInput) {
      updateUsername(usernameInput);
    } else {
      alert('Please enter a valid alphabetical name.')
    }
  };

  const handleUsernameInputChange = (e) => setUsernameInput(e.target.value);

  return (
    <form onSubmit={handleSubmit}>
      <h1>syne waves hi</h1>
      <input
        type="text"
        value={usernameInput}
        onChange={handleUsernameInputChange}
        placeholder="Enter your name"
      />
    </form>
  );
};

export default Splash;
