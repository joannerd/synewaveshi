import React, { useState } from 'react';

const Home = ({ updateUsername }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUsername(username);
  };

  const changeUsername = (e) => setUsername(e.target.value);

  return (
    <>
      <h1>synes wave hi</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={changeUsername}
          placeholder="Enter your name to wave hi back."
        />
      </form>
    </>
  );
};

export default Home;
