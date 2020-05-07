import React, { useState } from 'react';

const Home = ({ updateUsername }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUsername(username);
  };

  const changeUsername = (e) => setUsername(e.target.value);

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={username}
        onChange={changeUsername}
        placeholder="Enter username"
      />
    </form>
  );
};

export default Home;
