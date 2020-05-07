import React, { useState } from 'react'
import io from 'socket.io-client';
import Home from './Home';

const App = () => {
  const [username, setUsername] = useState('');

  const socket = io('http://localhost:3001', {
    path: '/socket.io',
  });
  
  const updateUsername = (name) => {
    setUsername(name);
    socket.open();
    socket.emit('add user', name);
  };

  socket.on('user joined', data => {
    console.log(`${data.username} joined!`);
  })

  socket.on('user left', data => {
    console.log(`${data.username} left!`);
  });

  socket.on('disconnect', () => {
    console.log(`user has disconnected.`);
    socket.open();
  });

  socket.on('reconnect', () => {
    console.log(`user has been reconnected!`);
    if (username) {
      socket.emit('add user', username);
    }
  });


  return (
    <>
      <h1>Syne Chat</h1>
      {!username ? (
        <Home updateUsername={updateUsername} />
      ) : (
        <h1>Welcome, {username}!</h1>
      )}
    </>
  );
};

export default App;
