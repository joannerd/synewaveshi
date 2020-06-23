import React from 'react';

const CurrentUsersList = ({ users }) => {
  const usersMessage = users.length > 0 ? (
    <h4>You are currently waving sines with...</h4>
  ) : (
    <h4>Invite someone to wave sines with!</h4>
  );

  const usersList = users.map(({ id, username }, i) => {
    let name = username;

    if (users.length === 2 && i === 1) {
      name = ` and ${username}.`;
    } else if (i !== 0) {
      i < users.length - 1 ? (
        name = `, ${username}`
      ) : (
        name = `, and ${username}.`
      );
    }

    return <span key={id}>{name}</span>;
  });

  return (
    <div className="current-users">
      {usersMessage}
      {usersList}
    </div>
  );
} 

export default CurrentUsersList;
