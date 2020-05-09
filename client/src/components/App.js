import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Home from './Home';
import Welcome from './Welcome';

const App = () => {
  const [username, setUsername] = useState('');
  const [currentUsers, setCurrentUsers] = useState([]);

  const socket = io('https://synewaveshi.herokuapp.com/');

  const updateUsername = (name) => {
    setUsername(name);
    socket.emit('add user', name);
  };

  useEffect(() => {
    socket.on('user joined', data => {
      // console.log(`${data.username} joined!`);
      setCurrentUsers(data.currentUsers);
    })

    socket.on('user left', data => {
      // console.log('user left!');
      setCurrentUsers(data.currentUsers);
    });

    socket.on('disconnect', () => {
      // console.log(`user has disconnected.`);
    });

    socket.on('reconnect', () => {
      // console.log(`user has been reconnected!`);
      if (username) socket.emit('add user', username);
    });
  }, [socket, username]);

  if (!username) return <Home updateUsername={updateUsername} />;
  return <Welcome username={username} currentUsers={currentUsers} socket={socket} />;
};

export default App;
