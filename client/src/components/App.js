import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Splash from './Splash';
import Welcome from './Welcome';
import { socketUrl } from '../config';
import History from './History';

const App = () => {
  const socket = io(socketUrl);
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const updateUsername = (name) => {
    setUsername(name);
    socket.emit('add user', name);
  };

  useEffect(() => {
    setIsConnected(true);
    return () => {
      if (isConnected) {
        socket.emit('disconnect');
        setIsConnected(false);
      }
    }
    // eslint-disable-next-line
  }, []);
  const [syneHistory, setSyneHistory] = useState([]);
  const [currentUsers, setCurrentUsers] = useState([]);

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

  if (!username) return <Splash updateUsername={updateUsername} />;

  if (!isConnected) return <h1>Connecting...</h1>

  return (
    <div id="home">
      <Welcome
        socket={socket}
        username={username}
        setSyneHistory={setSyneHistory}
        currentUsers={currentUsers}
      />
      <History
        syneHistory={syneHistory}
        username={username}
      />
    </div>
  );
};

export default App;
