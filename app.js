const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const morgan = require('morgan');
const socketIO = require('socket.io');
const { ChatHistory } = require('./util');

const server = http.Server(app);
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

io.on('connection', (socket) => {
  let newUser = false;

  socket.on('add note', ({ fullNote, newColor, username, message }) => {
    history.addMessage(`${message} (note: ${fullNote})`, username);

    console.log(`
      len: ${history.toArray().length}
      Broadcasting new note: ${fullNote}
      History: ${history.lastMessage()}
    `);
    socket.broadcast.emit('note added', {
      history: history.toArray(),
      note: fullNote,
      color: newColor,
    });
  });

  socket.on('add user', (username) => {
    if (newUser) return;

    socket.username = username;
    numUsers += 1;
    currentUsers.push({ id: numUsers, username });
    newUser = true;
    history.addMessage(`${username} joined`, username);

    console.log(`
      New user: ${username}
      Num users: ${numUsers}
      History: ${history.lastMessage()}
    `);

    socket.broadcast.emit('user joined', {
      history: history.toArray(),
      username: socket.username,
      currentUsers,
      numUsers,
    });
  });

  socket.on('disconnect', () => {
    if (!newUser) return;

    numUsers -= 1;
    console.log(`${socket.username} disconnected`);
    currentUsers = currentUsers.filter(
      (user) => user.username !== socket.username
    );
    history.addMessage(`${socket.username} disconnected`, socket.username);

    socket.username = undefined;
    console.log(`
      New user: ${socket.username}
      Num users: ${numUsers}
      History: ${history.lastMessage()}
    `);

    socket.broadcast.emit('user left', {
      history: history.toArray(),
      username: socket.username,
      currentUsers,
      numUsers,
    });
  });
});
