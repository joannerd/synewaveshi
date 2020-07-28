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
      setCurrentUsers(data.currentUsers);
      setSyneHistory(data.history);
    });

    socket.on('user left', (data) => {
      setCurrentUsers(data.currentUsers);
      setSyneHistory(data.history);
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
  const [socket, setSocket] = useState(null);
  const [syneHistory, setSyneHistory] = useState([]);
  const [currentUsers, setCurrentUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const updateUsername = (name) => {
    setUsername(name);
    socket.emit('add user', name);
  };

  useEffect(() => {
    const newSocket = io(socketUrl);
    setSocket(newSocket);
    setIsConnected(true);
    return () => {
      if (isConnected) {
        socket.emit('disconnect');
        setIsConnected(false);
      }
    }
    // eslint-disable-next-line
  }, []);

  const state = {
    socket,
    username,
    currentUsers,
    syneHistory,
    updateUsername,
    setCurrentUsers,
    setSyneHistory,
  };

  if (!isConnected) return <h1>Connecting...</h1>

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
