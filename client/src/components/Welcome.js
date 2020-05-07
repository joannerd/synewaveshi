import React from 'react';

const Welcome = ({ username, currentUsers }) => {
  const users = currentUsers.filter((user) => user.username !== username);
  return (
    <>
      <h2>Welcome, {username}!</h2>
      <h3>You are currently waving sines with...</h3>
      {users.map(({id, username}, i) => {
        let name = username;

        if (users.length === 2 && i === 1) {
          name = ` and ${username}.`;
        } else if (i !== 0) {
          i < users.length - 1
            ? name = `, ${username}`
            : name = `, and ${username}.`;
        }
        return (
          <span key={id}>{name}</span>
        );
      })}
    </>
  );
}

export default Welcome;
