import React from 'react';

const Home = ({ username, currentUsers }) => (
  <>
    <h1>Welcome, {username}!</h1>
    <h2>Current Users:</h2>
    <ul>
      {currentUsers.map((user) => (
        <li key={user.id}>{user.username}</li>
      ))}
    </ul>
  </>
);

export default Home;
