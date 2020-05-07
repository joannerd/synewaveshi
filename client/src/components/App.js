import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Welcome from './Welcome';
import Home from './Home';
const SOCKET_IO_URL = 'http://localhost:3001';

const App = () => {
  const [username, setUsername] = useState('');
  const [currentUsers, setCurrentUsers] = useState([]);
  
  const socket = io(SOCKET_IO_URL, {
    path: '/socket.io',
  });

  const updateUsername = (name) => {
    setUsername(name);
    socket.emit('add user', name);
  };

  useEffect(() => {
    socket.on('user joined', data => {
      console.log(`${data.username} joined!`);
      setCurrentUsers(data.currentUsers);
    })

    socket.on('user left', data => {
      console.log('user left!');
      setCurrentUsers(data.currentUsers);
    });

    socket.on('disconnect', () => {
      console.log(`user has disconnected.`);
    });

    socket.on('reconnect', () => {
      console.log(`user has been reconnected!`);
      if (username) socket.emit('add user', username);
    });
  });

  return (
    <>
      <h1>Syne Chat</h1>
      {!username ? (
        <Welcome updateUsername={updateUsername} />
      ) : (
        <Home username={username} currentUsers={currentUsers} />
      )}
    </>
  );
};

export default App;
