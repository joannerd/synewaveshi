import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Splash from './Splash';
import Welcome from './Welcome';
import { socketUrl } from '../config';
import HistoryContext from '../HistoryContext';
import History from './History';

const App = ({
  socket,
  username,
  setCurrentUsers,
  setSyneHistory,
}) => {
  useEffect(() => {
    socket.on('user joined', (data) => {
      console.log(`${data.username} joined!`);
      setCurrentUsers(data.currentUsers);
      setSyneHistory(data.history);
    });

    socket.on('user left', (data) => {
      console.log('user left!');
      setCurrentUsers(data.currentUsers);
      setSyneHistory(data.history);
    });

    socket.on('disconnect', () => {
      console.log(`user has disconnected.`);
    });

    socket.on('reconnect', () => {
      console.log(`user has been reconnected!`);
      if (username) socket.emit('add user', username);
    });
  }, [socket, username, setCurrentUsers, setSyneHistory]);

  if (!username) return <Splash />;
  return (
    <div id="home">
      <Welcome />
      <History />
    </div>
  );
};

const AppWithContext = () => {
  const socket = io(socketUrl);
  const [syneHistory, setSyneHistory] = useState([]);
  const [currentUsers, setCurrentUsers] = useState([]);
  const [username, setUsername] = useState('');

  const updateUsername = (name) => {
    setUsername(name);
    socket.emit('add user', name);
  };

  const state = {
    socket,
    username,
    currentUsers,
    syneHistory,
    updateUsername,
    setCurrentUsers,
    setSyneHistory,
  };

  return (
    <HistoryContext.Provider value={state}>
      <App
        socket={socket}
        username={username}
        setSyneHistory={setSyneHistory}
        setCurrentUsers={setCurrentUsers}
      />
    </HistoryContext.Provider>
  );
}

export default AppWithContext;
