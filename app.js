const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const morgan = require('morgan');
const socketIO = require('socket.io');
const { ChatHistory } = require('./chatHistoryLinkedList');

const server = http.createServer(app);
const PORT = process.env.PORT || 80;
server.listen(PORT, () => console.log(`Listening at port ${PORT}...`));

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '/client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

const io = socketIO(server);
let numUsers = 0;
let currentUsers = [];
let history = new ChatHistory();
let isSyneBotOn = false;

io.on('connection', (socket) => {
  socket.on('add note', ({ fullNote, newColor, username, message }) => {
    history.addMessage(`${message} (note: ${fullNote})`, username);

    console.log(`
      len: ${history.toArray().length}
      Broadcasting new note: ${fullNote}
      History: ${history.lastMessage()}
    `);
    
    io.emit('note added', {
      history: history.toArray(),
      note: fullNote,
      color: newColor,
    });
  });

  socket.on('add user', (username) => {
    socket.username = username;
    numUsers += 1;
    currentUsers.push({ id: numUsers, username });
    history.addMessage(`${username} joined`, username);

    console.log(`
      New user: ${username}
      Num users: ${numUsers}
      History: ${history.lastMessage()}
    `);

    io.emit('user joined', {
      history: history.toArray(),
      username: socket.username,
      currentUsers,
      numUsers,
    });
  });

  socket.on('add synebot', () => {
    isSyneBotOn = true;
    const username = 'SyneBot';
    numUsers += 1;
    currentUsers.push({ id: numUsers, username });
    history.addMessage(`${username} joined`, username);

    console.log(`
      New user: ${username}
      Num users: ${numUsers}
      History: ${history.lastMessage()}
    `);

    io.emit('user joined', {
      history: history.toArray(),
      username: socket.username,
      currentUsers,
      numUsers,
    });
  });

  socket.on('disconnect synebot', () => {
    numUsers -= 1;
    currentUsers = currentUsers.filter(
      (user) => user.username !== 'SyneBot'
    );
    history.addMessage('SyneBot disconnected', 'SyneBot');

    console.log(`
      Disconnected user: SyneBot
      Num users: ${numUsers}
      History: ${history.lastMessage()}
    `);

    io.emit('user left', {
      history: history.toArray(),
      currentUsers,
    });
  });

  socket.on('disconnect', () => {
    if (numUsers > 0) {
      numUsers -= 1;
      currentUsers = currentUsers.filter(
        (user) => user.username !== socket.username
      );
    }
    if (numUsers === 0) {
      currentUsers = [];
      history.clear();
    } else {
      history.addMessage(`${socket.username} disconnected`, socket.username);
    }

    console.log(`
      Disconnected user: ${socket.username}
      Num users: ${numUsers}
      History: ${history.lastMessage()}
    `);

    socket.username = undefined;

    socket.broadcast.emit('user left', {
      history: history.toArray(),
      currentUsers,
    });

    socket.disconnect();
  });
});
